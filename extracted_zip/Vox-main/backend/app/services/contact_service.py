"""Contact Service."""

from typing import List, Tuple, Optional

from app.schemas.contact import ContactCreate, ContactUpdate
from app.repositories.contact_repository import ContactRepository


class ContactService:
    """Service for managing user contacts."""

    def __init__(self, contact_repo: ContactRepository):
        self.contact_repo = contact_repo

    def get_contacts(
        self, user_id: int, skip: int = 0, limit: int = 50, search: Optional[str] = None
    ):
        """Get contacts for a user."""
        return self.contact_repo.get_user_contacts(user_id, skip, limit, search)

    def get_contact(self, contact_id: int, user_id: int):
        """Get a specific contact."""
        return self.contact_repo.get_by_id(contact_id, user_id)

    def create_contact(self, user_id: int, contact_in: ContactCreate):
        """Create a new contact."""
        return self.contact_repo.create(user_id, contact_in)

    def update_contact(self, contact_id: int, user_id: int, contact_in: ContactUpdate):
        """Update an existing contact."""
        return self.contact_repo.update(contact_id, user_id, contact_in)

    def delete_contact(self, contact_id: int, user_id: int) -> bool:
        """Delete a contact."""
        return self.contact_repo.delete(contact_id, user_id)
