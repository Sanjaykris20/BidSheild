"""Cross-verification of AI-extracted PDF fields against reference datasets and the document store.

This module implements the "cross verified with the db" requirement. After the
PDF scraper (``ai-engine``) and the AI extraction step produce a set of
``extracted_fields`` for an uploaded document, this module:

1. Looks each identifier (GSTIN, PAN, Udyam number, EPFO establishment, local
   content declaration, etc.) up in the reference datasets under ``datas/``
   (the curated "db" of company records).
2. Compares the AI-extracted values against the reference record and reports a
   per-parameter MATCH / PARTIAL / MISMATCH / NOT_FOUND verdict.
3. Cross-checks the same identifiers against *other* uploaded documents stored
   in the ``documents`` table (``ai_extracted``), surfacing duplicates or
   conflicting company names.

The module is intentionally dependency-free (stdlib ``csv`` only) so it can be
imported and unit-tested without pandas/openpyxl.
"""

from __future__ import annotations

import csv
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings

# Reference dataset filenames (kept alongside the repo, in ``datas/``).
_GST_CSV = "gst_mock.csv"
_UDYAM_CSV = "udyam_mock_data.csv"
_MII_CSV = "makeindia_mock.csv"
_EPFO_CSV = "EPFO_ESIC_mock.csv"

# Verdict constants.
MATCH = "MATCH"
PARTIAL = "PARTIAL"
MISMATCH = "MISMATCH"
NOT_FOUND = "NOT_FOUND"
NO_REFERENCE = "NO_REFERENCE"
NO_DATA = "NO_DATA"


def _ref_dir() -> Path:
    """Resolve the directory holding the reference CSVs.

    Uses ``REFERENCE_DATA_DIR`` when set, otherwise falls back to the
    ``datas/`` folder at the repository root (three levels up from this file:
    verification -> app -> backend -> repo root).
    """
    cfg = getattr(settings, "REFERENCE_DATA_DIR", None)
    if cfg:
        return Path(cfg)
    return Path(__file__).resolve().parents[3] / "datas"


def _norm(value: Any) -> str:
    """Normalise a string for comparison (lowercase, collapses whitespace)."""
    if value is None:
        return ""
    return " ".join(str(value).lower().replace("-", " ").replace("/", " ").split())


def _norm_pct(value: Any) -> float | None:
    """Parse a percentage-ish value (e.g. ``"85%"`` or ``85``) into a float."""
    if value is None:
        return None
    s = str(value).strip().replace("%", "").replace(",", "").strip()
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


