"""
Admin service — handles all admin-panel business logic.
All mutating actions write an audit log entry.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.admin import AdminUser, AuditLog
from app.models.user import User
from app.models.content import Subject, Lesson
from app.models.payment import PaymentTransaction
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import NotFoundError, BadRequestError, ForbiddenError
from app.config import settings


# ── Auth ─────────────────────────────────────────────────────────────────────

async def admin_login(db: AsyncSession, email: str, password: str, ip: str | None):
    result = await db.execute(select(AdminUser).where(AdminUser.email == email.lower().strip()))
    admin = result.scalar_one_or_none()

    if not admin or not admin.is_active or not verify_password(password, admin.password_hash):
        raise BadRequestError("Invalid credentials")

    # Update last login
    admin.last_login_at = datetime.now(timezone.utc)

    # Audit
    db.add(AuditLog(
        admin_id=admin.id, action="admin.login",
        target_type="admin", target_id=str(admin.id),
        ip_address=ip,
    ))
    await db.commit()
    await db.refresh(admin)

    token = create_access_token(
        str(admin.id),
        extra={"role": admin.role, "iss": "tusome-admin"},
    )
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

    return {
        "total_users": total_users,
        "active_subscribers": active_subs,
        "trial_users": trial_users,
        "expired_users": expired_users,
        "total_lessons": total_lessons,
        "total_subjects": total_subjects,
        "revenue_this_month_ksh": revenue,
        "new_users_this_week": new_this_week,
    }


# ── User management ───────────────────────────────────────────────────────────

async def list_users(db: AsyncSession, search: str | None, skip: int, limit: int):
    q = select(User).order_by(User.created_at.desc())
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
