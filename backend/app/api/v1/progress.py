import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_active_subscriber
from app.models.user import User
from app.schemas.progress import (
    MarkCompleteRequest,
    MarkCompleteResponse,
    UserStatsResponse,
    SubjectProgressResponse,
    CalendarDay,
    LeaderboardEntry,
    UserBadgeResponse,
)
from app.services.progress_service import ProgressService

router = APIRouter()


@router.post("/complete", response_model=MarkCompleteResponse)
async def mark_lesson_complete(
    body: MarkCompleteRequest,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a lesson as complete and award XP.
    Idempotent: calling again on an already-completed lesson awards re-read XP (2 XP)
    instead of the full first-completion reward.
    """
    try:
        return await ProgressService(db).mark_lesson_complete(
            current_user, body.lesson_id, body.time_spent_seconds
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/me", response_model=UserStatsResponse)
async def get_my_stats(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Return the current user's XP, level, streak, and aggregate counts."""
    return await ProgressService(db).get_user_stats(current_user.id)


@router.get("/subjects", response_model=list[SubjectProgressResponse])
async def get_subject_progress(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Per-subject completion stats for the user's grade category."""
    return await ProgressService(db).get_subject_progress(current_user)


@router.get("/calendar", response_model=list[CalendarDay])
async def get_streak_calendar(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Last 30 days in EAT (Africa/Nairobi), each day marked completed or not."""
    return await ProgressService(db).get_streak_calendar(current_user.id)


@router.get("/badges", response_model=list[UserBadgeResponse])
async def get_my_badges(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """All badges the current user has earned, most recent first."""
    return await ProgressService(db).get_user_badges(current_user.id)


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    grade_category: Optional[str] = Query(
        None,
        description="Filter to a grade category (primary | junior | senior). "
                    "Omit for the global top-10.",
    ),
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """
    Top-10 leaderboard by XP.  Defaults to the caller's own grade category
    so students compete within their tier.  Pass grade_category=all to see global.
    """
    category = (
        None if grade_category == "all"
        else (grade_category or current_user.grade_category)
    )
    return await ProgressService(db).get_leaderboard(category)
