from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.api.deps import get_current_user
from app.config import settings
from app.schemas.payment import (
    MpesaStkPushRequest,
    PaymentStatusResponse,
    SubscriptionResponse,
)
from app.services.payment_service import PaymentService
from app.models.user import User
from app.models.payment import PaymentTransaction

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


@router.post("/dev/confirm/{checkout_request_id}")
async def dev_confirm_payment(
    checkout_request_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    DEV/SANDBOX ONLY — simulate a successful Safaricom callback.
    Use this when testing locally because Safaricom sandbox does not
    reliably deliver callbacks to ngrok/localhost URLs.
    Blocked in production.
    """
    if settings.APP_ENV == "production":
        raise HTTPException(status_code=404, detail="Not found")

    tx_result = await db.execute(
        select(PaymentTransaction).where(
            PaymentTransaction.mpesa_request_id == checkout_request_id
        )
    )
    tx = tx_result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    mock_callback = {
        "Body": {
            "stkCallback": {
                "MerchantRequestID": "dev-simulate",
                "CheckoutRequestID": checkout_request_id,
                "ResultCode": 0,
                "ResultDesc": "The service request is processed successfully.",
                "CallbackMetadata": {
                    "Item": [
                        {"Name": "Amount", "Value": tx.amount_ksh},
                        {"Name": "MpesaReceiptNumber", "Value": "DEV" + checkout_request_id[-6:].upper()},
                        {"Name": "TransactionDate", "Value": 20260326130500},
                        {"Name": "PhoneNumber", "Value": int(tx.phone_number)},
                    ]
                },
            }
        }
    }
    return await PaymentService(db).handle_callback(mock_callback)