@dataclass
class CheckResult:
    """A single cross-verification verdict for one parameter."""

    parameter: str
    label: str
    extracted_value: Any
    reference_value: Any
    status: str
    confidence: float
    source: str
    notes: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ReferenceData:
    """Lazy loader/cache for the reference CSV datasets."""

    def __init__(self, ref_dir: Path | None = None):
        self.ref_dir = ref_dir or _ref_dir()
        self._gst: list[dict[str, str]] | None = None
        self._udyam: list[dict[str, str]] | None = None
        self._mii: list[dict[str, str]] | None = None
        self._epfo: list[dict[str, str]] | None = None

    # --- raw loading -------------------------------------------------------
    def _load(self, name: str) -> list[dict[str, str]]:
        path = self.ref_dir / name
        if not path.exists():
            return []
        with open(path, newline="", encoding="utf-8") as fh:
            # The reference CSVs use ", " separators, so header keys arrive with
            # leading spaces (e.g. " Legal Name"). Strip keys and values so
            # downstream lookups are robust. DictReader assigns ``None`` keys to
            # any trailing empty columns, which we drop.
            return [
                {
                    (k.strip() if k else k): (v.strip() if isinstance(v, str) else v)
                    for k, v in row.items()
                    if k is not None
                }
                for row in csv.DictReader(fh)
            ]

    @property
    def gst(self) -> list[dict[str, str]]:
        if self._gst is None:
            self._gst = self._load(_GST_CSV)
        return self._gst

    @property
    def udyam(self) -> list[dict[str, str]]:
        if self._udyam is None:
            self._udyam = self._load(_UDYAM_CSV)
        return self._udyam

    @property
    def mii(self) -> list[dict[str, str]]:
        if self._mii is None:
            self._mii = self._load(_MII_CSV)
        return self._mii

    @property
    def epfo(self) -> list[dict[str, str]]:
        if self._epfo is None:
            self._epfo = self._load(_EPFO_CSV)
        return self._epfo

    @property
    def available(self) -> list[str]:
        out = []
        for name in (_GST_CSV, _UDYAM_CSV, _MII_CSV, _EPFO_CSV):
            if (self.ref_dir / name).exists():
                out.append(name)
        return out

    # --- lookups -----------------------------------------------------------
    def gst_by_gstin(self, gstin: str) -> dict[str, str] | None:
        key = _norm(gstin)
        for row in self.gst:
            if _norm(row.get("GSTIN")) == key:
                return row
        return None

    def gst_by_pan(self, pan: str) -> list[dict[str, str]]:
        key = _norm(pan)
        return [r for r in self.gst if _norm(r.get("PAN")) == key]

    def udyam_by_number(self, number: str) -> dict[str, str] | None:
        key = _norm(number)
        for row in self.udyam:
            if _norm(row.get("Udyam Registration Number")) == key:
                return row
        return None

    def udyam_by_pan(self, pan: str) -> list[dict[str, str]]:
        key = _norm(pan)
        return [r for r in self.udyam if _norm(r.get("PAN")) == key]

    def udyam_by_gstin(self, gstin: str) -> list[dict[str, str]]:
        key = _norm(gstin)
        return [r for r in self.udyam if _norm(r.get("GSTIN")) == key]

    def mii_by_company(self, company: str) -> dict[str, str] | None:
        key = _norm(company)
        if not key:
            return None
        for row in self.mii:
            ref = _norm(row.get("Company Name"))
            if ref == key or key in ref or ref in key:
                return row
        return None

    def epfo_by_pan(self, pan: str) -> list[dict[str, str]]:
        key = _norm(pan)
        return [r for r in self.epfo if _norm(r.get("PAN")) == key]

    def epfo_by_company(self, company: str) -> list[dict[str, str]]:
        key = _norm(company)
        if not key:
            return []
        return [
            r
            for r in self.epfo
            if key in _norm(r.get("Company Name")) or _norm(r.get("Company Name")) in key
        ]


def _name_status(extracted: Any, reference: Any) -> str:
    """Compare two company/person names, allowing partial matches."""
    e, r = _norm(extracted), _norm(reference)
    if not e or not r:
        return NO_DATA
    if e == r:
        return MATCH
    if e in r or r in e:
        return PARTIAL
    return MISMATCH


def _verdict_confidence(status: str) -> float:
    return {
        MATCH: 0.95,
        PARTIAL: 0.70,
        MISMATCH: 0.90,
        NOT_FOUND: 0.60,
        NO_REFERENCE: 0.0,
        NO_DATA: 0.0,
    }.get(status, 0.0)


