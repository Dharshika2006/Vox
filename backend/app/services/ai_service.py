"""AI Service for intent detection and entity extraction."""

import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.providers.factory import ProviderFactory


class IntentResponse(BaseModel):
    intent: str
    recipient: Optional[str] = None
    message: Optional[str] = None

class DraftResponse(BaseModel):
    recipient: str
    subject: str
    body: str

class ConfirmationResponse(BaseModel):
    confirm: Optional[bool] = None

class EmailExtractResponse(BaseModel):
    email: Optional[str] = None


class AIService:
    """Service for interacting with AI models."""

    def __init__(self):
        self.provider = ProviderFactory.get_llm_provider()

    async def process_intent(
        self, transcript: str, history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Detect intent and extract entities from a transcript."""

        system_prompt = """
You are an AI assistant that helps users draft and manage emails via voice commands.
Analyze the user's transcript and determine their intent.

Extract the following information:
1. Intent (must be one of: "send_email", "unknown")
2. Recipient (the name or email address of the person they want to send to)
3. Message (the core message or content they want to convey)

Respond ONLY with a JSON object in this exact format:
{
  "intent": "send_email",
  "recipient": "Name",
  "message": "The message they want to send."
}

If you cannot determine the intent or recipient, use null for those fields. Do not add any conversational text.
"""

        schema = {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "enum": ["send_email", "unknown"],
                },
                "recipient": {"type": ["string", "null"]},
                "message": {"type": ["string", "null"]},
            },
            "required": ["intent", "recipient", "message"],
        }

        context = ""
        if history:
            context = "Conversation History:\n"
            for msg in history:
                context += f"{msg['role']}: {msg['content']}\n"
            context += f"\nLatest User Input: {transcript}"
        else:
            context = f"User Input: {transcript}"

        result = await self.provider.generate_json(context, system_prompt, schema)
        validated = IntentResponse(**result)
        return validated.model_dump()

    async def generate_draft(
        self, recipient: str, message: str, user_signature: str = ""
    ) -> Dict[str, Any]:
        """Generate a complete email draft from extracted entities."""

        system_prompt = """
You are an expert executive assistant. Draft a professional, clear, and concise email based on the user's brief message.
You must expand on their brief message to make it sound professional.
Include a proper subject line, a proper greeting using the recipient's name, a professional structured body (use \n\n for paragraph breaks to ensure it is not one big paragraph), and a proper closing.
DO NOT use placeholder brackets like [Your Name] for the signature. Simply end with "Best regards," (or whatever closing is appropriate) if no specific signature is provided.

Output ONLY a JSON object with the finalized email fields. Do not add conversational filler.
"""

        schema = {
            "type": "object",
            "properties": {
                "recipient": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["recipient", "subject", "body"],
        }

        prompt = f"Draft an email to {recipient} conveying this message: {message}\n"
        if user_signature:
            prompt += f"\nInclude this signature at the end:\n{user_signature}"

        result = await self.provider.generate_json(prompt, system_prompt, schema)
        validated = DraftResponse(**result)
        return validated.model_dump()

    async def classify_confirmation(self, transcript: str) -> Dict[str, Any]:
        """Classify if the user is confirming or denying the draft, or if it's unclear."""
        
        system_prompt = """
You are an AI assistant helping a user send an email. 
The user was just asked: "I've drafted your email. Would you like me to send it?"
Analyze the user's transcript and determine if they are confirming (yes, send it), denying/canceling (no, don't send it, cancel), or if their response is unclear (e.g. asking a question, making an unrelated statement, or providing an instruction to edit the draft without saying yes/no).

Output ONLY a JSON object in this format:
{
  "confirm": true, // if confirming
  "confirm": false, // if denying or canceling
  "confirm": null // if unclear or asking to edit
}
"""

        schema = {
            "type": "object",
            "properties": {
                "confirm": {"type": ["boolean", "null"]},
            },
            "required": ["confirm"],
        }

        context = f"User Input: {transcript}"
        result = await self.provider.generate_json(context, system_prompt, schema)
        validated = ConfirmationResponse(**result)
        return validated.model_dump()

    async def extract_email_address(self, transcript: str) -> Optional[str]:
        """Extract an email address from spoken text."""
        system_prompt = """
You are an AI assistant. The user is dictating an email address.
Extract the valid email address from their speech. They might say things like "john dot doe at gmail dot com".
Convert it to a standard email format (john.doe@gmail.com).
If you cannot find a valid email address, return null.

Output ONLY a JSON object in this format:
{
  "email": "extracted@email.com" // or null
}
"""
        schema = {
            "type": "object",
            "properties": {
                "email": {"type": ["string", "null"]},
            },
            "required": ["email"],
        }
        
        context = f"User Input: {transcript}"
        result = await self.provider.generate_json(context, system_prompt, schema)
        validated = EmailExtractResponse(**result)
        return validated.email
