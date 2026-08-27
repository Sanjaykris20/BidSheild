# MODULE 2 — PROCUREMENT / CLIENT PORTAL
### Owner: Developer 2 · Owns: `/client/*`

> Read `00_SHARED_ARCHITECTURE.md` first — it has the DB schema, full API contract, JSON shapes, shared components, and delivery schedule. This file only covers what's specific to the Client Portal.

## Purpose
Everything related to tender creation and bid evaluation.

## Your responsibilities
```text
Tender creation
Tender publication
Bid evaluation
Compliance dashboard
Risk dashboard
Evidence viewer
Final decision
```

---

## 2.1 Pages
```text
/client/dashboard
/client/tenders
/client/tenders/create
/client/tenders/[id]
/client/tenders/[id]/blueprint
/client/tenders/[id]/live
/client/bids
/client/bids/[id]
/client/bids/[id]/compliance
/client/bids/[id]/risk
/client/bids/[id]/evidence
/client/comparison
/client/clarifications
/client/decisions
/client/reports
/client/audit
```

---

## 2.2 Dashboard

**KPI cards:** `Active Tenders, Total Bidders, Pending Reviews, High Risk Bids, Clarifications`

**Charts:** `Risk Distribution, Tender Status, Verification Status`

**Buttons:** `Create Tender, View Bids, Pending Reviews, Reports`

---

## 2.3 Create Tender (7-step wizard)
```text
1. Basic Details
2. Timeline
3. Financial Details
4. Tender Documents
5. AI Analysis
6. Compliance Blueprint
7. Preview
```

---

## 2.4 AI Tender Analysis

**Button:** `Analyze Tender with AI`

**Pipeline:**
```text
Tender PDF → Text Extraction → OCR if required → AI Analysis → Requirement Extraction
```

**Output:**
```text
24 Requirements Found
Statutory: 8   Financial: 4   Technical: 5   Tender-specific: 7
```

---

## 2.5 Compliance Blueprint

Each requirement contains: `Requirement, Category, Required, Threshold, Evidence, Severity, Rule`

**Buttons:** `Edit, Delete, Add Requirement, Save, Approve Blueprint`

---

## 2.6 Publish Tender

**Pre-publish checklist:** `Tender Information ✓, Documents ✓, Requirements ✓, Compliance Blueprint ✓, Timeline ✓`

**Button:** `Publish Tender`

---

## 2.7 Live Tender

**Display:** `LIVE, Time Remaining, Number of Bidders, Number of Submitted Bids, Pending Bids`

**Buttons:** `View Bid, Run Verification, Extend Tender, Pause, Close Tender`

---

## 2.8 Bid Management

**Filters:** `Tender, Status, Risk, Compliance, Date`

**Columns:** `Bidder, Tender, Compliance, Risk, Verification, Status, Action`

---

## 2.9 Bid Details

**Tabs:** `Overview, Documents, Compliance, Risk, Evidence, AI Recommendation, Clarifications, Audit`

---

## 2.10 Full Verification

**Button:** `Run Full Verification`

**Pipeline:**
```text
Document Verification → Government Verification → Cross-Document Verification →
Compliance Rules → Risk Engine → Evidence → AI Recommendation
```
(This pipeline runs on Module 5's backend — you trigger it and display results.)

---

## 2.11 Compliance Dashboard

**Display:** `82 / 100`, `MEDIUM RISK`

**Summary:** `18 Passed, 3 Review, 2 Failed, 1 N/A`

**Table columns:** `Requirement, Expected, Actual, Result, Evidence, Source, Confidence`

**Buttons:** `View Evidence, Explain Finding, Mark Reviewed, Request Clarification`

---

## 2.12 Evidence Viewer

Split screen:
```text
┌───────────────────────┬──────────────────────┐
│     PDF DOCUMENT      │     AI FINDING        │
│     Page 4            │ Local Content         │
│     [42% highlighted] │ Required: 50%         │
│                        │ Detected: 42%         │
│                        │ Confidence: 98%       │
└───────────────────────┴──────────────────────┘
```

**Buttons:** `Open Document, Explain Finding, View Rule, Download Evidence`

---

## 2.13 Risk Dashboard

**Risk score:** `82 / 100`, `MEDIUM`

**Risk factors:** `Identity Consistency, Statutory Compliance, Financial Eligibility, Technical Eligibility, Documentation, Tender Compliance`

**Risk drivers example:** `HIGH → Local Content, MEDIUM → OEM, LOW → GST, LOW → PAN`

---

## 2.14 Bidder Comparison

Allow selecting multiple bidders. Compare: `Compliance, Risk, GST, PAN, Udyam, Turnover, Local Content, OEM, Debarment`

**Buttons:** `Compare, Export, View Bid`

---

## 2.15 AI Procurement Copilot

**Suggested questions:**
```text
Why is this bidder high risk?
Which requirements failed?
What documents are missing?
Why did local content fail?
Compare selected bidders.
Which bidders require clarification?
```
AI response MUST reference evidence (calls Module 4's `/api/ai/copilot`).

---

## 2.16 Clarification Management

**Fields:** `Bidder, Requirement, Reason, Message, Deadline`

**Buttons:** `Request Clarification, View Response, Resolve, Reopen`

---

## 2.17 Final Decision

**AI recommendation:** `APPROVE / REJECT / MANUAL REVIEW REQUIRED` — this is NOT the final decision.

**Officer chooses:** `Approve, Reject, Request Clarification` (Decision Remarks required)

**Button:** `Submit Final Decision` — every decision generates an audit log.

---

## APIs you consume/own (shared contract, Section 12–13 of `00_SHARED_ARCHITECTURE.md`)
```http
POST   /api/tenders
GET    /api/tenders
GET    /api/tenders/{id}
PUT    /api/tenders/{id}
DELETE /api/tenders/{id}
POST   /api/tenders/{id}/analyze
GET    /api/tenders/{id}/requirements
POST   /api/tenders/{id}/blueprint/approve
POST   /api/tenders/{id}/publish
POST   /api/tenders/{id}/close

GET  /api/bids
GET  /api/bids/{id}

POST /api/verification/run/{bid_id}
POST /api/compliance/run/{bid_id}
GET  /api/compliance/{bid_id}
GET  /api/compliance/{bid_id}/summary
GET  /api/compliance/{bid_id}/failed

POST /api/risk/calculate/{bid_id}
GET  /api/risk/{bid_id}

GET  /api/evidence/{id}
GET  /api/bids/{bid_id}/evidence

POST /api/clarifications
GET  /api/clarifications
POST /api/clarifications/{id}/resolve

POST /api/bids/{id}/decision
GET  /api/bids/{id}/decision

POST /api/ai/copilot
POST /api/ai/explain
```

## Integration checkpoints with other modules
- **Module 1 (Bidder Portal):** you receive their submitted bids and send them clarification requests.
- **Module 4 (AI):** powers Tender Analysis, Explain Finding, and the Procurement Copilot.
- **Module 5 (Compliance):** powers Full Verification, Compliance Dashboard, Risk Dashboard, and Evidence Viewer — this is your most critical backend dependency, mock it first using the frozen JSON contracts.
- **Module 3 (Admin):** compliance rules and risk weight configuration you display come from Admin-managed settings.