async def cross_check_document(
    extracted_fields: dict[str, Any],
    document_id: str | None = None,
    db: Any = None,
    ref: ReferenceData | None = None,
) -> dict[str, Any]:
    """Run cross-verification for a single document's extracted fields.

    Parameters
    ----------
    extracted_fields: the ``extracted_fields`` dict produced by the AI engine.
    document_id: id of the uploaded document (used to exclude self from the
        document-store comparison).
    db: optional SQLAlchemy async session for the document-store check.
    ref: optional pre-loaded :class:`ReferenceData` (mostly for testing).
    """
    ref = ref or ReferenceData(_ref_dir())
    results: list[CheckResult] = []

    gstin = extracted_fields.get("gstin")
    pan = (
        extracted_fields.get("pan")
        or extracted_fields.get("pan_number")
        or extracted_fields.get("income_tax_pan")
    )
    udyam = extracted_fields.get("udyam_number")
    legal_name = (
        extracted_fields.get("legal_name")
        or extracted_fields.get("enterprise_name")
        or extracted_fields.get("name")
        or extracted_fields.get("company_name")
    )
    local_content = extracted_fields.get("local_content_percentage")
    epfo_id = extracted_fields.get("establishment_code")
    mii_company = extracted_fields.get("company_name") or legal_name

    # --- GSTIN cross-check against GST reference ---------------------------
    if gstin:
        row = ref.gst_by_gstin(gstin)
        if row:
            ref_name = row.get("Legal Name") or row.get("Trade Name")
            ref_pan = row.get("PAN")
            ref_state = row.get("State")
            name_status = _name_status(legal_name, ref_name)
            pan_status = _name_status(pan, ref_pan)
            overall = (
                MATCH
                if name_status in (MATCH, PARTIAL) and pan_status in (MATCH, PARTIAL, NO_DATA)
                else MISMATCH
            )
            results.append(
                CheckResult(
                    parameter="gstin",
                    label="GST registration",
                    extracted_value=gstin,
                    reference_value={
                        "legal_name": ref_name,
                        "pan": ref_pan,
                        "state": ref_state,
                        "status": row.get("Type of Registration"),
                    },
                    status=overall,
                    confidence=_verdict_confidence(overall),
                    source="datas/gst_mock.csv",
                    notes=f"Name: {name_status}; PAN: {pan_status}",
                )
            )
        else:
            results.append(
                CheckResult(
                    parameter="gstin",
                    label="GST registration",
                    extracted_value=gstin,
                    reference_value=None,
                    status=NOT_FOUND,
                    confidence=_verdict_confidence(NOT_FOUND),
                    source="datas/gst_mock.csv",
                    notes="GSTIN not present in reference dataset.",
                )
            )

    # --- PAN cross-check across references --------------------------------
    if pan and not gstin:
        hits = ref.gst_by_pan(pan) + ref.udyam_by_pan(pan) + ref.epfo_by_pan(pan)
        if hits:
            names = [h.get("Legal Name") or h.get("Enterprise Name") or h.get("Company Name") for h in hits]
            name_status = next((_name_status(legal_name, n) for n in names if n), NO_DATA)
            results.append(
                CheckResult(
                    parameter="pan",
                    label="PAN identity",
                    extracted_value=pan,
                    reference_value={"matched_records": len(hits), "names": [n for n in names if n]},
                    status=MATCH if name_status in (MATCH, PARTIAL) else MISMATCH,
                    confidence=_verdict_confidence(MATCH if name_status in (MATCH, PARTIAL) else MISMATCH),
                    source="datas/gst_mock.csv,udyam_mock_data.csv,EPFO_ESIC_mock.csv",
                    notes=f"Found in {len(hits)} reference record(s); name: {name_status}.",
                )
            )
        else:
            results.append(
                CheckResult(
                    parameter="pan",
                    label="PAN identity",
                    extracted_value=pan,
                    reference_value=None,
                    status=NOT_FOUND,
                    confidence=_verdict_confidence(NOT_FOUND),
                    source="datas reference",
                    notes="PAN not present in any reference dataset.",
                )
            )

    # --- Udyam cross-check ------------------------------------------------
    if udyam:
        row = ref.udyam_by_number(udyam)
        if row:
            ref_name = row.get("Enterprise Name")
            ref_pan = row.get("PAN")
            ref_gstin = row.get("GSTIN")
            name_status = _name_status(legal_name, ref_name)
            overall = MATCH if name_status in (MATCH, PARTIAL) else MISMATCH
            results.append(
                CheckResult(
                    parameter="udyam_number",
                    label="Udyam registration",
                    extracted_value=udyam,
                    reference_value={
                        "enterprise_name": ref_name,
                        "pan": ref_pan,
                        "gstin": ref_gstin,
                        "enterprise_type": row.get("Enterprise Type"),
                        "annual_turnover": row.get("Annual Turnover (INR)"),
                    },
                    status=overall,
                    confidence=_verdict_confidence(overall),
                    source="datas/udyam_mock_data.csv",
                    notes=f"Name: {name_status}.",
                )
            )
        else:
            results.append(
                CheckResult(
                    parameter="udyam_number",
                    label="Udyam registration",
                    extracted_value=udyam,
                    reference_value=None,
                    status=NOT_FOUND,
                    confidence=_verdict_confidence(NOT_FOUND),
                    source="datas/udyam_mock_data.csv",
                    notes="Udyam number not present in reference dataset.",
                )
            )

    # --- Make in India / local content cross-check ------------------------
    if local_content is not None and mii_company:
        row = ref.mii_by_company(mii_company)
        if row:
            ref_pct = _norm_pct(row.get("Local Content Percentage"))
            ext_pct = _norm_pct(local_content)
            if ref_pct is not None and ext_pct is not None:
                diff = abs(ref_pct - ext_pct)
                status = MATCH if diff <= 1.0 else (PARTIAL if diff <= 5.0 else MISMATCH)
                results.append(
                    CheckResult(
                        parameter="local_content_percentage",
                        label="Make in India local content",
                        extracted_value=local_content,
                        reference_value={
                            "local_content_percentage": row.get("Local Content Percentage"),
                            "declaration_ref": row.get("Declaration Reference Number"),
                            "product": row.get("Product / Service Name"),
                        },
                        status=status,
                        confidence=_verdict_confidence(status),
                        source="datas/makeindia_mock.csv",
                        notes=f"Reference={ref_pct}% vs Extracted={ext_pct}% (delta={diff:.1f}%).",
                    )
                )
            else:
                results.append(
                    CheckResult(
                        parameter="local_content_percentage",
                        label="Make in India local content",
                        extracted_value=local_content,
                        reference_value={"local_content_percentage": row.get("Local Content Percentage")},
                        status=PARTIAL,
                        confidence=_verdict_confidence(PARTIAL),
                        source="datas/makeindia_mock.csv",
                        notes="Could not numerically compare local content percentages.",
                    )
                )
        else:
            results.append(
                CheckResult(
                    parameter="local_content_percentage",
                    label="Make in India local content",
                    extracted_value=local_content,
                    reference_value=None,
                    status=NO_REFERENCE,
                    confidence=_verdict_confidence(NO_REFERENCE),
                    source="datas/makeindia_mock.csv",
                    notes="Company not present in Make in India reference dataset.",
                )
            )

    # --- EPFO establishment cross-check -----------------------------------
    if epfo_id or (extracted_fields.get("epfo") and legal_name):
        if epfo_id:
            epfo_rows = [r for r in ref.epfo if _norm(r.get("EPFO Establishment ID")) == _norm(epfo_id)]
        else:
            epfo_rows = ref.epfo_by_company(legal_name)
        if epfo_rows:
            row = epfo_rows[0]
            name_status = _name_status(legal_name, row.get("Company Name"))
            results.append(
                CheckResult(
                    parameter="epfo_establishment",
                    label="EPFO establishment",
                    extracted_value=epfo_id or legal_name,
                    reference_value={
                        "company_name": row.get("Company Name"),
                        "establishment_id": row.get("EPFO Establishment ID"),
                        "state": row.get("State"),
                    },
                    status=MATCH if name_status in (MATCH, PARTIAL) else MISMATCH,
                    confidence=_verdict_confidence(MATCH if name_status in (MATCH, PARTIAL) else MISMATCH),
                    source="datas/EPFO_ESIC_mock.csv",
                    notes=f"Name: {name_status}.",
                )
            )
        else:
            results.append(
                CheckResult(
                    parameter="epfo_establishment",
                    label="EPFO establishment",
                    extracted_value=epfo_id or legal_name,
                    reference_value=None,
                    status=NOT_FOUND,
                    confidence=_verdict_confidence(NOT_FOUND),
                    source="datas/EPFO_ESIC_mock.csv",
                    notes="Establishment not present in EPFO reference dataset.",
                )
            )

    # --- Document-store cross-check (other uploaded PDFs) ------------------
    if db is not None:
        try:
            store_results = await _store_cross_check(db, extracted_fields, document_id)
            results.extend(store_results)
        except Exception as exc:  # noqa: BLE001 - store check is best-effort
            results.append(
                CheckResult(
                    parameter="document_store_consistency",
                    label="Cross-document consistency",
                    extracted_value=extracted_fields.get("gstin") or extracted_fields.get("pan"),
                    reference_value=None,
                    status=NO_REFERENCE,
                    confidence=_verdict_confidence(NO_REFERENCE),
                    source="documents.ai_extracted",
                    notes=f"Document-store check skipped: {exc!s}",
                )
            )

    summary = {
        "total": len(results),
        "match": sum(1 for r in results if r.status == MATCH),
        "partial": sum(1 for r in results if r.status == PARTIAL),
        "mismatch": sum(1 for r in results if r.status == MISMATCH),
        "not_found": sum(1 for r in results if r.status == NOT_FOUND),
        "no_reference": sum(1 for r in results if r.status == NO_REFERENCE),
    }
    overall = 0.0
    if results:
        overall = round(sum(r.confidence for r in results) / len(results), 3)

    return {
        "document_id": document_id,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "reference_source": "datas/*.csv",
        "store_source": "documents.ai_extracted",
        "reference_datasets_available": ref.available,
        "checks": [r.to_dict() for r in results],
        "summary": summary,
        "overall_confidence": overall,
    }


