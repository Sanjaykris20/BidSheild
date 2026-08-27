"""Tests for app/risk/router.py and engine."""

import pytest

pytestmark = pytest.mark.asyncio


COMPLIANCE_RESULT = {
    "score": 82,
    "risk_level": "MEDIUM",
    "passed_count": 10,
    "review_count": 1,
    "failed_count": 1,
    "rule_results": [
        {
            "rule_id": "REQ-GST-01",
            "source": "GST",
            "severity": "HIGH",
            "weight": 10,
            "result": "PASS",
        },
        {
            "rule_id": "REQ-LC-01",
            "source": "LOCAL_CONTENT",
            "severity": "HIGH",
            "weight": 15,
            "result": "FAIL",
        },
    ],
    "risk_drivers": [{"factor": "Tender Compliance", "severity": "HIGH"}],
}


async def test_calculate_risk_returns_risk_level(client):
    """POST /api/risk/calculate/{bid_id} returns a risk result."""
    response = await client.post(
        "/api/risk/calculate/BID-RISK01",
        json={"bid_id": "BID-RISK01", "compliance_result": COMPLIANCE_RESULT},
    )
    assert response.status_code == 200
    data = response.json()
    assert "risk_level" in data
    assert "risk_score" in data
    assert "risk_drivers" in data
    assert "compliance_score" in data


async def test_get_risk_without_compliance_result_returns_mock(client):
    """Omitting compliance_result returns a deterministic mock."""
    response = await client.get("/api/risk/UNKNOWN-BID")
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "MEDIUM"
    assert "risk_score" in data


async def test_update_and_get_thresholds(client):
    """PUT new thresholds; GET reflects them."""
    new_thresholds = {"LOW": 85, "MEDIUM": 65}
    put_resp = await client.put("/api/risk/thresholds", json=new_thresholds)
    assert put_resp.status_code == 200
    assert put_resp.json()["success"] is True

    get_resp = await client.get("/api/risk/thresholds")
    assert get_resp.status_code == 200
    thresholds = get_resp.json()["thresholds"]
    assert thresholds["LOW"] == 85
    assert thresholds["MEDIUM"] == 65


async def test_update_and_get_factor_weights(client):
    """PUT new factor weights; GET reflects them."""
    new_weights = {"Statutory Compliance": 1.5, "Financial Eligibility": 1.0}
    put_resp = await client.put("/api/risk/factor-weights", json=new_weights)
    assert put_resp.status_code == 200
    assert put_resp.json()["success"] is True

    get_resp = await client.get("/api/risk/factor-weights")
    assert get_resp.status_code == 200
    weights = get_resp.json()["weights"]
    assert weights["Statutory Compliance"] == 1.5
    assert weights["Financial Eligibility"] == 1.0
