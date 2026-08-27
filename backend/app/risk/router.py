from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.risk.engine import risk_engine

router = APIRouter(prefix="/api/risk", tags=["risk"])


class CalculateRiskRequest(BaseModel):
    bid_id: str
    compliance_result: Dict[str, Any]


@router.post("/calculate/{bid_id}")
async def calculate_risk(bid_id: str, request: CalculateRiskRequest):
    try:
        result = risk_engine.calculate(bid_id, request.compliance_result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")


@router.get("/{bid_id}")
async def get_risk(bid_id: str):
    result = risk_engine.calculate(bid_id)
    return result


@router.put("/thresholds")
async def update_risk_thresholds(request: Dict[str, int]):
    risk_engine.update_thresholds(request)
    return {"success": True, "thresholds": risk_engine.risk_thresholds}


@router.get("/thresholds")
async def get_risk_thresholds():
    return {"thresholds": risk_engine.risk_thresholds}


@router.put("/factor-weights")
async def update_factor_weights(request: Dict[str, float]):
    risk_engine.update_factor_weights(request)
    return {"success": True, "weights": risk_engine.risk_factor_weights}


@router.get("/factor-weights")
async def get_factor_weights():
    return {"weights": risk_engine.risk_factor_weights}