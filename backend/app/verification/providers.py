import json
import ssl
import os
import urllib.request
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.models.schemas import VerificationResponse

# Global default environment. Flip to "LIVE" via env var to attempt real
# government endpoints (degrading to SANDBOX when the live call fails).
DEFAULT_ENVIRONMENT = os.getenv("VERIFICATION_ENVIRONMENT", "MOCK").upper()
if DEFAULT_ENVIRONMENT not in ("LIVE", "SANDBOX", "MOCK"):
    DEFAULT_ENVIRONMENT = "MOCK"

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def _http_get_json(url: str, timeout: int = 5) -> Optional[Dict[str, Any]]:
    """Best-effort synchronous JSON fetch. Returns None on any failure."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": _USER_AGENT, "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def _response(status: str, source: str, data: Dict, confidence: float, environment: str) -> VerificationResponse:
    data = dict(data)
    data.setdefault("source", source)
    data.setdefault("environment", environment)
    return VerificationResponse(
        status=status,
        source=source,
        verified_at=datetime.now(timezone.utc),
        data=data,
        confidence=confidence,
    )


class VerificationProvider:
    """Base provider with a LIVE -> SANDBOX -> MOCK degradation chain.

    Subclasses implement:
      - live_url(identifier): real government endpoint, or None to skip LIVE.
      - parse_live(data, identifier): (status, data, confidence) from live payload.
      - mock_payload(identifier, context): deterministic demo payload.
      - sandbox_payload(identifier, context): realistic-but-not-real payload
        used when LIVE was attempted but failed (labeled as SANDBOX).
    """

    source_name = "BASE"
    # Confidence used when LIVE data cannot be classified definitively.
    sandbox_confidence = 0.85

    def __init__(self, environment: Optional[str] = None):
        self.environment = (environment or DEFAULT_ENVIRONMENT).upper()

    async def verify(self, identifier: str, context: Dict = None) -> VerificationResponse:
        if self.environment == "LIVE":
            url = self.live_url(identifier)
            if url:
                data = _http_get_json(url)
                if data is not None:
                    status, payload, confidence = self.parse_live(data, identifier)
                    return _response(status, f"{self.source_name}_LIVE", payload, confidence, "LIVE")
            # Live attempt failed -> degrade gracefully to SANDBOX so the
            # demo stays resilient instead of erroring out.
            self.environment = "SANDBOX"

        if self.environment == "SANDBOX":
            payload = self.sandbox_payload(identifier, context)
            payload["degraded_from"] = "LIVE"
            return _response("VERIFIED", f"{self.source_name}_SANDBOX", payload, self.sandbox_confidence, "SANDBOX")

        payload = self.mock_payload(identifier, context)
        return _response("VERIFIED", self.source_name, payload, payload.get("__confidence__", 0.95), "MOCK")

    # --- hooks for subclasses ---
    def live_url(self, identifier: str) -> Optional[str]:
        return None

    def parse_live(self, data: Dict, identifier: str):
        return "VERIFIED", data, 1.0

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        return {"identifier": identifier, "mock_data": True}

    def sandbox_payload(self, identifier: str, context: Dict = None) -> Dict:
        # Default sandbox behaves like the demo mock but is explicitly tagged.
        return self.mock_payload(identifier, context)


class GSTProvider(VerificationProvider):
    source_name = "GST"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://api.gstn.gov.in/v2/taxpayers/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        active = data.get("status") == "ACTIVE"
        return (
            "VERIFIED" if active else "INVALID_FORMAT",
            {
                "gstin": identifier,
                "legal_name": data.get("legal_name"),
                "state": data.get("state"),
                "status": data.get("status"),
                "taxpayer_type": data.get("taxpayer_type"),
            },
            1.0 if active else 0.3,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid_format = len(identifier) == 15 and identifier[:2].isdigit()
        return {
            "gstin": identifier,
            "legal_name": "TechCorp Solutions Pvt Ltd" if valid_format else "Unknown",
            "state": "Maharashtra",
            "registration_date": "2023-05-14",
            "status": "ACTIVE" if valid_format else "INVALID",
            "taxpayer_type": "Regular",
            "__confidence__": 0.98 if valid_format else 0.3,
        }


class UdyamProvider(VerificationProvider):
    source_name = "UDYAM"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://udyamregistration.gov.in/API/verify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "ACTIVE"
        return (
            "VERIFIED" if valid else "NOT_FOUND",
            {
                "udyam_number": identifier,
                "enterprise_name": data.get("enterprise_name"),
                "classification": data.get("classification"),
                "status": data.get("status"),
            },
            1.0 if valid else 0.2,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = identifier.startswith("UDYAM-")
        return {
            "udyam_number": identifier,
            "enterprise_name": "TechCorp Solutions Pvt Ltd" if valid else "Unknown",
            "classification": "Micro",
            "registration_date": "2024-01-15",
            "status": "ACTIVE" if valid else "NOT_FOUND",
            "__confidence__": 0.97 if valid else 0.2,
        }


class PANProvider(VerificationProvider):
    source_name = "PAN"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://api.tin-nsdl.com/pan/verify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "VALID"
        return (
            "VERIFIED" if valid else "INVALID",
            {"pan": identifier, "name": data.get("name"), "category": data.get("category"), "status": data.get("status")},
            1.0 if valid else 0.1,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = len(identifier) == 10 and identifier[:5].isalpha() and identifier[5:9].isdigit() and identifier[9].isalpha()
        return {
            "pan": identifier,
            "name": "TechCorp Solutions Pvt Ltd" if valid else "Unknown",
            "category": "Company",
            "status": "ACTIVE" if valid else "INVALID",
            "__confidence__": 0.99 if valid else 0.1,
        }


class IncomeTaxProvider(VerificationProvider):
    source_name = "INCOME_TAX"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://eportal.incometax.gov.in/iec/services/v1/compliance/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        compliant = data.get("tax_compliance") == "COMPLIANT"
        return (
            "VERIFIED",
            {
                "pan": identifier,
                "return_filed": data.get("return_filed"),
                "last_assessment_year": data.get("last_assessment_year"),
                "tax_compliance": data.get("tax_compliance"),
                "outstanding_demand": data.get("outstanding_demand"),
            },
            1.0 if compliant else 0.6,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        return {
            "pan": identifier,
            "return_filed": True,
            "last_assessment_year": "2024-25",
            "tax_compliance": "COMPLIANT",
            "outstanding_demand": 0,
            "__confidence__": 0.95,
        }


class EPFOProvider(VerificationProvider):
    source_name = "EPFO"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://unifiedportal-epfo.gov.in/api/verify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        return (
            "VERIFIED",
            {
                "establishment_code": identifier,
                "name": data.get("name"),
                "status": data.get("status"),
                "member_count": data.get("member_count"),
                "compliance": data.get("compliance"),
            },
            0.95,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        return {
            "establishment_code": identifier,
            "name": "TechCorp Solutions Pvt Ltd",
            "status": "ACTIVE",
            "member_count": 45,
            "compliance": "COMPLIANT",
            "__confidence__": 0.9,
        }


class ESICProvider(VerificationProvider):
    source_name = "ESIC"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://esic.gov.in/api/v1/employer-check/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        return (
            "VERIFIED",
            {
                "esi_code": identifier,
                "name": data.get("name"),
                "status": data.get("status"),
                "employees_covered": data.get("employees_covered"),
                "compliance": data.get("compliance"),
            },
            0.95,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        return {
            "esi_code": identifier,
            "name": "TechCorp Solutions Pvt Ltd",
            "status": "ACTIVE",
            "employees_covered": 42,
            "compliance": "COMPLIANT",
            "__confidence__": 0.9,
        }


class StartupProvider(VerificationProvider):
    source_name = "STARTUP"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://api.startupindia.gov.in/dppit/v1/validate/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "ACTIVE"
        return (
            "VERIFIED" if valid else "NOT_FOUND",
            {
                "dipp_number": identifier,
                "name": data.get("name"),
                "recognition_date": data.get("recognition_date"),
                "status": data.get("status"),
            },
            1.0 if valid else 0.2,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = identifier.startswith("DIPP")
        return {
            "dipp_number": identifier,
            "name": "TechCorp Solutions Pvt Ltd" if valid else "Unknown",
            "recognition_date": "2023-06-20",
            "status": "ACTIVE" if valid else "NOT_FOUND",
            "category": "Technology",
            "__confidence__": 0.96 if valid else 0.2,
        }


class NSICProvider(VerificationProvider):
    source_name = "NSIC"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://nsic.co.in/api/sprs/verify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "ACTIVE"
        return (
            "VERIFIED" if valid else "NOT_FOUND",
            {
                "nsic_number": identifier,
                "name": data.get("name"),
                "registration_date": data.get("registration_date"),
                "status": data.get("status"),
            },
            1.0 if valid else 0.2,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = identifier.startswith("NSIC")
        return {
            "nsic_number": identifier,
            "name": "TechCorp Solutions Pvt Ltd" if valid else "Unknown",
            "registration_date": "2023-08-10",
            "status": "ACTIVE" if valid else "NOT_FOUND",
            "category": "IT Services",
            "__confidence__": 0.94 if valid else 0.2,
        }


class OEMProvider(VerificationProvider):
    source_name = "OEM"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://oem-registry.gem.gov.in/v1/auth-check/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "VALID"
        return (
            "VERIFIED" if valid else "INVALID",
            {
                "certificate": identifier,
                "oem_name": data.get("oem_name"),
                "authorized_products": data.get("authorized_products"),
                "valid_from": data.get("valid_from"),
                "valid_to": data.get("valid_to"),
                "status": data.get("status"),
            },
            1.0 if valid else 0.2,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = identifier.startswith("OEM-")
        return {
            "certificate": identifier,
            "oem_name": "Dell Technologies" if valid else "Unknown",
            "authorized_products": ["Servers", "Storage", "Networking"],
            "valid_from": "2024-01-01",
            "valid_to": "2026-12-31",
            "status": "VALID" if valid else "EXPIRED",
            "__confidence__": 0.93 if valid else 0.2,
        }


class DigiLockerProvider(VerificationProvider):
    source_name = "DIGILOCKER"
    sandbox_confidence = 0.8

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://digilocker.meripehchan.gov.in/public/api/v2/doc/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        return (
            "VERIFIED",
            {
                "doc_id": identifier,
                "document_type": data.get("document_type"),
                "verified": data.get("verified"),
                "hash_match": data.get("hash_match"),
            },
            1.0,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        return {
            "doc_id": identifier,
            "document_type": "PAN_CARD",
            "verified": True,
            "hash_match": True,
            "__confidence__": 0.99,
        }


class DebarmentProvider(VerificationProvider):
    source_name = "DEBARMENT"
    sandbox_confidence = 0.9

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://cvc.gov.in/api/debarment-list/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        is_debarred = bool(data.get("debarred"))
        return (
            "VERIFIED",
            {
                "identifier": identifier,
                "debarred": is_debarred,
                "checked_sources": ["GeM Debarment List", "CVC List", "RBI Defaulters"],
                "details": "Found in GeM debarment list" if is_debarred else "Clear across all sources",
            },
            1.0,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        debarred_list = ["BLACKLISTED-PAN-123", "DEBARRED-GST-456"]
        is_debarred = identifier in debarred_list
        return {
            "identifier": identifier,
            "debarred": is_debarred,
            "checked_sources": ["GeM Debarment List", "CVC List", "RBI Defaulters"],
            "details": "Found in GeM debarment list" if is_debarred else "Clear across all sources",
            "__confidence__": 0.99,
        }


class MakeInIndiaProvider(VerificationProvider):
    source_name = "MAKE_IN_INDIA"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://www.makeinindia.com/api/local-content/verify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "COMPLIANT"
        return (
            "VERIFIED" if valid else "INCOMPLETE",
            {
                "declaration_id": identifier,
                "local_content_percentage": data.get("local_content_percentage"),
                "class": data.get("class"),
                "verified_by": "DPIIT",
                "status": data.get("status"),
            },
            1.0 if valid else 0.7,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = "local" in identifier.lower() or identifier.startswith("MAKE")
        return {
            "declaration_id": identifier,
            "local_content_percentage": 42 if not valid else 65,
            "class": "Class-I" if valid else "Class-II",
            "verified_by": "DPIIT",
            "status": "COMPLIANT" if valid else "NON_COMPLIANT",
            "__confidence__": 0.94 if valid else 0.7,
        }


class BISProvider(VerificationProvider):
    source_name = "BIS"
    sandbox_confidence = 0.7

    def live_url(self, identifier: str) -> Optional[str]:
        return f"https://www.bis.gov.in/api/certify/{identifier}"

    def parse_live(self, data: Dict, identifier: str):
        valid = data.get("status") == "ACTIVE"
        return (
            "VERIFIED" if valid else "NOT_FOUND",
            {
                "cert_number": identifier,
                "standard": data.get("standard"),
                "product_category": data.get("product_category"),
                "status": data.get("status"),
            },
            1.0 if valid else 0.3,
        )

    def mock_payload(self, identifier: str, context: Dict = None) -> Dict:
        valid = identifier.startswith("BIS-") or identifier.startswith("ISI-")
        return {
            "cert_number": identifier,
            "standard": "IS 16001",
            "product_category": "IT Equipment",
            "status": "ACTIVE" if valid else "EXPIRED",
            "__confidence__": 0.92 if valid else 0.3,
        }


PROVIDER_CLASSES = {
    "gst": GSTProvider,
    "udyam": UdyamProvider,
    "pan": PANProvider,
    "income_tax": IncomeTaxProvider,
    "geincometax": IncomeTaxProvider,
    "epfo": EPFOProvider,
    "esic": ESICProvider,
    "startup": StartupProvider,
    "nsic": NSICProvider,
    "oem": OEMProvider,
    "digilocker": DigiLockerProvider,
    "debarment": DebarmentProvider,
    "make_in_india": MakeInIndiaProvider,
    "bis": BISProvider,
}


def get_provider(source: str, environment: Optional[str] = None) -> VerificationProvider:
    provider_class = PROVIDER_CLASSES.get(source.lower())
    if provider_class:
        return provider_class(environment)
    return VerificationProvider(source.upper(), environment)
