"""
Public CMS endpoints — no authentication required.
Used by the student web app to render blog, success stories, announcements, FAQs.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.schemas.cms import BlogPostResponse, SuccessStoryResponse, AnnouncementResponse, FaqResponse
from app.services import admin_service

router = APIRouter(prefix="/public", tags=["Public CMS"])


@router.get("/blog")
async def list_blog(
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    posts, total = await admin_service.get_public_blog_posts(db, skip, limit, category)
    return {
        "total": total,
        "results": [BlogPostResponse.model_validate(p) for p in posts],
    }


@router.get("/blog/{slug}", response_model=BlogPostResponse)
async def get_blog_post(slug: str, db: AsyncSession = Depends(get_db)):
    return await admin_service.get_public_blog_post(db, slug)


@router.get("/stories")
async def list_stories(db: AsyncSession = Depends(get_db)):
    stories = await admin_service.get_public_stories(db)
    return [SuccessStoryResponse.model_validate(s) for s in stories]


@router.get("/announcements")
async def list_announcements(
    audience: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    anns = await admin_service.get_public_announcements(db, audience)
    return [AnnouncementResponse.model_validate(a) for a in anns]


@router.get("/faqs")
async def list_faqs(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    faqs = await admin_service.get_public_faqs(db, category)
    return [FaqResponse.model_validate(f) for f in faqs]
