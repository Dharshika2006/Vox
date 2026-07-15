"""API v1 Router."""

from fastapi import APIRouter

from app.api.v1 import auth, emails, contacts, voice, conversation, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(
    conversation.router, prefix="/conversation", tags=["conversation"]
)
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
