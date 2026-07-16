"""Contact repository."""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.models.contact import Contact, ContactEmail
from app.schemas.contact import ContactCreate, ContactUpdate


class ContactRepository:
    """Repository for Contact operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, contact_id: int, user_id: int) -> Optional[Contact]:
        """Get a contact by ID and user ID."""
        return (
            self.db.query(Contact)
            .filter(Contact.id == contact_id, Contact.user_id == user_id)
            .first()
        )

    def get_user_contacts(
        self, user_id: int, skip: int = 0, limit: int = 50, search: Optional[str] = None
    ) -> Tuple[List[Contact], int]:
        """Get paginated contacts for a user, optionally filtered by fuzzy search."""
        if search:
            from rapidfuzz import process, fuzz
            
            # Fetch all user contacts to perform fuzzy matching in memory
            all_contacts = self.db.query(Contact).filter(Contact.user_id == user_id).all()
            if not all_contacts:
                return [], 0
                
            choices = []
            for c in all_contacts:
                parts = [c.name]
                if c.nickname:
                    parts.append(c.nickname)
                for email_obj in c.emails:
                    parts.append(email_obj.email)
                choices.append(" ".join(parts))
                
            # Perform fuzzy match
            # WRatio handles variations in string length, case, and partial matches well
            results = process.extract(search, choices, scorer=fuzz.WRatio, limit=limit, score_cutoff=65.0)
            
            items = [all_contacts[idx] for _, score, idx in results]
            return items, len(items)
            
        else:
            query = self.db.query(Contact).filter(Contact.user_id == user_id)
            total = query.count()
            items = (
                query.order_by(desc(Contact.is_favorite), Contact.name)
                .offset(skip)
                .limit(limit)
                .all()
            )
            return items, total

    def _check_email_uniqueness(self, user_id: int, emails: List[str], exclude_contact_id: Optional[int] = None):
        """Check if emails already exist for this user on other contacts."""
        query = self.db.query(ContactEmail).join(Contact).filter(
            Contact.user_id == user_id,
            ContactEmail.email.in_(emails)
        )
        if exclude_contact_id:
            query = query.filter(Contact.id != exclude_contact_id)
            
        existing = query.first()
        if existing:
            raise ValueError(f"Email {existing.email} is already associated with another contact.")

    def create(self, user_id: int, contact_in: ContactCreate) -> Contact:
        """Create a new contact."""
        # Check uniqueness
        if contact_in.emails:
            self._check_email_uniqueness(user_id, [e.email for e in contact_in.emails])

        db_contact = Contact(
            user_id=user_id,
            name=contact_in.name,
            nickname=contact_in.nickname,
            is_favorite=contact_in.is_favorite,
        )
        self.db.add(db_contact)
        self.db.commit()
        self.db.refresh(db_contact)

        # Add emails
        for email_in in contact_in.emails:
            db_email = ContactEmail(
                contact_id=db_contact.id,
                email=email_in.email,
                is_primary=email_in.is_primary,
            )
            self.db.add(db_email)

        self.db.commit()
        self.db.refresh(db_contact)
        return db_contact

    def update(
        self, contact_id: int, user_id: int, contact_in: ContactUpdate
    ) -> Optional[Contact]:
        """Update an existing contact."""
        db_contact = self.get_by_id(contact_id, user_id)
        if not db_contact:
            return None

        if contact_in.name is not None:
            db_contact.name = contact_in.name
        if contact_in.nickname is not None:
            db_contact.nickname = contact_in.nickname
        if contact_in.is_favorite is not None:
            db_contact.is_favorite = contact_in.is_favorite

        if contact_in.emails is not None:
            # Check uniqueness before deleting old ones
            self._check_email_uniqueness(user_id, [e.email for e in contact_in.emails], exclude_contact_id=contact_id)
            
            # Delete existing emails
            self.db.query(ContactEmail).filter(
                ContactEmail.contact_id == db_contact.id
            ).delete()

            # Add new emails
            for email_in in contact_in.emails:
                db_email = ContactEmail(
                    contact_id=db_contact.id,
                    email=email_in.email,
                    is_primary=email_in.is_primary,
                )
                self.db.add(db_email)

        self.db.commit()
        self.db.refresh(db_contact)
        return db_contact

    def delete(self, contact_id: int, user_id: int) -> bool:
        """Delete a contact."""
        db_contact = self.get_by_id(contact_id, user_id)
        if not db_contact:
            return False

        self.db.delete(db_contact)
        self.db.commit()
        return True
