"""Review router: verification officer review of submitted documents."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.auth import User
from app.models.documents import Document, DocumentReview

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewRequest(BaseModel):
    document_id: str
    status: str  # approved, rejected, requested_clarification, reviewed
    comments: str | None = None


def _extract_payload(authorization: str):
    """Pull the bearer token out of the header and decode it.

    Returns ``None`` if the header is missing / malformed so callers can
    short-circuit with a 401.  Raises ``HTTPException(401)`` if the token is
    present but invalid (expired, bad signature, ...).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.replace("Bearer ", "", 1)
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization")
    from app.core.security import decode_token
    try:
        return decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/pending")
async def pending_reviews(
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    payload = _extract_payload(authorization)
    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role not in ["officer", "admin"]:
        raise HTTPException(status_code=403, detail="Officer or admin only")

    # Find submitted docs with pending reviews (or no review yet)
    docs_res = await db.execute(
        select(Document).where(Document.submitted_to_officer == True)
    )
    docs = docs_res.scalars().all()

    reviews = []
    for d in docs:
        rev_res = await db.execute(select(DocumentReview).where(DocumentReview.document_id == d.id))
        rev = rev_res.scalars().first()
        status = rev.status if rev else "pending"
        reviews.append({
            "document_id": d.id,
            "file_name": d.file_name,
            "status": status,
            "submitted_at": d.submitted_at.isoformat() if d.submitted_at else None,
        })
    return {"pending_reviews": reviews, "count": len(reviews)}


@router.get("/assigned")
async def assigned_reviews(
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    payload = _extract_payload(authorization)
    result = await db.execute(select(DocumentReview).where(DocumentReview.officer_id == payload.sub))
    reviews = result.scalars().all()
    return [
        {
            "id": r.id,
            "document_id": r.document_id,
            "status": r.status,
            "comments": r.comments,
            "decision_at": r.decision_at.isoformat() if r.decision_at else None,
        }
        for r in reviews
    ]


@router.get("/history")
async def review_history(
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    payload = _extract_payload(authorization)
    result = await db.execute(select(DocumentReview))
    reviews = result.scalars().all()
    return [
        {
            "id": r.id,
            "document_id": r.document_id,
            "officer_id": r.officer_id,
            "status": r.status,
            "comments": r.comments,
            "decision_at": r.decision_at.isoformat() if r.decision_at else None,
        }
        for r in reviews
    ]


@router.get("/{doc_id}")
async def get_review(
    doc_id: str,
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    # Accept any role (bidders may also want to see their own review status).
    _extract_payload(authorization)
    result = await db.execute(select(DocumentReview).where(DocumentReview.document_id == doc_id))
    review = result.scalars().first()
    if not review:
        return {"status": "pending", "message": "No review found"}
    return {
        "id": review.id,
        "document_id": review.document_id,
        "status": review.status,
        "comments": review.comments,
        "decision_at": review.decision_at.isoformat() if review.decision_at else None,
    }


@router.post("/{doc_id}")
async def submit_review(
    doc_id: str,
    request: ReviewRequest,
    authorization: str = "",
    db: AsyncSession = Depends(get_db),
):
    payload = _extract_payload(authorization)
    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalars().first()
    if not user or user.role not in ["officer", "admin"]:
        raise HTTPException(status_code=403, detail="Officer or admin only")

    # Find or create review
    rev_res = await db.execute(select(DocumentReview).where(DocumentReview.document_id == doc_id))
    review = rev_res.scalars().first()
    if not review:
        review = DocumentReview(
            document_id=doc_id,
            officer_id=payload.sub,
            status=request.status,
            comments=request.comments,
            decision_at=datetime.now(timezone.utc) if request.status != "pending" else None,
        )
        db.add(review)
    else:
        review.status = request.status
        review.comments = request.comments
        review.officer_id = payload.sub
        review.decision_at = datetime.now(timezone.utc) if request.status != "pending" else None
    await db.commit()
    await db.refresh(review)
    return {
        "message": "Review submitted",
        "document_id": doc_id,
        "status": review.status,
        "comments": review.comments,
        "decision_at": review.decision_at.isoformat() if review.decision_at else None,
    }
