# BidCompliance AI Platform (SIH 26100)

Universal Public Procurement Compliance & Evidenced Decision Platform integrating **Module 1 (Bidder Portal)**, **Module 2 (Procurement / Client Desk)**, **Module 3 (Admin Control Center)**, **Module 4 (AI Services)**, and **Module 5 (Deterministic Verification & Compliance Engine)** under a unified Next.js 14 application.

---

## Features & Modules

1. **Persona Access Gateway (`/`)**:
   - Role-based portal switcher for **Vendor / Bidder**, **Procurement Officer**, and **System Administrator**.
2. **Module 1: Bidder Portal (`/bidder/*`)**:
   - Document Vault with 4-stage AI OCR verification, Tender Marketplace with AI eligibility simulations, Bid Submission Wizard, Clarification Hub, and KYC profile.
3. **Module 2: Procurement / Client Portal (`/client/*`)**:
   - Procurement Desk Overview, Split-Screen Evidence Viewer (`/client/bids/[id]/evidence`) with highlighted OCR bounding boxes, Conversational AI Copilot, Comparative Matrix, and binding Final Officer Determinations.
4. **Module 3: Admin Control Center (`/admin/*`)**:
   - 11 Government Verification Gateways (GST, PAN, Udyam, Debarment, OEM, Income Tax, EPFO, ESIC, Startup India, NSIC, DigiLocker) with `MOCK` / `SANDBOX` / `LIVE` modes, Compliance Rule Engine thresholds, Dynamic Risk Scoring Matrix, AI Microservices telemetry, and Master Audit Ledger.
5. **Module 4: AI Services Core**:
   - Clean `AIProvider` abstraction with `MockAIProvider` (default, zero API key required) and server-side `GroqAIProvider` with prominent `MOCK` transparent indicators.
6. **Module 5: Deterministic Compliance & Verification Engine**:
   - 11 statutory providers, deterministic rule evaluator, dynamic weight calculator, risk bands, and structured evidence engine.

---

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Production Build
```bash
npm run build
npm start
```
