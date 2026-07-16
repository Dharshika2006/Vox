"""Settings repository."""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.settings import UserSettings


class SettingsRepository:
    """Repository for UserSettings operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> UserSettings:
        """Get settings for a user. Create default if they don't exist."""
        settings = (
            self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        )

        if not settings:
            settings = UserSettings(user_id=user_id)
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)

        return settings

    def update(
        self,
        user_id: int,
        voice_language: Optional[str] = None,
        auto_send: Optional[bool] = None,
        email_signature: Optional[str] = None,
    ) -> UserSettings:
        """Update user settings."""
        settings = self.get_by_user_id(user_id)

        if voice_language is not None:
            settings.voice_language = voice_language
        if auto_send is not None:
            settings.auto_send = auto_send
        if email_signature is not None:
            settings.email_signature = email_signature

        self.db.commit()
        self.db.refresh(settings)
        return settings
