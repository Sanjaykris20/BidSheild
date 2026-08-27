# MODULE 5 — COMPLIANCE + VERIFICATION ENGINE
### Owner: Developer 5 · Owns: `app/verification/*`, `app/compliance/*` (backend)

> Read `00_SHARED_ARCHITECTURE.md` first — it has the DB schema, full API contract, JSON shapes, shared components, and delivery schedule. This file only covers what's specific to the Compliance + Verification module.

## Purpose
The deterministic verification and decision-support engine. Everything here is rules-based, not AI-generated — this is the module that turns government data + AI-extracted fields into a defensible PASS/FAIL/REVIEW score.

## Your responsibilities
```text
Government Verification
Compliance Rules
Tender-specific Rules
Eligibility
Cross Verification
Scoring
Risk
Evidence
Compliance Results
```

You own no frontend pages — Modules 1, 2, and 3 render your outputs. Build against the frozen JSON contracts below so those teams can mock you until you're live.

---

## 5.1 Verification Architecture

```python
class VerificationProvider:
    async def verify(self, identifier):
        pass
```

**Implement:**
```text
GSTProvider
UdyamProvider
PANProvider
IncomeTaxProvider
EPFOProvider
ESICProvider
StartupProvider
NSICProvider
OEMProvider
DigiLockerProvider
DebarmentProvider
```

Each adapter operates in one of: `LIVE, SANDBOX, MOCK`. Government APIs may require credentials, authorization, or onboarding — don't block the demo on real access; default new connectors to `MOCK` and let Module 3's Connector Management UI (Section 3.8) flip environments. **Never claim an unavailable government service is live.**

---

## 5.2 Standard Verification Response

Every connector must return this exact shape:
```json
{
  "status": "VERIFIED",
  "source": "GST",
  "verified_at": "2026-08-24T18:00:00Z",
  "data": {},
  "confidence": 1.0
}
```

**Possible statuses:**
```text
VERIFIED, FAILED, NOT_FOUND, PENDING, UNAVAILABLE, MOCK
```

---

## 5.3 Compliance Rule Engine

```python
if requirement.type == "GST":
    if verification.status == "VERIFIED":
        result = "PASS"
    else:
        result = "FAIL"
```

```python
if actual_local_content >= required_local_content:
    result = "PASS"
else:
    result = "FAIL"
```

Rule definitions themselves are authored by Module 3 (Section 3.9) — you build the engine that evaluates them, not the admin UI that creates them.

**Compliance status enum:**
```text
PASS, FAIL, REVIEW, PENDING, NOT_APPLICABLE, EXPIRED, MISSING, VERIFICATION_FAILED
```

**Rule severity:**
```text
LOW, MEDIUM, HIGH, CRITICAL
```
```text
Debarment → CRITICAL
GST → HIGH
Local Content → HIGH
OEM → HIGH
Missing Supporting Document → MEDIUM
```

---

## 5.4 Compliance Score

```text
GST              10
PAN              10
Udyam            10
Tax              15
Local Content    15
OEM              15
Documents        10
Debarment        15
-------------------
TOTAL           100
```

Weights are editable by Admin (Module 3, Section 3.12) — read them at scoring time, don't hardcode.

```json
{ "score": 82, "risk_level": "MEDIUM" }
```

---

## 5.5 Risk Engine

**Risk levels:**
```text
90–100 → LOW
70–89  → MEDIUM
50–69  → HIGH
0–49   → CRITICAL
```

```json
{
  "risk_drivers": [
    { "factor": "LOCAL_CONTENT", "severity": "HIGH" },
    { "factor": "OEM_AUTHORIZATION", "severity": "MEDIUM" }
  ]
}
```

Risk factors surfaced to Module 2's Risk Dashboard (Section 2.13): `Identity Consistency, Statutory Compliance, Financial Eligibility, Technical Eligibility, Documentation, Tender Compliance`.

---

## 5.6 Evidence Engine

Every compliance result must have evidence — no bare PASS/FAIL.

**Evidence fields:**
```text
Requirement ID, Document ID, Page Number, Extracted Value,
Expected Value, Actual Value, Verification Source, Rule ID,
Result, Confidence
```

**Example:**
```text
Requirement: LOCAL_CONTENT
Expected:    50%
Actual:      42%
Document:    MII_Declaration.pdf
Page:        4
Result:      FAIL
Confidence:  98%
```

This is what Module 2's split-screen Evidence Viewer (Section 2.12) renders directly.

---

## 5.7 Full Verification Pipeline

Triggered by Module 2's "Run Full Verification" button (Section 2.10):
```text
Document Verification → Government Verification → Cross-Document Verification →
Compliance Rules → Risk Engine → Evidence → AI Recommendation
```

The last step calls into Module 4 — you own everything up to and including Evidence; Module 4 owns the Recommendation that follows.

---

## 5.8 Manual Override

Procurement officers may override your findings (Module 2, Final Decision). Every override you accept must be written with:
```text
Officer, Original Result, New Result, Reason, Timestamp
```
and logged to `audit_logs`. You never apply an override automatically — it's a write Module 2 makes through your API after officer confirmation.

---

## APIs you own (shared contract, Section 30–35 of `00_SHARED_ARCHITECTURE.md`)
```http
POST /api/verification/run/{bid_id}
POST /api/verification/gst
POST /api/verification/udyam
POST /api/verification/pan
POST /api/verification/oem
POST /api/verification/debarment

POST /api/compliance/run/{bid_id}
GET  /api/compliance/{bid_id}
GET  /api/compliance/{bid_id}/summary
GET  /api/compliance/{bid_id}/failed

POST /api/risk/calculate/{bid_id}
GET  /api/risk/{bid_id}

GET  /api/evidence/{id}
GET  /api/bids/{bid_id}/evidence
```

## Shared JSON contracts you must honor
```json
// Compliance Result
{
  "score": 82,
  "risk_level": "MEDIUM",
  "passed_count": 18,
  "review_count": 3,
  "failed_count": 2,
  "risk_drivers": ["LOCAL_CONTENT", "OEM_AUTHORIZATION"]
}
```

## Integration checkpoints with other modules
- **Module 1 (Bidder Portal):** their "My Bids" status and Eligibility Checker read your `/api/compliance/{bid_id}` and `/api/risk/{bid_id}` output.
- **Module 2 (Client Portal):** your most critical consumer — Full Verification, Compliance Dashboard, Risk Dashboard, and Evidence Viewer are all direct renders of your output. They'll mock you first using these frozen contracts; keep response shapes stable so they don't need a UI rewrite when you go live.
- **Module 3 (Admin):** they author the compliance rules and risk weights you evaluate against, and they monitor your government connectors — you expose status/environment/latency/error-rate per connector for their Connector Management UI.
- **Module 4 (AI):** they extract and classify the document fields you verify and cross-check; you consume their output but never invent or infer document data yourself.
