from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_admin
from app.models.admin import AdminUser
from app.schemas.admin import AnalyticsOverview, ContentGapReport, SuspiciousEvent
from app.services import admin_service

router = APIRouter(prefix="/analytics", tags=["admin-analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def analytics_overview(
    days: int = Query(30, ge=7, le=365),
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_analytics_overview(db, days)


@router.get("/content-gaps", response_model=ContentGapReport)
async def content_gaps(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_content_gaps(db)


@router.get("/suspicious", response_model=List[SuspiciousEvent])
async def suspicious_activity(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.get_suspicious_activity(db)
