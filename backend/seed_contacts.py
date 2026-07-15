"""Script to seed dummy contacts for testing."""

import asyncio
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.contact import Contact, ContactEmail

def seed_db():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check for existing user, create a dummy one if none exists
        user = db.execute(select(User).limit(1)).scalar_one_or_none()
        if not user:
            print("Creating dummy user...")
            user = User(
                email="test@example.com",
                name="Test User",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user with ID: {user.id}")
        else:
            print(f"Using existing user with ID: {user.id}")
            
        # Seed Contacts
        contacts = [
            {"name": "Surya", "email": "surya@example.com", "is_primary": True},
            {"name": "Surya Sharma", "email": "surya.sharma@example.com", "is_primary": True}, # For testing ambiguity
            {"name": "Jared", "email": "jared@example.com", "is_primary": True},
            {"name": "Alex", "email": "alex@example.com", "is_primary": True},
        ]
        
        for c in contacts:
            # Check if contact exists
            existing = db.execute(
                select(Contact).where(Contact.user_id == user.id, Contact.name == c["name"])
            ).scalar_one_or_none()
            
            if not existing:
                print(f"Adding contact: {c['name']}")
                contact = Contact(
                    user_id=user.id,
                    name=c["name"],
                )
                db.add(contact)
                db.commit()
                db.refresh(contact)
                
                email = ContactEmail(
                    contact_id=contact.id,
                    email=c["email"],
                    is_primary=c["is_primary"],
                )
                db.add(email)
                db.commit()
            else:
                print(f"Contact {c['name']} already exists.")
                
        print("Seeding complete.")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
