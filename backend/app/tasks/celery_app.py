"""
Celery application — task queue for all async/background work.

Workers:
  celery -A app.tasks.celery_app worker --loglevel=info --pool=threads -c 8

Beat (cron scheduler):
  celery -A app.tasks.celery_app beat --loglevel=info

Monitoring UI (Flower):
  celery -A app.tasks.celery_app flower --port=5555
"""
import os
from celery import Celery
from celery.schedules import crontab

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "tusome",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.payment_tasks",
    ],
)

celery_app.conf.update(
    # Suppress startup retry deprecation warning
    broker_connection_retry_on_startup=True,

    # Serialisation
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Nairobi",
    enable_utc=True,

    # Reliability
    task_acks_late=True,           # ack only after task completes (safe re-queue on crash)
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,  # don't buffer tasks (fair distribution)

    # Retries
    task_max_retries=3,
    task_default_retry_delay=60,   # 60s between retries

    # Results expire after 24 hours (we don't need them longer)
    result_expires=86_400,

    # Beat schedule — cron jobs
    beat_schedule={
        # Runs every day at 08:00 EAT (UTC+3 → 05:00 UTC)
        "daily-trial-expiry-check": {
            "task": "app.tasks.payment_tasks.check_trial_expiry",
            "schedule": crontab(hour=5, minute=0),
        },
        # Every 5 minutes: verify any stuck PENDING transactions
        "verify-pending-payments": {
            "task": "app.tasks.payment_tasks.verify_pending_payments",
            "schedule": crontab(minute="*/5"),
        },
    },
)
