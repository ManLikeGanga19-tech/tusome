"""
EmailService — sends transactional emails (verification, password reset, welcome).
Uses fastapi-mail with SMTP. Swap for SendGrid/Postmark in production by
changing the transport here without touching the rest of the codebase.
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
)

_mailer = FastMail(_conf)


async def send_verification_email(to: str, first_name: str, token: str):
    link = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"
    body = f"""
    <h2>Welcome to Tusome, {first_name}!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="{link}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Verify Email
    </a>
    <p>Link expires in 24 hours.</p>
    """
    await _send(to, "Verify your Tusome account", body)


async def send_password_reset_email(to: str, first_name: str, token: str):
    link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    body = f"""
    <h2>Hi {first_name},</h2>
    <p>You requested a password reset. Click below to set a new password:</p>
    <a href="{link}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Reset Password
    </a>
    <p>Link expires in 1 hour. If you did not request this, ignore this email.</p>
    """
    await _send(to, "Reset your Tusome password", body)


async def _send(to: str, subject: str, html_body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[to],
        body=html_body,
        subtype=MessageType.html,
    )
    await _mailer.send_message(message)
