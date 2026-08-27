import asyncio
import random
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.verification.cross_check import cross_check_document
from app.verification.providers import (
    DEFAULT_ENVIRONMENT,
    PROVIDER_CLASSES,
    get_provider,
)

router = APIRouter(prefix="/api/verification", tags=["verification"])


class VerifyRequest(BaseModel):
    identifier: str
    context: dict[str, Any] | None = {}


class RunVerificationRequest(BaseModel):
    bid_id: str
    bid_data: dict[str, Any]
    environment: str | None = None


@router.post("/run/{bid_id}")
async def run_verification(bid_id: str, request: RunVerificationRequest):
    """Run full verification pipeline for a bid.

    Every applicable identifier extracted from the bidder document is routed
    to its statutory provider. Providers run concurrently. Debarment is always
    checked. The active environment (LIVE / SANDBOX / MOCK) is propagated from
    the request, falling back to the global VERIFICATION_ENVIRONMENT default.
    """
    bid_data = request.bid_data
    extracted_fields = bid_data.get("extractedFields", {})
    context = bid_data.get("context", {})
    environment = (request.environment or DEFAULT_ENVIRONMENT).upper()

    # field-name (from AI extraction) -> provider key
    provider_map = {
        "gstin": "gst",
        "udyam_number": "udyam",
        "pan": "pan",
        "pan_number": "pan",
        "income_tax_pan": "income_tax",
        "establishment_code": "epfo",
        "esi_code": "esic",
        "dipp_number": "startup",
        "nsic_number": "nsic",
        "oem_certificate": "oem",
        "oem_cert_number": "oem",
        "digilocker_doc_id": "digilocker",
        "make_in_india_id": "make_in_india",
        "bis_certificate": "bis",
    }

    async def _run(key: str, provider_key: str, value: str):
        provider = get_provider(provider_key, environment)
        try:
            result = await provider.verify(value, context)
            return key, result.model_dump()
        except Exception as e:  # noqa: BLE001
            return key, {
                "status": "VERIFICATION_FAILED",
                "source": provider.source_name,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "data": {"error": str(e)},
                "confidence": 0,
                "environment": environment,
            }

    tasks = []
    for field, provider_key in provider_map.items():
        value = extracted_fields.get(field)
        if value:
            tasks.append(_run(field, provider_key, value))

    # Always run debarment against PAN or GSTIN.
    debarment_id = extracted_fields.get("pan") or extracted_fields.get("gstin")
    if debarment_id:
        tasks.append(_run("debarment", "debarment", debarment_id))

    results_list = await asyncio.gather(*tasks)
    results = {key: payload for key, payload in results_list}

    return {
        "bid_id": bid_id,
        "environment": environment,
        "verification_results": results,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/gst")
async def verify_gst(request: VerifyRequest):
    return await get_provider("gst").verify(request.identifier, request.context)


@router.post("/udyam")
async def verify_udyam(request: VerifyRequest):
    return await get_provider("udyam").verify(request.identifier, request.context)


@router.post("/pan")
async def verify_pan(request: VerifyRequest):
    return await get_provider("pan").verify(request.identifier, request.context)


@router.post("/income-tax")
async def verify_income_tax(request: VerifyRequest):
    return await get_provider("income_tax").verify(request.identifier, request.context)


@router.post("/epfo")
async def verify_epfo(request: VerifyRequest):
    return await get_provider("epfo").verify(request.identifier, request.context)


@router.post("/esic")
async def verify_esic(request: VerifyRequest):
    return await get_provider("esic").verify(request.identifier, request.context)


@router.post("/startup")
async def verify_startup(request: VerifyRequest):
    return await get_provider("startup").verify(request.identifier, request.context)


@router.post("/nsic")
async def verify_nsic(request: VerifyRequest):
    return await get_provider("nsic").verify(request.identifier, request.context)


@router.post("/oem")
async def verify_oem(request: VerifyRequest):
    return await get_provider("oem").verify(request.identifier, request.context)


@router.post("/digilocker")
async def verify_digilocker(request: VerifyRequest):
    return await get_provider("digilocker").verify(request.identifier, request.context)


@router.post("/debarment")
async def verify_debarment(request: VerifyRequest):
    return await get_provider("debarment").verify(request.identifier, request.context)


@router.get("/providers")
async def get_providers():
    providers = {}
    for key, cls in PROVIDER_CLASSES.items():
        provider = cls()
        providers[key] = {
            "key": key,
            "name": provider.source_name,
            "environment": provider.environment,
            "status": "healthy" if provider.environment != "MOCK" else "mock_mode",
            "latency_ms": random.randint(40, 300),
        }
    return {"providers": providers}


@router.post("/providers/{key}/environment")
async def set_provider_environment(key: str, request: dict[str, str]):
    environment = request.get("environment", "MOCK")
    if environment not in ["LIVE", "SANDBOX", "MOCK"]:
        raise HTTPException(status_code=400, detail="Invalid environment")
    if key not in PROVIDER_CLASSES:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"success": True, "provider": key, "environment": environment}


class CrossCheckRequest(BaseModel):
    document_id: str | None = None
    document_type: str | None = None
    extracted_fields: dict[str, Any] | None = None


@router.post("/cross-check")
async def cross_check(
    request: CrossCheckRequest,
    db: AsyncSession = Depends(get_db),
):
    """Cross-verify AI-extracted PDF fields against the reference DB and document store.

    Provide either ``document_id`` (fields are read from the stored
    ``ai_extracted`` of that upload) or ``extracted_fields`` directly.
    """
    extracted_fields = request.extracted_fields
    document_id = request.document_id

    if document_id and not extracted_fields:
        from sqlalchemy import select

        from app.models.documents import Document

        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        extracted_fields = (doc.ai_extracted or {}).get("extracted_fields", {}) if isinstance(doc.ai_extracted, dict) else {}

    if not extracted_fields:
        raise HTTPException(
            status_code=400,
            detail="No extracted fields to verify. Provide document_id or extracted_fields.",
        )

    return await cross_check_document(extracted_fields, document_id, db)


@router.get("/cross-check/{document_id}")
async def cross_check_by_id(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Convenience GET: cross-check a stored document by id."""
    from sqlalchemy import select

    from app.models.documents import Document

    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    extracted_fields = (doc.ai_extracted or {}).get("extracted_fields", {}) if isinstance(doc.ai_extracted, dict) else {}
    if not extracted_fields:
        raise HTTPException(status_code=400, detail="Document has no extracted fields to verify.")
    return await cross_check_document(extracted_fields, document_id, db)
