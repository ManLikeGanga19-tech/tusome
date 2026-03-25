from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import AdminResponse, AdminCreateRequest, AdminUpdateRequest
from app.services import admin_service

router = APIRouter(prefix="/admins", tags=["admin-management"])

# Super admin only
_role = ("super_admin",)


@router.get("", response_model=List[AdminResponse])
async def list_admins(
    admin: AdminUser = Depends(require_role(*_role)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_admins(db)


@router.post("", response_model=AdminResponse, status_code=201)
async def create_admin(
    body: AdminCreateRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(*_role)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    return await admin_service.create_admin(
        db, body.name, body.email, body.password, body.role, admin, ip
    )


@router.patch("/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: str,
    body: AdminUpdateRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(*_role)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    data = body.model_dump(exclude_none=True)
    return await admin_service.update_admin(db, admin_id, data, admin, ip)
