# backend/app/core/security.py
"""
Security utilities: JWT token handling, password hashing, token blacklist.
"""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenPayload(BaseModel):
    """JWT token payload structure."""
    sub: str  # user_id
    role: str  # BIDDER, CLIENT, ADMIN
    org_id: str | None = None
    exp: int  # expiration timestamp
    iat: int  # issued at timestamp
    jti: str  # JWT ID for revocation
    type: str  # "access" or "refresh"


class TokenPair(BaseModel):
    """Access + Refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # access token expiry in seconds


def create_access_token(
    user_id: str,
    role: str,
    org_id: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a short-lived access token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "org_id": org_id,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": str(uuid4()),
        "type": "access",
    }
    secret = settings.JWT_SECRET or "dev-secret-change-in-production"
    return jwt.encode(payload, secret, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    user_id: str,
    role: str,
    org_id: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a long-lived refresh token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "org_id": org_id,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": str(uuid4()),
        "type": "refresh",
    }
    secret = settings.JWT_SECRET or "dev-secret-change-in-production"
    return jwt.encode(payload, secret, algorithm=settings.JWT_ALGORITHM)


def create_token_pair(
    user_id: str,
    role: str,
    org_id: str | None = None,
) -> TokenPair:
    """Create both access and refresh tokens."""
    access_token = create_access_token(user_id, role, org_id)
    refresh_token = create_refresh_token(user_id, role, org_id)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def decode_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT token.
    Raises JWTError if invalid or expired.
    """
    try:
        secret = settings.JWT_SECRET or "dev-secret-change-in-production"
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return TokenPayload(**payload)
    except JWTError as e:
        raise JWTError(f"Invalid token: {e!s}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    # bcrypt only inspects the first 72 bytes; longer passwords are silently
    # truncated by passlib. We truncate here so the round-trip via
    # ``verify_password`` stays consistent with ``get_password_hash``.
    return pwd_context.verify(plain_password[:72], hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt.

    bcrypt only uses the first 72 bytes of the input; any extra bytes are
    silently ignored.  We truncate explicitly so the call site does not have
    to remember this.
    """
    return pwd_context.hash(password[:72])


# In-memory token blacklist (use Redis in production)
# Format: {jti: expiry_timestamp}
_token_blacklist: dict[str, int] = {}


def blacklist_token(jti: str, expires_at: int) -> None:
    """Add a token JTI to the blacklist."""
    _token_blacklist[jti] = expires_at


def is_token_blacklisted(jti: str) -> bool:
    """Check if a token is blacklisted."""
    if jti not in _token_blacklist:
        return False
    # Clean up expired entries
    now = int(datetime.now(timezone.utc).timestamp())
    if _token_blacklist[jti] < now:
        del _token_blacklist[jti]
        return False
    return True


def cleanup_blacklist() -> None:
    """Remove expired entries from blacklist."""
    now = int(datetime.now(timezone.utc).timestamp())
    global _token_blacklist
    _token_blacklist = {k: v for k, v in _token_blacklist.items() if v > now}


def get_token_expiry(token: str) -> int | None:
    """Get token expiry timestamp without full validation."""
    try:
        payload = jwt.get_unverified_claims(token)
        return payload.get("exp")
    except JWTError:
        return None