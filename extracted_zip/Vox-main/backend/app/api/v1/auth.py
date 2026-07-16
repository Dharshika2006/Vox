"""Auth endpoints."""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse, JSONResponse

from app.schemas.auth import UserResponse
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
    settings = get_settings()
    try:
        result = auth_service.handle_google_callback(code)

        # Redirect back to frontend, setting the cookie
        redirect_url = f"{settings.FRONTEND_URL}/dashboard"
        response = RedirectResponse(url=redirect_url)
        response.set_cookie(
            key="vox_token",
            value=result['access_token'],
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        return response

    except Exception as e:
        redirect_url = f"{settings.FRONTEND_URL}/login?error={str(e)}"
        return RedirectResponse(url=redirect_url)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user


@router.post("/logout")
def logout():
    """Clear the authentication cookie."""
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("vox_token")
    return response
