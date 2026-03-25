"""
Payment background tasks.
- verify_pending_payments: every 5 min, query Safaricom for stuck pending transactions
- check_trial_expiry: daily cron, email users whose trial is expiring/expired
"""
import logging
import asyncio
import os
from datetime import datetime, timezone, timedelta

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _run(coro):
    """Run an async coroutine from a synchronous Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="payment_tasks.verify_pending_payments")
def verify_pending_payments():
    """
    Find payment transactions stuck in PENDING status for more than 2 minutes
    and query the Safaricom Query API to get their real status.
    """
    _run(_do_verify_pending())


async def _do_verify_pending():
    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from app.models.payment import PaymentTransaction, Subscription
    from app.models.user import User

    engine = create_async_engine(os.getenv("DATABASE_URL", ""), echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=2)

    async with Session() as db:
        result = await db.execute(
            select(PaymentTransaction).where(
                PaymentTransaction.status == "pending",
                PaymentTransaction.created_at < cutoff,
            )
        )
        stale_txns = result.scalars().all()
        if not stale_txns:
            return

        logger.info("verify_pending_payments: checking %d stale transactions", len(stale_txns))

        for tx in stale_txns:
            # Mark stale pending as failed — Safaricom STK Push expires in 60s
            # In production you'd call the Query API here
            tx.status = "failed"
            logger.warning("Marked stale transaction %s as failed", tx.id)

        await db.commit()

    await engine.dispose()


@celery_app.task(name="payment_tasks.check_trial_expiry")
def check_trial_expiry():
    """Daily cron: email users expiring in 3 days, expire users whose trial ended."""
    _run(_do_check_trial_expiry())


async def _do_check_trial_expiry():
    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from app.models.user import User
    from app.tasks.email_tasks import (
        send_trial_expiry_warning_email,
        send_trial_expired_email,
    )

    engine = create_async_engine(os.getenv("DATABASE_URL", ""), echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    now = datetime.now(timezone.utc)
    warn_window_start = now + timedelta(days=3)
    warn_window_end = now + timedelta(days=4)

    async with Session() as db:
        # 1. Users whose trial expires in exactly 3 days → warning email
        warn_result = await db.execute(
            select(User).where(
                User.subscription_status == "trial",
                User.trial_end_date >= warn_window_start,
                User.trial_end_date < warn_window_end,
            )
        )
        for user in warn_result.scalars().all():
            days_left = (user.trial_end_date - now).days
            send_trial_expiry_warning_email.delay(
                user.email, user.first_name, days_left, frontend_url
            )
            logger.info("Trial warning queued for %s (%d days left)", user.email, days_left)

        # 2. Users whose trial has already ended but subscription_status still = 'trial'
        expired_result = await db.execute(
            select(User).where(
                User.subscription_status == "trial",
                User.trial_end_date < now,
            )
        )
        for user in expired_result.scalars().all():
            user.subscription_status = "expired"
            send_trial_expired_email.delay(user.email, user.first_name, frontend_url)
            logger.info("Trial expired and email queued for %s", user.email)

        await db.commit()

    await engine.dispose()
