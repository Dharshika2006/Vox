"""Contact endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.schemas.common import PaginatedResponse
from app.models.user import User
from app.api.dependencies import get_contact_repository, get_current_user
from app.repositories.contact_repository import ContactRepository

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ContactResponse])
def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Get paginated contacts."""
    items, total = contact_repo.get_user_contacts(current_user.id, skip, limit, search)
    return {"items": items, "total": total, "page": skip // limit + 1, "size": limit}


@router.post("", response_model=ContactResponse)
def create_contact(
    request: ContactCreate,
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Create a new contact."""
    return contact_repo.create(current_user.id, request)


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Get a specific contact."""
    contact = contact_repo.get_by_id(contact_id, current_user.id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    request: ContactUpdate,
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Update a contact."""
    contact = contact_repo.update(contact_id, current_user.id, request)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    contact_repo: ContactRepository = Depends(get_contact_repository),
    current_user: User = Depends(get_current_user),
):
    """Delete a contact."""
    success = contact_repo.delete(contact_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}
