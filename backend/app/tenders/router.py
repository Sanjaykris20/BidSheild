from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from app.models.auth import User
from app.models.documents import Document, DocumentReview
from app.database.session import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/tenders", tags=["tenders"])

# In-memory stores — data is lost on process restart.
# ------------------------------------------------------------------
# NOTE: a future iteration should replace these with proper SQLAlchemy
# models (see models/tenders.py) so that tenders and bids survive
# restarts and can be queried with SQL.
# ------------------------------------------------------------------
tenders_store: Dict[str, Dict] = {}
bids_store: Dict[str, Dict] = {}

DEMO_TENDERS = [
    {
        "id": "GEM/2026/B/1024",
        "title": "Data Center Migration & Security Upgrade",
        "organization": "Ministry of Defence",
        "category": "IT Services",
        "estimated_value": 4500000,
        "currency": "INR",
        "closing_date": "2026-09-01T23:59:59Z",
        "status": "OPEN",
        "requirements": {
            "min_local_content": 50,
            "mandatory_documents": ["GST_CERTIFICATE", "UDYAM_REGISTRATION", "PAN_CARD", "MAKE_IN_INDIA"],
            "oem_required": True
        },
        "created_at": "2026-08-01T10:00:00Z"
    },
    {
        "id": "GEM/2026/C/8812",
        "title": "Regional Transit Hub Development",
        "organization": "Metro Transit Authority",
        "category": "Infrastructure",
        "estimated_value": 12000000,
        "currency": "INR",
        "closing_date": "2026-09-10T23:59:59Z",
        "status": "OPEN",
        "requirements": {
            "min_local_content": 50,
            "mandatory_documents": ["GST_CERTIFICATE", "UDYAM_REGISTRATION", "PAN_CARD", "MAKE_IN_INDIA", "OEM_AUTHORIZATION"],
            "oem_required": True
        },
        "created_at": "2026-08-05T10:00:00Z"
    }
]

for t in DEMO_TENDERS:
    tenders_store[t["id"]] = t


class CreateTenderRequest(BaseModel):
    title: str
    organization: str
    category: str
    estimated_value: float
    currency: str = "INR"
    closing_date: str
    requirements: Dict[str, Any]


class SubmitBidRequest(BaseModel):
    tender_id: str
    bidder_name: str
    bidder_id: str
    extracted_fields: Dict[str, Any]
    documents: List[Dict[str, Any]]
    tender_requirements: Dict[str, Any]
    context: Dict[str, Any]


class UpdateBidStatusRequest(BaseModel):
    status: str
    remarks: str


@router.get("")
async def get_tenders(status: Optional[str] = None, category: Optional[str] = None, search: Optional[str] = None):
    results = list(tenders_store.values())

    if status:
        results = [t for t in results if t["status"] == status]
    if category:
        results = [t for t in results if t["category"].lower() == category.lower()]
    if search:
        search_lower = search.lower()
        results = [t for t in results if search_lower in t["title"].lower() or search_lower in t["organization"].lower()]

    return {"tenders": results, "total": len(results)}


