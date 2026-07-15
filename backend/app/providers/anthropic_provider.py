"""Anthropic provider implementation."""

import json
from typing import Dict, Any, List, Optional
from anthropic import AsyncAnthropic

from app.providers.base import LLMProvider
from app.config import get_settings


class AnthropicLLMProvider(LLMProvider):
    """Anthropic LLM provider implementation."""

    def __init__(self):
        settings = get_settings()
        self.client = AsyncAnthropic(api_key=settings.api_key_for_llm)
        self.model = settings.LLM_MODEL or "claude-3-5-sonnet-20241022"
        self.temperature = settings.AI_TEMPERATURE
        self.max_tokens = settings.AI_MAX_TOKENS

    async def generate_json(
        self, prompt: str, system_prompt: str, json_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate JSON using Anthropic.
        Claude supports tool use, but we can also just prompt it to output JSON."""

        sys_prompt = f"{system_prompt}\n\nYou must respond ONLY with valid JSON matching this schema, with no markdown formatting or other text:\n{json.dumps(json_schema)}"

        response = await self.client.messages.create(
            model=self.model,
            system=sys_prompt,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        content = response.content[0].text
        if not content:
            raise ValueError("Empty response from Anthropic")

        # Claude sometimes still wraps in markdown blocks despite instructions
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        return json.loads(content.strip())

    async def generate_text(self, prompt: str, system_prompt: str) -> str:
        """Generate text using Anthropic."""
        response = await self.client.messages.create(
            model=self.model,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.content[0].text

    async def chat(
        self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None
    ) -> str:
        """Have a multi-turn conversation."""
        # Convert roles if needed (Anthropic expects user/assistant alternation)

        # Anthropic doesn't allow 'system' in the messages list, it's a separate parameter
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }

        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self.client.messages.create(**kwargs)
        return response.content[0].text
