"""
Pytest fixtures for the BidSheild backend test suite.

Each test gets a fresh in-memory SQLite database and a FastAPI test client
that speaks directly to the ASGI app (no HTTP round-trip).  All database
state is isolated to the test that created it and is destroyed when the test
finishes.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Make sure app modules pick up the same .env that ``uvicorn`` uses.
import os
from pathlib import Path
from dotenv import load_dotenv

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_ROOT / ".env", override=False)

# Must be imported before the app, otherwise the engine is already bound.
from app.database.session import Base
from app.core.security import create_token_pair


# ---------------------------------------------------------------------------
# Async engine scoped to the test session
# ---------------------------------------------------------------------------
_engine: AsyncEngine | None = None


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def async_engine() -> AsyncEngine:
    """In-memory SQLite engine shared by all tests in the session."""
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=False,
        )
    return _engine


@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh session for each test and roll back after."""
    # Create all tables for this test.
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    async with session_factory() as session:
        yield session
        await session.rollback()

    # Drop all tables after the test so the next test starts clean.
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# Replace the global engine / session factory in the session module so that
# all FastAPI Depends() calls inside the test use the in-memory engine.
# ---------------------------------------------------------------------------

import app.database.session as _session_module


@asynccontextmanager
async def _override_engine(new_engine: AsyncEngine):
    """Temporarily swap the module-level engine and session factory."""
    old_engine = _session_module.engine
    old_factory = _session_module.async_session_factory

    _session_module.engine = new_engine
    _session_module.async_session_factory = async_sessionmaker(
        new_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    try:
        yield
    finally:
        _session_module.engine = old_engine
        _session_module.async_session_factory = old_factory


# ---------------------------------------------------------------------------
# App client — uses the test engine so all routes hit the same SQLite DB.
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="function")
async def client(
    db_session: AsyncSession,
    async_engine: AsyncEngine,
) -> AsyncGenerator[AsyncClient, None]:
    """Async test client that speaks directly to the ASGI app."""
    from app.main import app

    async with _override_engine(async_engine):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

        # Make sure no background tasks leak between tests.
        await asyncio.sleep(0)


# ---------------------------------------------------------------------------
# Seeded test users
# ---------------------------------------------------------------------------

from app.models.auth import User as _User
from app.core.security import get_password_hash


@pytest_asyncio.fixture
async def seeded_user(db_session: AsyncSession) -> _User:
    """A confirmed-active bidder user committed to the session."""
    user = _User(
        email="bidder@test.example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Bidder",
        role="bidder",
        active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def officer_user(db_session: AsyncSession) -> _User:
    """A verification officer committed to the session."""
    user = _User(
        email="officer@test.example.com",
        hashed_password=get_password_hash("officerpass"),
        full_name="Test Officer",
        role="officer",
        active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> _User:
    """An admin user committed to the session."""
    user = _User(
        email="admin@test.example.com",
        hashed_password=get_password_hash("adminpass"),
        full_name="Test Admin",
        role="admin",
        active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Auth token helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def bidder_token(seeded_user: _User) -> str:
    """Short-lived access token for the seeded bidder."""
    return create_token_pair(str(seeded_user.id), "bidder", None).access_token


@pytest.fixture
def officer_token(officer_user: _User) -> str:
    return create_token_pair(str(officer_user.id), "officer", None).access_token


@pytest.fixture
def admin_token(admin_user: _User) -> str:
    return create_token_pair(str(admin_user.id), "admin", None).access_token


@pytest.fixture
def auth_headers(bidder_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {bidder_token}"}


@pytest.fixture
def officer_auth(officer_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {officer_token}"}


@pytest.fixture
def admin_auth(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}
