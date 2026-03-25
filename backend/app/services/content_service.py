import uuid as _uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.content import Subject, Lesson
from app.models.user import User
from app.core.exceptions import NotFoundError, ForbiddenError


class ContentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_subjects_for_user(self, user: User):
        # Subquery: count published lessons per subject
        lesson_count_sq = (
            select(func.count())
            .select_from(Lesson)
            .where(
                Lesson.subject_id == Subject.id,
                Lesson.is_published.is_(True),
            )
            .correlate(Subject)
            .scalar_subquery()
        )

        result = await self.db.execute(
            select(Subject, lesson_count_sq.label("lesson_count"))
            .where(
                Subject.grade_category == user.grade_category,
                Subject.is_active.is_(True),
            )
            .order_by(Subject.order)
        )

        rows = result.all()
        # Attach lesson_count to each Subject instance for Pydantic
        subjects = []
        for subject, count in rows:
            subject.lesson_count = count
            subjects.append(subject)
        return subjects

    async def get_lessons(self, subject_slug: str, user: User):
        subject_result = await self.db.execute(
            select(Subject).where(Subject.slug == subject_slug)
        )
        subject = subject_result.scalar_one_or_none()
        if not subject:
            raise NotFoundError("Subject not found")
        if subject.grade_category != user.grade_category:
            raise ForbiddenError("You do not have access to this subject")

        result = await self.db.execute(
            select(Lesson)
            .options(selectinload(Lesson.resources))
            .where(
                Lesson.subject_id == subject.id,
                Lesson.is_published.is_(True),
            )
            .order_by(Lesson.order)
        )
        return result.scalars().all()

    async def get_lesson_detail(self, lesson_id: str, user: User):
        try:
            uid = _uuid.UUID(lesson_id)
        except (ValueError, AttributeError):
            raise NotFoundError("Lesson not found")
        result = await self.db.execute(
            select(Lesson).options(selectinload(Lesson.resources)).where(Lesson.id == uid)
        )
        lesson = result.scalar_one_or_none()
        if not lesson:
            raise NotFoundError("Lesson not found")

        subject_result = await self.db.execute(select(Subject).where(Subject.id == lesson.subject_id))
        subject = subject_result.scalar_one_or_none()
        if subject.grade_category != user.grade_category:
            raise ForbiddenError("Access denied")

        return lesson

    async def search(self, query: str, user: User):
        result = await self.db.execute(
            select(Lesson)
            .options(selectinload(Lesson.resources))
            .join(Subject)
            .where(
                Subject.grade_category == user.grade_category,
                Lesson.is_published.is_(True),
                Lesson.title.ilike(f"%{query}%"),
            )
            .limit(20)
        )
        return result.scalars().all()
