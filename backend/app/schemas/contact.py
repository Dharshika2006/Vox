"""Contact schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class ContactEmailBase(BaseModel):
    """Base contact email properties."""

    email: EmailStr
    is_primary: bool = False


class ContactEmailCreate(ContactEmailBase):
    """Properties to receive on contact email creation."""

    pass


class ContactEmailResponse(ContactEmailBase):
    """Contact email response model."""

    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactBase(BaseModel):
    """Base contact properties."""

    name: str
    nickname: Optional[str] = None
    is_favorite: bool = False


class ContactCreate(ContactBase):
    """Properties to receive on contact creation."""

    emails: List[ContactEmailCreate]


class ContactUpdate(BaseModel):
    """Properties to receive on contact update."""

    name: Optional[str] = None
    nickname: Optional[str] = None
    is_favorite: Optional[bool] = None
    emails: Optional[List[ContactEmailCreate]] = None


class ContactResponse(ContactBase):
    """Contact response model."""

    id: int
    created_at: datetime
    updated_at: datetime
    emails: List[ContactEmailResponse]

    model_config = {"from_attributes": True}
