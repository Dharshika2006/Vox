"""Authentication schemas."""

from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """OAuth token response."""

    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    """Base user properties."""

    email: EmailStr
    name: str
    picture: Optional[str] = None


class UserCreate(UserBase):
    """Properties to receive on user creation."""

    pass


class UserUpdate(BaseModel):
    """Properties to receive on user update."""

    name: Optional[str] = None
    picture: Optional[str] = None


class UserResponse(UserBase):
    """User response model."""

    id: int

    model_config = {"from_attributes": True}
