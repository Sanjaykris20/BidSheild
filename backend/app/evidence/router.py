import hashlib
import hmac
import os
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from app.evidence.engine import evidence_engine

router = APIRouter(prefix="/api", tags=["evidence"])

# Secret used to cryptographically sign officer decisions. Override with the
# AUDIT_SIGNING_SECRET environment variable in production deployments.
_AUDIT_SECRET = os.getenv("AUDIT_SIGNING_SECRET", "bidshield-dev-audit-secret").encode()


def _sign_decision(bid_id: str, decision: str, remarks: str, timestamp: str) -> str:
    message = f"{bid_id}|{decision}|{remarks}|{timestamp}"
    return hmac.new(_AUDIT_SECRET, message.encode(), hashlib.sha256).hexdigest()


class OverrideEvidenceRequest(BaseModel):
    officer_id: str
    original_result: str
    new_result: str
    reason: str
    requirement_id: str
    rule_id: str
    bid_id: Optional[str] = None


@router.get("/evidence/{evidence_id}")
async def get_evidence(evidence_id: str):
    evidence = evidence_engine.get_evidence(evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence.to_dict()


@router.get("/bids/{bid_id}/evidence")
async def get_bid_evidence(
    bid_id: str,
    result: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    rule_id: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None)
):
    query = {"bid_id": bid_id}
    if result: query["result"] = result
    if source: query["verification_source"] = source
    if rule_id: query["rule_id"] = rule_id
    if min_confidence: query["min_confidence"] = min_confidence

    evidence = evidence_engine.search_evidence(query)
    return {"bid_id": bid_id, "total": len(evidence), "evidence": [e.to_dict() for e in evidence]}


@router.get("/bids/{bid_id}/evidence/summary")
async def get_evidence_summary(bid_id: str):
    return evidence_engine.get_evidence_summary(bid_id)


@router.get("/bids/{bid_id}/evidence/export")
async def export_evidence_for_audit(bid_id: str):
    return evidence_engine.export_for_audit(bid_id)


@router.post("/evidence/override")
async def add_override_evidence(request: OverrideEvidenceRequest):
    evidence = evidence_engine.add_override_evidence(request.dict())
    if request.bid_id:
        evidence.details["bid_id"] = request.bid_id
    return {"success": True, "evidence": evidence.to_dict()}


@router.get("/evidence/requirement/{requirement_id}")
async def get_evidence_by_requirement(requirement_id: str):
    evidence = evidence_engine.get_evidence_by_requirement(requirement_id)
    return {"requirement_id": requirement_id, "evidence": [e.to_dict() for e in evidence]}


class DecisionSignRequest(BaseModel):
    bid_id: str
    decision: str  # APPROVE | CLARIFY | REJECT
    remarks: str
    officer_id: str
    timestamp: Optional[str] = None


class DecisionVerifyRequest(BaseModel):
    bid_id: str
    decision: str
    remarks: str
    timestamp: str
    signature: str


@router.post("/decision/sign")
async def sign_decision(request: DecisionSignRequest):
    """Cryptographically sign an officer decision (HMAC-SHA256 over
    bidId|decision|remarks|timestamp) and return a tamper-evident audit row."""
    timestamp = request.timestamp or datetime.now(timezone.utc).isoformat()
    signature = _sign_decision(request.bid_id, request.decision, request.remarks, timestamp)
    return {
        "success": True,
        "bid_id": request.bid_id,
        "decision": request.decision,
        "remarks": request.remarks,
        "officer_id": request.officer_id,
        "timestamp": timestamp,
        "signature": signature,
        "algorithm": "HMAC-SHA256",
    }


@router.post("/decision/verify")
async def verify_decision(request: DecisionVerifyRequest):
    expected = _sign_decision(request.bid_id, request.decision, request.remarks, request.timestamp)
    valid = hmac.compare_digest(expected, request.signature)
    return {"valid": valid}