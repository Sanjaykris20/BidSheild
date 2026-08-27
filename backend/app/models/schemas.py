from datetime import datetime
from typing import Any

from pydantic import BaseModel


class VerificationResponse(BaseModel):
    status: str
    source: str
    verified_at: datetime
    data: dict[str, Any]
    confidence: float

class ComplianceResult(BaseModel):
    score: int
    risk_level: str
    passed_count: int
    review_count: int
    failed_count: int
    risk_drivers: list[str]

class EvidenceRecord(BaseModel):
    requirement_id: str
    document_id: str
    page_number: int
    extracted_value: Any
    expected_value: Any
    actual_value: Any
    verification_source: str
    rule_id: str
    result: str
    confidence: float
