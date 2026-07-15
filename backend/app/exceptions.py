"""Custom exception hierarchy for the application."""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class VoxException(HTTPException):
    """Base exception for all custom application errors."""

    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "An unexpected error occurred.",
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class ConfigurationError(VoxException):
    """Raised when there is a configuration issue (e.g., missing API keys)."""

    def __init__(self, detail: str = "Service configuration error."):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class AuthenticationError(VoxException):
    """Raised when authentication fails."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(VoxException):
    """Raised when user lacks required permissions."""

    def __init__(self, detail: str = "Not enough permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class NotFoundError(VoxException):
    """Raised when a requested resource is not found."""

    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )


class ProviderError(VoxException):
    """Raised when an external AI provider fails."""

    def __init__(self, detail: str = "External provider error"):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        )


class ValidationError(VoxException):
    """Raised when validation of data or inputs fails."""

    def __init__(self, detail: str = "Validation error"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )
