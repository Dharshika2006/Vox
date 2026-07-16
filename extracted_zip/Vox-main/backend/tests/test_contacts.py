import pytest
from app.schemas.contact import ContactCreate
from app.repositories.contact_repository import ContactRepository

def test_fuzzy_contact_resolution(db_session, test_user):
    """Test that rapidfuzz correctly matches phonetic variations of names."""
    repo = ContactRepository(db_session)
    
    # Create a contact named Surya
    contact_data = ContactCreate(
        name="Surya",
        nickname="Soorya",
        emails=[{"email": "surya@example.com", "is_primary": True}],
        is_favorite=True
    )
    repo.create(test_user.id, contact_data)
    
    # Create a distractor contact
    distractor_data = ContactCreate(
        name="John Doe",
        emails=[{"email": "john@example.com", "is_primary": True}],
    )
    repo.create(test_user.id, distractor_data)
    
    # Search with a misspelling "Soorya"
    results, count = repo.get_user_contacts(test_user.id, search="Soorya")
    assert count == 1
    assert results[0].name == "Surya"
    
    # Search with a typo "Sury"
    results, count = repo.get_user_contacts(test_user.id, search="Sury")
    assert count == 1
    assert results[0].name == "Surya"
    
    # Search with something completely different
    results, count = repo.get_user_contacts(test_user.id, search="Michael")
    assert count == 0
