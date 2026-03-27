"""
CMS admin endpoints — blog posts, success stories, announcements, FAQs.
Role access:
  - super_admin: full CRUD on everything
  - content_editor: full CRUD on blog, stories, FAQs; view-only on announcements
  - support_agent: view-only on blog/stories/FAQs; full CRUD on announcements
"""
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_admin, require_role
from app.models.admin import AdminUser
from app.schemas.cms import (
    BlogPostCreate, BlogPostUpdate, BlogPostResponse,
    SuccessStoryCreate, SuccessStoryUpdate, SuccessStoryResponse,
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    FaqCreate, FaqUpdate, FaqResponse,
)
from app.services import admin_service

router = APIRouter(prefix="/cms", tags=["admin-cms"])

_content_roles = ("super_admin", "content_editor")
_support_roles = ("super_admin", "support_agent")
_all_roles = ("super_admin", "content_editor", "support_agent")


# ── Blog Posts ────────────────────────────────────────────────────────────────

@router.get("/blog", response_model=dict)
async def list_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin: AdminUser = Depends(require_role(*_all_roles)),
    db: AsyncSession = Depends(get_db),
):
    posts, total = await admin_service.list_blog_posts(db, skip, limit)
    return {
        "total": total,
        "results": [BlogPostResponse.model_validate(p) for p in posts],
    }


@router.post("/blog", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    body: BlogPostCreate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_blog_post(db, body.model_dump(), admin)


@router.patch("/blog/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    body: BlogPostUpdate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_blog_post(db, post_id, body.model_dump(exclude_none=True), admin)


@router.delete("/blog/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: str,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_blog_post(db, post_id, admin)


# ── Success Stories ───────────────────────────────────────────────────────────

@router.get("/stories", response_model=dict)
async def list_stories(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin: AdminUser = Depends(require_role(*_all_roles)),
    db: AsyncSession = Depends(get_db),
):
    stories, total = await admin_service.list_success_stories(db, skip, limit)
    return {
        "total": total,
        "results": [SuccessStoryResponse.model_validate(s) for s in stories],
    }


@router.post("/stories", response_model=SuccessStoryResponse, status_code=201)
async def create_story(
    body: SuccessStoryCreate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_success_story(db, body.model_dump(), admin)


@router.patch("/stories/{story_id}", response_model=SuccessStoryResponse)
async def update_story(
    story_id: str,
    body: SuccessStoryUpdate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_success_story(db, story_id, body.model_dump(exclude_none=True), admin)


@router.delete("/stories/{story_id}", status_code=204)
async def delete_story(
    story_id: str,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_success_story(db, story_id, admin)


# ── Announcements ─────────────────────────────────────────────────────────────

@router.get("/announcements", response_model=List[AnnouncementResponse])
async def list_announcements(
    admin: AdminUser = Depends(require_role(*_all_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_announcements(db)


@router.post("/announcements", response_model=AnnouncementResponse, status_code=201)
async def create_announcement(
    body: AnnouncementCreate,
    admin: AdminUser = Depends(require_role(*_support_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_announcement(db, body.model_dump(), admin)


@router.patch("/announcements/{ann_id}", response_model=AnnouncementResponse)
async def update_announcement(
    ann_id: str,
    body: AnnouncementUpdate,
    admin: AdminUser = Depends(require_role(*_support_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_announcement(db, ann_id, body.model_dump(exclude_none=True), admin)


@router.delete("/announcements/{ann_id}", status_code=204)
async def delete_announcement(
    ann_id: str,
    admin: AdminUser = Depends(require_role(*_support_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_announcement(db, ann_id, admin)


# ── FAQs ──────────────────────────────────────────────────────────────────────

@router.get("/faqs", response_model=List[FaqResponse])
async def list_faqs(
    admin: AdminUser = Depends(require_role(*_all_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.list_faqs(db)


@router.post("/faqs", response_model=FaqResponse, status_code=201)
async def create_faq(
    body: FaqCreate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_faq(db, body.model_dump(), admin)


@router.patch("/faqs/{faq_id}", response_model=FaqResponse)
async def update_faq(
    faq_id: str,
    body: FaqUpdate,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_faq(db, faq_id, body.model_dump(exclude_none=True), admin)


@router.delete("/faqs/{faq_id}", status_code=204)
async def delete_faq(
    faq_id: str,
    admin: AdminUser = Depends(require_role(*_content_roles)),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_faq(db, faq_id, admin)
