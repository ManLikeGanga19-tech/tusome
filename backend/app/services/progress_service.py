import uuid
from datetime import datetime, timezone, date, timedelta
from zoneinfo import ZoneInfo

import sqlalchemy as sa
from sqlalchemy import select, func, cast
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.types import Date as SADate

from app.models.progress import (
    UserProgress, UserStats, Badge, UserBadge,
    calc_level, next_level_xp, subject_tier,
    XP_FIRST_COMPLETE, XP_REREAD, XP_SUBJECT_MASTERED, XP_STREAK_CAP,
)
from app.models.content import Subject, Lesson
from app.models.user import User
from app.schemas.progress import (
    MarkCompleteResponse, UserStatsResponse, SubjectProgressResponse,
    CalendarDay, LeaderboardEntry, BadgeResponse, UserBadgeResponse,
)

EAT = ZoneInfo("Africa/Nairobi")


class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Public API ─────────────────────────────────────────────────────────

    async def mark_lesson_complete(
        self, user: User, lesson_id: uuid.UUID, time_spent_seconds: int = 0
    ) -> MarkCompleteResponse:
        lesson_r = await self.db.execute(
            select(Lesson).where(Lesson.id == lesson_id)
        )
        lesson = lesson_r.scalar_one_or_none()
        if lesson is None:
            raise ValueError(f"Lesson {lesson_id} not found")

        now = datetime.now(timezone.utc)

        # ── Upsert user_progress ──────────────────────────────────────────
        prog_r = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.lesson_id == lesson_id,
            )
        )
        progress = prog_r.scalar_one_or_none()
        first_completion = progress is None or progress.status != "completed"

        if progress is None:
            progress = UserProgress(
                user_id=user.id,
                lesson_id=lesson_id,
                subject_id=lesson.subject_id,
            )
            self.db.add(progress)
        elif first_completion:
            # Row exists but was only in_progress
            progress.subject_id = lesson.subject_id

        if first_completion:
            progress.status = "completed"
            progress.completed_at = now

        progress.last_accessed_at = now
        progress.time_spent_seconds = (progress.time_spent_seconds or 0) + time_spent_seconds

        # ── Upsert user_stats ─────────────────────────────────────────────
        stats_r = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user.id)
        )
        stats = stats_r.scalar_one_or_none()
        if stats is None:
            stats = UserStats(
                user_id=user.id,
                grade_category=user.grade_category,
                total_xp=0,
                level=1,
                level_name="Mwanzo",
                lessons_completed=0,
                subjects_mastered=0,
                current_streak=0,
                longest_streak=0,
            )
            self.db.add(stats)

        # ── XP calculation ────────────────────────────────────────────────
        if first_completion:
            # Streak must be updated first — streak bonus uses current_streak
            self._update_streak(stats)
            streak_bonus = min(stats.current_streak * 2, XP_STREAK_CAP)
            xp = XP_FIRST_COMPLETE + streak_bonus
            stats.lessons_completed += 1

            # Subject mastery bonus
            if lesson.subject_id and await self._check_subject_mastery(
                user.id, lesson.subject_id
            ):
                xp += XP_SUBJECT_MASTERED
                stats.subjects_mastered += 1
        else:
            xp = XP_REREAD

        progress.xp_earned = xp
        stats.total_xp += xp
        stats.grade_category = user.grade_category  # keep denorm fresh

        new_level, new_level_name = calc_level(stats.total_xp)
        stats.level = new_level
        stats.level_name = new_level_name

        # flush so badge checks see up-to-date stats
        await self.db.flush()

        newly_earned = await self._check_and_award_badges(user.id, stats)

        return MarkCompleteResponse(
            lesson_id=lesson_id,
            xp_earned=xp,
            total_xp=stats.total_xp,
            level=stats.level,
            level_name=stats.level_name,
            next_level_xp=next_level_xp(stats.total_xp),
            current_streak=stats.current_streak,
            newly_earned_badges=[BadgeResponse.model_validate(b) for b in newly_earned],
        )

    async def get_user_stats(self, user_id: uuid.UUID) -> UserStatsResponse:
        r = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user_id)
        )
        stats = r.scalar_one_or_none()
        if stats is None:
            return UserStatsResponse(
                total_xp=0, level=1, level_name="Mwanzo",
                next_level_xp=50,
                lessons_completed=0, subjects_mastered=0,
                current_streak=0, longest_streak=0,
                last_activity_date=None,
            )
        return UserStatsResponse(
            total_xp=stats.total_xp,
            level=stats.level,
            level_name=stats.level_name,
            next_level_xp=next_level_xp(stats.total_xp),
            lessons_completed=stats.lessons_completed,
            subjects_mastered=stats.subjects_mastered,
            current_streak=stats.current_streak,
            longest_streak=stats.longest_streak,
            last_activity_date=stats.last_activity_date,
        )

    async def get_subject_progress(self, user: User) -> list[SubjectProgressResponse]:
        """Single query per call — no N+1.  Two subqueries aggregated at DB level."""
        # Subquery: published lesson count per subject
        total_sq = (
            select(
                Lesson.subject_id.label("subject_id"),
                func.count().label("total"),
            )
            .where(Lesson.is_published.is_(True))
            .group_by(Lesson.subject_id)
            .subquery()
        )

        # Subquery: completed lessons per subject for this user
        completed_sq = (
            select(
                UserProgress.subject_id.label("subject_id"),
                func.count().label("completed"),
            )
            .where(
                UserProgress.user_id == user.id,
                UserProgress.status == "completed",
            )
            .group_by(UserProgress.subject_id)
            .subquery()
        )

        stmt = (
            select(
                Subject,
                func.coalesce(total_sq.c.total, 0).label("total"),
                func.coalesce(completed_sq.c.completed, 0).label("completed"),
            )
            .outerjoin(total_sq, total_sq.c.subject_id == Subject.id)
            .outerjoin(completed_sq, completed_sq.c.subject_id == Subject.id)
            .where(
                Subject.grade_category == user.grade_category,
                Subject.is_active.is_(True),
            )
            .order_by(Subject.order)
        )

        rows = (await self.db.execute(stmt)).all()
        result = []
        for subject, total, completed in rows:
            pct = round((completed / total * 100) if total else 0.0, 1)
            result.append(SubjectProgressResponse(
                subject_id=subject.id,
                subject_name=subject.name,
                total_lessons=total,
                completed_lessons=completed,
                percent_complete=pct,
                tier=subject_tier(pct),
            ))
        return result

    async def get_streak_calendar(self, user_id: uuid.UUID) -> list[CalendarDay]:
        """Last 30 days in EAT, marking each day a lesson was completed."""
        today = datetime.now(EAT).date()
        start = today - timedelta(days=29)

        # Convert completed_at to EAT date at DB level
        eat_date = cast(
            func.timezone("Africa/Nairobi", UserProgress.completed_at),
            SADate,
        ).label("day")

        r = await self.db.execute(
            select(eat_date)
            .where(
                UserProgress.user_id == user_id,
                UserProgress.status == "completed",
                UserProgress.completed_at.isnot(None),
                cast(
                    func.timezone("Africa/Nairobi", UserProgress.completed_at),
                    SADate,
                ) >= start,
            )
            .distinct()
        )
        active_dates = {row.day for row in r.fetchall()}

        return [
            CalendarDay(date=start + timedelta(days=i),
                        completed=((start + timedelta(days=i)) in active_dates))
            for i in range(30)
        ]

    async def get_leaderboard(
        self, grade_category: str | None = None
    ) -> list[LeaderboardEntry]:
        """Top 10 users by total_xp.  Pure index scan via ix_user_stats_grade_xp."""
        stmt = (
            select(UserStats, User)
            .join(User, User.id == UserStats.user_id)
            .where(User.is_active.is_(True))
        )
        if grade_category:
            stmt = stmt.where(UserStats.grade_category == grade_category)
        stmt = stmt.order_by(UserStats.total_xp.desc()).limit(10)

        rows = (await self.db.execute(stmt)).all()
        entries = []
        for rank, (stats, user) in enumerate(rows, start=1):
            # Partial last name for privacy: "Amara K."
            last_initial = (user.last_name[0] + ".") if user.last_name else ""
            entries.append(LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                display_name=f"{user.first_name} {last_initial}".strip(),
                total_xp=stats.total_xp,
                level=stats.level,
                level_name=stats.level_name,
                grade_category=stats.grade_category,
            ))
        return entries

    async def get_user_badges(self, user_id: uuid.UUID) -> list[UserBadgeResponse]:
        r = await self.db.execute(
            select(UserBadge)
            .options(selectinload(UserBadge.badge))
            .where(UserBadge.user_id == user_id)
            .order_by(UserBadge.earned_at.desc())
        )
        return [UserBadgeResponse.model_validate(ub) for ub in r.scalars().all()]

    # ── Private helpers ────────────────────────────────────────────────────

    def _update_streak(self, stats: UserStats) -> None:
        """Mutate stats streak fields in-place (EAT calendar dates)."""
        today = datetime.now(EAT).date()
        last = stats.last_activity_date

        if last == today:
            return  # already counted today — idempotent

        if last is not None and (today - last).days == 1:
            stats.current_streak += 1
            if stats.current_streak > stats.longest_streak:
                stats.longest_streak = stats.current_streak
        else:
            # Gap > 1 day or first ever activity
            stats.current_streak = 1
            if stats.longest_streak == 0:
                stats.longest_streak = 1

        stats.last_activity_date = today

    async def _check_subject_mastery(
        self, user_id: uuid.UUID, subject_id: uuid.UUID
    ) -> bool:
        """Return True if user has now completed every published lesson in the subject."""
        total_r = await self.db.execute(
            select(func.count()).select_from(Lesson).where(
                Lesson.subject_id == subject_id,
                Lesson.is_published.is_(True),
            )
        )
        total = total_r.scalar() or 0
        if total == 0:
            return False

        completed_r = await self.db.execute(
            select(func.count()).select_from(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.subject_id == subject_id,
                UserProgress.status == "completed",
            )
        )
        completed = completed_r.scalar() or 0
        return completed >= total

    async def _check_and_award_badges(
        self, user_id: uuid.UUID, stats: UserStats
    ) -> list[Badge]:
        """Compare current stats against all un-earned badges; award matches."""
        earned_r = await self.db.execute(
            select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
        )
        already_earned = {row[0] for row in earned_r.fetchall()}

        badges_r = await self.db.execute(select(Badge))
        newly_earned: list[Badge] = []

        for badge in badges_r.scalars().all():
            if badge.id in already_earned:
                continue

            unlocked = False
            if badge.criteria_type == "lessons_completed":
                unlocked = stats.lessons_completed >= badge.criteria_value
            elif badge.criteria_type == "streak_days":
                unlocked = stats.current_streak >= badge.criteria_value
            elif badge.criteria_type == "subjects_mastered":
                unlocked = stats.subjects_mastered >= badge.criteria_value
            elif badge.criteria_type == "level_reached":
                unlocked = stats.level >= badge.criteria_value

            if unlocked:
                self.db.add(UserBadge(user_id=user_id, badge_id=badge.id))
                stats.total_xp += badge.xp_bonus
                newly_earned.append(badge)

        if newly_earned:
            new_level, new_level_name = calc_level(stats.total_xp)
            stats.level = new_level
            stats.level_name = new_level_name

        return newly_earned
