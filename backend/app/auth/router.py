"""Auth router: register, login, refresh, logout, profile."""

from datetime import datetime, timezone, timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_token_pair,
    decode_token,
    verify_password,
    get_password_hash,
    blacklist_token,
    is_token_blacklisted,
)
from app.database.session import get_db
from app.models.auth import User, Session

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    role: str = "bidder"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    role: str
    active: bool
    created_at: str

    class Config:
        from_attributes = True


@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name,
        role=request.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role, "message": "Registered"}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    if not user or not user.active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    pair = create_token_pair(str(user.id), user.role, user.org_id)
    session = Session(
        user_id=str(user.id),
        jti=str(uuid.uuid4()),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    await db.commit()
    return TokenResponse(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
        expires_in=pair.expires_in,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    # Expected usage: body or header; here using simple form/body param for demo
    try:
        payload = decode_token(request.refresh_token)
        if payload.type != "refresh":
            raise HTTPException(status_code=401, detail="Not a refresh token")
        if is_token_blacklisted(payload.jti):
            raise HTTPException(status_code=401, detail="Token revoked")
        user_res = await db.execute(select(User).where(User.id == payload.sub))
        user = user_res.scalars().first()
        if not user or not user.active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        pair = create_token_pair(str(user.id), user.role, user.org_id)
        # Blacklist old refresh token
        blacklist_token(payload.jti, payload.exp)
        # Create new session
        new_session = Session(
            user_id=str(user.id),
            jti=str(uuid.uuid4()),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(new_session)
        await db.commit()
        return TokenResponse(
            access_token=pair.access_token,
            refresh_token=pair.refresh_token,
            expires_in=pair.expires_in,
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc


@router.post("/logout")
async def logout(
    request: LogoutRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_token(request.refresh_token)
        blacklist_token(payload.jti, payload.exp)
        await db.execute(delete(Session).where(Session.user_id == payload.sub))
        await db.commit()
        return {"message": "Logged out"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")


@router.get("/me", response_model=UserProfile)
async def me(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's profile.

    Note: ``Header(...)`` is required so FastAPI actually pulls the value from
    the request. The previous signature used a plain ``str`` parameter which
    FastAPI never bound, so the endpoint always 401'd.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.replace("Bearer ", "", 1)
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.type != "access":
        raise HTTPException(status_code=401, detail="Not an access token")
    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalars().first()
    if not user or not user.active:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        active=user.active,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


@router.get("/users")
async def list_users(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    token = authorization.replace("Bearer ", "", 1) if authorization and authorization.startswith("Bearer ") else ""
    payload = None
    if token:
        try:
            payload = decode_token(token)
        except Exception:
            payload = None
    if not payload or payload.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    results = await db.execute(select(User))
    users = results.scalars().all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "active": u.active,
            "created_at": u.created_at.isoformat() if u.created_at else "",
        }
        for u in users
    ]
