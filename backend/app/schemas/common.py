"""Common schemas."""

from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""

    items: List[T]
    total: int
    page: int
    size: int


class ErrorResponse(BaseModel):
    """Standard error response."""

    detail: str
    error_code: Optional[str] = None
