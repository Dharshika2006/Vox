"""Email schemas."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

from app.models.email_history import EmailStatus


class EmailDraftRequest(BaseModel):
    """Request to draft an email."""

    transcript: str
    # Context elements
    conversation_history: Optional[List[dict]] = None


class EmailRewriteRequest(BaseModel):
    """Request to rewrite an existing email draft."""
    
    draft_text: str
    instruction: str


class EmailSaveDraftRequest(BaseModel):
    """Request to save an email draft."""

    recipient: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    transcript: Optional[str] = None
    draft_id: Optional[int] = None


class EmailSendRequest(BaseModel):
    """Request to send an email."""

    recipient: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    transcript: Optional[str] = None
    # For updating an existing draft
    draft_id: Optional[int] = None


class EmailResponse(BaseModel):
    """Response containing an email draft or sent email."""

    recipient: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None


class EmailHistoryResponse(EmailResponse):
    """Response for email history record."""

    id: int
    status: EmailStatus
    gmail_message_id: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
