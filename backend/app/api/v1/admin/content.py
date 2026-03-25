from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import (
    SubjectAdminResponse, LessonAdminResponse,
    LessonPublishRequest, SubjectActiveRequest,
)
from app.services import admin_service

router = APIRouter(prefix="/content", tags=["admin-content"])

# Both super_admin and content_editor can manage content
_roles = ("super_admin", "content_editor")


@router.get("/subjects", response_model=List[SubjectAdminResponse])
async def list_subjects(
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_subjects_admin(db)


@router.patch("/subjects/{subject_id}/active", response_model=SubjectAdminResponse)
async def toggle_subject(
    subject_id: str,
    body: SubjectActiveRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    subject = await admin_service.toggle_subject_active(db, subject_id, body.is_active, admin, ip)
    subject.lesson_count = 0  # not critical here
    return subject


@router.get("/subjects/{slug}/lessons", response_model=List[LessonAdminResponse])
async def list_lessons(
    slug: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_lessons_admin(db, slug)


@router.patch("/lessons/{lesson_id}/publish", response_model=LessonAdminResponse)
async def toggle_lesson(
    lesson_id: str,
    body: LessonPublishRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    return await admin_service.toggle_lesson_publish(db, lesson_id, body.is_published, admin, ip)
