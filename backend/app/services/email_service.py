"""Email Service for managing drafts and sending."""

from app.schemas.email import EmailDraftRequest, EmailSendRequest, EmailSaveDraftRequest
from app.repositories.email_repository import EmailRepository
from app.services.gmail_service import GmailService
from app.services.ai_service import AIService


class EmailService:
    """Service for managing emails."""

    def __init__(
        self,
        email_repo: EmailRepository,
        gmail_service: GmailService,
        ai_service: AIService,
    ):
        self.email_repo = email_repo
        self.gmail_service = gmail_service
        self.ai_service = ai_service

    def get_emails(self, user_id: int, skip: int = 0, limit: int = 50):
        """Get email history for a user."""
        return self.email_repo.get_user_emails(user_id, skip, limit)

    def get_email(self, email_id: int, user_id: int):
        """Get a specific email."""
        return self.email_repo.get_by_id(email_id, user_id)

    def delete_email(self, email_id: int, user_id: int) -> bool:
        """Delete a specific email."""
        return self.email_repo.delete(email_id, user_id)

    async def draft_email(self, user_id: int, request: EmailDraftRequest):
        """Draft a new email from a transcript."""
        # This is a one-shot draft generation without conversation state
        result = await self.ai_service.process_intent(request.transcript)
        
        recipient = result.get("recipient")
        message = result.get("message")
        
        if not recipient or not message:
            raise ValueError("Could not determine recipient or message from transcript")

        draft_content = await self.ai_service.generate_draft(recipient=recipient, message=message)

        return self.email_repo.create_draft(
            user_id=user_id,
            recipient=draft_content.get("recipient", ""),
            subject=draft_content.get("subject", ""),
            body=draft_content.get("body", ""),
            cc=draft_content.get("cc"),
            bcc=draft_content.get("bcc"),
            transcript=request.transcript,
        )

    def save_draft(self, user_id: int, request: EmailSaveDraftRequest):
        """Save a draft without sending."""
        if request.draft_id:
            email = self.email_repo.update_draft(request.draft_id, user_id, request)
            if not email:
                raise ValueError("Draft not found or already sent")
            return email
        else:
            return self.email_repo.create_draft(
                user_id=user_id,
                recipient=request.recipient,
                subject=request.subject,
                body=request.body,
                cc=request.cc,
                bcc=request.bcc,
                transcript=request.transcript,
            )

    def send_email(self, user_id: int, request: EmailSendRequest):
        """Send an email."""
        # 1. Update or create draft
        if request.draft_id:
            email = self.email_repo.update_draft(request.draft_id, user_id, request)
            if not email:
                raise ValueError("Draft not found or already sent")
        else:
            email = self.email_repo.create_draft(
                user_id=user_id,
                recipient=request.recipient,
                subject=request.subject,
                body=request.body,
                cc=request.cc,
                bcc=request.bcc,
                transcript=request.transcript,
            )

        # 2. Send via Gmail
        try:
            result = self.gmail_service.send_email(
                user_id=user_id,
                recipient=email.recipient,
                subject=email.subject,
                body=email.body,
                cc=email.cc,
                bcc=email.bcc,
            )

            # 3. Mark as sent
            return self.email_repo.mark_as_sent(
                email_id=email.id,
                user_id=user_id,
                gmail_message_id=result["message_id"],
                gmail_thread_id=result["thread_id"],
            )
        except Exception as e:
            self.email_repo.mark_as_failed(email.id, user_id)
            raise e
