from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.compliance.engine import compliance_engine


router = APIRouter(prefix="/api/compliance", tags=["compliance"])


class RunComplianceRequest(BaseModel):
    bid_id: str
    bid_data: Dict[str, Any]


@router.post("/run/{bid_id}")
async def run_compliance(bid_id: str, request: RunComplianceRequest):
    try:
        result = compliance_engine.evaluate(bid_id, request.bid_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")


@router.get("/{bid_id}")
async def get_compliance(bid_id: str):
    result = compliance_engine.evaluate(bid_id)
    return result


@router.get("/{bid_id}/summary")
async def get_compliance_summary(bid_id: str):
    result = compliance_engine.evaluate(bid_id)
    return {
        "bid_id": bid_id,
        "score": result["score"],
        "risk_level": result["risk_level"],
        "passed_count": result["passed_count"],
        "review_count": result["review_count"],
        "failed_count": result["failed_count"],
        "risk_drivers": result["risk_drivers"],
        "evaluated_at": result.get("evaluated_at", datetime.now(timezone.utc).isoformat())
    }


@router.get("/{bid_id}/failed")
async def get_failed_compliance(bid_id: str):
    result = compliance_engine.evaluate(bid_id)
    failed_rules = [r for r in result.get("rule_results", []) if r.get("result") in ["FAIL", "EXPIRED", "VERIFICATION_FAILED", "MISSING"]]
    return {
        "bid_id": bid_id,
        "failed_count": len(failed_rules),
        "failed_rules": failed_rules
    }


@router.put("/weights")
async def update_rule_weights(request: Dict[str, int]):
    compliance_engine.rule_weights = {**compliance_engine.rule_weights, **request}
    return {"success": True, "weights": compliance_engine.rule_weights}


@router.get("/weights")
async def get_rule_weights():
    return {"weights": compliance_engine.rule_weights}