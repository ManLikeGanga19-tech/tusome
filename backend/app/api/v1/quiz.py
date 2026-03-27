"""
Quiz API — authenticated student endpoints.
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_active_subscriber
from app.models.user import User
from app.schemas.quiz import QuizOut, SubmitAttemptRequest, AttemptResult, AttemptSummary, QuizListItem
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("", response_model=list[QuizListItem])
async def list_quizzes(
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Return all published quizzes for the student's grade, with their best attempt info."""
    return await QuizService(db).list_quizzes(current_user)


@router.get("/lesson/{lesson_id}", response_model=QuizOut)
async def get_quiz_for_lesson(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Return the published quiz attached to a lesson."""
    return await QuizService(db).get_quiz_for_lesson(lesson_id, current_user)


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Return a quiz by its own ID."""
    return await QuizService(db).get_quiz(quiz_id, current_user)


@router.post("/{quiz_id}/attempt", response_model=AttemptResult)
async def submit_attempt(
    quiz_id: uuid.UUID,
    body: SubmitAttemptRequest,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Grade a quiz attempt and return detailed results + XP earned."""
    return await QuizService(db).submit_attempt(quiz_id, current_user, body)


@router.get("/{quiz_id}/my-attempts", response_model=list[AttemptSummary])
async def get_my_attempts(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_active_subscriber),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's last 10 attempts for a quiz."""
    return await QuizService(db).get_my_attempts(quiz_id, current_user)
