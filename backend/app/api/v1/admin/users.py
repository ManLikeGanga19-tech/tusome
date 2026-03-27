from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import AdminUserView, SubscriptionOverrideRequest, UserProfileResponse, BulkUserActionRequest, BulkUserActionResponse
from app.services import admin_service

router = APIRouter(prefix="/users", tags=["admin-users"])

# Both super_admin and support_agent can manage users
_roles = ("super_admin", "support_agent")


def _user_view_dict(u) -> dict:
    d = AdminUserView.model_validate(u).model_dump()
    s = u.stats
    d["total_xp"] = s.total_xp if s else 0
    d["level"] = s.level if s else 1
    d["level_name"] = s.level_name if s else "Mwanzo"
    d["current_streak"] = s.current_streak if s else 0
    d["lessons_completed"] = s.lessons_completed if s else 0
    return d


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
        "results": [_user_view_dict(u) for u in users],
    }


@router.post("/bulk", response_model=BulkUserActionResponse)
async def bulk_user_action(
    body: BulkUserActionRequest,
    request: Request,
    admin: AdminUser = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    affected = await admin_service.bulk_update_users(
        db, body.user_ids, body.action, body.value, admin, ip
    )
    return {"affected": affected, "action": body.action}


@router.get("/export")
async def export_users_csv(
    admin: AdminUser = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Download all users as a CSV file."""
    csv_data = await admin_service.export_users_csv(db)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"},
    )


@router.get("/expiring-trials", response_model=list)
async def expiring_trials(
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    users = await admin_service.list_expiring_trials(db)
    return [AdminUserView.model_validate(u) for u in users]


@router.get("/{user_id}/progress", response_model=dict)
async def user_progress(
    user_id: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_user_progress(db, user_id)


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def user_profile(
    user_id: str,
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_user_profile(db, user_id)


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
