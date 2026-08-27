"""Tests for app/documents/router.py (upload, list, get, submit, validate)."""

import io
from unittest.mock import AsyncMock, patch

import pytest

pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_upload_bytes(content: bytes, filename: str, *, folder: str = "documents"):
    """Return a deterministic fake upload result."""
    return {
        "key": f"{folder}/20260101/0000000000000000000000.ext",
        "url": f"http://localhost:9000/{folder}/20260101/0000000000000000000000.ext",
        "size": len(content),
        "file_name": filename,
        "content_type": "application/pdf",
        "bucket": "test-bucket",
    }


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

async def test_upload_requires_auth(client):
    """Uploading without a token returns 401."""
    response = await client.post(
        "/documents/upload",
        files={"file": ("test.pdf", b"dummy", "application/pdf")},
    )
    assert response.status_code == 401


async def test_upload_succeeds_and_stores_ai_extracted(
    client,
    auth_headers,
    seeded_user,
):
    """A PDF upload creates a Document row with ai_extracted and returns its id.

    We mock the R2 storage and the AI engine so this test is fully offline.
    """
    with patch("app.documents.router.storage") as mock_storage, \
         patch("httpx.AsyncClient") as mock_http_cls:

        mock_storage.upload_bytes = _mock_upload_bytes

        # Mock AI engine returns a fallback extraction.
        mock_response = AsyncMock()
        mock_response.status_code = 500  # trigger fallback path
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_http_cls.return_value = mock_client

        response = await client.post(
            "/documents/upload",
            files={"file": ("GST_Certificate.pdf", b"dummy pdf content", "application/pdf")},
            data={"tender_id": "GEM/2026/B/1024", "document_type": "GST_CERTIFICATE"},
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["file_name"] == "GST_Certificate.pdf"
    # ai_extracted is a fallback dict, never None.
    assert data["ai_extracted"] is not None
    assert "confidence" in data["ai_extracted"]


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

async def test_list_requires_auth(client):
    response = await client.get("/documents")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Get
# ---------------------------------------------------------------------------

async def test_get_document_returns_404_for_unknown(
    client,
    auth_headers,
):
    response = await client.get(
        "/documents/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Submit
# ---------------------------------------------------------------------------

async def test_submit_sets_submitted_to_officer_flag(
    client,
    auth_headers,
    seeded_user,
):
    """Submitting a document sets submitted_to_officer=True and records submitted_at."""
    with patch("app.documents.router.storage") as mock_storage, \
         patch("httpx.AsyncClient"):

        mock_storage.upload_bytes = _mock_upload_bytes

        # Upload first.
        upload_resp = await client.post(
            "/documents/upload",
            files={"file": ("doc.pdf", b"content", "application/pdf")},
            headers=auth_headers,
        )
        doc_id = upload_resp.json()["id"]

        # Submit.
        submit_resp = await client.post(
            f"/documents/{doc_id}/submit",
            headers=auth_headers,
        )

    assert submit_resp.status_code == 200
    data = submit_resp.json()
    assert "submitted_at" in data
    assert data["document_id"] == doc_id


# ---------------------------------------------------------------------------
# Validate — None-guard on ai_extracted
# ---------------------------------------------------------------------------

async def test_validate_works_when_ai_extracted_is_none(
    client,
    auth_headers,
    seeded_user,
):
    """validate_document must not crash when ai_extracted is None.

    This was the original bug: the code called doc.ai_extracted.get(...)
    without guarding against None.  The fix adds safe_extracted().
    """
    with patch("app.documents.router.storage") as mock_storage, \
         patch("httpx.AsyncClient") as mock_http_cls:

        mock_storage.upload_bytes = _mock_upload_bytes

        # Simulate the AI engine failing so ai_extracted stays None.
        mock_response = AsyncMock()
        mock_response.status_code = 500
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_http_cls.return_value = mock_client

        # Upload with a content type that triggers the exception path.
        upload_resp = await client.post(
            "/documents/upload",
            files={"file": ("anything.pdf", b"x", "application/pdf")},
            headers=auth_headers,
        )
        doc_id = upload_resp.json()["id"]

    # Manually set ai_extracted to None to simulate a legacy row.
    from app.models.documents import Document
    from sqlalchemy import update
    from app.database.session import async_session_factory

    async with async_session_factory() as session:
        await session.execute(
            update(Document)
            .where(Document.id == doc_id)
            .values(ai_extracted=None)
        )
        await session.commit()

    # validate_document must not raise AttributeError.
    with patch("httpx.AsyncClient") as mock_http_cls:
        mock_response = AsyncMock()
        mock_response.status_code = 500
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_http_cls.return_value = mock_client

        validate_resp = await client.post(
            f"/documents/{doc_id}/validate",
            data={"required_type": "GST_CERTIFICATE"},
            headers=auth_headers,
        )

    assert validate_resp.status_code == 200
    data = validate_resp.json()
    assert "ai_validation" in data
