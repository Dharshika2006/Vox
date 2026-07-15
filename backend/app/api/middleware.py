"""FastAPI Middleware."""

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request duration and details."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time

        # Don't log health checks as INFO to avoid noise
        log_level = (
            logging.DEBUG if request.url.path.endswith("/health") else logging.INFO
        )

        logger.log(
            log_level,
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {process_time:.4f}s",
        )

        response.headers["X-Process-Time"] = str(process_time)
        return response
