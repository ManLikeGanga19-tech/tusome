from fastapi import APIRouter
from app.api.v1 import auth, users, content, progress, payments, admin

api_router = APIRouter()

api_router.include_router(auth.router,     prefix="/auth",          tags=["Auth"])
api_router.include_router(users.router,    prefix="/users",         tags=["Users"])
api_router.include_router(content.router,  prefix="/content",       tags=["Content"])
api_router.include_router(progress.router, prefix="/progress",      tags=["Progress"])
api_router.include_router(payments.router, prefix="/payments",      tags=["Payments"])
api_router.include_router(admin.router,    prefix="/admin",         tags=["Admin"])
