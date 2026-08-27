"""Tests for app/evidence/router.py (evidence search, override, sign/verify)."""

import pytest

pytestmark = pytest.mark.asyncio


def _create_rule_results() -> list[dict]:
    """Rule results that produce evidence rows when run through the engine."""
    return [
        {
            "rule_id": "REQ-GST-01",
            "evidence_ref": "DOC-GST",
            "source": "GST",
            "severity": "HIGH",
            "weight": 10,
            "result": "PASS",
            "expected": "VERIFIED",
            "actual": "VERIFIED",
            "confidence": 0.98,
            "details": {"source_page": 1},
        },
        {
            "rule_id": "REQ-PAN-01",
            "evidence_ref": "DOC-PAN",
            "source": "PAN",
            "severity": "HIGH",
            "weight": 10,
            "result": "FAIL",
            "expected": "VERIFIED",
            "actual": "NOT_FOUND",
            "confidence": 0.1,
            "details": {"source_page": 2},
        },
    ]


async def test_get_evidence_for_unknown_returns_404(client):
    response = await client.get("/api/evidence/EVD-DOES-NOT-EXIST")
    assert response.status_code == 404


async def test_get_evidence_for_bid_after_compliance(client):
    """Running compliance populates evidence; we can then read it back."""
    from app.evidence.engine import evidence_engine

    evidence_engine.clear()
    evidence_engine.create_evidence_from_rules(
        rule_results=_create_rule_results(),
        verifications={},
        extracted_fields={},
        documents=[],
    )
    # Bind each evidence to a bid so search by bid works.
    for ev in evidence_engine.evidence_store.values():
        ev.details["bid_id"] = "BID-TEST-001"

    response = await client.get("/api/bids/BID-TEST-001/evidence")
    assert response.status_code == 200
    data = response.json()
    assert data["bid_id"] == "BID-TEST-001"
    assert data["total"] >= 2


async def test_get_evidence_summary(client):
    """GET /api/bids/{bid_id}/evidence/summary returns by_result and by_source."""
    from app.evidence.engine import evidence_engine

    evidence_engine.clear()
    evidence_engine.create_evidence_from_rules(
        rule_results=_create_rule_results(),
        verifications={},
        extracted_fields={},
        documents=[],
    )
    for ev in evidence_engine.evidence_store.values():
        ev.details["bid_id"] = "BID-SUMMARY-001"

    response = await client.get("/api/bids/BID-SUMMARY-001/evidence/summary")
    assert response.status_code == 200
    data = response.json()
    assert "by_result" in data
    assert "by_source" in data


async def test_export_evidence_for_audit(client):
    """GET /api/bids/{bid_id}/evidence/export returns an export envelope."""
    from app.evidence.engine import evidence_engine

    evidence_engine.clear()
    evidence_engine.create_evidence_from_rules(
        rule_results=_create_rule_results(),
        verifications={},
        extracted_fields={},
        documents=[],
    )
    for ev in evidence_engine.evidence_store.values():
        ev.details["bid_id"] = "BID-EXPORT-001"

    response = await client.get("/api/bids/BID-EXPORT-001/evidence/export")
    assert response.status_code == 200
    data = response.json()
    assert data["bid_id"] == "BID-EXPORT-001"
    assert "exported_at" in data
    assert "records" in data
    assert data["total_records"] >= 2


async def test_add_override_evidence(client):
    """POST /api/evidence/override stores a manual override record."""
    response = await client.post(
        "/api/evidence/override",
        json={
            "officer_id": "OFF-1",
            "original_result": "FAIL",
            "new_result": "PASS",
            "reason": "Verified manually",
            "requirement_id": "REQ-GST-01",
            "rule_id": "REQ-GST-01",
            "bid_id": "BID-OVERRIDE-001",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["evidence"]["verification_source"] == "MANUAL_OVERRIDE"
    assert data["evidence"]["result"] == "PASS"


async def test_decision_sign_then_verify_roundtrip(client):
    """The HMAC signature should round-trip exactly."""
    sign_resp = await client.post(
        "/api/decision/sign",
        json={
            "bid_id": "BID-SIG-001",
            "decision": "APPROVE",
            "remarks": "All checks passed",
            "officer_id": "OFF-1",
            "timestamp": "2026-08-27T12:00:00Z",
        },
    )
    assert sign_resp.status_code == 200
    signed = sign_resp.json()
    assert signed["algorithm"] == "HMAC-SHA256"

    verify_resp = await client.post(
        "/api/decision/verify",
        json={
            "bid_id": signed["bid_id"],
            "decision": signed["decision"],
            "remarks": signed["remarks"],
            "timestamp": signed["timestamp"],
            "signature": signed["signature"],
        },
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True


async def test_decision_verify_rejects_tampered_remarks(client):
    """Changing the remarks after signing must make verify fail."""
    sign_resp = await client.post(
        "/api/decision/sign",
        json={
            "bid_id": "BID-SIG-002",
            "decision": "APPROVE",
            "remarks": "All checks passed",
            "officer_id": "OFF-1",
            "timestamp": "2026-08-27T12:00:00Z",
        },
    )
    signed = sign_resp.json()

    verify_resp = await client.post(
        "/api/decision/verify",
        json={
            "bid_id": signed["bid_id"],
            "decision": signed["decision"],
            "remarks": "ALL CHECKS PASSED",  # tampered
            "timestamp": signed["timestamp"],
            "signature": signed["signature"],
        },
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is False
