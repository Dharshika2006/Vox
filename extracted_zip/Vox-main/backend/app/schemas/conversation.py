"""Conversation schemas."""

from typing import List, Optional
from pydantic import BaseModel


class ConversationMessage(BaseModel):
    """A message in a conversation."""

    role: str  # "user", "assistant"
    content: str


class ConversationRequest(BaseModel):
    """Request to process a voice command or transcript in a conversation."""

    transcript: str
    session_id: Optional[str] = None


class ConversationResponse(BaseModel):
    """Response from conversation processing."""

    session_id: str
    message: str
    state: str  # e.g., "IDLE", "PROCESSING_INTENT", "RESOLVING_CONTACT", "DRAFTING", "PREVIEW", "CONFIRMING_SEND", "SUCCESS", "ERROR"
    action_required: bool
    draft: Optional[dict] = None
    clarification_options: Optional[List[dict]] = None
    resolved_contact: Optional[dict] = None
