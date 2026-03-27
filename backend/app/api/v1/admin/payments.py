from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.api.deps import require_role
from app.models.admin import AdminUser
from app.schemas.admin import PaymentTransactionAdminResponse
from app.services import admin_service

router = APIRouter(prefix="/payments", tags=["admin-payments"])

_roles = ("super_admin", "support_agent")


@router.get("")
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    admin: AdminUser = Depends(require_role(*_roles)),
    db: AsyncSession = Depends(get_db),
):
    results, total = await admin_service.list_payment_transactions(db, skip, limit, status)
    return {"total": total, "skip": skip, "limit": limit, "results": results}
