"""Logging configuration for Vox application."""

import logging
import sys

from app.config import get_settings


def setup_logging() -> None:
    """Configure application-wide logging."""
    settings = get_settings()

    # Define log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Reduce noise from third-party libraries
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO else logging.WARNING
    )
