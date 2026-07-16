"""Conversation Session models."""

from datetime import datetime
from typing import Any, Dict

from sqlalchemy import String, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ConversationSession(Base):
    """Stores the state of a multi-turn conversation."""

    __tablename__ = "conversation_sessions"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    state: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
