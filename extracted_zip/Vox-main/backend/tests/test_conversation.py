import pytest
from app.services.conversation_service import ConversationService
from app.models.conversation_session import ConversationSession
from unittest.mock import MagicMock, AsyncMock

@pytest.fixture
def mock_db_session():
    return MagicMock()

@pytest.fixture
def mock_contact_service():
    service = MagicMock()
    service.resolve_recipient = AsyncMock()
    return service

@pytest.fixture
def mock_email_service():
    service = MagicMock()
    service.draft_email = AsyncMock()
    service.send_email = AsyncMock()
    return service

@pytest.fixture
def mock_ai_service():
    service = MagicMock()
    service.process_intent = AsyncMock()
    service.classify_confirmation = AsyncMock()
    service.extract_email_address = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_conversation_state_machine_cancel(mock_db_session, mock_contact_service, mock_email_service, mock_ai_service):
    """Test that cancelling an email in PREVIEW state returns to IDLE."""
    # Setup mock session
    fake_session = ConversationSession(
        id="test-session", 
        state={"state": "PREVIEW", "history": [], "context": {"draft": {"subject": "Test"}}}
    )
    mock_db_session.query().filter().first.return_value = fake_session
    
    # User says "no don't send it"
    mock_ai_service.classify_confirmation.return_value = {"confirm": False}
    
    service = ConversationService(
        db=mock_db_session,
        contact_service=mock_contact_service,
        email_service=mock_email_service,
        ai_service=mock_ai_service,
    )
    
    response = await service.process_message(1, "no don't send it", "test-session")
    
    assert response["state"] == "IDLE"
    assert "canceled" in response["message"].lower()
