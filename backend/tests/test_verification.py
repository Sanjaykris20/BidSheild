"""Tests for app/verification/router.py and providers."""

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
    "documents": [],
    "tenderRequirements": {
        "min_local_content": 50,
        "mandatory_documents": ["GST_CERTIFICATE", "UDYAM_REGISTRATION", "PAN_CARD"],
        "oem_required": True,
    },
    "context": {
        "tender_id": "GEM/2026/B/1024",
        "bidder_name": "TechCorp Solutions Pvt Ltd",
    },
}


async def test_run_full_verification_returns_results(client):
    """POST /api/verification/run/{bid_id} returns per-field verification results."""
    response = await client.post(
        "/api/verification/run/BID-VERIFY01",
        json={"bid_id": "BID-VERIFY01", "bid_data": DEMO_BID_DATA},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bid_id"] == "BID-VERIFY01"
    assert "verification_results" in data
    results = data["verification_results"]
    assert "gst" in results
    assert "pan" in results
    assert "debarment" in results  # always checked


async def test_gst_provider_returns_status(client):
    """POST /api/verification/gst returns a verification response."""
    response = await client.post(
        "/api/verification/gst",
        json={"identifier": "27ABCDE1234F1Z5", "context": {}},
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "source" in data
    assert "confidence" in data


async def test_pan_provider_rejects_invalid_format(client):
    """A 10-char string that doesn't match the PAN pattern returns NOT_FOUND."""
    response = await client.post(
        "/api/verification/pan",
        json={"identifier": "TOOSHORT", "context": {}},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("NOT_FOUND", "INVALID")


async def test_debarment_returns_debarred_field(client):
    """POST /api/verification/debarment includes a 'debarred' boolean."""
    response = await client.post(
        "/api/verification/debarment",
        json={"identifier": "27ABCDE1234F1Z5", "context": {}},
    )
    assert response.status_code == 200
    data = response.json()
    assert "debarred" in data["data"]


async def test_providers_endpoint_lists_all_providers(client):
    """GET /api/verification/providers returns all registered provider keys."""
    response = await client.get("/api/verification/providers")
    assert response.status_code == 200
    data = response.json()
    providers = data["providers"]
    assert "gst" in providers
    assert "pan" in providers
    assert "debarment" in providers


async def test_set_provider_environment(client):
    """Switching a provider to MOCK works and rejects invalid environments."""
    response = await client.post(
        "/api/verification/providers/gst/environment",
        json={"environment": "MOCK"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["environment"] == "MOCK"


async def test_set_invalid_environment_returns_400(client):
    response = await client.post(
        "/api/verification/providers/gst/environment",
        json={"environment": "INVALID"},
    )
    assert response.status_code == 400


async def test_udyam_provider_with_valid_prefix(client):
    """UDYAM with UDYAM- prefix should verify successfully in MOCK mode."""
    response = await client.post(
        "/api/verification/udyam",
        json={"identifier": "UDYAM-MH-18-0012345", "context": {}},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VERIFIED"


async def test_epfo_provider_returns_response(client):
    response = await client.post(
        "/api/verification/epfo",
        json={"identifier": "EPFO-MH-44881", "context": {}},
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "confidence" in data


# --- Cross-database verification (extracted PDF fields vs datas/*.csv) ------
# These identifiers belong to real companies in the reference datasets under
# datas/ (e.g. Apex Precision Gears Pvt Ltd -> GSTIN 33AABCA1111A1Z1).
_APEX_GSTIN = "33AABCA1111A1Z1"
_APEX_PAN = "AABCA1111A"


async def test_cross_check_matches_reference_record(client):
    """Extracted fields that agree with the reference DB should report MATCH."""
    response = await client.post(
        "/api/verification/cross-check",
        json={
            "extracted_fields": {
                "gstin": _APEX_GSTIN,
                "legal_name": "Apex Precision Gears Private Limited",
                "pan": _APEX_PAN,
                "local_content_percentage": "85%",
                "company_name": "Apex Precision Gears Pvt Ltd",
            }
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["match"] >= 2
    assert body["summary"]["mismatch"] == 0
    gst_check = next(c for c in body["checks"] if c["parameter"] == "gstin")
    assert gst_check["status"] == "MATCH"
    assert gst_check["reference_value"]["legal_name"] == "Apex Precision Gears Private Limited"


async def test_cross_check_flags_mismatch(client):
    """Conflicting extracted values should be flagged as MISMATCH."""
    response = await client.post(
        "/api/verification/cross-check",
        json={
            "extracted_fields": {
                "gstin": _APEX_GSTIN,
                "legal_name": "Totally Fake Company Ltd",
                "pan": "ZZZZZ9999Z",
            }
        },
    )
    assert response.status_code == 200
    body = response.json()
    gst_check = next(c for c in body["checks"] if c["parameter"] == "gstin")
    assert gst_check["status"] == "MISMATCH"


async def test_cross_check_rejects_empty_request(client):
    response = await client.post("/api/verification/cross-check", json={})
    assert response.status_code == 400
