from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_active_subscriber
from app.schemas.progress import ProgressUpdateRequest, SubjectProgressResponse, StreakResponse
from app.services.progress_service import ProgressService
from app.models.user import User

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectProgressResponse])
async def get_subject_progress(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ProgressService(db).get_subject_progress(current_user)


@router.post("/lesson")
async def update_lesson_progress(
    body: ProgressUpdateRequest,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ProgressService(db).update_lesson_progress(current_user, body)


@router.get("/streak", response_model=StreakResponse)
async def get_streak(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    return await ProgressService(db).get_streak(current_user)
