"""Voice processing endpoints."""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.schemas.voice import TranscriptionResponse
from app.models.user import User
from app.api.dependencies import get_transcription_service, get_current_user, get_contact_repository
from app.services.transcription_service import TranscriptionService
from app.repositories.contact_repository import ContactRepository

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    transcription_service: TranscriptionService = Depends(get_transcription_service),
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Transcribe an audio file."""
    if not file.content_type or (
        not file.content_type.startswith("audio/")
        and file.content_type not in ["video/mp4", "video/webm"]
    ):
        raise HTTPException(status_code=400, detail="File must be audio or webm video")

    # Fetch contacts for Whisper prompt
    contacts, _ = contact_repo.get_user_contacts(current_user.id, limit=100)
    prompt_names = []
    for c in contacts:
        prompt_names.append(c.name)
        if c.nickname:
            prompt_names.append(c.nickname)
    
    prompt = ", ".join(prompt_names) if prompt_names else None

    content = await file.read()
    transcript = await transcription_service.transcribe_audio(
        content, file.filename or "audio.webm", file.content_type, prompt=prompt
    )

    return TranscriptionResponse(transcript=transcript)
