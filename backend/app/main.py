"""BidSheild Python backend entry point.

Exposes a single ``app`` ASGI object. Routers are registered at the end of the
module so each module can be imported and used in isolation (e.g. by the
pytest suite).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.database.session import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise and tear down the database connection pool."""
    await init_db()
    try:
        yield
    finally:
        await close_db()


# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME or "BidSheild Compliance & Verification Engine",
    version=settings.APP_VERSION or "1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "BidSheild Verification API is running",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
async def healthcheck():
    """Lightweight liveness + DB connectivity probe.

    The Node gateway uses this to decide whether the python backend is up.
    We keep the DB check cheap (``SELECT 1``) so a slow query never blocks
    healthchecks.
    """
    db_status = "connected"
    try:
        from app.database.session import engine

        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - we want to surface the message
        db_status = f"error: {exc!s}"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": db_status,
    }


from app.compliance.router import router as compliance_router
from app.evidence.router import router as evidence_router
from app.risk.router import router as risk_router
from app.verification.router import router as verification_router
from app.tenders.router import router as tenders_router
from app.auth.router import router as auth_router
from app.documents.router import router as documents_router
from app.reviews.router import router as reviews_router

app.include_router(verification_router)
app.include_router(compliance_router)
app.include_router(risk_router)
app.include_router(evidence_router)
app.include_router(tenders_router)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(reviews_router)
