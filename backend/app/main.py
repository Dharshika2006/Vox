"""Main FastAPI application module."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import engine, Base
from app.api.v1.router import api_router
from app.api.middleware import RequestLoggingMiddleware
from app.utils.logging import setup_logging
from app.exceptions import VoxException

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the FastAPI application."""
    # Startup
    setup_logging()
    logger.info("Starting Vox backend service...")

    # Create database tables (in a real production app, use Alembic migrations instead)
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized.")

    yield

    # Shutdown
    logger.info("Shutting down Vox backend service...")
    engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # Exception Handlers
    @app.exception_handler(VoxException)
    async def vox_exception_handler(request: Request, exc: VoxException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500, content={"detail": "An unexpected error occurred."}
        )

    # Routers
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
