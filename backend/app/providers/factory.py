"""Provider factory for instantiating the correct AI providers based on config."""

import logging
from typing import Dict, Type

from app.config import get_settings, LLMProviderType, TranscriptionProviderType
from app.providers.base import LLMProvider, TranscriptionProvider

# Lazy load imports to avoid importing SDKs unless configured
from app.providers.groq_provider import GroqLLMProvider, GroqTranscriptionProvider
from app.providers.openai_provider import OpenAILLMProvider, OpenAITranscriptionProvider
from app.providers.anthropic_provider import AnthropicLLMProvider
from app.providers.gemini_provider import GeminiLLMProvider

logger = logging.getLogger(__name__)


class ProviderFactory:
    """Factory for creating LLM and Transcription provider instances."""

    @staticmethod
    def get_llm_provider() -> LLMProvider:
        """Get the configured LLM provider instance."""
        settings = get_settings()

        providers: Dict[LLMProviderType, Type[LLMProvider]] = {
            LLMProviderType.GROQ: GroqLLMProvider,
            LLMProviderType.OPENAI: OpenAILLMProvider,
            LLMProviderType.ANTHROPIC: AnthropicLLMProvider,
            LLMProviderType.GEMINI: GeminiLLMProvider,
        }

        provider_class = providers.get(settings.LLM_PROVIDER)
        if not provider_class:
            logger.warning(
                f"Unsupported LLM provider '{settings.LLM_PROVIDER}', falling back to Groq."
            )
            provider_class = GroqLLMProvider

        return provider_class()

    @staticmethod
    def get_transcription_provider() -> TranscriptionProvider:
        """Get the configured Transcription provider instance."""
        settings = get_settings()

        providers: Dict[TranscriptionProviderType, Type[TranscriptionProvider]] = {
            TranscriptionProviderType.GROQ: GroqTranscriptionProvider,
            TranscriptionProviderType.OPENAI: OpenAITranscriptionProvider,
        }

        provider_class = providers.get(settings.TRANSCRIPTION_PROVIDER)
        if not provider_class:
            logger.warning(
                f"Unsupported transcription provider '{settings.TRANSCRIPTION_PROVIDER}', falling back to Groq."
            )
            provider_class = GroqTranscriptionProvider

        return provider_class()
