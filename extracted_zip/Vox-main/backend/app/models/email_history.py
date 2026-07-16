"""Email history model."""

import enum
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import ForeignKey, DateTime, String, Text, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class EmailStatus(str, enum.Enum):
    """Status of an email."""

    DRAFT = "draft"
    SENT = "sent"
    FAILED = "failed"


class EmailHistory(Base):
    """Record of an email drafted or sent via Vox."""

    __tablename__ = "email_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    recipient: Mapped[str] = mapped_column(String(1024), nullable=False)
    cc: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    bcc: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    subject: Mapped[str] = mapped_column(String(1024), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[EmailStatus] = mapped_column(
        Enum(EmailStatus), default=EmailStatus.DRAFT, nullable=False
    )

    gmail_message_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )
    gmail_thread_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )

    transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="emails")
