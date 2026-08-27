# MODULE 4 — AI + DOCUMENT INTELLIGENCE
### Owner: Developer 4 · Owns: `app/ai/*` (backend)

> Read `00_SHARED_ARCHITECTURE.md` first — it has the DB schema, full API contract, JSON shapes, shared components, and delivery schedule. This file only covers what's specific to the AI + Document Intelligence module.

## Purpose
The main AI processing system: turns raw PDFs into structured, verifiable data, and powers every AI-facing surface across the platform (eligibility checker, pre-submission check, tender analysis, evidence explanations, procurement copilot).

## Your responsibilities
```text
PDF Processing
OCR
Document Classification
Information Extraction
Tender Requirement Extraction
Entity Resolution
Contradiction Detection
Missing Information Detection
AI Explanation
AI Recommendation
AI Copilot
```

You own no frontend pages — Modules 1, 2, and 3 render your outputs. Build against the frozen JSON contracts below so those teams can mock you until you're live.

---

## 4.1 Document Pipeline

```text
PDF
 ↓
File Validation
 ↓
Text Extraction
 ↓
OCR if required
 ↓
Document Classification
 ↓
Field Extraction
 ↓
Validation
 ↓
Structured Data
```

---

## 4.2 PDF Processing

**Library:** `PyMuPDF`

```text
PDF
 ↓
Check if text exists
 ↓
YES → Extract text
NO  → OCR
```

---

## 4.3 OCR

**Library:** `PaddleOCR`

**Input:** Scanned PDF

**Output:**
```text
Page Number, Text, Bounding Boxes, Confidence
```

Bounding boxes are required — they drive the Evidence Viewer's highlight-on-page feature in Module 2.

---

## 4.4 Document Classification

**Input:** `unknown.pdf`

**Output:**
```json
{
  "document_type": "GST",
  "confidence": 0.96
}
```

**Possible document types:**
```text
GST, PAN, UDYAM, ITR, OEM, EPFO, ESIC, STARTUP, NSIC,
LOCAL_CONTENT, EXPERIENCE, FINANCIAL, DIGILOCKER
```

*(Keep this list in sync with Module 3's Document Type Management — new types added there must be classifiable here.)*

---

## 4.5 Information Extraction

**Example:**
```json
{
  "document_type": "GST",
  "fields": {
    "gstin": "33XXXXXXXXXXXXX",
    "legal_name": "ABC Technologies Pvt Ltd",
    "registration_date": "2023-05-14",
    "status": "ACTIVE"
  }
}
```

All AI output must be validated with Pydantic before it reaches the database or another module.

---

## 4.6 Tender Intelligence

**Input:** `Tender.pdf`

**Output:**
```json
{
  "requirements": [
    { "type": "GST", "required": true },
    { "type": "TURNOVER", "minimum": 100000000 },
    { "type": "LOCAL_CONTENT", "minimum": 50 },
    { "type": "OEM", "required": true }
  ]
}
```

This powers Module 2's "Analyze Tender with AI" step (Section 13.4) and feeds the Compliance Blueprint.

---

## 4.7 Entity Resolution

**Example:**
```text
PAN:  ABC Technologies Pvt Ltd
GST:  ABC Technologies Private Limited
OEM:  ABC Technology Solutions
```

**Output:**
```text
LIKELY SAME ENTITY        Confidence: 87%
```
or
```text
POTENTIAL MISMATCH        Confidence: 94%
```

---

## 4.8 Contradiction Detection

**Example:**
```text
ITR:                  Turnover = ₹15 Cr
Tender Form:          Turnover = ₹12 Cr
Financial Statement:  Turnover = ₹15 Cr
```

**Output:** `POTENTIAL CONTRADICTION`

---

## 4.9 Missing Information Detection

**Example:**
```text
Requirement: OEM Authorization
Documents:   GST.pdf, PAN.pdf, Udyam.pdf
Result:      OEM Authorization Missing
```

---

## 4.10 AI Recommendation

**Input:** Compliance Results + Risk + Evidence

**Output:** `MANUAL REVIEW REQUIRED` (or `APPROVE` / `REJECT`)

```json
{
  "recommendation": "MANUAL_REVIEW",
  "confidence": 0.91,
  "reasons": [
    "Local content below required threshold",
    "OEM authorization requires review"
  ],
  "evidence_ids": ["EV-001", "EV-002"]
}
```

The AI must always provide reasons and evidence references — never a bare verdict. This is Module 2's Section 2.17 input; it is explicitly **not** the final decision.

---

## 4.11 AI Copilot

```http
POST /api/ai/copilot
```

**Input:**
```json
{
  "bid_id": "BID-1024",
  "question": "Why is this bidder high risk?"
}
```

**Output:**
```json
{
  "answer": "The bidder has a local content mismatch...",
  "evidence_ids": ["EV-102", "EV-103"]
}
```

Every answer must reference evidence — no unsupported claims. Consumed by Module 2's Procurement Copilot (Section 2.15).

---

## 4.12 AI Safety / Reliability Rules

**AI must NOT:**
```text
Invent verification results
Invent documents
Invent evidence
Automatically reject bidders
Modify compliance rules
Modify scores without authorization
Make final procurement decisions
```

**AI SHOULD:**
```text
Extract information
Identify inconsistencies
Identify missing information
Explain findings
Recommend review
Reference evidence
```

---

## 4.13 Loading / Progress States

AI operations run asynchronously (Celery + Redis) and must expose meaningful progress to the calling module:

```text
✓ File uploaded
✓ Text extracted
✓ OCR completed
● Extracting information
○ Verification
○ Compliance
○ Risk analysis
```

---

## APIs you own (shared contract, Section 27–37 of `00_SHARED_ARCHITECTURE.md`)
```http
POST /api/ai/tender-analyze
POST /api/ai/document-classify
POST /api/ai/document-extract
POST /api/ai/explain
POST /api/ai/copilot
POST /api/ai/recommendation

POST /api/documents/{id}/process
```

## Integration checkpoints with other modules
- **Module 1 (Bidder Portal):** you power the Eligibility Checker and AI Pre-Submission Check — they build against your mocked `/api/ai/*` contract until you're live.
- **Module 2 (Client Portal):** you power Tender Analysis, Explain Finding, AI Recommendation, and the Procurement Copilot.
- **Module 3 (Admin):** you expose request/success/failure/latency/model-version metrics for their AI Management monitoring UI (Section 3.11) — you don't build that UI, just the data.
- **Module 5 (Compliance):** your document extraction and contradiction-detection output feeds their compliance rules and evidence engine; you never write compliance results or scores directly — that's their write path.
