"""API Dependencies."""

from typing import Generator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.exceptions import AuthenticationError
from app.repositories.user_repository import UserRepository
from app.repositories.token_repository import TokenRepository
from app.repositories.email_repository import EmailRepository
from app.repositories.contact_repository import ContactRepository
from app.services.ai_service import AIService
from app.services.transcription_service import TranscriptionService
from app.services.auth_service import AuthService
from app.services.gmail_service import GmailService
from app.services.email_service import EmailService
from app.services.conversation_service import ConversationService
from app.services.contact_service import ContactService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """Get the current authenticated user from JWT token."""
    if not token:
        raise AuthenticationError("Not authenticated")

    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token payload")
    except JWTError:
        raise AuthenticationError("Could not validate credentials")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(int(user_id))

    if user is None:
        raise AuthenticationError("User not found")

    return user


# Repositories
def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_token_repository(db: Session = Depends(get_db)) -> TokenRepository:
    return TokenRepository(db)


def get_email_repository(db: Session = Depends(get_db)) -> EmailRepository:
    return EmailRepository(db)


def get_contact_repository(db: Session = Depends(get_db)) -> ContactRepository:
    return ContactRepository(db)


# Services
def get_ai_service() -> AIService:
    return AIService()


def get_transcription_service() -> TranscriptionService:
    return TranscriptionService()


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    token_repo: TokenRepository = Depends(get_token_repository),
) -> AuthService:
    return AuthService(user_repo, token_repo)


def get_gmail_service(
    auth_service: AuthService = Depends(get_auth_service),
) -> GmailService:
    return GmailService(auth_service)


def get_email_service(
    email_repo: EmailRepository = Depends(get_email_repository),
    gmail_service: GmailService = Depends(get_gmail_service),
    ai_service: AIService = Depends(get_ai_service),
) -> EmailService:
    return EmailService(email_repo, gmail_service, ai_service)


def get_contact_service(
    contact_repo: ContactRepository = Depends(get_contact_repository),
) -> ContactService:
    from app.services.contact_service import ContactService

    return ContactService(contact_repo)


def get_conversation_service(
    ai_service: AIService = Depends(get_ai_service),
    contact_service: ContactService = Depends(get_contact_service),
    email_service: EmailService = Depends(get_email_service),
) -> ConversationService:
    return ConversationService(ai_service, contact_service, email_service)
