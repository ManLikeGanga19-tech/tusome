"""
Admin service — handles all admin-panel business logic.
All mutating actions write an audit log entry.
"""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, cast, Date
from sqlalchemy.orm import selectinload

import re

from app.models.admin import AdminUser, AuditLog, AdminSession
from app.models.user import User, UserActivity
from app.models.content import Subject, Lesson
from app.models.payment import PaymentTransaction, Subscription
from app.models.progress import UserProgress, UserStats
from app.models.cms import BlogPost, SuccessStory, Announcement, Faq
from app.models.quiz import Quiz, QuizQuestion, QuizChoice
from app.core.security import hash_password, verify_password, create_access_token, create_admin_access_token
from app.core.exceptions import NotFoundError, BadRequestError, ForbiddenError
from app.config import settings


# ── Auth ─────────────────────────────────────────────────────────────────────

async def admin_login(
    db: AsyncSession, email: str, password: str,
    ip: str | None, user_agent: str | None = None,
):
    result = await db.execute(select(AdminUser).where(AdminUser.email == email.lower().strip()))
    admin = result.scalar_one_or_none()

    if not admin or not admin.is_active or not verify_password(password, admin.password_hash):
        raise BadRequestError("Invalid credentials")

    now = datetime.now(timezone.utc)
    admin.last_login_at = now

    token, jti = create_admin_access_token(
        str(admin.id),
        extra={"role": admin.role, "iss": "tusome-admin"},
    )
    expires_at = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    db.add(AdminSession(
        admin_id=admin.id,
        jti=jti,
        ip_address=ip,
        user_agent=user_agent,
        expires_at=expires_at,
    ))
    db.add(AuditLog(
        admin_id=admin.id, action="admin.login",
        target_type="admin", target_id=str(admin.id),
        ip_address=ip,
    ))
    await db.commit()
    await db.refresh(admin)
    return token, admin


# ── Dashboard ─────────────────────────────────────────────────────────────────

async def get_dashboard_stats(db: AsyncSession):
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    async def count(model, *filters):
        r = await db.execute(select(func.count()).select_from(model).where(*filters))
        return r.scalar() or 0

    total_users = await count(User)
    active_subs = await count(User, User.subscription_status == "active")
    trial_users = await count(User, User.subscription_status == "trial")
    expired_users = await count(User, User.subscription_status == "expired")
    total_lessons = await count(Lesson, Lesson.is_published.is_(True))
    total_subjects = await count(Subject, Subject.is_active.is_(True))
    new_this_week = await count(User, User.created_at >= week_ago)

    rev_r = await db.execute(
        select(func.coalesce(func.sum(PaymentTransaction.amount_ksh), 0))
        .where(
            PaymentTransaction.status == "success",
            PaymentTransaction.created_at >= month_start,
        )
    )
    revenue = int(rev_r.scalar() or 0)

    three_days = now + timedelta(days=3)
    expiring_soon = await count(
        User,
        User.subscription_status == "trial",
        User.trial_end_date.isnot(None),
        User.trial_end_date <= three_days,
        User.trial_end_date >= now,
    )

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    failed_today = await count(
        PaymentTransaction,
        PaymentTransaction.status == "failed",
        PaymentTransaction.created_at >= today_start,
    )

    return {
        "total_users": total_users,
        "active_subscribers": active_subs,
        "trial_users": trial_users,
        "expired_users": expired_users,
        "total_lessons": total_lessons,
        "total_subjects": total_subjects,
        "revenue_this_month_ksh": revenue,
        "new_users_this_week": new_this_week,
        "expiring_trials_soon": expiring_soon,
        "failed_payments_today": failed_today,
    }


# ── Analytics ─────────────────────────────────────────────────────────────────

async def get_analytics_overview(db: AsyncSession, days: int = 30) -> dict:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)

    # Registrations per day
    reg_rows = await db.execute(
        select(
            cast(User.created_at, Date).label("day"),
            func.count().label("cnt"),
        )
        .where(User.created_at >= start)
        .group_by(cast(User.created_at, Date))
        .order_by(cast(User.created_at, Date))
    )
    reg_by_day = [{"date": str(r.day), "value": r.cnt} for r in reg_rows]

    # Revenue per day (successful transactions)
    rev_rows = await db.execute(
        select(
            cast(PaymentTransaction.created_at, Date).label("day"),
            func.coalesce(func.sum(PaymentTransaction.amount_ksh), 0).label("total"),
        )
        .where(
            PaymentTransaction.status == "success",
            PaymentTransaction.created_at >= start,
        )
        .group_by(cast(PaymentTransaction.created_at, Date))
        .order_by(cast(PaymentTransaction.created_at, Date))
    )
    rev_by_day = [{"date": str(r.day), "value": float(r.total)} for r in rev_rows]

    # Grade breakdown of active subscribers
    grade_rows = await db.execute(
        select(User.grade_category, func.count().label("cnt"))
        .where(User.subscription_status.in_(["active", "trial"]))
        .group_by(User.grade_category)
    )
    grade_map = {r.grade_category: r.cnt for r in grade_rows}

    # Trial conversion: active / (active + expired) users all-time
    active_count_r = await db.execute(
        select(func.count()).where(User.subscription_status == "active")
    )
    active_count = active_count_r.scalar() or 0
    expired_count_r = await db.execute(
        select(func.count()).where(User.subscription_status == "expired")
    )
    expired_count = expired_count_r.scalar() or 0
    conversion_denom = active_count + expired_count
    conversion_rate = round(active_count / conversion_denom * 100, 1) if conversion_denom > 0 else 0.0

    # Churn: expired this month / (active + expired this month)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    churned_r = await db.execute(
        select(func.count())
        .where(User.subscription_status == "expired", User.updated_at >= month_start)
    )
    churned = churned_r.scalar() or 0
    new_active_r = await db.execute(
        select(func.count())
        .where(User.subscription_status == "active", User.updated_at >= month_start)
    )
    new_active = new_active_r.scalar() or 0
    churn_denom = churned + new_active
    churn_rate = round(churned / churn_denom * 100, 1) if churn_denom > 0 else 0.0

    # Total revenue all-time
    total_rev_r = await db.execute(
        select(func.coalesce(func.sum(PaymentTransaction.amount_ksh), 0))
        .where(PaymentTransaction.status == "success")
    )
    total_rev = int(total_rev_r.scalar() or 0)

    total_users_r = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_r.scalar() or 1
    avg_rev = round(total_rev / total_users, 2)

    return {
        "registrations_by_day": reg_by_day,
        "revenue_by_day": rev_by_day,
        "trial_conversion_rate": conversion_rate,
        "churn_rate": churn_rate,
        "grade_breakdown": {
            "primary": grade_map.get("primary", 0),
            "junior": grade_map.get("junior", 0),
            "senior": grade_map.get("senior", 0),
        },
        "total_revenue_ksh": total_rev,
        "avg_revenue_per_user_ksh": avg_rev,
    }


