import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class MpesaStkPushRequest(BaseModel):
    phone_number: str    # 2547XXXXXXXX format
    plan: str            # monthly | weekly | daily | yearly


class MpesaCallbackRequest(BaseModel):
    Body: dict           # Raw Safaricom callback payload


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    plan: str
    grade_tier: str
    amount_ksh: int
    status: str
    starts_at: datetime
    ends_at: datetime

    model_config = {"from_attributes": True}


class PaymentStatusResponse(BaseModel):
    subscription: Optional[SubscriptionResponse]
    subscription_status: str
    trial_end_date: Optional[datetime]
