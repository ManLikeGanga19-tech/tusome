from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.payment import (
    MpesaStkPushRequest,
    PaymentStatusResponse,
    SubscriptionResponse,
)
from app.services.payment_service import PaymentService
from app.models.user import User

router = APIRouter()


@router.post("/subscribe")
async def initiate_payment(
    body: MpesaStkPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Initiate an M-Pesa STK Push.
    Returns checkout_request_id — frontend should poll /poll/{checkout_request_id}.
    """
    return await PaymentService(db).initiate_stk_push(current_user, body)


@router.get("/poll/{checkout_request_id}")
async def poll_payment(
    checkout_request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Frontend polls this every 3 seconds after STK push.
    Returns: { status: 'pending'|'success'|'failed', receipt, plan, amount_ksh, ends_at }
    """
    return await PaymentService(db).poll_transaction(checkout_request_id, current_user)


@router.post("/mpesa/callback")
async def mpesa_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Safaricom calls this after user confirms/cancels on phone.
    No auth header — Safaricom sends bare POST.
    Must return within 5 seconds.
    """
    body = await request.json()
    caller_ip = request.client.host if request.client else None
    return await PaymentService(db).handle_callback(body, caller_ip)


@router.get("/status", response_model=PaymentStatusResponse)
async def payment_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Current subscription status + trial end date."""
    return await PaymentService(db).get_status(current_user)


@router.get("/history", response_model=List[SubscriptionResponse])
async def payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Full subscription payment history for the user."""
    return await PaymentService(db).get_payment_history(current_user)
