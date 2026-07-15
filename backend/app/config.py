"""Application configuration using Pydantic BaseSettings.

Loads settings from environment variables and .env files with full validation.
Supports multiple AI providers, database backends, and OAuth configuration.
"""

from __future__ import annotations

import logging
import secrets
from enum import Enum
from typing import Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class LLMProviderType(str, Enum):
    """Supported LLM provider types."""

    GROQ = "groq"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"


class TranscriptionProviderType(str, Enum):
    """Supported transcription provider types."""

    GROQ = "groq"
    OPENAI = "openai"


class Settings(BaseSettings):
    """Application settings with validation and defaults.

    Settings are loaded from environment variables first, then from a .env file.
    Environment variables take precedence over .env values.
    """

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────
    APP_NAME: str = "Vox AI Voice Email Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # ── Server ───────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"]
    )

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./vox.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = False

    # ── Authentication ───────────────────────────────────────────────────
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(64))
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ENCRYPTION_KEY: Optional[str] = None

    # ── Google OAuth ─────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback"
    GOOGLE_SCOPES: list[str] = Field(
        default=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.compose",
            "https://www.googleapis.com/auth/gmail.readonly",
        ]
    )

    # ── AI Providers ─────────────────────────────────────────────────────
    LLM_PROVIDER: LLMProviderType = LLMProviderType.GROQ
    TRANSCRIPTION_PROVIDER: TranscriptionProviderType = TranscriptionProviderType.GROQ

    # Provider API Keys
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Model overrides (optional — defaults set in provider implementations)
    LLM_MODEL: Optional[str] = None
    TRANSCRIPTION_MODEL: Optional[str] = None

    # AI generation settings
    AI_MAX_TOKENS: int = 2048
    AI_TEMPERATURE: float = 0.7
    AI_RETRY_ATTEMPTS: int = 3
    AI_RETRY_DELAY: float = 1.0

    # ── Rate Limiting ────────────────────────────────────────────────────
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── Frontend ─────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Ensure log level is a valid Python logging level."""
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = v.upper()
        if upper not in valid_levels:
            raise ValueError(
                f"Invalid log level '{v}'. Must be one of: {', '.join(sorted(valid_levels))}"
            )
        return upper

    @field_validator("AI_TEMPERATURE")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        """Ensure temperature is within valid range."""
        if not 0.0 <= v <= 2.0:
            raise ValueError("AI_TEMPERATURE must be between 0.0 and 2.0")
        return v

    @model_validator(mode="after")
    def validate_provider_keys(self) -> Settings:
        """Ensure the selected provider has a valid API key configured."""
        provider_key_map = {
            LLMProviderType.GROQ: ("GROQ_API_KEY", self.GROQ_API_KEY),
            LLMProviderType.OPENAI: ("OPENAI_API_KEY", self.OPENAI_API_KEY),
            LLMProviderType.ANTHROPIC: ("ANTHROPIC_API_KEY", self.ANTHROPIC_API_KEY),
            LLMProviderType.GEMINI: ("GEMINI_API_KEY", self.GEMINI_API_KEY),
        }

        key_name, key_value = provider_key_map[self.LLM_PROVIDER]
        if not key_value:
            logger.warning(
                "LLM provider '%s' selected but %s is not set. "
                "AI features will not work until configured.",
                self.LLM_PROVIDER.value,
                key_name,
            )

        transcription_key_map = {
            TranscriptionProviderType.GROQ: ("GROQ_API_KEY", self.GROQ_API_KEY),
            TranscriptionProviderType.OPENAI: ("OPENAI_API_KEY", self.OPENAI_API_KEY),
        }

        key_name, key_value = transcription_key_map[self.TRANSCRIPTION_PROVIDER]
        if not key_value:
            logger.warning(
                "Transcription provider '%s' selected but %s is not set. "
                "Transcription will not work until configured.",
                self.TRANSCRIPTION_PROVIDER.value,
                key_name,
            )

        return self

    @property
    def is_sqlite(self) -> bool:
        """Check if the database is SQLite."""
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def api_key_for_llm(self) -> str:
        """Return the API key for the currently selected LLM provider."""
        mapping = {
            LLMProviderType.GROQ: self.GROQ_API_KEY,
            LLMProviderType.OPENAI: self.OPENAI_API_KEY,
            LLMProviderType.ANTHROPIC: self.ANTHROPIC_API_KEY,
            LLMProviderType.GEMINI: self.GEMINI_API_KEY,
        }
        return mapping[self.LLM_PROVIDER]

    @property
    def api_key_for_transcription(self) -> str:
        """Return the API key for the currently selected transcription provider."""
        mapping = {
            TranscriptionProviderType.GROQ: self.GROQ_API_KEY,
            TranscriptionProviderType.OPENAI: self.OPENAI_API_KEY,
        }
        return mapping[self.TRANSCRIPTION_PROVIDER]


def get_settings() -> Settings:
    """Create and return the application settings singleton.

    Uses lru_cache-like behavior via module-level caching to avoid
    re-reading environment on every call.
    """
    return _settings_instance


# Module-level singleton — created once on import
_settings_instance = Settings()
