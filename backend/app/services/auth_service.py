"""
AuthService — handles registration, login, token management, email verification, password reset.
All business logic lives here; the route layer only does HTTP concerns.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import BadRequestError, UnauthorizedError, ConflictError, NotFoundError
from app.models.user import User, RefreshToken, EmailVerificationToken, PasswordResetToken, UserActivity, UserPreferences, DEFAULT_PREFS
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.auth import MessageResponse
from app.schemas.user import AuthResponse, UserResponse


GRADE_MAP = {
    "grade-4": ("primary", "Primary CBC"),
    "grade-5": ("primary", "Primary CBC"),
    "grade-6": ("primary", "Primary CBC"),
    "grade-7": ("junior", "Junior Secondary"),
    "grade-8": ("junior", "Junior Secondary"),
    "grade-9": ("junior", "Junior Secondary"),
    "grade-10": ("senior", "Senior Secondary"),
    "grade-11": ("senior", "Senior Secondary"),
    "grade-12": ("senior", "Senior Secondary"),
}


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _build_auth_response(user: User, message: str) -> AuthResponse:
    access_token = create_access_token(str(user.id), {"grade": user.grade_category})
    refresh_token = create_refresh_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        message=message,
    ), refresh_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Profile & password ────────────────────────────────────────────────

    async def update_profile(self, user: User, body) -> User:
        """Update editable profile fields (first_name, last_name, profile_image)."""
        if body.first_name is not None:
            user.first_name = body.first_name.strip()
        if body.last_name is not None:
            user.last_name = body.last_name.strip()
        if body.profile_image is not None:
            user.profile_image = body.profile_image
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(self, user: User, current_password: str, new_password: str) -> None:
        """Verify current password then save the new hash."""
        if not verify_password(current_password, user.password_hash):
            raise BadRequestError("Current password is incorrect")
        user.password_hash = hash_password(new_password)
        await self.db.commit()

    async def get_preferences(self, user: User) -> UserPreferences:
        """Return the user's preferences row, creating it with defaults if missing."""
        result = await self.db.execute(
            select(UserPreferences).where(UserPreferences.user_id == user.id)
        )
        row = result.scalar_one_or_none()
        if not row:
            import copy
            row = UserPreferences(user_id=user.id, prefs=copy.deepcopy(DEFAULT_PREFS))
            self.db.add(row)
            await self.db.commit()
            await self.db.refresh(row)
        return row

    async def update_preferences(self, user: User, prefs: dict) -> UserPreferences:
        """Merge incoming prefs dict over existing prefs and save."""
        row = await self.get_preferences(user)
        import copy
        merged = copy.deepcopy(row.prefs)
        for key, val in prefs.items():
            if isinstance(val, dict) and isinstance(merged.get(key), dict):
                merged[key].update(val)
            else:
                merged[key] = val
        row.prefs = merged
        await self.db.commit()
        await self.db.refresh(row)
        return row

    # ── Registration & login ──────────────────────────────────────────────

    async def register(self, body: RegisterRequest, request: Request) -> AuthResponse:
        if not body.agree_terms:
            raise BadRequestError("You must agree to the terms")

        if body.grade_level not in GRADE_MAP:
            raise BadRequestError(f"Invalid grade level: {body.grade_level}")

        existing = await self.db.execute(select(User).where(User.email == body.email.lower()))
        if existing.scalar_one_or_none():
            raise ConflictError("Email already registered")

        grade_category, grade_tier = GRADE_MAP[body.grade_level]
        now = datetime.now(timezone.utc)

        user = User(
            first_name=body.first_name.strip(),
            last_name=body.last_name.strip(),
            email=body.email.lower(),
            password_hash=hash_password(body.password),
            grade=body.grade_level,
            grade_category=grade_category,
            grade_tier=grade_tier,
            trial_start_date=now,
            trial_end_date=now + timedelta(days=settings.TRIAL_DAYS),
            subscription_status="trial",
        )
        self.db.add(user)
        await self.db.flush()  # get user.id without committing

        await self._log_activity(user.id, "user_registered", request)

        response, refresh_jwt = _build_auth_response(user, "Registration successful! Your 7-day trial has started.")
        await self._store_refresh_token(user, refresh_jwt)
        return response

    async def login(self, body: LoginRequest, request: Request) -> AuthResponse:
        result = await self.db.execute(select(User).where(User.email == body.email.lower()))
        user = result.scalar_one_or_none()

        if not user or not verify_password(body.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedError("Account deactivated. Contact support.")

        user.last_login_at = datetime.now(timezone.utc)
        await self._log_activity(user.id, "user_login", request)

        response, refresh_jwt = _build_auth_response(user, "Login successful")
        await self._store_refresh_token(user, refresh_jwt)
        return response

    async def logout(self, user: User, refresh_token: str) -> dict:
        h = _token_hash(refresh_token)
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.token_hash == h)
        )
        token_row = result.scalar_one_or_none()
        if token_row:
            await self.db.delete(token_row)
        return {"message": "Logged out successfully"}

    async def refresh(self, refresh_token: str) -> AuthResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise UnauthorizedError("Invalid token type")
            user_id = payload["sub"]
        except Exception:
            raise UnauthorizedError("Invalid refresh token")

        h = _token_hash(refresh_token)
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == h)
        )
        token_row = result.scalar_one_or_none()
        if not token_row or token_row.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("Refresh token expired or invalid")

        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise UnauthorizedError("User not found")

        await self.db.delete(token_row)

        response, new_refresh_jwt = _build_auth_response(user, "Token refreshed")
        await self._store_refresh_token(user, new_refresh_jwt)
        return response

    async def forgot_password(self, email: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()
        # Always return success to prevent email enumeration
        if user:
            token = secrets.token_urlsafe(32)
            expires = datetime.now(timezone.utc) + timedelta(hours=1)
            self.db.add(PasswordResetToken(
                user_id=user.id,
                token_hash=_token_hash(token),
                expires_at=expires,
            ))
            # TODO: send email via EmailService
        return {"message": "If that email is registered, a reset link has been sent"}

    async def reset_password(self, token: str, new_password: str) -> dict:
        h = _token_hash(token)
        result = await self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == h,
                PasswordResetToken.used_at.is_(None),
            )
        )
        token_row = result.scalar_one_or_none()
        if not token_row or token_row.expires_at < datetime.now(timezone.utc):
            raise BadRequestError("Reset token is invalid or expired")

        user_result = await self.db.execute(select(User).where(User.id == token_row.user_id))
        user = user_result.scalar_one_or_none()
        user.password_hash = hash_password(new_password)
        token_row.used_at = datetime.now(timezone.utc)
        return {"message": "Password updated successfully"}

    async def user_lookup(self, email: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()
        if not user:
            return {"user": None}
        return {
            "user": {
                "grade_category": user.grade_category,
                "grade_tier": user.grade_tier,
                "subscription_status": user.subscription_status,
            }
        }

    async def verify_email(self, token: str) -> dict:
        h = _token_hash(token)
        result = await self.db.execute(
            select(EmailVerificationToken).where(
                EmailVerificationToken.token_hash == h,
                EmailVerificationToken.used_at.is_(None),
            )
        )
        token_row = result.scalar_one_or_none()
        if not token_row or token_row.expires_at < datetime.now(timezone.utc):
            raise BadRequestError("Verification token is invalid or expired")

        user_result = await self.db.execute(select(User).where(User.id == token_row.user_id))
        user = user_result.scalar_one_or_none()
        user.email_verified = True
        token_row.used_at = datetime.now(timezone.utc)
        return {"message": "Email verified successfully"}

    # ── helpers ──────────────────────────────────────────────────────────────

    async def _store_refresh_token(self, user: User, token: str) -> None:
        self.db.add(RefreshToken(
            user_id=user.id,
            token_hash=_token_hash(token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        ))

    async def _log_activity(self, user_id, activity_type: str, request: Request):
        self.db.add(UserActivity(
            user_id=user_id,
            activity_type=activity_type,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        ))
