"""Tests for app/compliance/router.py and engine."""

import pytest

pytestmark = pytest.mark.asyncio


DEMO_BID_DATA = {
    "extractedFields": {
        "gstin": "27ABCDE1234F1Z5",
        "udyam_number": "UDYAM-MH-18-0012345",
        "pan": "AAACT1234F",
        "pan_number": "AAACT1234F",
        "income_tax_pan": "AAACT1234F",
        "establishment_code": "EPFO-MH-44881",
        "esi_code": "ESIC-MH-77120",
        "dipp_number": "DIPP20123",
        "nsic_number": "NSIC-MH-12345",
        "oem_certificate": "OEM-CERT-2024-001",
        "local_content_percentage": 55.0,
    },
    "documents": [
        {"id": "d1", "category": "GST_CERTIFICATE"},
        {"id": "d2", "category": "UDYAM_REGISTRATION"},
        {"id": "d3", "category": "PAN_CARD"},
        {"id": "d4", "category": "MAKE_IN_INDIA"},
        {"id": "d5", "category": "OEM_AUTHORIZATION"},
    ],
    "tenderRequirements": {
        "min_local_content": 50,
        "mandatory_documents": [
            "GST_CERTIFICATE",
            "UDYAM_REGISTRATION",
            "PAN_CARD",
            "MAKE_IN_INDIA",
        ],
        "oem_required": True,
    },
    "verificationResults": {
        "gst": {
            "status": "VERIFIED",
            "confidence": 0.98,
            "data": {"status": "ACTIVE"},
        },
        "pan": {"status": "VERIFIED", "confidence": 0.99, "data": {"status": "ACTIVE"}},
        "udyam": {
            "status": "VERIFIED",
            "confidence": 0.97,
            "data": {"status": "ACTIVE"},
        },
        "income_tax": {
            "status": "VERIFIED",
            "confidence": 0.95,
            "data": {"tax_compliance": "COMPLIANT"},
        },
        "epfo": {"status": "VERIFIED", "confidence": 0.90, "data": {"compliance": "COMPLIANT"}},
        "esic": {"status": "VERIFIED", "confidence": 0.90, "data": {"compliance": "COMPLIANT"}},
        "startup": {"status": "VERIFIED", "confidence": 0.96, "data": {"status": "ACTIVE"}},
        "nsic": {"status": "VERIFIED", "confidence": 0.94, "data": {"status": "ACTIVE"}},
        "oem": {"status": "VERIFIED", "confidence": 0.93, "data": {"status": "VALID"}},
        "debarment": {"status": "VERIFIED", "confidence": 0.99, "data": {"debarred": False}},
    },
}


async def test_run_compliance_returns_score(client):
    """POST /api/compliance/run/{bid_id} returns a full compliance result."""
    response = await client.post(
        f"/api/compliance/run/BID-TEST001",
        json={"bid_id": "BID-TEST001", "bid_data": DEMO_BID_DATA},
    )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "risk_level" in data
    assert "passed_count" in data
    assert "failed_count" in data
    assert "rule_results" in data


async def test_run_compliance_without_data_returns_mock(client):
    """Omitting bid_data returns a deterministic mock result."""
    response = await client.get("/api/compliance/UNKNOWN-BID")
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 82
    assert data["risk_level"] == "MEDIUM"


async def test_get_compliance_summary(client):
    """GET /api/compliance/{bid_id}/summary returns score + risk_level + counts."""
    response = await client.get("/api/compliance/BID-SUMMARY01")
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "risk_level" in data
    assert "passed_count" in data
    assert "review_count" in data
    assert "failed_count" in data


async def test_get_failed_rules(client):
    """GET /api/compliance/{bid_id}/failed returns failed rules."""
    response = await client.get("/api/compliance/BID-FAIL01/failed")
    assert response.status_code == 200
    data = response.json()
    assert "failed_rules" in data
    assert isinstance(data["failed_rules"], list)


async def test_update_and_get_rule_weights(client):
    """PUT new weights; GET reflects them."""
    new_weights = {"GST": 20, "PAN": 15}
    put_resp = await client.put("/api/compliance/weights", json=new_weights)
    assert put_resp.status_code == 200
    assert put_resp.json()["success"] is True

    get_resp = await client.get("/api/compliance/weights")
    assert get_resp.status_code == 200
    weights = get_resp.json()["weights"]
    assert weights["GST"] == 20
    assert weights["PAN"] == 15
