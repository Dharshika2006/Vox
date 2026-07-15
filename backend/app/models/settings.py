"""User settings model."""

from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import ForeignKey, DateTime, String, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserSettings(Base):
    """User preferences and settings."""

    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    voice_language: Mapped[str] = mapped_column(
        String(50), default="en-US", nullable=False
    )
    auto_send: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_signature: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="settings")
