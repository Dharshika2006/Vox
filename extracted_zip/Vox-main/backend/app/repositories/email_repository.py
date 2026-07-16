"""Email repository."""

from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.email_history import EmailHistory, EmailStatus
from app.schemas.email import EmailSendRequest


class EmailRepository:
    """Repository for EmailHistory operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, email_id: int, user_id: int) -> Optional[EmailHistory]:
        """Get an email by ID and user ID."""
        return (
            self.db.query(EmailHistory)
            .filter(EmailHistory.id == email_id, EmailHistory.user_id == user_id)
            .first()
        )

    def get_user_emails(
        self, user_id: int, skip: int = 0, limit: int = 50
    ) -> Tuple[List[EmailHistory], int]:
        """Get paginated emails for a user."""
        query = self.db.query(EmailHistory).filter(EmailHistory.user_id == user_id)
        total = query.count()
        items = (
            query.order_by(desc(EmailHistory.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def create_draft(
        self,
        user_id: int,
        recipient: str,
        subject: str,
        body: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        transcript: Optional[str] = None,
    ) -> EmailHistory:
        """Create a new email draft."""
        email = EmailHistory(
            user_id=user_id,
            recipient=recipient,
            subject=subject,
            body=body,
            cc=cc,
            bcc=bcc,
            transcript=transcript,
            status=EmailStatus.DRAFT,
        )
        self.db.add(email)
        self.db.commit()
        self.db.refresh(email)
        return email

    def update_draft(
        self, email_id: int, user_id: int, update_data: EmailSendRequest
    ) -> Optional[EmailHistory]:
        """Update an existing draft."""
        email = self.get_by_id(email_id, user_id)
        if not email or email.status != EmailStatus.DRAFT:
            return None

        email.recipient = update_data.recipient
        email.subject = update_data.subject
        email.body = update_data.body

        if update_data.cc is not None:
            email.cc = update_data.cc
        if update_data.bcc is not None:
            email.bcc = update_data.bcc

        self.db.commit()
        self.db.refresh(email)
        return email

    def mark_as_sent(
        self, email_id: int, user_id: int, gmail_message_id: str, gmail_thread_id: str
    ) -> Optional[EmailHistory]:
        """Mark an email as sent."""
        email = self.get_by_id(email_id, user_id)
        if not email:
            return None

        email.status = EmailStatus.SENT
        email.gmail_message_id = gmail_message_id
        email.gmail_thread_id = gmail_thread_id
        email.sent_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(email)
        return email

    def mark_as_failed(self, email_id: int, user_id: int) -> Optional[EmailHistory]:
        """Mark an email as failed."""
        email = self.get_by_id(email_id, user_id)
        if not email:
            return None

        email.status = EmailStatus.FAILED
        self.db.commit()
        self.db.refresh(email)
        return email