@router.post("")
async def create_tender(request: CreateTenderRequest):
    tender_id = f"GEM/2026/{uuid.uuid4().hex[:6].upper()}"
    tender = {
        "id": tender_id,
        **request.dict(),
        "status": "OPEN",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    tenders_store[tender_id] = tender
    return tender


@router.get("/dashboard/stats")
async def get_dashboard_stats(role: str = "bidder"):
    if role == "bidder":
        return {
            "active_bids": len([b for b in bids_store.values() if b.get("status") in ["SUBMITTED", "UNDER_EVALUATION"]]),
            "total_bids": len(bids_store),
            "compliance_score": 92,
            "documents_pending": 1
        }
    elif role == "officer":
        return {
            "live_tenders": len([t for t in tenders_store.values() if t["status"] == "OPEN"]),
            "total_bids_received": len(bids_store),
            "pending_reviews": len([b for b in bids_store.values() if b.get("status") == "UNDER_EVALUATION"]),
            "high_risk_bids": 2
        }
    elif role == "admin":
        return {
            "total_tenders": len(tenders_store),
            "total_bids": len(bids_store),
            "ai_documents_processed": 14291,
            "avg_confidence": 96.4
        }
    return {"error": "Invalid role"}


@router.get("/bids/{bid_id}")
async def get_bid(bid_id: str):
    if bid_id not in bids_store:
        raise HTTPException(status_code=404, detail="Bid not found")
    return bids_store[bid_id]


@router.put("/bids/{bid_id}/status")
async def update_bid_status(bid_id: str, request: UpdateBidStatusRequest):
    if bid_id not in bids_store:
        raise HTTPException(status_code=404, detail="Bid not found")

    valid_statuses = ["SUBMITTED", "UNDER_EVALUATION", "CLARIFICATION", "APPROVED", "REJECTED", "AWARDED"]
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    bids_store[bid_id]["status"] = request.status
    bids_store[bid_id]["remarks"] = request.remarks
    bids_store[bid_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
    return bids_store[bid_id]


@router.get("/{tender_id:path}/bids")
async def get_bids(tender_id: str):
    if tender_id not in tenders_store:
        raise HTTPException(status_code=404, detail="Tender not found")
    bids = [b for b in bids_store.values() if b.get("tender_id") == tender_id]
    return {"bids": bids, "total": len(bids)}


@router.post("/{tender_id:path}/bids")
async def submit_bid(tender_id: str, request: SubmitBidRequest):
    if tender_id not in tenders_store:
        raise HTTPException(status_code=404, detail="Tender not found")

    bid_id = f"BID-{uuid.uuid4().hex[:8].upper()}"
    bid = {
        "id": bid_id,
        "tender_id": tender_id,
        **request.dict(),
        "status": "SUBMITTED",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    bids_store[bid_id] = bid
    return bid


@router.get("/{tender_id:path}/docs")
async def get_tender_document_requirements(
    tender_id: str,
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Show required documents for tender with user's upload/verify status."""
    from app.core.security import decode_token
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else ""
    user_id = None
    if token:
        try:
            payload = decode_token(token)
            user_id = payload.sub
        except Exception:
            pass

    if tender_id not in tenders_store:
        raise HTTPException(status_code=404, detail="Tender not found")

    tender = tenders_store[tender_id]
    requirements = tender.get("requirements", {})
    mandatory_docs = requirements.get("mandatory_documents", [])

    user_verified_docs = []
    if user_id:
        docs_res = await db.execute(select(Document).where(Document.user_id == user_id, Document.submitted_to_officer == True))
        user_docs = docs_res.scalars().all()
        for d in user_docs:
            rev_res = await db.execute(select(DocumentReview).where(DocumentReview.document_id == d.id, DocumentReview.status == "approved"))
            rev = rev_res.scalars().first()
            if rev:
                user_verified_docs.append({
                    "document_id": d.id,
                    "file_name": d.file_name,
                    "document_type": d.ai_extracted.get("required_document_type", "") if d.ai_extracted else "",
                    "verified": True,
                    "status": "approved",
                    "r2_url": d.r2_url,
                })

    doc_requirements = []
    for req in mandatory_docs:
        verified_for_req = [v for v in user_verified_docs if v.get("document_type") == req or req.lower() in v.get("file_name", "").lower()]
        doc_requirements.append({
            "required_document_type": req,
            "required_for_tender": True,
            "user_has_verified": len(verified_for_req) > 0,
            "verified_documents": verified_for_req,
            "upload_link": f"/documents/upload?tender_id={tender_id}&document_type={req}",
        })

    return {
        "tender_id": tender_id,
        "tender_title": tender.get("title"),
        "required_documents": doc_requirements,
        "user_verified_count": len(user_verified_docs),
        "total_required": len(mandatory_docs),
        "message": "Upload your PDF for each required document. AI will validate it. If missing, you can still apply but score will be lower.",
    }


@router.get("/{tender_id:path}")
async def get_tender(tender_id: str):
    if tender_id not in tenders_store:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tenders_store[tender_id]


@router.post("/{tender_id:path}/apply")
async def apply_tender(
    tender_id: str,
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Full tender application with verified document check + AI weighted score."""
    if tender_id not in tenders_store:
        raise HTTPException(status_code=404, detail="Tender not found")

    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else ""
    from app.core.security import decode_token
    payload = decode_token(token)

    tender = tenders_store[tender_id]
    requirements = tender.get("requirements", {})
    mandatory_docs = requirements.get("mandatory_documents", [])

    # Find user's verified approved documents
    docs_res = await db.execute(
        select(Document).where(Document.user_id == payload.sub, Document.submitted_to_officer == True)
    )
    user_docs = docs_res.scalars().all()

    verified_doc_ids = set()
    for d in user_docs:
        rev_res = await db.execute(
            select(DocumentReview).where(DocumentReview.document_id == d.id, DocumentReview.status == "approved")
        )
        if rev_res.scalars().first():
            verified_doc_ids.add(d.id)

    # Check which mandatory docs have verified uploads (simplified mapping by file name keywords)
    verified_count = 0
    missing_docs = []
    for req_doc in mandatory_docs:
        found = False
        for d in user_docs:
            # Simple keyword match for demo
            if req_doc.lower() in d.file_name.lower() or req_doc.lower().replace("_", "").replace("-", "") in d.file_name.lower().replace("_", "").replace("-", ""):
                rev_res = await db.execute(select(DocumentReview).where(DocumentReview.document_id == d.id, DocumentReview.status == "approved"))
                if rev_res.scalars().first():
                    found = True
                    break
        if found:
            verified_count += 1
        else:
            missing_docs.append(req_doc)

    total_required = len(mandatory_docs)
    score_percentage = (verified_count / total_required * 100) if total_required else 100.0
    weighted_score = score_percentage * 0.9  # AI weight factor

    # AI verification call (mock)
    ai_result = {
        "ai_verified": True,
        "ai_confidence": min(0.96, 0.7 + (verified_count / total_required) * 0.3) if total_required else 0.96,
        "missing_documents": missing_docs,
        "verified_documents": verified_count,
        "total_required": total_required,
        "weighted_score": round(weighted_score, 2),
        "can_apply": True  # User can always apply, just lower score if missing docs
    }

    # Create bid
    bid_id = f"BID-{uuid.uuid4().hex[:8].upper()}"
    bid = {
        "id": bid_id,
        "tender_id": tender_id,
        "bidder_id": payload.sub,
        "verified_docs": verified_count,
        "missing_docs": missing_docs,
        "score_percentage": round(score_percentage, 2),
        "weighted_score": ai_result["weighted_score"],
        "ai_result": ai_result,
        "status": "SUBMITTED",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "documents_submitted": verified_doc_ids,
    }
    bids_store[bid_id] = bid
    return {
        "message": "Tender application submitted",
        "bid_id": bid_id,
        "tender_id": tender_id,
        "verified_documents": verified_count,
        "required_documents": total_required,
        "missing_documents": missing_docs,
        "score_percentage": round(score_percentage, 2),
        "weighted_score": ai_result["weighted_score"],
        "ai_verification": ai_result,
        "can_apply": True,
        "note": "You can apply even with missing documents, but score will be lower."
    }
