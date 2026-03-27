from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import (
    QuizAdminResponse, QuizAdminDetailResponse,
    QuizCreate, QuizUpdate,
    QuestionAdminOut, QuestionCreate, QuestionUpdate,
    ChoiceAdminOut, ChoiceCreate, ChoiceUpdate,
)
from app.services import admin_service

router = APIRouter(prefix="/quizzes", tags=["admin-quizzes"])

_roles = ("super_admin", "content_editor")


@router.get("", response_model=List[QuizAdminResponse])
async def list_quizzes(
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_quizzes_admin(db)


@router.post("", response_model=QuizAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    body: QuizCreate,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    return await admin_service.create_quiz(db, body.model_dump(), admin, ip)


@router.get("/{quiz_id}", response_model=QuizAdminDetailResponse)
async def get_quiz(
    quiz_id: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_quiz_admin(db, quiz_id)


@router.patch("/{quiz_id}", response_model=QuizAdminResponse)
async def update_quiz(
    quiz_id: str,
    body: QuizUpdate,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    return await admin_service.update_quiz(db, quiz_id, body.model_dump(exclude_unset=True), admin, ip)


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: str,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    await admin_service.delete_quiz(db, quiz_id, admin, ip)


# ── Questions ─────────────────────────────────────────────────────────────────

@router.post("/{quiz_id}/questions", response_model=QuestionAdminOut, status_code=status.HTTP_201_CREATED)
async def create_question(
    quiz_id: str,
    body: QuestionCreate,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_question(db, quiz_id, body.model_dump())


@router.patch("/{quiz_id}/questions/{question_id}", response_model=QuestionAdminOut)
async def update_question(
    quiz_id: str,
    question_id: str,
    body: QuestionUpdate,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_question(db, question_id, body.model_dump(exclude_unset=True))


@router.delete("/{quiz_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    quiz_id: str,
    question_id: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_question(db, question_id)


# ── Choices ───────────────────────────────────────────────────────────────────

@router.post("/{quiz_id}/questions/{question_id}/choices", response_model=ChoiceAdminOut, status_code=status.HTTP_201_CREATED)
async def create_choice(
    quiz_id: str,
    question_id: str,
    body: ChoiceCreate,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_choice(db, question_id, body.model_dump())


@router.patch("/{quiz_id}/questions/{question_id}/choices/{choice_id}", response_model=ChoiceAdminOut)
async def update_choice(
    quiz_id: str,
    question_id: str,
    choice_id: str,
    body: ChoiceUpdate,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_choice(db, choice_id, body.model_dump(exclude_unset=True))


@router.delete("/{quiz_id}/questions/{question_id}/choices/{choice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_choice(
    quiz_id: str,
    question_id: str,
    choice_id: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_choice(db, choice_id)
