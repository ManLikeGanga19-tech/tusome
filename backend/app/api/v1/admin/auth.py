from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_admin
from app.models.admin import AdminUser
from app.schemas.admin import AdminLoginRequest, AdminTokenResponse, AdminResponse
from app.services import admin_service
from app.config import settings

router = APIRouter(prefix="/auth", tags=["admin-auth"])


@router.post("/login", response_model=AdminTokenResponse)
async def login(
    request: Request,
    body: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    token, admin = await admin_service.admin_login(db, body.email, body.password, ip, ua)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "admin": admin,
    }


@router.get("/me", response_model=AdminResponse)
async def me(admin: AdminUser = Depends(get_current_admin)):
    return admin
