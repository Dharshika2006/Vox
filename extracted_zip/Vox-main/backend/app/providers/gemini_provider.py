"""Google Gemini provider implementation."""

import json
from typing import Dict, Any, List, Optional
import google.generativeai as genai

from app.providers.base import LLMProvider
from app.config import get_settings


class GeminiLLMProvider(LLMProvider):
    """Google Gemini LLM provider implementation."""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.api_key_for_llm)
        self.model_name = settings.LLM_MODEL or "gemini-2.0-flash"
        self.temperature = settings.AI_TEMPERATURE

    async def generate_json(
        self, prompt: str, system_prompt: str, json_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate JSON using Gemini's JSON response mime type."""

        # In Gemini API, system instructions are set on the model
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                temperature=self.temperature,
                response_mime_type="application/json",
            ),
        )

        response = await model.generate_content_async(
            f"Generate a response matching this schema: {json.dumps(json_schema)}\n\nInput: {prompt}"
        )

        content = response.text
        if not content:
            raise ValueError("Empty response from Gemini")

        return json.loads(content)

    async def generate_text(self, prompt: str, system_prompt: str) -> str:
        """Generate text using Gemini."""
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                temperature=self.temperature,
            ),
        )

        response = await model.generate_content_async(prompt)
        return response.text

    async def chat(
        self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None
    ) -> str:
        """Have a multi-turn conversation."""

        model_kwargs = {"model_name": self.model_name}
        if system_prompt:
            model_kwargs["system_instruction"] = system_prompt

        model = genai.GenerativeModel(**model_kwargs)

        # Convert standard user/assistant messages to Gemini format (user/model)
        gemini_messages = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            gemini_messages.append({"role": role, "parts": [msg["content"]]})

        response = await model.generate_content_async(gemini_messages)
        return response.text
