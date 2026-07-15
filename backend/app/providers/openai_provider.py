"""OpenAI provider implementation."""

import json
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI

from app.providers.base import LLMProvider, TranscriptionProvider
from app.config import get_settings


class OpenAILLMProvider(LLMProvider):
    """OpenAI LLM provider implementation."""

    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.api_key_for_llm)
        self.model = settings.LLM_MODEL or "gpt-4o"
        self.temperature = settings.AI_TEMPERATURE
        self.max_tokens = settings.AI_MAX_TOKENS

    async def generate_json(
        self, prompt: str, system_prompt: str, json_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate JSON using OpenAI's Structured Outputs."""
        # For simplicity in this provider abstraction, we just use JSON mode
        # and ask it to follow the schema.
        sys_prompt = f"{system_prompt}\n\nYou must respond in JSON format matching this schema:\n{json.dumps(json_schema)}"

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")

        return json.loads(content)

    async def generate_text(self, prompt: str, system_prompt: str) -> str:
        """Generate text using OpenAI."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content or ""

    async def chat(
        self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None
    ) -> str:
        """Have a multi-turn conversation."""
        api_messages = []
        if system_prompt:
            api_messages.append({"role": "system", "content": system_prompt})

        api_messages.extend(messages)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=api_messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content or ""


class OpenAITranscriptionProvider(TranscriptionProvider):
    """OpenAI Whisper provider implementation."""

    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.api_key_for_transcription)
        self.model = settings.TRANSCRIPTION_MODEL or "whisper-1"

    async def transcribe(
        self, audio_content: bytes, filename: str, mime_type: str
    ) -> str:
        """Transcribe audio using OpenAI's Whisper API."""
        file_tuple = (filename, audio_content, mime_type)

        response = await self.client.audio.transcriptions.create(
            file=file_tuple, model=self.model, response_format="text"
        )
        return response.text.strip()
