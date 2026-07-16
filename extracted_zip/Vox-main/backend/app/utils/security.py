"""Security utilities for encryption and hashing."""

import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.config import get_settings


def _get_fernet() -> Fernet:
    """Get Fernet instance using the application secret key."""
    settings = get_settings()
    # If explicit encryption key is provided, use it
    if settings.ENCRYPTION_KEY:
        # Pad or truncate to ensure 32 url-safe base64 bytes
        key = settings.ENCRYPTION_KEY.encode()[:32].ljust(32, b"0")
        fernet_key = base64.urlsafe_b64encode(key)
        return Fernet(fernet_key)

    # Fallback to deriving a key from the app's secret key
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"vox_salt",  # Fixed salt for deterministic key derivation
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
    return Fernet(key)


def encrypt_token(token: str) -> str:
    """Encrypt an OAuth token for storage in the database."""
    if not token:
        return token
    f = _get_fernet()
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt an OAuth token retrieved from the database."""
    if not encrypted_token:
        return encrypted_token
    f = _get_fernet()
    return f.decrypt(encrypted_token.encode()).decode()


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    settings = get_settings()
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
