from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError

from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError, SubscriptionRequiredError
from app.models.user import User
from app.models.admin import AdminUser, AdminSession

bearer_scheme = HTTPBearer()


# ── Student auth ─────────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedError("Invalid token type")
        # Reject admin tokens on student endpoints
        if payload.get("iss") == "tusome-admin":
            raise UnauthorizedError("Invalid token type")
        user_id: str = payload.get("sub")
    except JWTError:
        raise UnauthorizedError("Invalid or expired token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or deactivated")
    return user


async def get_current_active_subscriber(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.subscription_status not in ("trial", "active"):
        raise SubscriptionRequiredError()
    return current_user


# ── Admin auth & RBAC ─────────────────────────────────────────────────────────

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access" or payload.get("iss") != "tusome-admin":
            raise UnauthorizedError("Invalid admin token")
        admin_id: str = payload.get("sub")
        jti: str | None = payload.get("jti")
    except JWTError:
        raise UnauthorizedError("Invalid or expired token")

    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    if not admin or not admin.is_active:
        raise UnauthorizedError("Admin account not found or deactivated")

    # If token has a JTI, verify the session hasn't been force-revoked
    if jti:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        sess_r = await db.execute(
            select(AdminSession).where(
                AdminSession.jti == jti,
                AdminSession.is_active.is_(True),
                AdminSession.expires_at >= now,
            )
        )
        if not sess_r.scalar_one_or_none():
            raise UnauthorizedError("Session has been revoked or expired")

    return admin


def require_role(*roles: str):
    """Dependency factory — enforces role-based access on admin routes."""
    async def _dep(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        db: AsyncSession = Depends(get_db),
    ) -> AdminUser:
        admin = await get_current_admin(credentials, db)
        if admin.role not in roles:
            raise ForbiddenError(
                f"This action requires one of these roles: {', '.join(roles)}"
            )
        return admin
    return _dep
