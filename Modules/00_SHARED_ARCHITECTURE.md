# BidShield AI — Shared Architecture

**Version:** 1.0 · **Platform:** BidShield AI Enterprise v2.4 · **Generated:** 2026-08-27

> This is the **single source of truth for cross-cutting concerns**. Each module doc
> (`01`…`05`) covers only what is specific to its owner. Read this first. It defines
> the data model, the frozen API contract, the shared JSON shapes, shared UI
> components, the verification pipeline, and the delivery schedule that every
> module aligns to.

---

## 0.1 Table of Contents

1. [Architecture Overview](#02-architecture-overview)
2. [Roles & Personas](#03-roles--personas)
3. [Data Model (DB Schema)](#04-data-model)
4. [Core Enums](#05-core-enums)
5. [API Contract (Master)](#06-api-contract)
6. [Shared JSON Contracts](#07-shared-json-contracts)
7. [Verification Pipeline](#08-verification-pipeline)
8. [Compliance & Scoring](#09-compliance--scoring)
9. [Risk Engine](#10-risk-engine)
10. [Evidence Engine](#11-evidence-engine)
11. [Shared UI Components & Design System](#12-shared-ui-components)
12. [Shared Libraries (Backend)](#13-shared-libraries-backend)
13. [Cross-Module Integration Map](#14-cross-module-integration-map)
14. [Delivery Schedule](#15-delivery-schedule)
15. [Conventions & Freeze Policy](#16-conventions--freeze-policy)

---

## 0.2 Architecture Overview

BidShield AI is a **unified Next.js 14 application** (frontend/API) backed by an
in-memory `platformDataStore` (a stand-in for the production Postgres/SQLite
layer). All five functional modules — Bidder Portal, Procurement / Client Desk,
Admin Control Center, AI Services, and Compliance & Verification Engine — share
this single application and data layer.

```
                         ┌──────────────────────────┐
                         │   BidShield AI Platform  │
                         │   (Next.js 14 App)       │
  Vendor / Bidder  ◄────┤   frontend/src/  (UI)    ├────►  Admin / Control Center
  (Module 1)              │   ┌──────────────────┐   │       (Module 3)
                         │   │ platformDataStore│   │
                         │   │  (single source  │   │
                         │   │   of truth)      │   │
  Procurement Officer ◄──┤   └──────────────────┘   ├────►  AI / Verification
  (Module 2)              │       │    │    │       │       (Modules 4 & 5)
                         │       ▼    ▼    ▼       │
                         │   API / lib layers      │
                         └──────────┬──────────────┘
                                    ▼
                         ┌──────────────────────────┐
                         │   bidcompliance.db       │
                         │   (SQLite / future PG)   │
                         └──────────────────────────┘
```

**Key property:** `platformDataStore` (at
`frontend/src/lib/data/platformDataStore.ts`) is the **single source of truth**
for bid, tender, user, document, audit, and connector state. **Every** status
change — officer decision, clarification respond/approve, verification run,
risk calculation, compliance run — flows through `platformStore.updateBid()` and
writes an entry to the audit log. There are no race conditions because all
pages read from the same store.

---

## 0.3 Roles & Personas

| Role (enum) | Label used in UI | Portal prefix | Data scope |
|---|---|---|---|
| `BIDDER` | Vendor Portal | `/bidder/*` | Own bids, own documents, own clarifications |
| `CLIENT` / `PROCUREMENT_OFFICER` | Procurement Desk | `/client/*` | All bids for assigned tenders, all clarifications they raised |
| `ADMIN` / `AUDITOR` | Control Center | `/admin/*` | System-wide — all tenders, all bids, all users, global audit |

Role-based access is enforced **inside the API handlers** (see the AI Copilot
handler at `frontend/src/app/api/ai/copilot/route.ts:28-65` for the pattern): the
handler receives `role` in the request body and filters the data it returns.
Bidders can never see another bidder's data, officers can see all bids, admins
see aggregate statistics.

---

## 0.4 Data Model

The canonical type definitions live in **`frontend/src/types/index.ts`**.
They are the frozen contract for the DB schema. Each top-level interface maps to
a logical table. Below is the entity relationship summary; each section links to
the exact interface and its key fields.

### Entities

#### `User` / `AdminUser` (`types/index.ts:367`)
The authenticated principal. A user has a `role`, `organization`,
`department`, `status` (ACTIVE / SUSPENDED / DEACTIVATED / PENDING_VERIFICATION),
`twoFactorEnabled`, and `assignedTendersCount` / `activeBidsCount`.

#### `OrganizationEntity` (`types/index.ts:401`)
Organization + department grouping. Fields: `organization`, `department`,
`code`, `address`, `status`, `assignedOfficers[]`, `tendersCount`.

#### `ClientEntity` (`types/index.ts:386`)
A client organization (PSU / Central Ministry / State Govt / etc.). Fields:
`name`, `shortCode`, `category`, `department`, `status`,
`procurementOfficersCount`, `activeTendersCount`, `totalProcurementValue`.

#### `Tender` (`types/index.ts:271`)
A procurement notice. Fields: `tenderNumber`, `title`, `organization`,
`department`, `category`, `estimatedValue` / `estimatedValueINR`,
`publishedDate`, `closingDate`, `status` (`TenderStatus`), `assignedOfficer`,
`scopeOfWork[]`, `eligibilityCriteria[]`, `boqItems[]`, `complianceRuleIds[]`,
`bidsCount`, `location`, `emdAmountFormatted`, `tags[]`, `requirementsCount`.

#### `Bid` (`types/index.ts:315`)
A vendor's submission. **This is the central aggregate root.** Fields:

| Field | Type | Notes |
|---|---|---|
| `id` / `bidId` | string | `id` = numeric (e.g. `BID-1024`), `bidId` = canonical (e.g. `BID-2026-00891`) |
| `tenderId` / `tenderNumber` / `tenderTitle` | string | FK to Tender |
| `bidderId` / `bidderName` | string | FK to User |
| `gstin`, `pan`, `udyam` | string | Extracted/verified identifiers |
| `submittedAt` | string (ISO) | |
| `status` | `BidStatus` | See [0.5](#05-core-enums) |
| `financialBid` | string | Formatted commercial value |
| `quotedValueINR` | number | |
| `priceBreakdown` | `CommercialPriceBreakdown` | GST rate, freight, totals |
| `complianceScore` | number (0–100) | Aggregate of weighted rule results |
| `riskLevel` | `RiskLevel` | LOW / MEDIUM / HIGH / CRITICAL |
| `localContentPercent` | number | % extracted from MII declaration |
| `documents[]` | `DocumentItem[]` | Attached documents |
| `verifications[]` | `StatutoryVerification[]` | Per-connector results |
| `requirements[]` | `RequirementEvaluation[]` | Per-rule pass/fail/review list |
| `evidenceList[]` | `EvidenceItem[]` | Traceable evidence rows |
| `riskResult?` | `RiskAnalysisResult` | Detailed risk drivers |
| `aiRecommendation?` | `AIRecommendation` | Advisory only |
| `auditTimeline[]` | `AuditTimelineStage[]` | Stage-numbered timeline |
| `officerDecision?` | `{ action, decisionStatus, remarks, decidedBy, decidedAt }` | Final human determination |

#### `DocumentItem` (`types/index.ts:123`)
A document on a bidder. Fields: `name`, `category` (`DocCategory`),
`docNumber`, `uploadedAt`, `expiryDate`, `status` (`DocStatus`), `source`
(verification source), `confidence`, `fileType`, `hashSha256`,
`extractedFields[]` (`ExtractedField[]` with bounding boxes), `verificationMode`,
`isVerifiedByGovt`, `govtVerificationSource`.

`ExtractedField` (`types/index.ts:115`) carries `label`, `value`,
`confidence`, and optional `boundingBox { x, y, width, height }` +
`pageNumber` — the bounding boxes drive Module 2's Evidence Viewer
highlight-on-page feature.

#### `UploadedDocumentRecord` (`types/index.ts:90`)
The upload transaction record (distinct from the catalog `DocumentItem`). Carries
`storageReference`, `hashSha256`, `extractedData`, `ocrText`, processing status.

#### `StatutoryVerification` (`types/index.ts:147`)
One row **per statutory connector** on a bid. Fields: `type` (GST /
Udyam / PAN / Income Tax / EPFO / ESIC / Startup India / NSIC / OEM /
DigiLocker / Debarment / eProcure), `status` (`VerificationStatus`), `source`,
`verification_mode`, `verifiedAt`, `confidence`, `latencyMs`, `data`, `remarks`.

#### `ComplianceRule` (`types/index.ts:168`)
An admin-authored rule. Fields: `ruleCode`, `title`, `description`, `category`,
`parameter`, `operator` (EQUALS / GREATER_EQUAL / LESS_EQUAL / CONTAINS /
IS_TRUE / NOT_EXPIRED), `thresholdValue`, `weightPercent`, `severity`
(CRITICAL / HIGH / MEDIUM / LOW), `status` (ACTIVE / DISABLED), `version`,
`updatedAt`, `lastModifiedBy`.

#### `RequirementEvaluation` (`types/index.ts:213`)
One row **per rule applied to a bid**. Produced by Module 5's rule engine
(owned by Module 3's rule config). Fields: `ruleId`, `ruleCode`, `title`,
`category`, `expected`, `extracted`, `difference`, `status`
(`ComplianceStatus`), `severity`, `weight`, `scoreContribution`, `confidence`,
`sourceDoc`, `page`, `snippetHtml`, `aiExplanation`, plus optional override
fields (`isOverridden`, `overrideRemarks`, `overriddenBy`, `overriddenAt`).

#### `EvidenceItem` (`types/index.ts:193`)
The traceability row. Fields: `requirementId`, `ruleId`, `ruleTitle`,
`documentId`, `documentName`, `pageNumber`, `extractedValue`, `expectedValue`,
`actualValue`, `verificationSource`, `result`, `confidence`, `severity`,
`snippetHtml`, `aiTraceExplanation`, `boundingBox`. **Every compliance result
must have evidence — no bare PASS/FAIL.**

#### `RiskAnalysisResult` / `RiskDriver` (`types/index.ts:246` / `238`)
`riskLevel`, category `categoryBreakdown`, `drivers[]` (factor + severity +
description + evidenceRef).

#### `AIRecommendation` (`types/index.ts:261`)
`recommendation` (APPROVE / REJECT / MANUAL_REVIEW / REQUEST_CLARIFICATION),
`confidence`, `headline`, `reasons[]`, `evidenceIds[]`, `isMock`, `generatedAt`.

#### `GemReservationStatus` (`types/index.ts:272`) — **GeM MPS Reservation Policy**
**New.** Tracks compliance with the Government of India *Public Procurement
Policy for Micro and Small Enterprises* (GeM MPS), the mandatory sourcing
priorities the user added. Fields:
- `isMSE` / `msmeEnterpriseType` (MICRO / SMALL / MEDIUM)
- `emdExemptionEligible`, `tenderFeeExemptionEligible` — verified MSE/SC/ST/Women
  are **mandatorily exempt** from EMD and tender fees
- `eligibleForPurchasePreference`, `purchasePreferenceBand` (`L1 + 15%`) —
  eligible bidders get a chance to match the lowest evaluated (L1) price
- `scVerified`, `stVerified`, `womenOwnedVerified` / `reservationCategories[]`
- `msmeProcurementPercentClaimed` (25%), `scstReservationPercentClaimed` (4%),
  `womenReservationPercentClaimed` (3%)

Stored on the `Bid` (`bid.reservationStatus`), derived by
`POST /api/verification/run/{bid_id}` from the SC/ST/Women/Udyam verification
results, and surfaced in the officer Copilot and Compliance Dashboard.

#### `ClarificationItem` (`types/index.ts:350`)
The clarification thread header. Fields: `bidId`, `bidderName`,
`tenderNumber`, `tenderTitle`, `subject`, `message`, `requestedBy`,
`requestedAt`, `dueDate`, `status`
(PENDING_RESPONSE / RESPONDED / RESOLVED / CLOSED), `bidderResponse`,
`bidderResponseAt`, `attachedDocNames[]`.

#### `AuditLog` / `AuditLogEntry` (`types/index.ts:515`)
`tamper-evident` event row. Fields: `timestamp`, `actor`, `role`, `action`,
`resource`, `resourceId`, `result`, `ipAddress`, `details`, `hash`.

#### `ConnectorConfig` (`types/index.ts:416`) and `ConnectorLog` (`types/index.ts:435`)
The 11 government gateways. Each connector: `type` (enum), `status`
(ONLINE / DEGRADED / OFFLINE), `environment` (LIVE / OPEN_DATA / SANDBOX /
MOCK / UNAVAILABLE), `endpointUrl`, `apiKeyMasked`, `responseTime`,
`errorRate`, `successRate`, `requests24h`, `rateLimitPerMin`, and a `ConnectorLog`
history per call.

#### `ScoringWeightsConfig` / `RiskWeightConfig` (`types/index.ts:504` / `556`)
Admin-editable weightings: `gst`, `pan`, `udyam`, `tax`, `localContent`,
`oem`, `documents`, `debarment` (sum = 100). Read at scoring time, never
hardcoded in Module 5.

#### `RiskThresholdBand` (`types/index.ts:567`)
Score bands → level: 90–100 LOW, 70–89 MEDIUM, 50–69 HIGH, 0–49 CRITICAL.

#### `SystemSettingsConfig` (`types/index.ts:616`)
Nested settings groups: `general`, `security`, `ai`, `compliance`,
`notifications`, `storage`. Edited in Module 3.15.

---

## 0.5 Core Enums

All enums are frozen in `types/index.ts`. Do **not** invent new values.

| Enum | File location | Values |
|---|---|---|
| `UserRole` | `types/index.ts:1` | `BIDDER`, `CLIENT`, `ADMIN`, `PROCUREMENT_OFFICER`, `AUDITOR` |
| `BidStatus` | `types/index.ts:26` | `DRAFT`, `SUBMITTED`, `UNDER_VERIFICATION`, `UNDER_EVALUATION`, `CLARIFICATION_REQUIRED`, `COMPLIANCE_PASSED`, `COMPLIANCE_FAILED`, `QUALIFIED`, `DISQUALIFIED`, `AWARDED`, `REJECTED`, `WITHDRAWN` |
| `TenderStatus` | `types/index.ts:15` | `DRAFT`, `UPCOMING`, `LIVE`, `UNDER_EVALUATION`, `CLOSED`, `AWARDED`, `CANCELLED`, `SUSPENDED`, `ARCHIVED` |
| `ComplianceStatus` | `types/index.ts:3` | `PASS`, `FAIL`, `REVIEW`, `PENDING`, `NOT_APPLICABLE`, `EXPIRED`, `MISSING`, `VERIFICATION_FAILED` |
| `RiskLevel` | `types/index.ts:13` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `DocStatus` | `types/index.ts:50` | `VERIFIED`, `FAILED`, `PENDING`, `EXPIRED`, `MISSING`, `UPLOADED`, `ACTION_REQUIRED` |
| `VerificationStatus` | `types/index.ts:54` | `VERIFIED`, `FAILED`, `NOT_FOUND`, `PENDING`, `UNAVAILABLE`, `MOCK` |
| `VerificationMode` / `ConnectorEnvironment` | `types/index.ts:52` / `413` | `LIVE`, `OPEN_DATA`, `SANDBOX`, `MOCK`, `UNAVAILABLE` |
| `RiskWeightConfig`, `ScoringWeightsConfig` | `types/index.ts:556` / `504` | `gst`, `pan`, `udyam`, `tax`, `localContent`, `oem`, `documents`, `debarment` |

### Status transition map (Bid)

This is the source of truth for state machine behavior. Module 2's Final
Decision handler (`frontend/src/app/api/decisions/route.ts:21-41`) and
clarification handlers enforce these:

```text
OFFICER ACTION (Module 2 Final Decision)
  approve    → Qualification status: QUALIFIED          (decision: Qualified / Approved for Financial Evaluation)
  clarify    → Qualification status: CLARIFICATION_REQUIRED (creates clarification, notifies bidder)
  reject     → Qualification status: DISQUALIFIED       (decision: Disqualified / Non-Compliant)

CLARIFICATION FLOW
  Officer requests clarification → CLARIFICATION_REQUIRED
  Bidder responds (uploads docs) → UNDER_EVALUATION  (AI re-verification auto-triggered)
  Officer approves response      → QUALIFIED         (docs → VERIFIED, reqs → PASS)
  (Officer can re-request clarification → back to CLARIFICATION_REQUIRED)

VERIFICATION PIPELINE (Module 5, triggered by Module 2 "Run Full Verification")
  Run Full Verification → UNDER_VERIFICATION → (compliance run) → UNDER_EVALUATION
```

---

## 0.6 API Contract (Master)

This is the **frozen** contract. Every route below is implemented as a Next.js
Route Handler under `frontend/src/app/api/`. Routes are grouped by owning
module. `bid_id` = the canonical bid id (e.g. `BID-2026-00891`) or numeric
(`BID-1024`); handlers accept both via `platformStore.getBidById()`.

### Shared / Auth
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `GET` | `/api/audit` | — | Master audit ledger (all roles) |

### Module 1 (Bidder Portal)
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `GET` | `/api/users/me` | M1 | Authenticated bidder profile |
| `PUT` | `/api/users/me` | M1 | Update bidder profile |
| `GET` | `/api/users/me/documents` | M1 | Bidder's uploaded docs |
| `GET` | `/api/tenders` | M2 (shared) | Tender marketplace listing |
| `GET` | `/api/tenders/{id}` | M2 (shared) | Tender detail |
| `POST` | `/api/bids` | M1 | Create a bid draft |
| `GET` | `/api/bids` | M2 | List bids (filtered by caller role) |
| `GET` | `/api/bids/{id}` | M1/M2 | Bid detail |
| `PUT` | `/api/bids/{id}` | M1 | Update bid draft |
| `POST` | `/api/bids/{id}/submit` | M1 | Submit bid (status → SUBMITTED) |
| `POST` | `/api/bids/{id}/precheck` | M1 | AI Pre-Submission Check |
| `POST` | `/api/documents` | M1 | Upload a document |
| `GET` | `/api/documents` | M1 | List documents |
| `GET` | `/api/documents/{id}` | M1 | Document detail |
| `DELETE` | `/api/documents/{id}` | M1 | Delete document |
| `GET` | `/api/documents/{id}/view` | M1 | View document content |
| `GET` | `/api/documents/{id}/download` | M1 | Download document |
| `POST` | `/api/documents/upload` | M1 | Upload transaction |
| `POST` | `/api/documents/{id}/process` | M4 | Trigger PDF→OCR→extract (see 5.8) |
| `POST` | `/api/clarifications` | M2 | Officer requests clarification |
| `GET` | `/api/clarifications` | M1/M2 | List clarifications |
| `POST` | `/api/clarifications/respond` | M1 | Bidder responds + uploads docs |
| `POST` | `/api/clarifications/approve` | M2 | Officer approves response |

### Module 2 (Procurement / Client Portal)
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `POST` | `/api/tenders` | M2 | Create tender |
| `GET` | `/api/tenders` | M2 | List tenders |
| `GET` | `/api/tenders/{id}` | M2 | Tender detail |
| `PUT` | `/api/tenders/{id}` | M2 | Update tender |
| `DELETE` | `/api/tenders/{id}` | M2 | Delete tender |
| `POST` | `/api/tenders/live` | M2 | Live tender view / status |
| `POST` | `/api/tenders/{id}/analyze` | M4 | AI Tender Analysis (requirement extraction) |
| `GET` | `/api/tenders/{id}/requirements` | M5 | Requirement list |
| `POST` | `/api/tenders/{id}/blueprint/approve` | M2 | Approve blueprint |
| `POST` | `/api/tenders/{id}/publish` | M2 | Publish tender (status → LIVE) |
| `POST` | `/api/tenders/{id}/close` | M2 | Close tender |
| `POST` | `/api/decisions` | M2 | Commit final officer decision |
| `GET` | `/api/decisions` | M2 | (reserved) decision lookup |
| `POST` | `/api/clarifications/{id}/resolve` | M2 | Resolve a clarification |
| `POST` | `/api/verification/run/{bid_id}` | M5 | Run full verification pipeline |
| `POST` | `/api/compliance/run/{bid_id}` | M5 | Run compliance rules → score |
| `GET` | `/api/compliance/{bid_id}` | M5 | Full compliance result |
| `GET` | `/api/compliance/{bid_id}/summary` | M5 | Pass/review/fail summary |
| `GET` | `/api/compliance/{bid_id}/failed` | M5 | Only failed requirements |
| `GET` | `/api/evidence/{id}` | M5 | Single evidence item |
| `GET` | `/api/bids/{bid_id}/evidence` | M5 | All evidence for a bid |

### Module 3 (Admin Control Center)
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/users` | M3 | User list |
| `GET` | `/api/admin/rules` | M3 | Compliance rules list |
| `POST` | `/api/admin/rules` | M3 | Create/edit rule |
| `GET` | `/api/admin/connectors` | M3 | Government gateways status |
| `POST` | `/api/admin/connectors` | M3 | Configure connector |
| `GET` | `/api/admin/risk` | M3 | Risk weight config |
| `POST` | `/api/admin/risk` | M3 | Update risk weights |

### Module 4 (AI Services)
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `POST` | `/api/ai/tender-analyze` | M4 | Extract requirements from tender PDF |
| `POST` | `/api/ai/document-classify` | M4 | Classify unknown PDF → document type |
| `POST` | `/api/ai/document-extract` | M4 | Field extraction + bounding boxes |
| `POST` | `/api/ai/explain` | M4 | Explain a compliance finding |
| `POST` | `/api/ai/copilot` | M4 | Context-aware Q&A |
| `POST` | `/api/ai/recommendation` | M4 | Generate AI recommendation |

### Module 5 (Compliance & Verification Engine)
| Method | Route | Owned by | Purpose |
|---|---|---|---|
| `POST` | `/api/verification/gst` | M5 | GST connector |
| `POST` | `/api/verification/udyam` | M5 | Udyam/MSME connector |
| `POST` | `/api/verification/pan` | M5 | PAN connector |
| `POST` | `/api/verification/oem` | M5 | OEM authorization connector |
| `POST` | `/api/verification/debarment` | M5 | CVC debarment connector |
| `POST` | `/api/verification/eprocure` | M5 | eProcure/CPPP connector |
| `POST` | `/api/verification/[type]` | M5 | Generic per-type dispatch |
| `POST` | `/api/verification/run/[bid_id]` | M5 | Full per-bid verification run |
| `POST` | `/api/risk/calculate/{bid_id}` | M5 | Compute risk score + drivers |
| `GET` | `/api/risk/{bid_id}` | M5 | Cached risk analysis |

### 11 Statutory Verification Gateways (Module 5)

| # | Connector | Type | Default environment | Notes |
|---|---|---|---|---|
| 1 | GSTN Portal API | `GST` | `MOCK` (live key available) | GSTIN validation + filing timeline |
| 2 | Udyam MSME (data.gov.in) | `Udyam` | `OPEN_DATA` | Turnover tiers, small-enterprise fee waiver |
| 3 | PAN NSDL Gateway | `PAN` | `MOCK` | PAN ledger + name match |
| 4 | Income Tax | `Income Tax` | `MOCK` | ITR verification |
| 5 | EPFO | `EPFO` | `MOCK` | Establishment registration |
| 6 | ESIC | `ESIC` | `MOCK` | Employee insurance |
| 7 | Startup India | `Startup India` | `MOCK` | Recognition certificate |
| 8 | NSIC | `NSIC` | `MOCK` | MSME registration |
| 9 | OEM Authorization | `OEM` | `MOCK` | Product authorization |
| 10 | DigiLocker | `DigiLocker` | `MOCK` | Digilocker-issued docs |
| 11 | Central Debarment Registry (CVC) | `Debarment` | `OPEN_DATA` | Ban list across ministries/CPSEs |
| 12 | eProcure / CPPP Portal | `eProcure` | `OPEN_DATA` | Public procurement tender registry |

> New connectors default to `MOCK`. Module 3's Connector Management UI flips
> environments. **Never claim an unavailable government service is live.**

---

## 0.7 Shared JSON Contracts

These shapes are frozen. Module 5 owns all compliance/risk/evidence output;
Module 4 owns AI output. Modules 1 & 2 consume but never write these directly.

### Statutory Verification Types (owned by Module 5)
The 11 government gateways **plus** the 3 GeM MSP reservation verifiers:

| # | Connector | Type | Default environment | GeM MPS relevance |
|---|---|---|---|---|
| 1 | GSTN Portal API | `GST` | `MOCK` (live key available) | — |
| 2 | Udyam / data.gov.in | `Udyam` | `OPEN_DATA` | 25% MSE mandatory procurement; EMD/tender-fee waiver |
| 3 | PAN NSDL Gateway | `PAN` | `MOCK` | identity consistency |
| 4 | Income Tax e-Filing | `Income Tax` | `MOCK` | 3-year ITR |
| 5 | EPFO Database Gateway | `EPFO` | `MOCK` | — |
| 6 | ESIC Insurance Portal | `ESIC` | `MOCK` | — |
| 7 | Startup India DPIIT | `Startup India` | `MOCK` | — |
| 8 | NSIC Single Point Reg. | `NSIC` | `MOCK` | — |
| 9 | OEM Direct Ledger | `OEM` | `MOCK` | — |
| 10 | DigiLocker | `DigiLocker` | `MOCK` | — |
| 11 | CVC Debarment Register | `Debarment` | `OPEN_DATA` | integrity gating |
| 12 | eProcure / CPPP | `eProcure` | `OPEN_DATA` | tender sourcing |
| 13 | National SC Certificate Register | `SC` | `OPEN_DATA` | **4% SC sub-quota + EMD exemption** |
| 14 | National ST Certificate Register | `ST` | `OPEN_DATA` | **4% ST sub-quota + EMD exemption** |
| 15 | GeM Women Enterprise Index | `Women` | `OPEN_DATA` | **3% Women sub-quota + EMD exemption** |

> New connectors default to `MOCK`/`OPEN_DATA`. Module 3's Connector Management
> UI flips environments. **Never claim an unavailable government service is
> live.** The SC/ST/Women verifiers cross-check uploaded caste/WEE certificates
> and ownership share (Women ≥51%) against the open-data national registers.

### Standard Verification Response (per statutory connector)
Every connector returns this exact shape (`frontend/src/lib/verification/verificationProvider.ts`):

```jsonc
{
  "status": "VERIFIED",            // VERIFIED | FAILED | NOT_FOUND | PENDING | UNAVAILABLE | MOCK
  "source": "GSTN Portal API",
  "verified_at": "2026-08-24T18:00:00Z",
  "data": { "gstin": "27XXXXXXXXXXX", "legal_name": "...", "status": "ACTIVE" },
  "confidence": 1.0,
  "latencyMs": 40,
  "verification_mode": "MOCK"
}
```

### Compliance Result (summary, `types/index.ts:227`)
```jsonc
{
  "score": 82,
  "risk_level": "MEDIUM",
  "passed_count": 18,
  "review_count": 3,
  "failed_count": 2,
  "risk_drivers": ["LOCAL_CONTENT", "OEM_AUTHORIZATION"]
}
```

### Requirement Evaluation (`types/index.ts:213`)
```jsonc
{
  "id": "REQ-001",
  "ruleId": "RULE-001",
  "ruleCode": "REQ-GST-01",
  "title": "GST registration must be active",
  "category": "Statutory",
  "expected": "Active",
  "extracted": "Active",
  "status": "PASS",            // ComplianceStatus
  "severity": "HIGH",
  "weight": 10,
  "scoreContribution": 10,
  "confidence": 0.99,
  "sourceDoc": "GST_Certificate.pdf",
  "page": 1,
  "snippetHtml": "<mark>GSTIN</mark> 27XXX...",
  "aiExplanation": "...",
  "isOverridden": false
}
```

### Evidence Item (`types/index.ts:193`)
```jsonc
{
  "id": "EV-001",
  "requirementId": "REQ-LC-01",
  "ruleId": "RULE-LC-01",
  "ruleTitle": "Minimum Local Content 50%",
  "documentId": "DOC-042",
  "documentName": "MII_Declaration.pdf",
  "pageNumber": 4,
  "extractedValue": "42%",
  "expectedValue": "50%",
  "actualValue": "42%",
  "verificationSource": "Make-In-India Declaration",
  "result": "FAIL",
  "confidence": 0.98,
  "severity": "HIGH",
  "boundingBox": { "x": 120, "y": 340, "width": 260, "height": 40 }
}
```

### AI Recommendation (`types/index.ts:261`)
```jsonc
{
  "recommendation": "MANUAL_REVIEW",
  "confidence": 0.91,
  "headline": "Review recommended for Local Content & OEM",
  "reasons": ["Local content below required threshold", "OEM authorization requires review"],
  "evidence_ids": ["EV-001", "EV-002"],
  "is_mock": true,
  "generated_at": "2026-08-24T18:00:00Z"
}
```

### AI Copilot (`frontend/src/app/api/ai/copilot/route.ts:71`)
Request:
```jsonc
{ "question": "Why is this bidder high risk?", "bid_id": "BID-1024", "role": "CLIENT" }
```
Response:
```jsonc
{
  "answer": "The bidder has a local content mismatch...",
  "confidence": 0.95,
  "evidenceIds": ["EV-102", "EV-103"],
  "groundingSources": ["Make_In_India_Declaration.pdf (p.1)", "GSTN Portal API", "PAN NSDL Gateway", "CVC Registry"],
  "isMock": false
}
```

---

## 0.8 Verification Pipeline

Triggered by Module 2's **"Run Full Verification"** button →
`POST /api/verification/run/{bid_id}`. The pipeline runs sequentially; each
stage is instrumented to the loading/progress state (Module 4, Section 4.13):

```text
1. Document Verification     (M4 document-extract + field extraction)
2. Government Verification   (M5 statutory connectors: GST, PAN, Udyam, ...)
3. Cross-Document Verification (M4 entity resolution: name consistency)
4. Compliance Rules          (M5 rule engine → REQUIREMENT_EVALUATION rows)
5. Risk Engine               (M5 → risk level + drivers)
6. Evidence                  (M5 → EVIDENCE_ITEM rows, every result must have evidence)
7. AI Recommendation         (M4 — only after Evidence; never before)
8. Reservation derivation     (GeM MPS: EMD exemption + L1+15% preference → `bid.reservationStatus`)
```

**Ownership boundary:** Module 5 owns everything up to and including Evidence
(own section 5.7). Module 4 owns the Recommendation. Module 4 never writes
compliance results or scores. The **Reservation derivation** (step 8) is owned
by the verification pipeline (Module 5) — it reads the SC/ST/Women + Udyam
verification results and writes `GemReservationStatus` onto the bid.

---

## 0.9 Compliance & Scoring

### 9.1 Scoring weights (admin-editable, `ScoringWeightsConfig`)
Read at scoring time from Module 3's risk config (`frontend/src/app/api/admin/risk/route.ts`),
**never hardcoded** in Module 5:

| Factor | Weight |
|---|---|
| GST | 10% |
| PAN | 10% |
| Udyam | 10% |
| Tax | 15% |
| Local Content | 15% |
| OEM | 15% |
| Documents | 10% |
| Debarment | 15% |
| **Total** | **100%** |

### 9.2 GeM MPS Reservation Rules (admin-authored, added 2026-08-27)

These rules enforce the Government of India *Public Procurement Policy for MSEs*
(25% mandatory MSE sourcing, 4% SC/ST sub-quota, 3% Women sub-quota, EMD
exemption, and L1 + 15% purchase preference). They are normalized into the
total score by `scoringEngine` — `totalWeight` / `earnedScore` accumulate across
all rules, so adding them does not break the 0–100 scale.

| Rule code | Title | Parameter | Weight | Severity |
|---|---|---|---|---|
| `REQ-SCST-01` | SC / ST Caste Certificate Validation (4% Sub-Quota) | `sc_st_qualification` | 10 | HIGH |
| `REQ-WOMEN-01` | Women-Owned Enterprise Validation (3% Sub-Quota) | `women_entrepreneur` | 10 | HIGH |
| `REQ-EMD-01` | GeM MPS EMD Exemption | `emd_exemption` | 8 | HIGH |
| `REQ-PP-01` | GeM MPS Purchase Preference (L1 + 15%) | `mse_purchase_preference` | 7 | MEDIUM |

### 9.3 Rule evaluation
```python
# M5 rule engine (types/index.ts:168, ComplianceRule)
if requirement.type == "GST":
    if verification.status == "VERIFIED":
        result = "PASS"
    else:
        result = "FAIL"

if actual_local_content >= required_local_content:
    result = "PASS"
else:
    result = "FAIL"
```

Rule severity map (`types/index.ts:98`):
- `Debarment` → CRITICAL
- `GST` → HIGH
- `Local Content` → HIGH
- `SC / ST` → HIGH
- `Women Enterprise` → HIGH
- `EMD Exemption` → HIGH
- `OEM` → HIGH
- `Missing Supporting Document` → MEDIUM

### 9.3 Compliance status enum (`ComplianceStatus`)
`PASS`, `FAIL`, `REVIEW`, `PENDING`, `NOT_APPLICABLE`, `EXPIRED`, `MISSING`, `VERIFICATION_FAILED`

---

## 0.10 Risk Engine

### 10.1 Risk level bands (read from `RiskThresholdBand`, admin-editable)
| Score range | Level |
|---|---|
| 90–100 | LOW |
| 70–89 | MEDIUM |
| 50–69 | HIGH |
| 0–49 | CRITICAL |

### 10.2 Risk factors surfaced to Module 2's Risk Dashboard
`Identity Consistency`, `Statutory Compliance`, `Financial Eligibility`,
`Technical Eligibility`, `Documentation`, `Tender Compliance`.

---

## 0.11 Evidence Engine

Every compliance result must carry evidence — no bare PASS/FAIL
(Module 5, Section 5.6). Evidence fields (`EvidenceItem`): Requirement ID,
Document ID, Page Number, Extracted Value, Expected Value, Verification
Source, Rule ID, Result, Confidence, bounding box.

The Evidence Viewer (Module 2, Section 2.12) renders these directly,
including the glowing amber `.evidence-highlight` bounding-box overlay on the
PDF page.

---

## 0.12 Shared UI Components & Design System

All shared UI lives under `frontend/src/components/`. The design system is
defined by `bidcompliance_ai_platform.html`:

- **Typography:** Google Fonts `Inter` (sans) and `Manrope` (display).
- **Icons:** Google `Material Symbols Outlined` with `.icon-fill` support.
- **Palette:** Slate-900 `#0F172A` (primary), `#1e293b` (container),
  Emerald `#10B981` (success / PASS), Amber `#F59E0B` (warning / REVIEW),
  Rose `#EF4444` (danger / FAIL), Blue `#3B82F6` (info).

Shared components:
- `components/layout/AppShell.tsx` — header, role badge, profile dropdown, role
  switcher. Header badge: "Vendor Portal" / "Procurement Desk" / "Control Center".
- `components/layout/AdminLayout.tsx` — admin navigation (see §14 nav items).
- `components/shared/GlobalSearchModal.tsx`.
- `lib/export/exportUtils.ts` — PDF export helpers used by Evidence Viewer and
  Reports.

---

## 0.13 Shared Libraries (Backend)

All API routes import the single in-memory store:
`import { platformStore } from '@/lib/data/platformDataStore'`.

| Library | Path | Used by |
|---|---|---|
| `platformDataStore` | `lib/data/platformDataStore.ts` | All API handlers (single source of truth) |
| `VerificationProvider` | `lib/verification/verificationProvider.ts` | M5 |
| `RuleEngine` | `lib/compliance/ruleEngine.ts` | M5 |
| `ScoringEngine` | `lib/compliance/scoringEngine.ts` | M5 |
| `RiskEngine` | `lib/compliance/riskEngine.ts` | M5 |
| `EvidenceEngine` | `lib/compliance/evidenceEngine.ts` | M5 |
| `AIProvider` | `lib/ai/aiProvider.ts` | M4 (MockAIProvider default; GroqAIProvider fallback) |
| `exportUtils` | `lib/export/exportUtils.ts` | M1, M2 |
| `documentService` | `lib/documents/documentService.ts` | M1, M4 |

`MockAIProvider` runs out-of-the-box with **zero API keys**; every AI output
carries an `is_mock` flag and is visibly badged `MOCK` in compliance cards,
copilot drawers, and gateway diagnostics. `GroqAIProvider` is the live
fallback (requires `GROQ_API_KEY`).

---

## 0.14 Cross-Module Integration Map

```text
                          ┌─────────┐
  Module 1 (Bidder)  ────► │ Module 5 │ ◄──  Module 2 (Officer)
  uploads docs, runs       │ Compla-  │      triggers verification,
  precheck, responds       │ ance &   │      commits final decision,
  to clarifications        │ Verifica-│      reviews evidence
     │                     │ tion     │       │
     └────────────────────►│ Engine   │ ◄─────┘
                              │  ▲
                              │  │ owns compliance rules/
                              │  │ risk weights (via Module 3)
                              ▼  │
                         ┌────────┐│
                         │Module 4││ owns AI (OCR, copilot,
                         │ AI Svcs││ recommendation, explain)
                         └────────┘
                              │  ▲
                              │  │ exposes metrics for
                              ▼  │ Module 3 monitoring
                         ┌────────┐
                         │Module 3│ owns global config +
                         │ Admin  │ audit + connector status
                         └────────┘
```

- **Module 1 ↔ Module 2:** Module 2 publishes tenders (2.3); Module 1 consumes
  them, submits bids (1.9), and responds to clarifications (1.11). Module 2
  sends clarification requests; Module 1 responds.
- **Module 1/2 ↔ Module 4:** M4 powers Eligibility Checker, Pre-Submission
  Check, Tender Analysis, Explain Finding, Copilot, Recommendation. Build
  against the mocked `/api/ai/*` contract until live.
- **Module 1/2 ↔ Module 5:** My Bids status, Compliance Dashboard, Risk
  Dashboard, Evidence Viewer all read `/api/compliance/{bid_id}`,
  `/api/risk/{bid_id}`, `/api/evidence/*`. M5 owns scoring/risk/evidence
  output; never a bare verdict.
- **Module 2 ↔ Module 3:** Module 2's Compliance Dashboard reflects rules/
  weights configured in Module 3. Module 2's audit logs flow to the shared
  `audit_logs` table Module 3 monitors.
- **Module 2/3 ↔ Module 4:** Module 3 exposes AI service metrics
  (requests, success rate, latency, model version) for its AI Management UI.
- **Module 3 ↔ Module 5:** Module 3 authors compliance rules and risk weights;
  Module 5 evaluates them. Module 3 monitors M5's 11 government connectors.
- **Module 4 ↔ Module 5:** M4 extracts/classifies document fields; M5 verifies
  them and writes compliance. M4 consumes M5 output for Recommendation; M5
  never writes M4 output.

---

## 0.15 Delivery Schedule

Source: `Modules/SIH_Module_Implementation_Plan.md`. The shared backend is built
once and is depended on by all three roles. Build priority order:

| # | Phase | What | Status |
|---|---|---|---|
| 1 | Auth + roles | 3 roles, route guards | BUILD |
| 2 | Document upload + OCR extraction | Core AI value-add | BUILD |
| 3 | Compliance rule engine + scoring | Heart of the platform | BUILD |
| 4 | Compliance Dashboard + Evidence Viewer | Headline Client demo | BUILD |
| 5 | AI Eligibility Checker + Pre-Submission Check | Bidder headline feature | BUILD |
| 6 | Bid comparison table + clarification workflow | Client workflow | BUILD |
| 7 | Final decision + audit trail | Client + Admin | BUILD |
| 8 | Connector status panel | Admin — proves PS coverage | BUILD |
| 9 | AI Copilot / Recommendation | MOCK-first | MOCK |
| 10 | Reports export | Single PDF/CSV | MOCK |

Out of scope / mentioned-in-slides only: Finance/BOQ/pricing, Document Type
Configuration, Organization Management, Data Retention/Backup, Risk Threshold
Configuration (mock).

---

## 0.16 Conventions & Freeze Policy

- **Single source of truth:** all state changes go through
  `platformStore.updateBid()` and emit an `AuditLogEntry`. No frontend component
  holds its own copy of bid status.
- **Frozen shapes:** the JSON contracts in Section 7 are frozen. Changing them
  requires a version bump in this doc and a coordinated update of all consumers.
- **Mock transparency:** every AI/verification output carries an `is_mock` /
  `_MOCK` indicator and a visible `MOCK` badge. Never hide mock state.
- **No AI writes compliance:** AI extracts and explains; it never writes
  compliance results, scores, or risk levels. (Module 4, Section 4.12.)
- **Evidence requirement:** every compliance result must map to an
  `EvidenceItem`. No bare PASS/FAIL. (Module 5, Section 5.6.)
- **Admin config is runtime data:** weights, rule thresholds, and connector
  environments are read at runtime — Module 5 must not hardcode them.
