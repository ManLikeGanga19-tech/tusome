"""
PaymentService — Enterprise M-Pesa Daraja STK Push integration.

Enterprise features:
  - Redis-cached access token (expires in 3590s, avoids hitting Safaricom on every request)
  - Idempotency guard: prevents duplicate STK pushes for the same user + plan
  - Timeout + error handling on every httpx call
  - Safaricom IP whitelist on callback
  - Celery task queued for email after payment confirmed
  - Full audit trail (raw JSON stored on every transaction)

Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
"""
import base64
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import redis as redis_client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.models.payment import Subscription, PaymentTransaction
from app.schemas.payment import MpesaStkPushRequest, PaymentStatusResponse, SubscriptionResponse
from app.core.exceptions import BadRequestError, NotFoundError

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────

PLAN_DURATION = {
    "daily":   timedelta(days=1),
    "weekly":  timedelta(weeks=1),
    "monthly": timedelta(days=30),
    "yearly":  timedelta(days=365),
}

TIER_PRICES = {
    "primary": {"daily": 25,  "weekly": 150, "monthly": 499,  "yearly": 4_999},
    "junior":  {"daily": 40,  "weekly": 250, "monthly": 899,  "yearly": 8_990},
    "senior":  {"daily": 60,  "weekly": 400, "monthly": 1_499, "yearly": 14_999},
}

MPESA_BASE = {
    "sandbox": "https://sandbox.safaricom.co.ke",
    "live":    "https://api.safaricom.co.ke",
}

# Safaricom M-Pesa callback IPs (allowlist) — add more from their docs
SAFARICOM_IPS = {
    "196.201.214.200", "196.201.214.206", "196.201.213.114",
    "196.201.214.207", "196.201.214.208", "196.201.213.44",
    "196.201.212.127", "196.201.212.138", "196.201.212.129",
    "196.201.212.136", "196.201.212.74", "196.201.212.69",
}

TOKEN_CACHE_KEY = "mpesa:access_token"

# ── Redis (sync client — only used for token cache, not in async path) ───────

