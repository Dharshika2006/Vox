"""Auth Service for Google OAuth and JWT management."""

import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from jose import jwt

from app.config import get_settings
from app.schemas.auth import UserCreate
from app.repositories.user_repository import UserRepository
from app.repositories.token_repository import TokenRepository
from app.exceptions import AuthenticationError


class AuthService:
    """Service for handling authentication and user sessions."""

    def __init__(self, user_repo: UserRepository, token_repo: TokenRepository):
        self.user_repo = user_repo
        self.token_repo = token_repo
        self.settings = get_settings()

    def get_google_auth_url(self) -> str:
        """Generate Google OAuth login URL."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.settings.GOOGLE_CLIENT_ID,
                    "client_secret": self.settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.settings.GOOGLE_SCOPES,
        )
        flow.redirect_uri = self.settings.GOOGLE_REDIRECT_URI

        # Use access_type="offline" to get a refresh token
        # Use prompt="consent" to ensure we always get a refresh token on first login
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return auth_url

    def handle_google_callback(self, code: str) -> Dict[str, Any]:
        """Exchange code for tokens and create/update user."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.settings.GOOGLE_CLIENT_ID,
                    "client_secret": self.settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.settings.GOOGLE_SCOPES,
        )
        flow.redirect_uri = self.settings.GOOGLE_REDIRECT_URI

        try:
            flow.fetch_token(code=code)
            credentials = flow.credentials

            # Get user info from Google
            service = build("oauth2", "v2", credentials=credentials)
            user_info = service.userinfo().get().execute()

            email = user_info.get("email")
            if not email:
                raise AuthenticationError("Could not retrieve email from Google")

            # Create or update user
            user = self.user_repo.get_by_email(email)
            if not user:
                user_create = UserCreate(
                    email=email,
                    name=user_info.get("name", ""),
                    picture=user_info.get("picture", ""),
                )
                user = self.user_repo.create(user_create)
            else:
                self.user_repo.update(
                    user,
                    name=user_info.get("name", user.name),
                    picture=user_info.get("picture", user.picture),
                )

            # Save OAuth tokens
            expiry = (
                credentials.expiry.replace(tzinfo=timezone.utc)
                if credentials.expiry
                else datetime.now(timezone.utc) + timedelta(hours=1)
            )

            self.token_repo.create_or_update(
                user_id=user.id,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expiry=expiry,
                scopes=",".join(credentials.scopes) if credentials.scopes else "",
            )

            # Create JWT session token
            from app.utils.security import create_access_token

            jwt_token = create_access_token(data={"sub": str(user.id)})

            return {
                "access_token": jwt_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "picture": user.picture,
                },
            }

        except Exception as e:
            raise AuthenticationError(f"Failed to authenticate with Google: {str(e)}")

    def get_google_credentials(self, user_id: int) -> Credentials:
        """Get valid Google credentials for a user, refreshing if necessary."""
        tokens = self.token_repo.get_decrypted_tokens(user_id)
        if not tokens:
            raise AuthenticationError("User has no Google credentials")

        creds = Credentials(
            token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.settings.GOOGLE_CLIENT_ID,
            client_secret=self.settings.GOOGLE_CLIENT_SECRET,
            scopes=tokens["scopes"].split(",") if tokens["scopes"] else None,
        )

        # If expired or close to expiring, refresh it
        token_expiry = tokens["token_expiry"]
        if token_expiry and token_expiry.tzinfo is None:
            token_expiry = token_expiry.replace(tzinfo=timezone.utc)
            
        if creds.expired or (
            token_expiry
            and token_expiry
            < datetime.now(timezone.utc) + timedelta(minutes=5)
        ):
            from google.auth.transport.requests import Request

            try:
                creds.refresh(Request())

                # Save new token
                expiry = (
                    creds.expiry.replace(tzinfo=timezone.utc)
                    if creds.expiry
                    else datetime.now(timezone.utc) + timedelta(hours=1)
                )
                self.token_repo.create_or_update(
                    user_id=user_id,
                    access_token=creds.token,
                    refresh_token=creds.refresh_token,
                    token_expiry=expiry,
                    scopes=tokens["scopes"],
                )
            except Exception as e:
                raise AuthenticationError(f"Failed to refresh Google token: {str(e)}")

        return creds
