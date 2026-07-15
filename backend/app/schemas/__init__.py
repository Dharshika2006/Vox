"""Application schemas."""

from app.schemas.auth import (
    Token,
    UserCreate,
    UserUpdate,
    UserResponse,
)
from app.schemas.email import (
    EmailDraftRequest,
    EmailSendRequest,
    EmailResponse,
    EmailHistoryResponse,
)
from app.schemas.contact import (
    ContactEmailCreate,
    ContactEmailResponse,
    ContactCreate,
    ContactUpdate,
    ContactResponse,
)
from app.schemas.conversation import (
    ConversationMessage,
    ConversationRequest,
    ConversationResponse,
)
from app.schemas.voice import (
    TranscriptionResponse,
)
from app.schemas.common import (
    PaginatedResponse,
    ErrorResponse,
)

__all__ = [
    "Token",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "EmailDraftRequest",
    "EmailSendRequest",
    "EmailResponse",
    "EmailHistoryResponse",
    "ContactEmailCreate",
    "ContactEmailResponse",
    "ContactCreate",
    "ContactUpdate",
    "ContactResponse",
    "ConversationMessage",
    "ConversationRequest",
    "ConversationResponse",
    "TranscriptionResponse",
    "PaginatedResponse",
    "ErrorResponse",
]
