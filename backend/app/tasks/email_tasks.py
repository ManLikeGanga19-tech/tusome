"""
Email tasks — all emails go through this queue.
Never call SMTP directly from an HTTP handler.
"""
import logging
from app.tasks.celery_app import celery_app
from app.email_templates.renderer import render_email

logger = logging.getLogger(__name__)


def _send(to: str, subject: str, html: str):
    """Sync SMTP send — called inside Celery worker, not in HTTP request."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    import os

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = os.getenv("MAIL_FROM", "noreply@tusome.co.ke")
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    port = int(os.getenv("MAIL_PORT", "587"))
    username = os.getenv("MAIL_USERNAME", "")
    password = os.getenv("MAIL_PASSWORD", "")

    if not username:
        # Dev mode — just log the email, don't send
        logger.info("[EMAIL MOCK] To=%s Subject=%s", to, subject)
        return

    with smtplib.SMTP(server, port) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(username, password)
        smtp.sendmail(msg["From"], [to], msg.as_string())


# ── Tasks ──────────────────────────────────────────────────────────────────


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_welcome")
def send_welcome_email(self, to: str, first_name: str):
    try:
        html = render_email("welcome", {"first_name": first_name})
        _send(to, f"Welcome to Tusome, {first_name}! 🎉", html)
    except Exception as exc:
        logger.error("send_welcome_email failed: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_verification")
def send_verification_email(self, to: str, first_name: str, token: str, frontend_url: str):
    try:
        html = render_email("email_verify", {
            "first_name": first_name,
            "link": f"{frontend_url}/auth/verify-email?token={token}",
        })
        _send(to, "Verify your Tusome email address", html)
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_password_reset")
def send_password_reset_email(self, to: str, first_name: str, token: str, frontend_url: str):
    try:
        html = render_email("password_reset", {
            "first_name": first_name,
            "link": f"{frontend_url}/auth/reset-password?token={token}",
        })
        _send(to, "Reset your Tusome password", html)
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_payment_confirmed")
def send_payment_confirmed_email(self, to: str, first_name: str, plan: str, amount_ksh: int, ends_at: str):
    try:
        html = render_email("payment_confirmed", {
            "first_name": first_name,
            "plan": plan.title(),
            "amount_ksh": f"KSh {amount_ksh:,}",
            "ends_at": ends_at,
        })
        _send(to, "Payment confirmed — Tusome subscription active ✅", html)
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_trial_expiry_warning")
def send_trial_expiry_warning_email(self, to: str, first_name: str, days_left: int, frontend_url: str):
    try:
        html = render_email("trial_expiry_warning", {
            "first_name": first_name,
            "days_left": days_left,
            "days_left_plural": "" if days_left == 1 else "s",
            "upgrade_link": f"{frontend_url}/dashboard/subscribe",
        })
        _send(to, f"Your Tusome trial expires in {days_left} day{'s' if days_left != 1 else ''}", html)
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120, name="email.send_trial_expired")
def send_trial_expired_email(self, to: str, first_name: str, frontend_url: str):
    try:
        html = render_email("trial_expired", {
            "first_name": first_name,
            "upgrade_link": f"{frontend_url}/dashboard/subscribe",
        })
        _send(to, "Your Tusome free trial has ended", html)
    except Exception as exc:
        raise self.retry(exc=exc)
