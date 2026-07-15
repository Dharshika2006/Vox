"""Contact models."""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

from sqlalchemy import ForeignKey, DateTime, String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Contact(Base):
    """User contact."""

    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="contacts")
    emails: Mapped[List["ContactEmail"]] = relationship(
        "ContactEmail", back_populates="contact", cascade="all, delete-orphan"
    )


class ContactEmail(Base):
    """Email address for a contact."""

    __tablename__ = "contact_emails"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    contact_id: Mapped[int] = mapped_column(
        ForeignKey("contacts.id", ondelete="CASCADE"), index=True
    )

    email: Mapped[str] = mapped_column(String(255), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    contact: Mapped["Contact"] = relationship("Contact", back_populates="emails")
