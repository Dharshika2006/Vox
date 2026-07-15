"""Token repository."""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.oauth_token import OAuthToken
from app.utils.security import encrypt_token, decrypt_token


class TokenRepository:
    """Repository for OAuthToken operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> Optional[OAuthToken]:
        """Get OAuth token for a user."""
        return self.db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()

    def create_or_update(
        self,
        user_id: int,
        access_token: str,
        refresh_token: str,
        token_expiry: datetime,
        scopes: str,
    ) -> OAuthToken:
        """Create or update a user's OAuth token."""
        enc_access = encrypt_token(access_token)
        enc_refresh = encrypt_token(refresh_token) if refresh_token else ""

        token = self.get_by_user_id(user_id)
        if token:
            token.encrypted_access_token = enc_access
            if refresh_token:
                token.encrypted_refresh_token = enc_refresh
            token.token_expiry = token_expiry
            token.scopes = scopes
        else:
            token = OAuthToken(
                user_id=user_id,
                encrypted_access_token=enc_access,
                encrypted_refresh_token=enc_refresh,
                token_expiry=token_expiry,
                scopes=scopes,
            )
            self.db.add(token)

        self.db.commit()
        self.db.refresh(token)
        return token

    def get_decrypted_tokens(self, user_id: int) -> Optional[dict]:
        """Get decrypted tokens for a user."""
        token = self.get_by_user_id(user_id)
        if not token:
            return None

        return {
            "access_token": decrypt_token(token.encrypted_access_token),
            "refresh_token": (
                decrypt_token(token.encrypted_refresh_token)
                if token.encrypted_refresh_token
                else None
            ),
            "token_expiry": token.token_expiry,
            "scopes": token.scopes,
        }
