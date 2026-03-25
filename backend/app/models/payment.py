import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan: Mapped[str] = mapped_column(String(20))           # monthly | weekly | daily | yearly
    grade_tier: Mapped[str] = mapped_column(String(100))
    amount_ksh: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20))         # active | expired | cancelled | pending
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="subscriptions")  # type: ignore[name-defined]
    transactions: Mapped[list["PaymentTransaction"]] = relationship(back_populates="subscription", cascade="all, delete-orphan")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="CASCADE"), index=True)
    mpesa_receipt_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(20))
    amount_ksh: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20))         # pending | success | failed
    mpesa_request_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    subscription: Mapped["Subscription"] = relationship(back_populates="transactions")
