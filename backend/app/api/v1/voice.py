"""Voice processing endpoints."""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.schemas.voice import TranscriptionResponse
from app.models.user import User
from app.api.dependencies import get_transcription_service, get_current_user
from app.services.transcription_service import TranscriptionService

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    transcription_service: TranscriptionService = Depends(get_transcription_service),
    current_user: User = Depends(get_current_user),
):
    """Transcribe an audio file."""
    if not file.content_type or (
        not file.content_type.startswith("audio/")
        and file.content_type not in ["video/mp4", "video/webm"]
    ):
        raise HTTPException(status_code=400, detail="File must be audio or webm video")

    try:
        content = await file.read()
        transcript = await transcription_service.transcribe_audio(
            content, file.filename or "audio.webm", file.content_type
        )

        return TranscriptionResponse(transcript=transcript)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
