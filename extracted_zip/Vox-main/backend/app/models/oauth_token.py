"""OAuth token model."""

from typing import TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import ForeignKey, DateTime, Text, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OAuthToken(Base):
    """Encrypted OAuth token storage."""

    __tablename__ = "oauth_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    encrypted_access_token: Mapped[str] = mapped_column(Text, nullable=False)
    encrypted_refresh_token: Mapped[str] = mapped_column(Text, nullable=False)
    token_expiry: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    scopes: Mapped[str] = mapped_column(String(1024), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="oauth_token")
