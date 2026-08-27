# MODULE 1 — BIDDER / USER PORTAL
### Owner: Developer 1 · Owns: `/user/*` (frontend) + relevant bid/tender-read APIs (backend, via shared FastAPI contract)

> Read `00_SHARED_ARCHITECTURE.md` first — it has the DB schema, full API contract, JSON shapes, shared components, and delivery schedule. This file only covers what's specific to the Bidder Portal.

## Purpose
Everything related to bidder interaction: profile, documents, tender discovery, eligibility checking, bid creation/submission, tracking, and clarifications.

## Your responsibilities
```text
Bidder experience
Tender marketplace
Bid creation
Bid submission
Clarifications
```

---

## 1.1 Pages
```text
/user/dashboard
/user/profile
/user/documents
/user/tenders
/user/tenders/[id]
/user/eligibility/[tenderId]
/user/bids
/user/bids/create
/user/bids/[id]
/user/bids/[id]/review
/user/clarifications
/user/notifications
/user/history
```

---

## 1.2 Dashboard

**Components:**
```text
Welcome Card, Active Bids, Submitted Bids, Under Evaluation, Awarded Bids,
Compliance Health, Recent Bids, Notifications, Expiring Documents
```

**Buttons:**
```text
Browse Tenders, Create Bid, Upload Document, View Compliance, View Notifications
```

---

## 1.3 Profile

**Fields:**
```text
Company Name, Company Type, PAN, GSTIN, Udyam, CIN, Address, State, District,
Pincode, Authorized Representative, Email, Phone
```

**Buttons:**
```text
Edit Profile, Save Changes, Cancel, Verify Company
```

---

## 1.4 Document Vault

**Features:** `Upload, View, Download, Replace, Delete, Verify, Search, Filter`

**Statuses:** `VERIFIED, PENDING, EXPIRED, MISSING, REVIEW_REQUIRED, REJECTED`

---

## 1.5 Tender Marketplace

**Search by:** `Tender ID, Tender Title, Organization, Category`

**Filters:** `Category, Location, Value, Closing Date, Status, Eligibility`

**Buttons:** `View Tender, Check Eligibility, Create Bid, Download Tender`

---

## 1.6 Eligibility Checker

**Flow:**
```text
Tender Requirements + Bidder Profile + Bidder Documents
        ↓
AI Eligibility Engine
        ↓
Eligibility Result
```

**Example:**
```text
86% Eligible

GST           PASS
PAN           PASS
Udyam         PASS
Turnover      PASS
OEM           REVIEW
Local Content FAIL
```

**Buttons:** `View Evidence, Fix Issue, Continue to Bid`

---

## 1.7 Create Bid (5-step wizard)

```text
1. Company Information
2. Technical Proposal
3. Compliance Documents
4. Financial Bid
5. Declaration
```

**Buttons:** `Back, Continue, Save Draft, Review Bid`

---

## 1.8 AI Pre-Submission Check

**Checks:**
```text
Required Documents, Document Validity, Registration, Eligibility,
Tender Requirements, Consistency, Missing Information
```

**Result:**
```text
18 Requirements
15 PASS
2 REVIEW
1 FAIL
```

**Buttons:** `Fix Issue, View Evidence, Run Again, Submit Bid`

---

## 1.9 Bid Submission

**Confirmation shows:** `Bid ID, Tender ID, Version, Document Count, Submission Time`

**Button:** `Confirm & Submit Bid`

---

## 1.10 My Bids

**Columns:** `Tender, Bid ID, Submitted, Status, Compliance, Risk, Action`

**Buttons:** `View, Track, Respond, Download Report`

---

## 1.11 Clarification

**Shows:** `Requirement, Officer Question, Deadline`

**Fields:** `Response, Supporting Document`

**Button:** `Submit Clarification`

---

## APIs you consume (defined in shared contract, Section 12–13 of `00_SHARED_ARCHITECTURE.md`)
```http
GET  /api/users/me
PUT  /api/users/me
GET  /api/users/me/documents

GET  /api/tenders
GET  /api/tenders/{id}

POST /api/bids
GET  /api/bids
GET  /api/bids/{id}
PUT  /api/bids/{id}
POST /api/bids/{id}/submit
POST /api/bids/{id}/precheck

POST /api/documents
GET  /api/documents
GET  /api/documents/{id}
DELETE /api/documents/{id}

POST /api/clarifications
GET  /api/clarifications
POST /api/clarifications/{id}/respond
```

## Bid status enum (shared — do not invent new values)
```text
DRAFT SUBMITTED UNDER_VERIFICATION UNDER_EVALUATION CLARIFICATION_REQUIRED
COMPLIANCE_PASSED COMPLIANCE_FAILED AWARDED REJECTED WITHDRAWN
```

## Integration checkpoints with other modules
- **Module 2 (Client Portal):** publishes the tenders you list; consumes the bids you submit; sends the clarifications you respond to.
- **Module 4 (AI):** powers your Eligibility Checker and AI Pre-Submission Check — build against the mocked `/api/ai/*` contract until real endpoints are ready.
- **Module 5 (Compliance):** produces the compliance/risk status shown on "My Bids" — consume via `GET /api/compliance/{bid_id}` and `GET /api/risk/{bid_id}`.

Until Module 4/5 backends are live, use mock responses matching the frozen JSON contracts in the shared doc — no UI rewrite needed once real APIs land.
