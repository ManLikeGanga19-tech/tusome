from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_user, get_current_active_subscriber
from app.schemas.content import SubjectResponse, LessonResponse, LessonDetailResponse
from app.services.content_service import ContentService
from app.models.user import User

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ContentService(db).get_subjects_for_user(current_user)


@router.get("/subjects/{slug}/lessons", response_model=List[LessonResponse])
async def list_lessons(
    slug: str,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ContentService(db).get_lessons(slug, current_user)


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ContentService(db).get_lesson_detail(lesson_id, current_user)


@router.get("/search", response_model=List[LessonResponse])
async def search_content(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ContentService(db).search(q, current_user)
