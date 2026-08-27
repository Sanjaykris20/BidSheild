"""Tests for app/tenders/router.py (tender listing, creation, bid submission)."""

import pytest

pytestmark = pytest.mark.asyncio


async def test_list_tenders_includes_demo_tenders(client):
    """GET /tenders returns the demo seed tenders."""
    response = await client.get("/tenders")
    assert response.status_code == 200
    data = response.json()
    assert "tenders" in data
    assert data["total"] >= 2
    assert any("GEM/" in t["id"] for t in data["tenders"])


async def test_list_tenders_filter_by_status(client):
    """Filtering by status=OPEN returns only open tenders."""
    response = await client.get("/tenders?status=OPEN")
    assert response.status_code == 200
    tenders = response.json()["tenders"]
    for t in tenders:
        assert t["status"] == "OPEN"


async def test_list_tenders_filter_by_search(client):
    """Searching by title returns matching tenders only."""
    response = await client.get("/tenders?search=Data%20Center")
    assert response.status_code == 200
    tenders = response.json()["tenders"]
    for t in tenders:
        assert "data center" in t["title"].lower()


async def test_create_tender_returns_id_and_status_open(client):
    """POST /tenders creates a new tender with status OPEN."""
    response = await client.post(
        "/tenders",
        json={
            "title": "Test Tender",
            "organization": "Test Org",
            "category": "IT Services",
            "estimated_value": 100000.0,
            "currency": "INR",
            "closing_date": "2026-12-31T23:59:59Z",
            "requirements": {
                "min_local_content": 50,
                "mandatory_documents": ["GST_CERTIFICATE", "PAN_CARD"],
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"].startswith("GEM/")
    assert data["status"] == "OPEN"
    assert data["title"] == "Test Tender"


async def test_get_tender_returns_full_record(client):
    """GET /tenders/{tender_id} returns the tender."""
    response = await client.get("/tenders/GEM/2026/B/1024")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "GEM/2026/B/1024"
    assert "requirements" in data


async def test_get_tender_404_for_unknown(client):
    response = await client.get("/tenders/UNKNOWN-ID")
    assert response.status_code == 404


async def test_submit_bid_returns_bid_with_status(client):
    """POST /tenders/{tender_id}/bids creates a new bid in SUBMITTED state."""
    response = await client.post(
        "/tenders/GEM/2026/B/1024/bids",
        json={
            "tender_id": "GEM/2026/B/1024",
            "bidder_name": "Test Bidder Inc",
            "bidder_id": "BIDDER-001",
            "extracted_fields": {"gstin": "27ABCDE1234F1Z5"},
            "documents": [
                {"id": "d1", "category": "GST_CERTIFICATE"},
            ],
            "tender_requirements": {
                "min_local_content": 50,
                "mandatory_documents": ["GST_CERTIFICATE"],
            },
            "context": {"tender_id": "GEM/2026/B/1024"},
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUBMITTED"
    assert data["tender_id"] == "GEM/2026/B/1024"
    assert "id" in data


async def test_submit_bid_to_unknown_tender_returns_404(client):
    response = await client.post(
        "/tenders/UNKNOWN-TENDER/bids",
        json={
            "tender_id": "UNKNOWN-TENDER",
            "bidder_name": "Test",
            "bidder_id": "B1",
            "extracted_fields": {},
            "documents": [],
            "tender_requirements": {},
            "context": {},
        },
    )
    assert response.status_code == 404


async def test_get_bids_for_tender(client):
    """GET /tenders/{tender_id}/bids returns the bids for that tender."""
    # Submit one first.
    await client.post(
        "/tenders/GEM/2026/C/8812/bids",
        json={
            "tender_id": "GEM/2026/C/8812",
            "bidder_name": "B",
            "bidder_id": "B",
            "extracted_fields": {},
            "documents": [],
            "tender_requirements": {},
            "context": {},
        },
    )

    response = await client.get("/tenders/GEM/2026/C/8812/bids")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(b["tender_id"] == "GEM/2026/C/8812" for b in data["bids"])


async def test_dashboard_stats_for_bidder(client):
    response = await client.get("/tenders/dashboard/stats?role=bidder")
    assert response.status_code == 200
    data = response.json()
    assert "active_bids" in data
    assert "total_bids" in data


async def test_dashboard_stats_for_officer(client):
    response = await client.get("/tenders/dashboard/stats?role=officer")
    assert response.status_code == 200
    data = response.json()
    assert "live_tenders" in data
    assert "total_bids_received" in data


async def test_dashboard_stats_for_admin(client):
    response = await client.get("/tenders/dashboard/stats?role=admin")
    assert response.status_code == 200
    data = response.json()
    assert "total_tenders" in data


async def test_update_bid_status_uses_valid_status(client):
    """PUT /tenders/bids/{bid_id}/status updates the bid status."""
    # Submit a bid first.
    submit = await client.post(
        "/tenders/GEM/2026/B/1024/bids",
        json={
            "tender_id": "GEM/2026/B/1024",
            "bidder_name": "B",
            "bidder_id": "B",
            "extracted_fields": {},
            "documents": [],
            "tender_requirements": {},
            "context": {},
        },
    )
    bid_id = submit.json()["id"]

    response = await client.put(
        f"/tenders/bids/{bid_id}/status",
        json={"status": "UNDER_EVALUATION", "remarks": "AI check running"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UNDER_EVALUATION"
    assert data["remarks"] == "AI check running"


async def test_update_bid_status_rejects_invalid(client):
    response = await client.put(
        "/tenders/bids/UNKNOWN-BID/status",
        json={"status": "APPROVED", "remarks": ""},
    )
    # Bid doesn't exist -> 404.
    assert response.status_code == 404
