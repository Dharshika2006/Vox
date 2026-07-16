"""Settings endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.api.dependencies import get_current_user, get_db
from sqlalchemy.orm import Session
from app.models.settings import UserSettings

router = APIRouter()

class SettingsUpdate(BaseModel):
    voice_language: Optional[str] = None
    auto_send: Optional[bool] = None
    email_signature: Optional[str] = None

class SettingsResponse(BaseModel):
    voice_language: str
    auto_send: bool
    email_signature: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user settings."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        # Create default settings
        settings = UserSettings(
            user_id=current_user.id,
            voice_language="en-US",
            auto_send=False,
            email_signature=""
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return settings

@router.patch("", response_model=SettingsResponse)
def update_settings(
    update_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user settings."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            voice_language="en-US",
            auto_send=False,
            email_signature=""
        )
        db.add(settings)
    
    if update_data.voice_language is not None:
        settings.voice_language = update_data.voice_language
    if update_data.auto_send is not None:
        settings.auto_send = update_data.auto_send
    if update_data.email_signature is not None:
        settings.email_signature = update_data.email_signature
        
    db.commit()
    db.refresh(settings)
    return settings
