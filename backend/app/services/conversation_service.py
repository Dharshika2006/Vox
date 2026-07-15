"""Conversation Service for managing multi-turn interactions."""

import uuid
from typing import Dict, Any, List, Optional

from app.services.ai_service import AIService
from app.services.contact_service import ContactService
from app.services.email_service import EmailService
from app.schemas.conversation import ConversationResponse
from app.schemas.email import EmailSendRequest

# Simple in-memory state for conversations (in a real app, use Redis)
_conversations: Dict[str, Dict[str, Any]] = {}


class ConversationService:
    """Service for managing multi-turn voice conversations."""

    def __init__(
        self,
        ai_service: AIService,
        contact_service: ContactService,
        email_service: EmailService,
    ):
        self.ai_service = ai_service
        self.contact_service = contact_service
        self.email_service = email_service

    async def process_message(
        self, transcript: str, user_id: int, session_id: Optional[str] = None
    ) -> ConversationResponse:
        """Process a new message in a conversation state machine."""

        if not session_id or session_id not in _conversations:
            session_id = session_id or str(uuid.uuid4())
            _conversations[session_id] = {
                "state": "IDLE",
                "history": [],
                "pending_intent": None,
                "pending_recipient_name": None,
                "pending_message": None,
                "draft": None,
                "resolved_contact": None,
                "clarification_options": None,
            }

        session = _conversations[session_id]
        state = session["state"]
        history = session["history"]

        # 1. We were awaiting clarification on a contact name
        if state == "RESOLVING_CONTACT":
            # Very simple resolution: match transcript to the options
            selected_contact = None
            transcript_lower = transcript.lower()
            
            # Check for direct matches or numbered matches (e.g. "the first one")
            for i, opt in enumerate(session["clarification_options"]):
                if opt["name"].lower() in transcript_lower:
                    selected_contact = opt
                    break
                
            if not selected_contact and "first" in transcript_lower and len(session["clarification_options"]) > 0:
                selected_contact = session["clarification_options"][0]
            elif not selected_contact and "second" in transcript_lower and len(session["clarification_options"]) > 1:
                selected_contact = session["clarification_options"][1]
                
            if not selected_contact:
                return ConversationResponse(
                    session_id=session_id,
                    message="I didn't catch which one you meant. Can you say the full name?",
                    state="RESOLVING_CONTACT",
                    action_required=True,
                    clarification_options=session["clarification_options"]
                )
                
            # We found the contact.
            session["resolved_contact"] = selected_contact
            
            # Transition to DRAFTING
            session["state"] = "DRAFTING"
            draft = await self.ai_service.generate_draft(
                recipient=selected_contact["name"],
                message=session["pending_message"],
            )
            
            session["draft"] = draft
            session["state"] = "PREVIEW"
            
            return ConversationResponse(
                session_id=session_id,
                message="I've drafted your email. Would you like me to send it?",
                state="PREVIEW",
                action_required=True,
                draft=draft,
                resolved_contact=selected_contact
            )

        # 2. We were at PREVIEW, waiting for "Yes" or "No" to send
        if state == "PREVIEW":
            transcript_lower = transcript.lower()
            if "yes" in transcript_lower or "send" in transcript_lower:
                session["state"] = "SENDING"
                # Send the email!
                try:
                    draft = session["draft"]
                    contact = session["resolved_contact"]
                    
                    send_req = EmailSendRequest(
                        recipient=contact["email"],
                        subject=draft["subject"],
                        body=draft["body"],
                        transcript=session["pending_message"]
                    )
                    
                    self.email_service.send_email(user_id=user_id, request=send_req)
                    
                    session["state"] = "SUCCESS"
                    return ConversationResponse(
                        session_id=session_id,
                        message="Your email has been sent successfully.",
                        state="SUCCESS",
                        action_required=False,
                    )
                except Exception as e:
                    session["state"] = "ERROR"
                    return ConversationResponse(
                        session_id=session_id,
                        message=f"I'm sorry, I couldn't send the email. The error was: {str(e)}",
                        state="ERROR",
                        action_required=False,
                    )
            elif "no" in transcript_lower or "cancel" in transcript_lower:
                session["state"] = "PREVIEW" # Stays in preview, user can edit manually
                return ConversationResponse(
                    session_id=session_id,
                    message="Okay, I won't send it. You can edit it manually.",
                    state="PREVIEW",
                    action_required=False,
                    draft=session["draft"],
                    resolved_contact=session["resolved_contact"]
                )
            else:
                return ConversationResponse(
                    session_id=session_id,
                    message="Please say 'yes' to send it, or 'no' to cancel.",
                    state="PREVIEW",
                    action_required=True,
                    draft=session["draft"],
                    resolved_contact=session["resolved_contact"]
                )


        # 3. Default state (IDLE): process a new intent
        session["state"] = "PROCESSING_INTENT"
        
        # Determine intent and entities
        result = await self.ai_service.process_intent(transcript, history)

        # Add user message to history
        history.append({"role": "user", "content": transcript})
        
        intent = result.get("intent")
        if intent != "send_email":
            session["state"] = "IDLE"
            return ConversationResponse(
                session_id=session_id,
                message="I'm sorry, I didn't understand that command. Try asking me to send an email.",
                state="IDLE",
                action_required=False,
            )
            
        recipient_name = result.get("recipient")
        message_body = result.get("message")
        
        if not recipient_name or not message_body:
            session["state"] = "IDLE"
            return ConversationResponse(
                session_id=session_id,
                message="I couldn't figure out who to send this to, or what the message is. Please try again.",
                state="IDLE",
                action_required=False,
            )
            
        session["pending_intent"] = intent
        session["pending_recipient_name"] = recipient_name
        session["pending_message"] = message_body
        
        # Contact Resolution
        contacts, total = self.contact_service.get_contacts(user_id=user_id, search=recipient_name)
        
        # contacts is a list of Contact model instances
        if len(contacts) == 0:
            session["state"] = "ERROR"
            return ConversationResponse(
                session_id=session_id,
                message=f"I couldn't find any contact named {recipient_name}.",
                state="ERROR",
                action_required=False,
            )
            
        if len(contacts) > 1:
            session["state"] = "RESOLVING_CONTACT"
            options = [{"id": c.id, "name": c.name, "email": c.emails[0].email if c.emails else ""} for c in contacts]
            session["clarification_options"] = options
            
            names = " or ".join([c.name for c in contacts])
            return ConversationResponse(
                session_id=session_id,
                message=f"I found {len(contacts)} contacts named {recipient_name}: {names}. Which one would you like?",
                state="RESOLVING_CONTACT",
                action_required=True,
                clarification_options=options
            )
            
        # Exactly 1 contact found
        contact = contacts[0]
        selected_contact = {"id": contact.id, "name": contact.name, "email": contact.emails[0].email if contact.emails else ""}
        session["resolved_contact"] = selected_contact
        
        # Transition to DRAFTING
        session["state"] = "DRAFTING"
        draft = await self.ai_service.generate_draft(
            recipient=selected_contact["name"],
            message=session["pending_message"],
        )
        
        session["draft"] = draft
        session["state"] = "PREVIEW"
        
        return ConversationResponse(
            session_id=session_id,
            message="I've drafted your email. Would you like me to send it?",
            state="PREVIEW",
            action_required=True,
            draft=draft,
            resolved_contact=selected_contact
        )

    def end_conversation(self, session_id: str) -> None:
        """End a conversation and clear state."""
        if session_id in _conversations:
            del _conversations[session_id]
