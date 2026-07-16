"""Transcription Service."""

from app.providers.factory import ProviderFactory


class TranscriptionService:
    """Service for handling audio transcription."""

    def __init__(self):
        self.provider = ProviderFactory.get_transcription_provider()

    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, mime_type: str, prompt: str = None
    ) -> str:
        """Transcribe an audio file."""
        return await self.provider.transcribe(audio_bytes, filename, mime_type, prompt)