# ── User profile (detailed) ───────────────────────────────────────────────────

async def get_user_profile(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")

    activities_r = await db.execute(
        select(UserActivity)
        .where(UserActivity.user_id == user.id)
        .order_by(UserActivity.created_at.desc())
        .limit(20)
    )
    activities = activities_r.scalars().all()

    payments_r = await db.execute(
        select(PaymentTransaction, Subscription.plan)
        .join(Subscription, PaymentTransaction.subscription_id == Subscription.id)
        .where(Subscription.user_id == user.id)
        .order_by(PaymentTransaction.created_at.desc())
    )
    payment_rows = payments_r.all()
    payment_history = []
    for txn, plan in payment_rows:
        payment_history.append({
            "plan": plan,
            "amount_ksh": txn.amount_ksh,
            "status": txn.status,
            "mpesa_receipt_number": txn.mpesa_receipt_number,
            "phone_number": txn.phone_number,
            "created_at": txn.created_at,
        })

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "grade": user.grade,
        "grade_category": user.grade_category,
        "grade_tier": user.grade_tier,
        "subscription_status": user.subscription_status,
        "trial_start_date": user.trial_start_date,
        "trial_end_date": user.trial_end_date,
        "last_login_at": user.last_login_at,
        "created_at": user.created_at,
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "recent_activities": [
            {"activity_type": a.activity_type, "ip_address": a.ip_address, "created_at": a.created_at}
            for a in activities
        ],
        "payment_history": payment_history,
    }


async def list_expiring_trials(db: AsyncSession, days: int = 3):
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=days)
    result = await db.execute(
        select(User)
        .where(
            User.subscription_status == "trial",
            User.trial_end_date.isnot(None),
            User.trial_end_date <= cutoff,
            User.trial_end_date >= now,
        )
        .order_by(User.trial_end_date)
    )
    return result.scalars().all()


# ── Payment transaction log ───────────────────────────────────────────────────

async def list_payment_transactions(
    db: AsyncSession, skip: int = 0, limit: int = 50, status: str | None = None
):
    q = (
        select(
            PaymentTransaction,
            Subscription.plan,
            User.id.label("user_id"),
            (User.first_name + " " + User.last_name).label("user_name"),
            User.email.label("user_email"),
        )
        .join(Subscription, PaymentTransaction.subscription_id == Subscription.id)
        .join(User, Subscription.user_id == User.id)
        .order_by(PaymentTransaction.created_at.desc())
    )
    if status:
        q = q.where(PaymentTransaction.status == status)

    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_r.scalar() or 0

    rows = await db.execute(q.offset(skip).limit(limit))
    results = []
    for txn, plan, user_id, user_name, user_email in rows:
        results.append({
            "id": txn.id,
            "user_id": user_id,
            "user_name": user_name,
            "user_email": user_email,
            "plan": plan,
            "amount_ksh": txn.amount_ksh,
            "status": txn.status,
            "mpesa_receipt_number": txn.mpesa_receipt_number,
            "phone_number": txn.phone_number,
            "created_at": txn.created_at,
        })
    return results, total


# ── Admin sessions ───────────────────────────────────────────────────────────

async def list_admin_sessions(db: AsyncSession, active_only: bool = True):
    q = (
        select(AdminSession, AdminUser)
        .join(AdminUser, AdminSession.admin_id == AdminUser.id)
        .order_by(AdminSession.last_active_at.desc())
    )
    if active_only:
        q = q.where(
            AdminSession.is_active.is_(True),
            AdminSession.expires_at >= datetime.now(timezone.utc),
        )
    rows = await db.execute(q)
    results = []
    for session, admin in rows:
        results.append({
            "id": session.id,
            "admin_id": session.admin_id,
            "admin_name": admin.name,
            "admin_email": admin.email,
            "admin_role": admin.role,
            "ip_address": session.ip_address,
            "user_agent": session.user_agent,
            "is_active": session.is_active,
            "created_at": session.created_at,
            "last_active_at": session.last_active_at,
            "expires_at": session.expires_at,
        })
    return results


async def force_logout_session(
    db: AsyncSession, session_id: str, acting_admin: AdminUser, ip: str | None
):
    result = await db.execute(
        select(AdminSession).where(AdminSession.id == uuid.UUID(session_id))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Session not found")

    # Super_admin can revoke any session; others can only revoke their own
    if acting_admin.role != "super_admin" and session.admin_id != acting_admin.id:
        raise ForbiddenError("Cannot revoke another admin's session")

    session.is_active = False
    db.add(AuditLog(
        admin_id=acting_admin.id, action="admin.session_revoked",
        target_type="admin_session", target_id=str(session.id),
        extra={"target_admin_id": str(session.admin_id)},
        ip_address=ip,
    ))
    await db.commit()


async def touch_session(db: AsyncSession, jti: str):
    """Update last_active_at on the session — called on authenticated requests."""
    result = await db.execute(select(AdminSession).where(AdminSession.jti == jti))
    session = result.scalar_one_or_none()
    if session and session.is_active:
        session.last_active_at = datetime.now(timezone.utc)
        await db.commit()


# ── CSV export ────────────────────────────────────────────────────────────────

async def export_users_csv(db: AsyncSession) -> str:
    """Return all users as a CSV string."""
    import csv, io
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "first_name", "last_name", "email", "grade",
        "grade_category", "grade_tier", "subscription_status",
        "trial_start_date", "trial_end_date", "email_verified",
        "is_active", "created_at", "last_login_at",
    ])
    for u in users:
        writer.writerow([
            str(u.id), u.first_name, u.last_name, u.email, u.grade,
            u.grade_category, u.grade_tier, u.subscription_status,
            u.trial_start_date.isoformat() if u.trial_start_date else "",
            u.trial_end_date.isoformat() if u.trial_end_date else "",
            u.email_verified, u.is_active,
            u.created_at.isoformat(), u.last_login_at.isoformat() if u.last_login_at else "",
        ])
    return buf.getvalue()


