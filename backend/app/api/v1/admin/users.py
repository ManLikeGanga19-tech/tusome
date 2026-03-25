from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import AdminUserView, SubscriptionOverrideRequest
from app.services import admin_service

router = APIRouter(prefix="/users", tags=["admin-users"])

# Both super_admin and support_agent can manage users
_roles = ("super_admin", "support_agent")


@router.get("", response_model=dict)
async def list_users(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    users, total = await admin_service.list_users(db, search, skip, limit)
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "results": [AdminUserView.model_validate(u) for u in users],
    }


@router.patch("/{user_id}/subscription", response_model=AdminUserView)
async def override_subscription(
    user_id: str,
    body: SubscriptionOverrideRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    user = await admin_service.override_subscription(db, user_id, body.subscription_status, admin, ip)
    return user
