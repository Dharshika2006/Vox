"""Auth endpoints."""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import RedirectResponse

from app.schemas.auth import Token, UserResponse
from app.models.user import User
from app.api.dependencies import get_auth_service, get_current_user
from app.services.auth_service import AuthService
from app.config import get_settings

router = APIRouter()


@router.get("/login")
def login_google(auth_service: AuthService = Depends(get_auth_service)):
    """Get the Google OAuth2 login URL and redirect to it."""
    url = auth_service.get_google_auth_url()
    return {"url": url}


@router.get("/callback")
def auth_callback(
    code: str = Query(...), auth_service: AuthService = Depends(get_auth_service)
):
    """Callback for Google OAuth2. Exchanges code for token."""
    try:
        result = auth_service.handle_google_callback(code)

        # In a real app with a frontend, we might want to redirect with the token
        # or set it as a cookie. Here we just return it.
        settings = get_settings()

        # Redirect back to frontend with token
        redirect_url = (
            f"{settings.FRONTEND_URL}/auth/callback?token={result['access_token']}"
        )
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        settings = get_settings()
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?error={str(e)}"
        return RedirectResponse(url=redirect_url)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user
