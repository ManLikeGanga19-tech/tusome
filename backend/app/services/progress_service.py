from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.progress import UserProgress, UserStreak
from app.models.content import Subject, Lesson
from app.models.user import User
from app.schemas.progress import ProgressUpdateRequest, SubjectProgressResponse, StreakResponse


class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_subject_progress(self, user: User):
        subjects_result = await self.db.execute(
            select(Subject).where(Subject.grade_category == user.grade_category, Subject.is_active.is_(True))
        )
        subjects = subjects_result.scalars().all()

        summaries = []
        for subject in subjects:
            total_result = await self.db.execute(
                select(func.count()).select_from(Lesson).where(
                    Lesson.subject_id == subject.id, Lesson.is_published.is_(True)
                )
            )
            total = total_result.scalar() or 0

            completed_result = await self.db.execute(
                select(func.count()).select_from(UserProgress)
                .join(Lesson)
                .where(
                    Lesson.subject_id == subject.id,
                    UserProgress.user_id == user.id,
                    UserProgress.status == "completed",
                )
            )
            completed = completed_result.scalar() or 0

            summaries.append(SubjectProgressResponse(
                subject_id=subject.id,
                subject_name=subject.name,
                total_lessons=total,
                completed_lessons=completed,
                percent_complete=round((completed / total * 100) if total else 0, 1),
            ))

        return summaries

    async def update_lesson_progress(self, user: User, body: ProgressUpdateRequest):
        result = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.lesson_id == body.lesson_id,
            )
        )
        progress = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if not progress:
            progress = UserProgress(user_id=user.id, lesson_id=body.lesson_id)
            self.db.add(progress)

        progress.status = body.status
        progress.time_spent_seconds += body.time_spent_seconds
        progress.last_accessed_at = now
        if body.score is not None:
            progress.score = body.score
        if body.status == "completed" and not progress.completed_at:
            progress.completed_at = now

        await self._update_streak(user)
        return progress

    async def get_streak(self, user: User) -> StreakResponse:
        result = await self.db.execute(select(UserStreak).where(UserStreak.user_id == user.id))
        streak = result.scalar_one_or_none()
        if not streak:
            return StreakResponse(current_streak=0, longest_streak=0, last_study_date=None)
        return StreakResponse(
            current_streak=streak.current_streak,
            longest_streak=streak.longest_streak,
            last_study_date=streak.last_study_date,
        )

    async def _update_streak(self, user: User):
        result = await self.db.execute(select(UserStreak).where(UserStreak.user_id == user.id))
        streak = result.scalar_one_or_none()
        today = date.today()

        if not streak:
            streak = UserStreak(user_id=user.id, current_streak=1, longest_streak=1, last_study_date=datetime.now(timezone.utc))
            self.db.add(streak)
            return

        last = streak.last_study_date.date() if streak.last_study_date else None
        if last == today:
            return
        elif last and (today - last).days == 1:
            streak.current_streak += 1
            streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        else:
            streak.current_streak = 1

        streak.last_study_date = datetime.now(timezone.utc)
