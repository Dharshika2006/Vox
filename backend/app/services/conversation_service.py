"""Conversation Service for managing multi-turn interactions."""

import uuid
from typing import Dict, Any, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.services.ai_service import AIService
from app.services.contact_service import ContactService
from app.services.email_service import EmailService
from app.schemas.conversation import ConversationResponse
from app.schemas.email import EmailSendRequest
from app.models.conversation_session import ConversationSession
from app.models.user import User


class ConversationService:
    """Service for managing multi-turn voice conversations."""

    def __init__(
        self,
        db: Session,
        ai_service: AIService,
        contact_service: ContactService,
        email_service: EmailService,
    ):
        self.db = db
        self.ai_service = ai_service
        self.contact_service = contact_service
        self.email_service = email_service

    def _get_or_create_session(self, session_id: Optional[str]) -> ConversationSession:
        if session_id:
            db_session = self.db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
            if db_session:
                return db_session
                
        session_id = session_id or str(uuid.uuid4())
        initial_state = {
            "state": "IDLE",
            "history": [],
            "pending_intent": None,
            "pending_recipient_name": None,
            "pending_message": None,
            "draft": None,
            "resolved_contact": None,
            "clarification_options": None,
        }
        db_session = ConversationSession(id=session_id, state=initial_state)
        self.db.add(db_session)
        self.db.commit()
        return db_session
        
    def _save_session(self, db_session: ConversationSession, state_dict: dict):
        # Only save if not deleted
        if db_session in self.db:
            db_session.state = dict(state_dict)
            flag_modified(db_session, "state")
            self.db.commit()

    async def process_message(
        self, transcript: str, user: User, session_id: Optional[str] = None
    ) -> ConversationResponse:
        """Process a new message in a conversation state machine with error handling."""
        from app.exceptions import ProviderError
        try:
            return await self._process_message_internal(transcript, user, session_id)
        except ProviderError:
            return ConversationResponse(
                session_id=session_id or "",
                message="I'm having trouble connecting to my AI brain right now. Please try again in a moment.",
                state="IDLE",
                action_required=False,
            )

    async def _process_message_internal(
        self, transcript: str, user: User, session_id: Optional[str] = None
    ) -> ConversationResponse:
        """Internal processing logic."""

        db_session = self._get_or_create_session(session_id)
        session_id = db_session.id
        
        session = dict(db_session.state)
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
                self._save_session(db_session, session)
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
                user_signature=user.name
            )
            
            session["draft"] = draft
            session["state"] = "PREVIEW"
            
            self._save_session(db_session, session)
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
            confirmation_result = await self.ai_service.classify_confirmation(transcript)
            is_confirmed = confirmation_result.get("confirm")
            
            if is_confirmed is True:
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
                    
                    self.email_service.send_email(user_id=user.id, request=send_req)
                    
                    session["state"] = "SUCCESS"
                    self._save_session(db_session, session)
                    return ConversationResponse(
                        session_id=session_id,
                        message="Your email has been sent successfully.",
                        state="SUCCESS",
                        action_required=False,
                    )
                except Exception as e:
                    session["state"] = "ERROR"
                    self._save_session(db_session, session)
                    return ConversationResponse(
                        session_id=session_id,
                        message=f"I'm sorry, I couldn't send the email. The error was: {str(e)}",
                        state="ERROR",
                        action_required=False,
                    )
            elif is_confirmed is False:
                draft_content = session["draft"]
                contact_info = session["resolved_contact"]
                self.end_conversation(session_id)
                return ConversationResponse(
                    session_id=session_id,
                    message="Okay, I've cancelled the automated send. You can edit the draft manually.",
                    state="IDLE",
                    action_required=False,
                    draft=draft_content,
                    resolved_contact=contact_info
                )
            else:
                self._save_session(db_session, session)
                return ConversationResponse(
                    session_id=session_id,
                    message="I wasn't sure if you wanted to send that. Please say 'yes' to send it, or 'no' to cancel.",
                    state="PREVIEW",
                    action_required=True,
                    draft=session["draft"],
                    resolved_contact=session["resolved_contact"]
                )

        # 3. We were awaiting an email address because contact resolution failed (Fix 3.5)
        if state == "AWAITING_EMAIL_ADDRESS":
            email_address = await self.ai_service.extract_email_address(transcript)
            if not email_address:
                self._save_session(db_session, session)
                return ConversationResponse(
                    session_id=session_id,
                    message="I didn't catch that email address. Could you spell it out for me?",
                    state="AWAITING_EMAIL_ADDRESS",
                    action_required=True,
                )
                
            selected_contact = {"id": -1, "name": session["pending_recipient_name"], "email": email_address}
            session["resolved_contact"] = selected_contact
            
            session["state"] = "DRAFTING"
            draft = await self.ai_service.generate_draft(
                recipient=selected_contact["name"],
                message=session["pending_message"],
                user_signature=user.name
            )
            
            session["draft"] = draft
            session["state"] = "PREVIEW"
            
            self._save_session(db_session, session)
            return ConversationResponse(
                session_id=session_id,
                message="I've drafted your email. Would you like me to send it?",
                state="PREVIEW",
                action_required=True,
                draft=draft,
                resolved_contact=selected_contact
            )

        # 4. Default state (IDLE): process a new intent
        session["state"] = "PROCESSING_INTENT"
        
        # Determine intent and entities
        result = await self.ai_service.process_intent(transcript, history)

        # Add user message to history
        history.append({"role": "user", "content": transcript})
        
        intent = result.get("intent")
        if intent != "send_email":
            session["state"] = "IDLE"
            self._save_session(db_session, session)
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
            self._save_session(db_session, session)
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
        contacts, total = self.contact_service.get_contacts(user_id=user.id, search=recipient_name)
        
        if len(contacts) == 0:
            # Fix 3.5: No Contact Fallback
            session["state"] = "AWAITING_EMAIL_ADDRESS"
            self._save_session(db_session, session)
            return ConversationResponse(
                session_id=session_id,
                message=f"I couldn't find any contact named {recipient_name}. What is their email address?",
                state="AWAITING_EMAIL_ADDRESS",
                action_required=True,
            )
            
        if len(contacts) > 1:
            session["state"] = "RESOLVING_CONTACT"
            options = [{"id": c.id, "name": c.name, "email": c.emails[0].email if c.emails else ""} for c in contacts]
            session["clarification_options"] = options
            
            names = " or ".join([c.name for c in contacts])
            self._save_session(db_session, session)
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
            user_signature=user.name
        )
        
        session["draft"] = draft
        session["state"] = "PREVIEW"
        
        self._save_session(db_session, session)
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
        db_session = self.db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
        if db_session:
            self.db.delete(db_session)
            self.db.commit()
