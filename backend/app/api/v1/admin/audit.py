from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import AuditLogResponse
from app.services import admin_service

router = APIRouter(prefix="/audit", tags=["admin-audit"])


@router.get("", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: AdminUser = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_audit_logs(db, skip, limit)
