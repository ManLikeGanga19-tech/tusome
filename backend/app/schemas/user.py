import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    grade: str
    grade_category: str
    grade_tier: str
    profile_image: Optional[str]
    is_active: bool
    email_verified: bool
    subscription_status: str
    trial_end_date: Optional[datetime]
    last_login_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    message: str


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    profile_image: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class PreferencesResponse(BaseModel):
    prefs: dict

    model_config = {"from_attributes": True}


class UpdatePreferencesRequest(BaseModel):
    prefs: dict
