"""AI Service for intent detection and entity extraction."""

import json
from typing import Dict, Any, List, Optional

from app.providers.factory import ProviderFactory


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

        return await self.provider.generate_json(context, system_prompt, schema)

    async def generate_draft(
        self, recipient: str, message: str, user_signature: str = ""
    ) -> Dict[str, Any]:
        """Generate a complete email draft from extracted entities."""

        system_prompt = """
You are an expert executive assistant. Draft a professional, clear, and concise email based on the user's brief message.
You must expand on their brief message to make it sound professional.
Include a proper subject line, a proper greeting using the recipient's name, a professional body, and a proper closing.

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

        return await self.provider.generate_json(prompt, system_prompt, schema)