# ── User management ───────────────────────────────────────────────────────────

async def list_users(db: AsyncSession, search: str | None, skip: int, limit: int):
    q = select(User).options(selectinload(User.stats)).order_by(User.created_at.desc())
    if search:
        term = f"%{search}%"
        q = q.where(
            (User.email.ilike(term)) |
            (User.first_name.ilike(term)) |
            (User.last_name.ilike(term))
        )
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_r.scalar() or 0
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all(), total


async def get_user_progress(db: AsyncSession, user_id: str) -> dict:
    from app.services.progress_service import ProgressService
    uid = uuid.UUID(user_id)
    ps = ProgressService(db)
    stats = await ps.get_user_stats(uid)
    badges = await ps.get_user_badges(uid)
    return {
        **stats.model_dump(),
        "badges": [b.model_dump() for b in badges],
    }


async def override_subscription(
    db: AsyncSession, user_id: str, status: str,
    admin: AdminUser, ip: str | None,
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")

    old_status = user.subscription_status
    user.subscription_status = status

    db.add(AuditLog(
        admin_id=admin.id, action="user.subscription_changed",
        target_type="user", target_id=str(user.id),
        extra={"from": old_status, "to": status},
        ip_address=ip,
    ))
    await db.commit()
    return user


# ── Content management ────────────────────────────────────────────────────────

async def list_subjects_admin(db: AsyncSession):
    lesson_count_sq = (
        select(func.count())
        .select_from(Lesson)
        .where(Lesson.subject_id == Subject.id, Lesson.is_published.is_(True))
        .correlate(Subject)
        .scalar_subquery()
    )
    result = await db.execute(
        select(Subject, lesson_count_sq.label("lesson_count")).order_by(Subject.grade_category, Subject.order)
    )
    rows = result.all()
    subjects = []
    for subject, count in rows:
        subject.lesson_count = count
        subjects.append(subject)
    return subjects


async def list_lessons_admin(db: AsyncSession, subject_slug: str):
    subj_r = await db.execute(select(Subject).where(Subject.slug == subject_slug))
    subject = subj_r.scalar_one_or_none()
    if not subject:
        raise NotFoundError("Subject not found")
    result = await db.execute(
        select(Lesson).where(Lesson.subject_id == subject.id).order_by(Lesson.order)
    )
    return result.scalars().all()


async def toggle_lesson_publish(
    db: AsyncSession, lesson_id: str, is_published: bool,
    admin: AdminUser, ip: str | None,
):
    result = await db.execute(select(Lesson).where(Lesson.id == uuid.UUID(lesson_id)))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise NotFoundError("Lesson not found")

    lesson.is_published = is_published
    action = "lesson.published" if is_published else "lesson.unpublished"
    db.add(AuditLog(
        admin_id=admin.id, action=action,
        target_type="lesson", target_id=str(lesson.id),
        extra={"title": lesson.title},
        ip_address=ip,
    ))
    await db.commit()
    return lesson


async def toggle_subject_active(
    db: AsyncSession, subject_id: str, is_active: bool,
    admin: AdminUser, ip: str | None,
):
    result = await db.execute(select(Subject).where(Subject.id == uuid.UUID(subject_id)))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundError("Subject not found")

    subject.is_active = is_active
    db.add(AuditLog(
        admin_id=admin.id, action="subject.active_toggled",
        target_type="subject", target_id=str(subject.id),
        extra={"is_active": is_active, "name": subject.name},
        ip_address=ip,
    ))
    await db.commit()
    return subject


# ── Content CRUD ──────────────────────────────────────────────────────────────

def _make_slug(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


async def create_subject(
    db: AsyncSession, data: dict, admin: AdminUser, ip: str | None,
) -> Subject:
    slug = _make_slug(data['name'])
    existing = await db.execute(select(Subject).where(Subject.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    subject = Subject(
        name=data['name'],
        slug=slug,
        grade_category=data['grade_category'],
        description=data.get('description'),
        icon=data.get('icon'),
        color=data.get('color'),
        order=data.get('order', 0),
    )
    db.add(subject)
    db.add(AuditLog(
        admin_id=admin.id, action="subject.created",
        target_type="subject", target_id=str(subject.id),
        extra={"name": subject.name}, ip_address=ip,
    ))
    await db.commit()
    await db.refresh(subject)
    subject.lesson_count = 0
    return subject


async def update_subject(
    db: AsyncSession, subject_id: str, data: dict, admin: AdminUser, ip: str | None,
) -> Subject:
    result = await db.execute(select(Subject).where(Subject.id == uuid.UUID(subject_id)))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundError("Subject not found")
    for field in ('name', 'grade_category', 'description', 'icon', 'color', 'order', 'is_active'):
        if field in data and data[field] is not None:
            setattr(subject, field, data[field])
    db.add(AuditLog(
        admin_id=admin.id, action="subject.updated",
        target_type="subject", target_id=str(subject.id),
        extra={"changes": {k: v for k, v in data.items() if v is not None}},
        ip_address=ip,
    ))
    await db.commit()
    count_r = await db.execute(
        select(func.count()).select_from(Lesson).where(Lesson.subject_id == subject.id)
    )
    subject.lesson_count = count_r.scalar() or 0
    return subject


async def delete_subject(
    db: AsyncSession, subject_id: str, admin: AdminUser, ip: str | None,
) -> None:
    result = await db.execute(select(Subject).where(Subject.id == uuid.UUID(subject_id)))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundError("Subject not found")
    db.add(AuditLog(
        admin_id=admin.id, action="subject.deleted",
        target_type="subject", target_id=str(subject.id),
        extra={"name": subject.name}, ip_address=ip,
    ))
    await db.delete(subject)
    await db.commit()


async def create_lesson(
    db: AsyncSession, data: dict, admin: AdminUser, ip: str | None,
) -> Lesson:
    subject_id = uuid.UUID(str(data['subject_id']))
    subj_r = await db.execute(select(Subject).where(Subject.id == subject_id))
    if not subj_r.scalar_one_or_none():
        raise NotFoundError("Subject not found")
    slug = _make_slug(data['title'])
    existing = await db.execute(select(Lesson).where(Lesson.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    lesson = Lesson(
        subject_id=subject_id,
        title=data['title'],
        slug=slug,
        description=data.get('description'),
        content=data.get('content'),
        order=data.get('order', 0),
        duration_minutes=data.get('duration_minutes', 0),
        is_free_preview=data.get('is_free_preview', False),
        is_published=data.get('is_published', False),
    )
    db.add(lesson)
    db.add(AuditLog(
        admin_id=admin.id, action="lesson.created",
        target_type="lesson", target_id=str(lesson.id),
        extra={"title": lesson.title}, ip_address=ip,
    ))
    await db.commit()
    await db.refresh(lesson)
    return lesson


async def update_lesson(
    db: AsyncSession, lesson_id: str, data: dict, admin: AdminUser, ip: str | None,
) -> Lesson:
    result = await db.execute(select(Lesson).where(Lesson.id == uuid.UUID(lesson_id)))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise NotFoundError("Lesson not found")
    for field in ('title', 'description', 'content', 'order', 'duration_minutes', 'is_free_preview', 'is_published'):
        if field in data and data[field] is not None:
            setattr(lesson, field, data[field])
    db.add(AuditLog(
        admin_id=admin.id, action="lesson.updated",
        target_type="lesson", target_id=str(lesson.id),
        extra={"title": lesson.title}, ip_address=ip,
    ))
    await db.commit()
    return lesson


async def delete_lesson(
    db: AsyncSession, lesson_id: str, admin: AdminUser, ip: str | None,
) -> None:
    result = await db.execute(select(Lesson).where(Lesson.id == uuid.UUID(lesson_id)))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise NotFoundError("Lesson not found")
    db.add(AuditLog(
        admin_id=admin.id, action="lesson.deleted",
        target_type="lesson", target_id=str(lesson.id),
        extra={"title": lesson.title}, ip_address=ip,
    ))
    await db.delete(lesson)
    await db.commit()


# ── Quiz management ────────────────────────────────────────────────────────────

async def list_quizzes_admin(db: AsyncSession):
    count_sq = (
        select(func.count())
        .select_from(QuizQuestion)
        .where(QuizQuestion.quiz_id == Quiz.id)
        .correlate(Quiz)
        .scalar_subquery()
    )
    result = await db.execute(
        select(Quiz, count_sq.label("question_count")).order_by(Quiz.created_at.desc())
    )
    rows = result.all()
    quizzes = []
    for quiz, count in rows:
        quiz.question_count = count
        quizzes.append(quiz)
    return quizzes


async def get_quiz_admin(db: AsyncSession, quiz_id: str) -> Quiz:
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(QuizQuestion.choices))
        .where(Quiz.id == uuid.UUID(quiz_id))
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundError("Quiz not found")
    return quiz


async def create_quiz(
    db: AsyncSession, data: dict, admin: AdminUser, ip: str | None,
) -> Quiz:
    quiz = Quiz(
        title=data['title'],
        description=data.get('description'),
        lesson_id=data.get('lesson_id'),
        pass_score=data.get('pass_score', 60),
        xp_reward=data.get('xp_reward', 20),
        time_limit_seconds=data.get('time_limit_seconds'),
        grade_category=data.get('grade_category'),
        is_published=data.get('is_published', False),
        randomise_order=data.get('randomise_order', True),
        max_attempts_per_day=data.get('max_attempts_per_day'),
        show_correct_answers=data.get('show_correct_answers', True),
    )
    db.add(quiz)
    db.add(AuditLog(
        admin_id=admin.id, action="quiz.created",
        target_type="quiz", target_id=str(quiz.id),
        extra={"title": quiz.title}, ip_address=ip,
    ))
    await db.commit()
    await db.refresh(quiz)
    quiz.question_count = 0
    return quiz


async def update_quiz(
    db: AsyncSession, quiz_id: str, data: dict, admin: AdminUser, ip: str | None,
) -> Quiz:
    result = await db.execute(select(Quiz).where(Quiz.id == uuid.UUID(quiz_id)))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundError("Quiz not found")
    for field in ('title', 'description', 'lesson_id', 'pass_score', 'xp_reward',
                  'time_limit_seconds', 'grade_category', 'is_published',
                  'randomise_order', 'max_attempts_per_day', 'show_correct_answers'):
        if field in data and data[field] is not None:
            setattr(quiz, field, data[field])
    db.add(AuditLog(
        admin_id=admin.id, action="quiz.updated",
        target_type="quiz", target_id=str(quiz.id),
        extra={"title": quiz.title}, ip_address=ip,
    ))
    await db.commit()
    return quiz


async def delete_quiz(
    db: AsyncSession, quiz_id: str, admin: AdminUser, ip: str | None,
) -> None:
    result = await db.execute(select(Quiz).where(Quiz.id == uuid.UUID(quiz_id)))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundError("Quiz not found")
    db.add(AuditLog(
        admin_id=admin.id, action="quiz.deleted",
        target_type="quiz", target_id=str(quiz.id),
        extra={"title": quiz.title}, ip_address=ip,
    ))
    await db.delete(quiz)
    await db.commit()


async def create_question(
    db: AsyncSession, quiz_id: str, data: dict,
) -> QuizQuestion:
    result = await db.execute(select(Quiz).where(Quiz.id == uuid.UUID(quiz_id)))
    if not result.scalar_one_or_none():
        raise NotFoundError("Quiz not found")
    q = QuizQuestion(
        quiz_id=uuid.UUID(quiz_id),
        question_text=data['question_text'],
        question_type=data.get('question_type', 'mcq'),
        explanation=data.get('explanation'),
        points=data.get('points', 1),
        order=data.get('order', 0),
    )
    db.add(q)
    await db.commit()
    # Reload with choices eagerly so the async session isn't hit by lazy-load
    result2 = await db.execute(
        select(QuizQuestion)
        .options(selectinload(QuizQuestion.choices))
        .where(QuizQuestion.id == q.id)
    )
    return result2.scalar_one()


async def update_question(
    db: AsyncSession, question_id: str, data: dict,
) -> QuizQuestion:
    result = await db.execute(
        select(QuizQuestion)
        .options(selectinload(QuizQuestion.choices))
        .where(QuizQuestion.id == uuid.UUID(question_id))
    )
    q = result.scalar_one_or_none()
    if not q:
        raise NotFoundError("Question not found")
    for field in ('question_text', 'question_type', 'explanation', 'points', 'order'):
        if field in data and data[field] is not None:
            setattr(q, field, data[field])
    await db.commit()
    return q


async def delete_question(db: AsyncSession, question_id: str) -> None:
    result = await db.execute(select(QuizQuestion).where(QuizQuestion.id == uuid.UUID(question_id)))
    q = result.scalar_one_or_none()
    if not q:
        raise NotFoundError("Question not found")
    await db.delete(q)
    await db.commit()


async def create_choice(
    db: AsyncSession, question_id: str, data: dict,
) -> QuizChoice:
    result = await db.execute(select(QuizQuestion).where(QuizQuestion.id == uuid.UUID(question_id)))
    if not result.scalar_one_or_none():
        raise NotFoundError("Question not found")
    c = QuizChoice(
        question_id=uuid.UUID(question_id),
        choice_text=data['choice_text'],
        is_correct=data.get('is_correct', False),
        order=data.get('order', 0),
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return c


async def update_choice(db: AsyncSession, choice_id: str, data: dict) -> QuizChoice:
    result = await db.execute(select(QuizChoice).where(QuizChoice.id == uuid.UUID(choice_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise NotFoundError("Choice not found")
    for field in ('choice_text', 'is_correct', 'order'):
        if field in data and data[field] is not None:
            setattr(c, field, data[field])
    await db.commit()
    return c


async def delete_choice(db: AsyncSession, choice_id: str) -> None:
    result = await db.execute(select(QuizChoice).where(QuizChoice.id == uuid.UUID(choice_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise NotFoundError("Choice not found")
    await db.delete(c)
    await db.commit()


# ── Admin management (super_admin only) ───────────────────────────────────────

async def list_admins(db: AsyncSession):
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at))
    return result.scalars().all()


async def create_admin(
    db: AsyncSession, name: str, email: str, password: str, role: str,
    created_by: AdminUser, ip: str | None,
):
    existing = await db.execute(select(AdminUser).where(AdminUser.email == email.lower()))
    if existing.scalar_one_or_none():
        raise BadRequestError("An admin with that email already exists")

    new_admin = AdminUser(
        name=name,
        email=email.lower().strip(),
        password_hash=hash_password(password),
        role=role,
        created_by=created_by.id,
    )
    db.add(new_admin)
    await db.flush()

    db.add(AuditLog(
        admin_id=created_by.id, action="admin.created",
        target_type="admin", target_id=str(new_admin.id),
        extra={"email": email, "role": role},
        ip_address=ip,
    ))
    await db.commit()
    await db.refresh(new_admin)
    return new_admin


async def update_admin(
    db: AsyncSession, admin_id: str, data: dict,
    acting_admin: AdminUser, ip: str | None,
):
    # Prevent super_admin from deactivating themselves
    if str(acting_admin.id) == admin_id and data.get("is_active") is False:
        raise BadRequestError("You cannot deactivate your own account")

    result = await db.execute(select(AdminUser).where(AdminUser.id == uuid.UUID(admin_id)))
    target = result.scalar_one_or_none()
    if not target:
        raise NotFoundError("Admin not found")

    changes = {}
    for field, value in data.items():
        if value is not None and getattr(target, field) != value:
            changes[field] = {"from": getattr(target, field), "to": value}
            setattr(target, field, value)

    if changes:
        db.add(AuditLog(
            admin_id=acting_admin.id, action="admin.updated",
            target_type="admin", target_id=str(target.id),
            extra=changes, ip_address=ip,
        ))
        await db.commit()
    return target


# ── Audit log ────────────────────────────────────────────────────────────────

async def get_audit_logs(db: AsyncSession, skip: int, limit: int):
    result = await db.execute(
        select(AuditLog, AdminUser.name.label("admin_name"))
        .join(AdminUser, AuditLog.admin_id == AdminUser.id)
        .order_by(AuditLog.created_at.desc())
        .offset(skip).limit(limit)
    )
    rows = result.all()
    logs = []
    for log, admin_name in rows:
        log.admin_name = admin_name
        logs.append(log)
    return logs


# ── CMS: Blog Posts ───────────────────────────────────────────────────────────

async def list_blog_posts(db: AsyncSession, skip: int = 0, limit: int = 50, published_only: bool = False):
    q = select(BlogPost).order_by(BlogPost.created_at.desc())
    if published_only:
        q = q.where(BlogPost.is_published.is_(True))
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_r.scalar() or 0
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all(), total


async def create_blog_post(db: AsyncSession, data: dict, admin: AdminUser) -> BlogPost:
    post = BlogPost(**data, created_by=admin.id)
    db.add(post)
    db.add(AuditLog(
        admin_id=admin.id, action="blog.created",
        target_type="blog_post", target_id=None,
        extra={"title": data.get("title")},
    ))
    await db.commit()
    await db.refresh(post)
    return post


async def update_blog_post(db: AsyncSession, post_id: str, data: dict, admin: AdminUser) -> BlogPost:
    result = await db.execute(select(BlogPost).where(BlogPost.id == uuid.UUID(post_id)))
    post = result.scalar_one_or_none()
    if not post:
        raise NotFoundError("Blog post not found")
    for k, v in data.items():
        if v is not None:
            setattr(post, k, v)
    db.add(AuditLog(
        admin_id=admin.id, action="blog.updated",
        target_type="blog_post", target_id=str(post.id),
        extra={"title": post.title},
    ))
    await db.commit()
    await db.refresh(post)
    return post


async def delete_blog_post(db: AsyncSession, post_id: str, admin: AdminUser) -> None:
    result = await db.execute(select(BlogPost).where(BlogPost.id == uuid.UUID(post_id)))
    post = result.scalar_one_or_none()
    if not post:
        raise NotFoundError("Blog post not found")
    db.add(AuditLog(
        admin_id=admin.id, action="blog.deleted",
        target_type="blog_post", target_id=str(post.id),
        extra={"title": post.title},
    ))
    await db.delete(post)
    await db.commit()


# ── CMS: Success Stories ──────────────────────────────────────────────────────

async def list_success_stories(db: AsyncSession, skip: int = 0, limit: int = 50, published_only: bool = False):
    q = select(SuccessStory).order_by(SuccessStory.created_at.desc())
    if published_only:
        q = q.where(SuccessStory.is_published.is_(True))
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_r.scalar() or 0
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all(), total


async def create_success_story(db: AsyncSession, data: dict, admin: AdminUser) -> SuccessStory:
    story = SuccessStory(**data, created_by=admin.id)
    db.add(story)
    db.add(AuditLog(
        admin_id=admin.id, action="story.created",
        target_type="success_story", target_id=None,
        extra={"name": data.get("student_name")},
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def update_success_story(db: AsyncSession, story_id: str, data: dict, admin: AdminUser) -> SuccessStory:
    result = await db.execute(select(SuccessStory).where(SuccessStory.id == uuid.UUID(story_id)))
    story = result.scalar_one_or_none()
    if not story:
        raise NotFoundError("Story not found")
    for k, v in data.items():
        if v is not None:
            setattr(story, k, v)
    db.add(AuditLog(
        admin_id=admin.id, action="story.updated",
        target_type="success_story", target_id=str(story.id),
    ))
    await db.commit()
    await db.refresh(story)
    return story


async def delete_success_story(db: AsyncSession, story_id: str, admin: AdminUser) -> None:
    result = await db.execute(select(SuccessStory).where(SuccessStory.id == uuid.UUID(story_id)))
    story = result.scalar_one_or_none()
    if not story:
        raise NotFoundError("Story not found")
    db.add(AuditLog(
        admin_id=admin.id, action="story.deleted",
        target_type="success_story", target_id=str(story.id),
    ))
    await db.delete(story)
    await db.commit()


# ── CMS: Announcements ────────────────────────────────────────────────────────

async def list_announcements(db: AsyncSession, active_only: bool = False):
    q = select(Announcement).order_by(Announcement.created_at.desc())
    if active_only:
        now = datetime.now(timezone.utc)
        q = q.where(
            Announcement.is_active.is_(True),
            (Announcement.starts_at.is_(None)) | (Announcement.starts_at <= now),
            (Announcement.ends_at.is_(None)) | (Announcement.ends_at >= now),
        )
    result = await db.execute(q)
    return result.scalars().all()


async def create_announcement(db: AsyncSession, data: dict, admin: AdminUser) -> Announcement:
    ann = Announcement(**data, created_by=admin.id)
    db.add(ann)
    db.add(AuditLog(
        admin_id=admin.id, action="announcement.created",
        target_type="announcement", target_id=None,
        extra={"title": data.get("title")},
    ))
    await db.commit()
    await db.refresh(ann)
    return ann


async def update_announcement(db: AsyncSession, ann_id: str, data: dict, admin: AdminUser) -> Announcement:
    result = await db.execute(select(Announcement).where(Announcement.id == uuid.UUID(ann_id)))
    ann = result.scalar_one_or_none()
    if not ann:
        raise NotFoundError("Announcement not found")
    for k, v in data.items():
        if v is not None:
            setattr(ann, k, v)
    db.add(AuditLog(
        admin_id=admin.id, action="announcement.updated",
        target_type="announcement", target_id=str(ann.id),
    ))
    await db.commit()
    await db.refresh(ann)
    return ann


async def delete_announcement(db: AsyncSession, ann_id: str, admin: AdminUser) -> None:
    result = await db.execute(select(Announcement).where(Announcement.id == uuid.UUID(ann_id)))
    ann = result.scalar_one_or_none()
    if not ann:
        raise NotFoundError("Announcement not found")
    await db.delete(ann)
    await db.commit()


# ── CMS: FAQs ─────────────────────────────────────────────────────────────────

async def list_faqs(db: AsyncSession, published_only: bool = False):
    q = select(Faq).order_by(Faq.display_order, Faq.created_at)
    if published_only:
        q = q.where(Faq.is_published.is_(True))
    result = await db.execute(q)
    return result.scalars().all()


async def create_faq(db: AsyncSession, data: dict, admin: AdminUser) -> Faq:
    faq = Faq(**data, created_by=admin.id)
    db.add(faq)
    db.add(AuditLog(
        admin_id=admin.id, action="faq.created",
        target_type="faq", target_id=None,
        extra={"question": data.get("question", "")[:80]},
    ))
    await db.commit()
    await db.refresh(faq)
    return faq


async def update_faq(db: AsyncSession, faq_id: str, data: dict, admin: AdminUser) -> Faq:
    result = await db.execute(select(Faq).where(Faq.id == uuid.UUID(faq_id)))
    faq = result.scalar_one_or_none()
    if not faq:
        raise NotFoundError("FAQ not found")
    for k, v in data.items():
        if v is not None:
            setattr(faq, k, v)
    db.add(AuditLog(
        admin_id=admin.id, action="faq.updated",
        target_type="faq", target_id=str(faq.id),
    ))
    await db.commit()
    await db.refresh(faq)
    return faq


async def delete_faq(db: AsyncSession, faq_id: str, admin: AdminUser) -> None:
    result = await db.execute(select(Faq).where(Faq.id == uuid.UUID(faq_id)))
    faq = result.scalar_one_or_none()
    if not faq:
        raise NotFoundError("FAQ not found")
    await db.delete(faq)
    await db.commit()


# ── Public CMS (no auth required) ────────────────────────────────────────────

async def get_public_blog_posts(db: AsyncSession, skip: int = 0, limit: int = 12, category: str | None = None):
    q = select(BlogPost).where(BlogPost.is_published.is_(True)).order_by(BlogPost.created_at.desc())
    if category:
        q = q.where(BlogPost.category == category)
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_r.scalar() or 0
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all(), total


async def get_public_blog_post(db: AsyncSession, slug: str) -> BlogPost:
    result = await db.execute(
        select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published.is_(True))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise NotFoundError("Blog post not found")
    post.view_count = (post.view_count or 0) + 1
    await db.commit()
    return post


async def get_public_stories(db: AsyncSession):
    result = await db.execute(
        select(SuccessStory)
        .where(SuccessStory.is_published.is_(True))
        .order_by(SuccessStory.is_featured.desc(), SuccessStory.created_at.desc())
    )
    return result.scalars().all()


async def get_public_announcements(db: AsyncSession, audience: str = "all"):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Announcement).where(
            Announcement.is_active.is_(True),
            Announcement.target_audience.in_(["all", audience]),
            (Announcement.starts_at.is_(None)) | (Announcement.starts_at <= now),
            (Announcement.ends_at.is_(None)) | (Announcement.ends_at >= now),
        ).order_by(Announcement.created_at.desc())
    )
    return result.scalars().all()


async def get_public_faqs(db: AsyncSession, category: str | None = None):
    q = select(Faq).where(Faq.is_published.is_(True)).order_by(Faq.display_order, Faq.created_at)
    if category:
        q = q.where(Faq.category == category)
    result = await db.execute(q)
    return result.scalars().all()


# ── Bulk user actions ─────────────────────────────────────────────────────────

async def bulk_update_users(
    db: AsyncSession,
    user_ids: list[str],
    action: str,
    value: str | None,
    admin: AdminUser,
    ip: str | None,
) -> int:
    """Apply an action to multiple users. Returns affected count."""
    if not user_ids:
        raise BadRequestError("No user IDs provided")
    if len(user_ids) > 200:
        raise BadRequestError("Maximum 200 users per bulk action")

    uuids = []
    for uid in user_ids:
        try:
            uuids.append(uuid.UUID(uid))
        except ValueError:
            raise BadRequestError(f"Invalid user ID: {uid}")

    result = await db.execute(select(User).where(User.id.in_(uuids)))
    users = result.scalars().all()
    if not users:
        raise NotFoundError("No matching users found")

    affected = 0
    for user in users:
        if action == "set_status":
            allowed = {"trial", "active", "expired", "cancelled"}
            if value not in allowed:
                raise BadRequestError(f"status must be one of {allowed}")
            old = user.subscription_status
            user.subscription_status = value
            db.add(AuditLog(
                admin_id=admin.id, action="user.subscription_changed",
                target_type="user", target_id=str(user.id),
                extra={"from": old, "to": value, "bulk": True},
                ip_address=ip,
            ))
        elif action == "deactivate":
            user.is_active = False
            db.add(AuditLog(
                admin_id=admin.id, action="user.deactivated",
                target_type="user", target_id=str(user.id),
                extra={"bulk": True}, ip_address=ip,
            ))
        elif action == "reactivate":
            user.is_active = True
            db.add(AuditLog(
                admin_id=admin.id, action="user.reactivated",
                target_type="user", target_id=str(user.id),
                extra={"bulk": True}, ip_address=ip,
            ))
        else:
            raise BadRequestError(f"Unknown action: {action}")
        affected += 1

    await db.commit()
    return affected


# ── Content gap report ────────────────────────────────────────────────────────

async def get_content_gaps(db: AsyncSession) -> dict:
    """Per-subject: lesson counts, published ratio, unique completions."""
    # All subjects with lesson counts
    from sqlalchemy import case as sa_case
    rows = await db.execute(
        select(
            Subject.id,
            Subject.name,
            Subject.grade_category,
            Subject.is_active,
            func.count(Lesson.id).label("total_lessons"),
            func.coalesce(
                func.sum(sa_case((Lesson.is_published.is_(True), 1), else_=0)),
                0
            ).label("published_lessons"),
        )
        .outerjoin(Lesson, Lesson.subject_id == Subject.id)
        .group_by(Subject.id, Subject.name, Subject.grade_category, Subject.is_active)
        .order_by(Subject.grade_category, Subject.name)
    )
    subject_rows = rows.all()

    # Unique users who completed at least 1 lesson per subject
    comp_rows = await db.execute(
        select(
            Lesson.subject_id,
            func.count(UserProgress.user_id.distinct()).label("unique_completions"),
            func.count(UserProgress.id).label("total_progress_entries"),
            func.sum(
                sa_case((UserProgress.status == "completed", 1), else_=0)
            ).label("completed_entries"),
        )
        .join(Lesson, UserProgress.lesson_id == Lesson.id)
        .group_by(Lesson.subject_id)
    )
    comp_map: dict = {}
    for row in comp_rows:
        comp_map[str(row.subject_id)] = {
            "unique_completions": row.unique_completions or 0,
            "total_entries": row.total_progress_entries or 0,
            "completed_entries": row.completed_entries or 0,
        }

    subjects_by_grade: dict = {"primary": [], "junior": [], "senior": []}
    under_served = 0
    for row in subject_rows:
        sid = str(row.id)
        comp = comp_map.get(sid, {})
        total = row.total_lessons or 0
        published = int(row.published_lessons or 0)
        total_entries = comp.get("total_entries", 0)
        completed_entries = comp.get("completed_entries", 0)
        completion_rate = round(completed_entries / total_entries * 100, 1) if total_entries > 0 else 0.0
        is_under_served = published < 5

        if is_under_served and row.is_active:
            under_served += 1

        entry = {
            "id": sid,
            "name": row.name,
            "grade_category": row.grade_category,
            "is_active": row.is_active,
            "total_lessons": total,
            "published_lessons": published,
            "draft_lessons": total - published,
            "unique_completions": comp.get("unique_completions", 0),
            "completion_rate": completion_rate,
            "is_under_served": is_under_served,
        }
        cat = row.grade_category
        if cat in subjects_by_grade:
            subjects_by_grade[cat].append(entry)

    # Grade-level totals
    grade_totals = {}
    for grade, items in subjects_by_grade.items():
        grade_totals[grade] = {
            "subjects": len(items),
            "total_lessons": sum(i["total_lessons"] for i in items),
            "published_lessons": sum(i["published_lessons"] for i in items),
            "unique_completions": sum(i["unique_completions"] for i in items),
        }

    return {
        "subjects_by_grade": subjects_by_grade,
        "grade_totals": grade_totals,
        "under_served_count": under_served,
        "total_subjects": len(subject_rows),
    }


# ── Suspicious activity feed ──────────────────────────────────────────────────

async def get_suspicious_activity(db: AsyncSession) -> list[dict]:
    """Detect anomalous patterns across users and payments."""
    now = datetime.now(timezone.utc)
    window_24h = now - timedelta(hours=24)
    events: list[dict] = []

    # 1. Users with 3+ failed payments in 24h
    failed_rows = await db.execute(
        select(
            Subscription.user_id,
            func.count(PaymentTransaction.id).label("fail_count"),
            (User.first_name + " " + User.last_name).label("user_name"),
            User.email,
        )
        .join(Subscription, PaymentTransaction.subscription_id == Subscription.id)
        .join(User, Subscription.user_id == User.id)
        .where(
            PaymentTransaction.status == "failed",
            PaymentTransaction.created_at >= window_24h,
        )
        .group_by(Subscription.user_id, User.first_name, User.last_name, User.email)
        .having(func.count(PaymentTransaction.id) >= 3)
        .order_by(func.count(PaymentTransaction.id).desc())
    )
    for row in failed_rows:
        events.append({
            "event_type": "payment_failures",
            "severity": "high" if row.fail_count >= 5 else "medium",
            "user_id": str(row.user_id),
            "user_name": row.user_name,
            "user_email": row.email,
            "description": f"{row.fail_count} failed M-Pesa attempts in the last 24h",
            "count": row.fail_count,
            "occurred_at": now.isoformat(),
        })

    # 2. Users logging in from 2+ distinct IPs in 24h
    ip_rows = await db.execute(
        select(
            UserActivity.user_id,
            func.count(UserActivity.ip_address.distinct()).label("ip_count"),
            (User.first_name + " " + User.last_name).label("user_name"),
            User.email,
        )
        .join(User, UserActivity.user_id == User.id)
        .where(
            UserActivity.activity_type == "login",
            UserActivity.created_at >= window_24h,
            UserActivity.ip_address.isnot(None),
        )
        .group_by(UserActivity.user_id, User.first_name, User.last_name, User.email)
        .having(func.count(UserActivity.ip_address.distinct()) >= 2)
        .order_by(func.count(UserActivity.ip_address.distinct()).desc())
    )
    for row in ip_rows:
        events.append({
            "event_type": "multiple_ips",
            "severity": "medium",
            "user_id": str(row.user_id),
            "user_name": row.user_name,
            "user_email": row.email,
            "description": f"Logged in from {row.ip_count} different IP addresses in 24h",
            "count": row.ip_count,
            "occurred_at": now.isoformat(),
        })

    # 3. Trial users whose trial_end_date has passed but status is still 'trial'
    stale_trials = await db.execute(
        select(
            User.id, User.first_name, User.last_name, User.email, User.trial_end_date
        )
        .where(
            User.subscription_status == "trial",
            User.trial_end_date < now,
            User.trial_end_date.isnot(None),
        )
        .order_by(User.trial_end_date)
        .limit(50)
    )
    for row in stale_trials:
        days_overdue = (now - row.trial_end_date).days
        events.append({
            "event_type": "stale_trial",
            "severity": "low",
            "user_id": str(row.id),
            "user_name": f"{row.first_name} {row.last_name}",
            "user_email": row.email,
            "description": f"Trial ended {days_overdue}d ago but account still shows 'trial' status",
            "count": days_overdue,
            "occurred_at": row.trial_end_date.isoformat(),
        })

    # 4. High-activity accounts with zero completed lessons (potential bots)
    bot_rows = await db.execute(
        select(
            UserActivity.user_id,
            func.count(UserActivity.id).label("activity_count"),
            (User.first_name + " " + User.last_name).label("user_name"),
            User.email,
        )
        .join(User, UserActivity.user_id == User.id)
        .outerjoin(
            UserProgress,
            and_(UserProgress.user_id == UserActivity.user_id, UserProgress.status == "completed")
        )
        .where(UserProgress.id.is_(None))
        .group_by(UserActivity.user_id, User.first_name, User.last_name, User.email)
        .having(func.count(UserActivity.id) >= 20)
        .order_by(func.count(UserActivity.id).desc())
        .limit(20)
    )
    for row in bot_rows:
        events.append({
            "event_type": "high_activity_no_progress",
            "severity": "low",
            "user_id": str(row.user_id),
            "user_name": row.user_name,
            "user_email": row.email,
            "description": f"{row.activity_count} recorded activities but zero completed lessons",
            "count": row.activity_count,
            "occurred_at": now.isoformat(),
        })

    # Sort by severity: high → medium → low
    order = {"high": 0, "medium": 1, "low": 2}
    events.sort(key=lambda e: order.get(e["severity"], 3))
    return events
