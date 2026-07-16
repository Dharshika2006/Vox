"""Conversation endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.conversation import ConversationRequest, ConversationResponse
from app.models.user import User
from app.api.dependencies import get_conversation_service, get_current_user
from app.services.conversation_service import ConversationService

router = APIRouter()


@router.post("", response_model=ConversationResponse)
async def process_conversation(
    request: ConversationRequest,
    conversation_service: ConversationService = Depends(get_conversation_service),
    current_user: User = Depends(get_current_user),
):
    """Process a message in a conversation."""
    return await conversation_service.process_message(
        request.transcript, current_user, request.session_id
    )


@router.delete("/{session_id}")
async def end_conversation(
    session_id: str,
    conversation_service: ConversationService = Depends(get_conversation_service),
    current_user: User = Depends(get_current_user),
):
    """End a conversation."""
    conversation_service.end_conversation(session_id)
    return {"status": "success"}
