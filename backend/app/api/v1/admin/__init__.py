from fastapi import APIRouter
from app.api.v1.admin.auth import router as auth_router
from app.api.v1.admin.dashboard import router as dashboard_router
from app.api.v1.admin.users import router as users_router
from app.api.v1.admin.content import router as content_router
from app.api.v1.admin.admins import router as admins_router
from app.api.v1.admin.audit import router as audit_router
from app.api.v1.admin.analytics import router as analytics_router
from app.api.v1.admin.payments import router as payments_router
from app.api.v1.admin.cms import router as cms_router
from app.api.v1.admin.sessions import router as sessions_router
from app.api.v1.admin.quizzes import router as quizzes_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(dashboard_router)
router.include_router(analytics_router)
router.include_router(users_router)
router.include_router(content_router)
router.include_router(admins_router)
router.include_router(audit_router)
router.include_router(payments_router)
router.include_router(cms_router)
router.include_router(sessions_router)
router.include_router(quizzes_router)
