"""Gmail Service for sending and managing emails."""

import base64
from email.message import EmailMessage
from typing import Dict, Any, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.services.auth_service import AuthService
from app.exceptions import ProviderError


class GmailService:
    """Service for interacting with Gmail API."""

    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    def _build_service(self, user_id: int):
        """Build the Gmail API service client."""
        creds = self.auth_service.get_google_credentials(user_id)
        return build("gmail", "v1", credentials=creds)

    def send_email(
        self,
        user_id: int,
        recipient: str,
        subject: str,
        body: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
    ) -> Dict[str, str]:
        """Send an email via Gmail API."""
        try:
            service = self._build_service(user_id)

            message = EmailMessage()
            message.set_content(body)

            message["To"] = recipient
            message["Subject"] = subject
            
            import logging
            logging.getLogger(__name__).error(f"GMAIL DEBUG: recipient='{recipient}', subject='{subject}'")
            if cc:
                message["Cc"] = cc
            if bcc:
                message["Bcc"] = bcc

            # Encoded message
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            create_message = {"raw": encoded_message}

            sent_message = (
                service.users()
                .messages()
                .send(userId="me", body=create_message)
                .execute()
            )

            return {
                "message_id": sent_message.get("id"),
                "thread_id": sent_message.get("threadId"),
            }

        except HttpError as error:
            raise ProviderError(f"Gmail API error: {error.reason}")
        except Exception as e:
            raise ProviderError(f"Failed to send email: {str(e)}")
