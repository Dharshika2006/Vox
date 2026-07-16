"""Rate Limiting Middleware."""

import time
from collections import defaultdict
from threading import Lock

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware."""

    def __init__(self, app):
        super().__init__(app)
        settings = get_settings()
        self.requests_limit = settings.RATE_LIMIT_REQUESTS
        self.window_seconds = settings.RATE_LIMIT_WINDOW_SECONDS
        
        # client_ip -> list of timestamps
        self.clients = defaultdict(list)
        self.lock = Lock()
        self.last_cleanup = time.time()

    async def dispatch(self, request: Request, call_next):
        """Process request and check rate limit."""
        client_ip = request.client.host if request.client else "unknown"
        
        # Don't rate limit options requests or localhost in debug
        if request.method == "OPTIONS":
            return await call_next(request)

        now = time.time()
        
        with self.lock:
            # Periodic cleanup of all clients to prevent memory leak
            if now - self.last_cleanup > 60:
                keys_to_delete = []
                for ip, timestamps in self.clients.items():
                    valid = [t for t in timestamps if now - t < self.window_seconds]
                    if not valid:
                        keys_to_delete.append(ip)
                    else:
                        self.clients[ip] = valid
                for ip in keys_to_delete:
                    del self.clients[ip]
                self.last_cleanup = now

            # Clean up old requests outside the window for current IP
            timestamps = self.clients[client_ip]
            valid_timestamps = [t for t in timestamps if now - t < self.window_seconds]
            
            if len(valid_timestamps) >= self.requests_limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too Many Requests"}
                )
                
            valid_timestamps.append(now)
            self.clients[client_ip] = valid_timestamps

        return await call_next(request)
