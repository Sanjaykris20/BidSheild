# backend/app/core/config.py
"""
Application configuration using Pydantic Settings.
Loads from .env file and environment variables.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "BidCompliance AI Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str | None = Field(default=None, description="PostgreSQL connection string")

    # Redis
    REDIS_URL: str | None = Field(default=None, description="Redis connection string")

    # Object Storage (Cloudflare R2 / S3 compatible)
    R2_ACCOUNT_ID: str | None = Field(default=None, description="Cloudflare R2 Account ID")
    R2_ACCESS_KEY_ID: str | None = Field(default=None, description="R2 Access Key ID")
    R2_SECRET_ACCESS_KEY: str | None = Field(default=None, description="R2 Secret Access Key")
    R2_BUCKET_NAME: str | None = Field(default=None, description="R2 Bucket name")
    R2_PUBLIC_URL: str | None = Field(default=None, description="R2 Public URL for direct access")

    # OCR Service (Azure Form Recognizer)
    AZURE_FORM_RECOGNIZER_ENDPOINT: str | None = Field(default=None, description="Azure Form Recognizer endpoint")
    AZURE_FORM_RECOGNIZER_KEY: str | None = Field(default=None, description="Azure Form Recognizer key")

    # LLM (Groq Cloud)
    GROQ_API_KEY: str | None = Field(default=None, description="Groq API key")
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # JWT Authentication
    JWT_SECRET: str | None = Field(default=None, description="JWT signing secret (base64 encoded)")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Python Backend
    PYTHON_HOST: str = "0.0.0.0"
    PYTHON_PORT: int = 8000

    # Node Backend
    NODE_HOST: str = "0.0.0.0"
    NODE_PORT: int = 3000

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        description="Allowed CORS origins (comma-separated in .env)",
    )

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Reference datasets used for cross-verification of extracted PDF fields.
    # Defaults to the ``datas/`` directory at the repository root.
    REFERENCE_DATA_DIR: str | None = Field(
        default=None,
        description="Directory containing reference CSVs (gst_mock.csv, udyam_mock_data.csv, makeindia_mock.csv, EPFO_ESIC_mock.csv) used for cross-verification.",
    )

    # File Upload
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_FILE_TYPES: list[str] = Field(
        default=["pdf", "png", "jpg", "jpeg", "tiff"],
        description="Allowed file extensions"
    )

    # Celery
    CELERY_BROKER_URL: str | None = Field(default=None, description="Celery broker URL (Redis)")
    CELERY_RESULT_BACKEND: str | None = Field(default=None, description="Celery result backend URL (Redis)")

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def database_url_async(self) -> str:
        """Convert sync DATABASE_URL to async for SQLAlchemy async engine."""
        if not self.DATABASE_URL:
            return ""
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()