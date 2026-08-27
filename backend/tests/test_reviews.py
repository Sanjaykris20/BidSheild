"""Tests for app/reviews/router.py (officer review flow)."""

from unittest.mock import patch

import pytest

pytestmark = pytest.mark.asyncio


async def _create_and_submit_document(client, auth_headers) -> str:
    """Helper: create a document, then submit it for review."""
    from app.documents.router import _mock_upload_bytes_for_test  # noqa: F401

    def _upload_bytes(content, filename, folder="documents"):
        return {
            "key": f"{folder}/20260101/abc123.pdf",
            "url": f"http://localhost:9000/{folder}/20260101/abc123.pdf",
            "size": len(content),
            "file_name": filename,
            "content_type": "application/pdf",
            "bucket": "test-bucket",
        }

    with patch("app.documents.router.storage") as mock_storage, \
         patch("httpx.AsyncClient"):

        mock_storage.upload_bytes = _upload_bytes
        upload_resp = await client.post(
            "/documents/upload",
            files={"file": ("Doc.pdf", b"content", "application/pdf")},
            headers=auth_headers,
        )
        doc_id = upload_resp.json()["id"]

        submit_resp = await client.post(
            f"/documents/{doc_id}/submit",
            headers=auth_headers,
        )
    assert submit_resp.status_code == 200
    return doc_id


async def test_pending_reviews_requires_officer(client, auth_headers):
    """A bidder is forbidden from listing pending reviews."""
    doc_id = await _create_and_submit_document(client, auth_headers)

    response = await client.get("/reviews/pending", headers=auth_headers)
    assert response.status_code == 403


async def test_pending_reviews_lists_submitted_documents(
    client,
    auth_headers,
    officer_auth,
    seeded_user,
):
    """Officer sees submitted documents in /reviews/pending."""
    doc_id = await _create_and_submit_document(client, auth_headers)

    response = await client.get("/reviews/pending", headers=officer_auth)
    assert response.status_code == 200
    data = response.json()
    assert "pending_reviews" in data
    assert data["count"] >= 1
    assert any(r["document_id"] == doc_id for r in data["pending_reviews"])


async def test_get_review_for_unknown_doc_returns_pending(
    client,
    officer_auth,
):
    """An unreviewed doc has no review yet, so the route returns 'pending'."""
    response = await client.get(
        "/reviews/00000000-0000-0000-0000-000000000000",
        headers=officer_auth,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"


async def test_submit_review_creates_record(
    client,
    auth_headers,
    officer_auth,
    seeded_user,
):
    """Officer submits a review and it is stored."""
    doc_id = await _create_and_submit_document(client, auth_headers)

    response = await client.post(
        f"/reviews/{doc_id}",
        json={
            "document_id": doc_id,
            "status": "approved",
            "comments": "Looks good.",
        },
        headers=officer_auth,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"
    assert data["comments"] == "Looks good."

    # Get it back.
    get_resp = await client.get(f"/reviews/{doc_id}", headers=officer_auth)
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "approved"


async def test_assigned_reviews_lists_for_officer(
    client,
    auth_headers,
    officer_auth,
    officer_user,
):
    """Officer's assigned reviews show up in /reviews/assigned."""
    doc_id = await _create_and_submit_document(client, auth_headers)

    await client.post(
        f"/reviews/{doc_id}",
        json={"document_id": doc_id, "status": "rejected", "comments": "Missing sig"},
        headers=officer_auth,
    )

    response = await client.get("/reviews/assigned", headers=officer_auth)
    assert response.status_code == 200
    reviews = response.json()
    assert any(r["document_id"] == doc_id for r in reviews)
    assert any(r["status"] == "rejected" for r in reviews)
