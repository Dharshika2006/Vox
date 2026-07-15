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
    try:
        return await conversation_service.process_message(
            request.transcript, current_user.id, request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}")
async def end_conversation(
    session_id: str,
    conversation_service: ConversationService = Depends(get_conversation_service),
    current_user: User = Depends(get_current_user),
):
    """End a conversation."""
    conversation_service.end_conversation(session_id)
    return {"status": "success"}
