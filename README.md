# BidShield AI — Universal Public Procurement Compliance & Evidenced Decision Platform

**Platform:** BidShield AI Enterprise v2.4 · **Stack:** Next.js 14 (App Router) + TypeScript · **Status:** Core implementation complete, ready for end-to-end testing

BidShield AI is a unified digital procurement platform that turns vendor
submissions into **compliance-verified, audit-trail-evident, officer-decided**
outcomes. It combines AI document intelligence (OCR + entity resolution), 11
government statutory verification gateways, a deterministic compliance & risk
engine, and a single source of truth for bid state — all under role-based
portals for **Vendors**, **Procurement Officers**, and **System Administrators**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [The Five Modules](#the-five-modules)
- [Data Flow (Core Loop)](#data-flow-core-loop)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Design Principles](#design-principles)

---

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select a persona:
**Vendor / Bidder**, **Procurement Officer**, or **System Administrator**.

Production build:

```bash
npm run build && npm start
```

> No API keys required. A high-fidelity `MockAIProvider` and `MOCK`-mode
> statutory connectors run out of the box. A `GROQ_API_KEY` env var enables the
> live `GroqAIProvider` fallback. All mock outputs are clearly badged `MOCK`
> in the UI.

---

## Architecture Overview

```
                     platformDataStore (single source of truth)
                              │
         ┌────────────────────┼──────────────────────┐
         ▼                    ▼                      ▼
  Module 1 (Bidder)   Module 2 (Officer)    Module 3 (Admin)
         │                    │                      │
         │              Module 4 (AI)           │
         │              Module 5 (Compliance)    │
         └────────────────────┼──────────────────────┘
                              ▼
                      bidcompliance.db (SQLite)
```

- **Single source of truth:** all state (bids, tenders, documents, verifications,
  compliance, risk, audit) lives in `platformDataStore`
  (`frontend/src/lib/data/platformDataStore.ts`). Every status change — officer
  decision, clarification response, verification run — flows through
  `platformStore.updateBid()` and writes a tamper-evident `AuditLogEntry`.
- **Frozen contracts:** the data model and API shapes are defined in
  `Modules/00_SHARED_ARCHITECTURE.md` and the TypeScript types at
  `frontend/src/types/index.ts`.
- **Mock-transparent:** AI and government verification run in `MOCK` mode by
  default and always carry an `is_mock` flag visible in the UI.

---

## The Five Modules

| Module | Owner | Routes | Purpose |
|---|---|---|---|
| **1. Bidder / User Portal** | Dev 1 | `/bidder/*` | Document vault, tender marketplace, AI eligibility, bid submission, clarifications |
| **2. Procurement / Client Portal** | Dev 2 | `/client/*` | Tender creation, split-screen Evidence Viewer, compliance/risk dashboards, final decisions |
| **3. Admin Control Center** | Dev 3 | `/admin/*` | 11 government gateways, compliance rules, risk weights, global audit, users |
| **4. AI Services** | Dev 4 | `app/api/ai/*` (backend) | OCR, document classification, entity resolution, copilot, recommendations |
| **5. Compliance & Verification Engine** | Dev 5 | `app/api/verification/*`, `app/api/compliance/*`, `app/api/risk/*`, `app/api/evidence/*` | 11 statutory providers, rule engine, scoring, risk bands, evidence |

---

## Data Flow (Core Loop)

```
1. Vendor        → uploads documents to Vault          (Module 1 + Module 4 OCR)
2. Vendor        → selects tender, runs Eligibility    (Module 1 + Module 5 rules)
3. Vendor        → submits bid                         (status → SUBMITTED)
4. Officer       → triggers Run Full Verification      (Module 2 → Module 5 pipeline)
                   docs → govt checks → rules → score → risk → evidence → AI rec
5. Officer       → reviews Compliance + Risk + Evidence dashboards
6. Officer       → asks AI Copilot, compares bidders
7. Officer       → commits Final Decision (Approve / Clarify / Reject)  (status update)
8. [if clarify]  → bidder responds → AI re-verifies → officer approves (→ QUALIFIED)
9. System        → every step recorded as tamper-evident AuditLogEntry
```

**Status transitions** (see `Modules/00_SHARED_ARCHITECTURE.md:5` for the full map):
`approve → QUALIFIED`, `clarify → CLARIFICATION_REQUIRED`,
`reject → DISQUALIFIED`. Clarification: bidder responds
`→ UNDER_EVALUATION` (auto re-verification), officer approves `→ QUALIFIED`.

---

## Documentation

| Document | Audience | Description |
|---|---|---|
| [`Modules/00_SHARED_ARCHITECTURE.md`](Modules/00_SHARED_ARCHITECTURE.md) | **All developers** | Data model, frozen API contract, JSON shapes, verification pipeline, scoring, risk, evidence, shared UI libs, integration map, delivery schedule |
| [`Modules/01_MODULE_BIDDER_PORTAL.md`](Modules/01_MODULE_BIDDER_PORTAL.md) | Dev 1 | Bidder Portal pages, components, APIs, integrations |
| [`Modules/02_MODULE_CLIENT_PORTAL.md`](Modules/02_MODULE_CLIENT_PORTAL.md) | Dev 2 | Officer desk pages, dashboards, decisions, APIs |
| [`Modules/03_MODULE_ADMIN_PORTAL.md`](Modules/03_MODULE_ADMIN_PORTAL.md) | Dev 3 | Admin pages, connectors, rules, audit, APIs |
| [`Modules/04_MODULE_AI_DOCUMENT_INTELLIGENCE.md`](Modules/04_MODULE_AI_DOCUMENT_INTELLIGENCE.md) | Dev 4 | AI pipeline, OCR, classification, copilot, safety rules |
| [`Modules/05_MODULE_COMPLIANCE_VERIFICATION.md`](Modules/05_MODULE_COMPLIANCE_VERIFICATION.md) | Dev 5 | Verification providers, rule engine, scoring, risk, evidence |
| [`Modules/AI Bid Compliance Platform — Complete UI-UX Design & Page Specification.md`](Modules/AI%20Bid%20Compliance%20Platform%20—%20Complete%20UI-UX%20Design%20&%20Page%20Specification.md) | Designers / Devs | Full UI design system (colors, typography, page specs) |
| [`Modules/SIH_Module_Implementation_Plan.md`](Modules/SIH_Module_Implementation_Plan.md) | Product | Build/MOCK/SKIP priority matrix per feature |
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | All | Targeted functional fixes implemented |
| [`frontend/walkthrough.md`](frontend/walkthrough.md) | All | Verified routes & API contracts |

---

## Project Structure

```
bidshield/
├── frontend/                     # Next.js 14 application (UI + API routes)
│   ├── src/
│   │   ├── app/                  # App Router pages + API route handlers
│   │   │   ├── api/              # All REST-style API contracts
│   │   │   ├── bidder/*          # Module 1 routes
│   │   │   ├── client/*          # Module 2 routes
│   │   │   └── admin/*           # Module 3 routes
│   │   ├── lib/
│   │   │   ├── data/platformDataStore.ts   # ◀ single source of truth
│   │   │   ├── ai/aiProvider.ts            # MockAIProvider + GroqAIProvider
│   │   │   ├── verification/verificationProvider.ts
│   │   │   ├── compliance/{ruleEngine,scoringEngine,riskEngine,evidenceEngine}.ts
│   │   │   ├── documents/documentService.ts
│   │   │   └── export/exportUtils.ts       # PDF export
│   │   ├── components/           # Shared + per-module UI components
│   │   └── types/index.ts        # ◀ frozen data model & enums
│   └── README.md
├── bidshield-ai-platform-complete/   # Standalone complete platform copy
├── gem-compliance-engine/              # Reusable React compliance dashboard
├── Modules/                            # Module spec & shared architecture docs
├── api-service.js / server.js          # Legacy API surface
├── start-all.ps1                       # One-click dev launcher
└── IMPLEMENTATION_STATUS.md / IMPLEMENTATION_COMPLETE.md
```

---

## Design Principles

1. **AI recommends, humans decide.** AI extracts, classifies, explains, and
   recommends — but never writes compliance results, scores, risk levels, or
   final decisions.
2. **No bare verdicts.** Every compliance result maps to traceable evidence
   with source document, page, extracted/expected values, and bounding boxes.
3. **Mock transparency.** All mock outputs are visibly badged; never hidden.
4. **Single source of truth.** No component maintains its own copy of bid
   status; all updates flow through the shared store + audit log.
5. **Admin config is runtime data.** Rules, weights, and connector environments
   are read at runtime from the store — never hardcoded.
