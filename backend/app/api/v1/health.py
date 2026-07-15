"""Health check endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter()


@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Basic health check endpoint."""
    status = {"status": "ok", "database": "unknown"}

    try:
        # Simple query to check DB connection
        db.execute(text("SELECT 1"))
        status["database"] = "ok"
    except Exception:
        status["database"] = "error"
        status["status"] = "degraded"

    return status
