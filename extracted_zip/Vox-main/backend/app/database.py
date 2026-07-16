"""Database configuration and session management."""

from collections.abc import Generator

from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

from app.config import get_settings

settings = get_settings()

# Engine configuration
engine_kwargs: dict[str, Any] = {
    "echo": settings.DB_ECHO,
}

if settings.is_sqlite:
    # SQLite-specific configuration
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL-specific configuration
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_timeout"] = settings.DB_POOL_TIMEOUT

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting a database session.

    Yields:
        Session: SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
