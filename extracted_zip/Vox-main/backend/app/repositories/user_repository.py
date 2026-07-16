"""User repository."""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserCreate


class UserRepository:
    """Repository for User operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_in: UserCreate) -> User:
        """Create a new user."""
        db_user = User(email=user_in.email, name=user_in.name, picture=user_in.picture)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user: User, **kwargs) -> User:
        """Update a user."""
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)
        return user
