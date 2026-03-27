import io
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_admin, require_role
from app.models.admin import AdminUser
from app.schemas.admin import AdminSessionResponse
from app.services import admin_service

router = APIRouter(prefix="/sessions", tags=["admin-sessions"])


@router.get("", response_model=List[AdminSessionResponse])
async def list_sessions(
    active_only: bool = True,
    admin: AdminUser = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all admin sessions (super_admin only)."""
    return await admin_service.list_admin_sessions(db, active_only=active_only)


@router.delete("/{session_id}", status_code=204)
async def force_logout(
    session_id: str,
    request: Request,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Force-revoke an admin session. super_admin can revoke anyone; others only their own."""
    ip = request.client.host if request.client else None
    await admin_service.force_logout_session(db, session_id, admin, ip)
    return Response(status_code=204)
