"""Voice processing schemas."""

from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    """Response from audio transcription."""

    transcript: str
    language: str = "en"
    duration: float = 0.0
