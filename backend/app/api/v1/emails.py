"""Email endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.email import (
    EmailDraftRequest,
    EmailSendRequest,
    EmailResponse,
    EmailHistoryResponse,
)
from app.schemas.common import PaginatedResponse
from app.models.user import User
from app.api.dependencies import get_email_service, get_current_user
from app.services.email_service import EmailService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[EmailHistoryResponse])
def get_email_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    email_service: EmailService = Depends(get_email_service),
    current_user: User = Depends(get_current_user),
):
    """Get paginated email history."""
    items, total = email_service.get_emails(current_user.id, skip, limit)
    return {"items": items, "total": total, "page": skip // limit + 1, "size": limit}


@router.get("/{email_id}", response_model=EmailHistoryResponse)
def get_email(
    email_id: int,
    email_service: EmailService = Depends(get_email_service),
    current_user: User = Depends(get_current_user),
):
    """Get a specific email."""
    email = email_service.get_email(email_id, current_user.id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email


@router.post("/draft", response_model=EmailHistoryResponse)
async def draft_email(
    request: EmailDraftRequest,
    email_service: EmailService = Depends(get_email_service),
    current_user: User = Depends(get_current_user),
):
    """Generate an email draft from a transcript."""
    try:
        return await email_service.draft_email(current_user.id, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send", response_model=EmailHistoryResponse)
def send_email(
    request: EmailSendRequest,
    email_service: EmailService = Depends(get_email_service),
    current_user: User = Depends(get_current_user),
):
    """Send an email."""
    try:
        return email_service.send_email(current_user.id, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