def _get_redis():
    return redis_client.Redis.from_url(settings.REDIS_URL, decode_responses=True)


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── STK Push ──────────────────────────────────────────────────────────

    async def initiate_stk_push(self, user: User, body: MpesaStkPushRequest):
        amount = TIER_PRICES.get(user.grade_category, {}).get(body.plan)
        if not amount:
            raise BadRequestError("Invalid plan for your grade tier")

        # Idempotency: block if a pending transaction already exists for this user + plan
        existing = await self.db.execute(
            select(PaymentTransaction)
            .join(Subscription)
            .where(
                Subscription.user_id == user.id,
                Subscription.plan == body.plan,
                PaymentTransaction.status == "pending",
            )
        )
        if existing.scalar_one_or_none():
            raise BadRequestError(
                "A payment is already pending for this plan. "
                "Check your phone for the M-Pesa prompt or wait a minute and try again."
            )

        access_token = await self._get_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode()
        ).decode()

        base_url = MPESA_BASE[settings.MPESA_ENV]
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": body.phone_number,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": body.phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"TUSOME-{str(user.id)[:8].upper()}",
            "TransactionDesc": f"Tusome {body.plan} subscription — {user.grade_tier}",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{base_url}/mpesa/stkpush/v1/processrequest",
                    json=payload,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
            data = resp.json()
        except httpx.TimeoutException:
            raise BadRequestError("M-Pesa gateway timed out. Please try again.")
        except Exception as exc:
            logger.error("STK push HTTP error: %s", exc)
            raise BadRequestError("Could not reach M-Pesa gateway. Please try again.")

        if data.get("ResponseCode") != "0":
            error_msg = data.get("errorMessage") or data.get("ResponseDescription", "M-Pesa request failed")
            logger.error("STK push rejected: %s | user=%s", error_msg, user.id)
            raise BadRequestError(error_msg)

        # Persist pending subscription + transaction
        now = datetime.now(timezone.utc)
        subscription = Subscription(
            user_id=user.id,
            plan=body.plan,
            grade_tier=user.grade_tier,
            amount_ksh=amount,
            status="pending",
            starts_at=now,
            ends_at=now + PLAN_DURATION[body.plan],
        )
        self.db.add(subscription)
        await self.db.flush()

        transaction = PaymentTransaction(
            subscription_id=subscription.id,
            phone_number=body.phone_number,
            amount_ksh=amount,
            status="pending",
            mpesa_request_id=data.get("CheckoutRequestID"),
            raw_response=json.dumps(data),
        )
        self.db.add(transaction)

        logger.info(
            "STK push initiated: user=%s plan=%s amount=%s checkout=%s",
            user.id, body.plan, amount, data.get("CheckoutRequestID")
        )

        return {
            "message": "M-Pesa STK push sent. Enter your PIN on your phone.",
            "checkout_request_id": data.get("CheckoutRequestID"),
            "transaction_id": str(transaction.id) if transaction.id else None,
            "amount_ksh": amount,
            "plan": body.plan,
        }

    # ── Callback ─────────────────────────────────────────────────────────

    async def handle_callback(self, body: dict, caller_ip: Optional[str] = None):
        """
        Called by Safaricom after the user completes/cancels the STK prompt.
        Must respond with ResultCode=0 within 5 seconds or Safaricom retries.
        """
        # IP allowlist check (skip in sandbox)
        if settings.MPESA_ENV == "live" and caller_ip and caller_ip not in SAFARICOM_IPS:
            logger.warning("M-Pesa callback from unknown IP: %s", caller_ip)
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        try:
            callback = body["Body"]["stkCallback"]
        except (KeyError, TypeError):
            logger.error("Malformed M-Pesa callback: %s", body)
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        result_code = callback.get("ResultCode")
        checkout_id = callback.get("CheckoutRequestID")

        if not checkout_id:
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        tx_result = await self.db.execute(
            select(PaymentTransaction).where(
                PaymentTransaction.mpesa_request_id == checkout_id
            )
        )
        tx = tx_result.scalar_one_or_none()
        if not tx:
            logger.warning("Callback for unknown checkout_id: %s", checkout_id)
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        # Idempotency: already processed
        if tx.status != "pending":
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        # Store full raw callback for audit
        tx.raw_response = json.dumps(body)

        if result_code == 0:
            metadata = callback.get("CallbackMetadata", {})
            items = {i["Name"]: i["Value"] for i in metadata.get("Item", [])}
            tx.mpesa_receipt_number = items.get("MpesaReceiptNumber")
            tx.status = "success"

            sub_result = await self.db.execute(
                select(Subscription).where(Subscription.id == tx.subscription_id)
            )
            sub = sub_result.scalar_one_or_none()
            if sub:
                sub.status = "active"

                user_result = await self.db.execute(
                    select(User).where(User.id == sub.user_id)
                )
                user = user_result.scalar_one_or_none()
                if user:
                    user.subscription_status = "active"

                    # Queue payment confirmed email (non-blocking)
                    from app.tasks.email_tasks import send_payment_confirmed_email
                    send_payment_confirmed_email.delay(
                        user.email,
                        user.first_name,
                        sub.plan,
                        sub.amount_ksh,
                        sub.ends_at.strftime("%d %B %Y"),
                    )

                    logger.info(
                        "Payment confirmed: user=%s plan=%s receipt=%s",
                        user.id, sub.plan, tx.mpesa_receipt_number
                    )
        else:
            tx.status = "failed"
            result_desc = callback.get("ResultDesc", "Payment cancelled")
            logger.info("Payment failed/cancelled: checkout=%s reason=%s", checkout_id, result_desc)

        return {"ResultCode": 0, "ResultDesc": "Accepted"}

    # ── Status / polling ──────────────────────────────────────────────────

    async def get_status(self, user: User) -> PaymentStatusResponse:
        sub_result = await self.db.execute(
            select(Subscription).where(
                Subscription.user_id == user.id,
                Subscription.status == "active",
            ).order_by(Subscription.ends_at.desc())
        )
        sub = sub_result.scalar_one_or_none()
        return PaymentStatusResponse(
            subscription=SubscriptionResponse.model_validate(sub) if sub else None,
            subscription_status=user.subscription_status,
            trial_end_date=user.trial_end_date,
        )

    async def poll_transaction(self, checkout_request_id: str, user: User) -> dict:
        """Frontend polls this every 3s until status != 'pending'."""
        tx_result = await self.db.execute(
            select(PaymentTransaction).where(
                PaymentTransaction.mpesa_request_id == checkout_request_id
            )
        )
        tx = tx_result.scalar_one_or_none()
        if not tx:
            raise NotFoundError("Transaction not found")

        # Verify it belongs to this user (security)
        sub_result = await self.db.execute(
            select(Subscription).where(Subscription.id == tx.subscription_id)
        )
        sub = sub_result.scalar_one_or_none()
        if not sub or sub.user_id != user.id:
            raise NotFoundError("Transaction not found")

        return {
            "status": tx.status,           # pending | success | failed
            "receipt": tx.mpesa_receipt_number,
            "plan": sub.plan,
            "amount_ksh": sub.amount_ksh,
            "ends_at": sub.ends_at.isoformat() if sub.ends_at else None,
        }

    async def get_payment_history(self, user: User) -> list:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.user_id == user.id,
            ).order_by(Subscription.created_at.desc()).limit(20)
        )
        subs = result.scalars().all()
        return [SubscriptionResponse.model_validate(s) for s in subs]

    # ── Access Token (Redis-cached) ───────────────────────────────────────

    async def _get_access_token(self) -> str:
        """
        Cache the Safaricom access token in Redis for 3590 seconds
        (it expires after 3600s — we refresh 10s early).
        This avoids one Safaricom round-trip per payment request.
        """
        r = _get_redis()
        cached = r.get(TOKEN_CACHE_KEY)
        if cached:
            return cached

        base_url = MPESA_BASE[settings.MPESA_ENV]
        creds = base64.b64encode(
            f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}".encode()
        ).decode()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
                    headers={"Authorization": f"Basic {creds}"},
                )
            token = resp.json()["access_token"]
        except Exception as exc:
            logger.error("Failed to get M-Pesa access token: %s", exc)
            raise BadRequestError("M-Pesa authentication failed. Try again shortly.")

        r.setex(TOKEN_CACHE_KEY, 3590, token)
        return token
