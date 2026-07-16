"""Base abstract classes for AI and Transcription providers."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import json


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate_json(
        self, prompt: str, system_prompt: str, json_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured JSON output."""
        pass

    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: str) -> str:
        """Generate unstructured text output."""
        pass

    @abstractmethod
    async def chat(
        self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None
    ) -> str:
        """Have a multi-turn conversation."""
        pass


class TranscriptionProvider(ABC):
    """Abstract base class for transcription providers."""

    @abstractmethod
    async def transcribe(
        self, audio_content: bytes, filename: str, mime_type: str, prompt: Optional[str] = None
    ) -> str:
        """Transcribe audio bytes to text."""
        pass