async def _store_cross_check(
    db: Any,
    extracted_fields: dict[str, Any],
    document_id: str | None,
) -> list[CheckResult]:
    """Compare the document's identifiers against other uploaded documents."""
    from sqlalchemy import select

    from app.models.documents import Document

    gstin = extracted_fields.get("gstin")
    pan = extracted_fields.get("pan") or extracted_fields.get("pan_number")
    legal_name = (
        extracted_fields.get("legal_name")
        or extracted_fields.get("enterprise_name")
        or extracted_fields.get("company_name")
        or extracted_fields.get("name")
    )

    if not gstin and not pan:
        return []

    result = await db.execute(select(Document))
    docs = result.scalars().all()

    matches: list[CheckResult] = []
    for d in docs:
        if document_id and str(d.id) == str(document_id):
            continue
        ai = d.ai_extracted or {}
        ef = ai.get("extracted_fields", {}) if isinstance(ai, dict) else {}
        other_gstin = ef.get("gstin")
        other_pan = ef.get("pan") or ef.get("pan_number")
        other_name = (
            ef.get("legal_name") or ef.get("enterprise_name") or ef.get("company_name") or ef.get("name")
        )
        is_same = (gstin and other_gstin == gstin) or (pan and other_pan == pan)
        if not is_same:
            continue
        name_status = _name_status(legal_name, other_name)
        matches.append(
            CheckResult(
                parameter="document_store_consistency",
                label="Cross-document consistency",
                extracted_value={"gstin": gstin, "pan": pan, "name": legal_name},
                reference_value={"document_id": str(d.id), "file_name": d.file_name, "name": other_name},
                status=MATCH if name_status in (MATCH, PARTIAL) else MISMATCH,
                confidence=_verdict_confidence(MATCH if name_status in (MATCH, PARTIAL) else MISMATCH),
                source="documents.ai_extracted",
                notes=(
                    f"Same GSTIN/PAN also uploaded in document {d.file_name}; "
                    f"company name: {name_status}."
                ),
            )
        )

    if not matches:
        matches.append(
            CheckResult(
                parameter="document_store_consistency",
                label="Cross-document consistency",
                extracted_value={"gstin": gstin, "pan": pan},
                reference_value=None,
                status=NO_REFERENCE,
                confidence=_verdict_confidence(NO_REFERENCE),
                source="documents.ai_extracted",
                notes="No other uploaded document shares this GSTIN/PAN.",
            )
        )
    return matches
