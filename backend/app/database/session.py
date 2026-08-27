# backend/app/database/session.py
"""
Database session management using SQLAlchemy async.

For development / prototype runs the app falls back to SQLite (aiosqlite).
For production set ``DATABASE_URL`` to a PostgreSQL connection string, e.g.

    postgresql+asyncpg://user:pass@host/dbname?sslmode=require

The engine is created at import time, which means a malformed DATABASE_URL
will raise immediately when this module is first imported.  The error message
is deliberately explicit so the cause is obvious without digging into tracebacks.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all ORM models."""


def _build_async_url(url: str) -> str:
    """Convert a synchronous driver prefix to its async equivalent."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
    return url


_raw_url = settings.DATABASE_URL
if not _raw_url:
    # No URL configured — fall back to an in-process SQLite database.
    # This makes the module import-safe for test environments where no .env
    # is loaded, and also works out-of-the-box for local dev without setup.
    _raw_url = "sqlite+aiosqlite:///./bidcompliance.db"

_async_url = _build_async_url(_raw_url)

# Detect the driver to log useful information.
_is_sqlite = "sqlite" in _async_url
_driver_note = (
    " (SQLite — not suitable for production)"
    if _is_sqlite
    else " (PostgreSQL via asyncpg)"
)

try:
    _engine_kwargs: dict = {"echo": settings.DEBUG, "pool_pre_ping": True}
    if not _is_sqlite:
        # SQLite uses a single connection per thread — pool sizing is not
        # supported.  Apply pooling only for PostgreSQL.
        _engine_kwargs["pool_size"] = 5
        _engine_kwargs["max_overflow"] = 10
    engine: AsyncEngine = create_async_engine(_async_url, **_engine_kwargs)
except Exception as exc:
    raise RuntimeError(
        f"Failed to create async engine for DATABASE_URL={_raw_url!r}. "
        f"Original error: {exc!s}\n"
        "Hint: for SQLite use sqlite+aiosqlite:///./db.sqlite — "
        "for PostgreSQL use postgresql+asyncpg://user:pass@host/db."
    ) from exc

print(f"[db] Using{_driver_note}  url={_async_url[: _async_url.index('@') + 1 if '@' in _async_url else len(_async_url) - 10]}***")  # noqa: T201

# Create async session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for database session (non-FastAPI use)."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables. Safe to call multiple times (idempotent)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()
