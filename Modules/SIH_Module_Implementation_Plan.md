# AI-Powered Bid Compliance Verification Platform
## Implementation Module List — User / Client / Admin

Legend:
- 🟢 **BUILD** — implement fully, this is what you demo live
- 🟡 **MOCK** — fake UI + hardcoded/sample data, looks real but no real backend logic
- ⚪ **SKIP** — mention in slides/architecture diagram only, do not build

---

## 👤 USER (Bidder) MODULE

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1.1 | Login / Register | 🟢 BUILD | Simple auth (email+password or OTP mock). Don't build full 2FA. |
| 1.2 | Company Profile | 🟢 BUILD | Name, PAN, GSTIN, Udyam no., address, category — this is input data your AI engine consumes. |
| 1.3 | Document Vault (Upload) | 🟢 BUILD | Upload GST cert, PAN, Udyam, OEM auth, EPFO, ESIC as PDFs/images. This feeds your AI pipeline — core to the demo. |
| 1.4 | Document OCR + Auto-Extraction | 🟢 BUILD | This is your core differentiator. Extract GSTIN, name, dates etc. from uploaded docs. |
| 1.5 | Document Verification Status | 🟢 BUILD | Show ✓/⚠/✗ per doc after extraction + mock portal check. |
| 1.6 | Tender Selection (not creation) | 🟢 BUILD | Bidder picks/enters a GeM Tender ID or selects from 3–4 seeded sample tenders. **Do NOT build a tender marketplace.** |
| 1.7 | AI Eligibility Checker | 🟢 BUILD | Compare bidder profile + docs vs tender requirements → % eligible + gap list. This is a headline feature — invest here. |
| 1.8 | Bid Submission (compliance docs only) | 🟢 BUILD | Attach mapped compliance documents to a tender ID and submit. Skip full technical/financial bid workflow. |
| 1.9 | AI Pre-Submission Check | 🟢 BUILD | "18 requirements found — 15 pass, 2 warn, 1 fail" before allowing submit. Great live-demo moment. |
| 1.10 | My Submissions / Status Tracker | 🟢 BUILD | List of submitted compliance packages + current status (Submitted → Verified → Under Review → Decision). |
| 1.11 | Clarification Inbox | 🟢 BUILD | Officer requests a doc → bidder sees notification → re-uploads. Shows the human-in-the-loop story. |
| 1.12 | Document Expiry Tracker | 🟡 MOCK | Nice visual, low build cost, just needs expiry_date field + date comparison. Worth doing since it's cheap. |
| 1.13 | Notifications | 🟡 MOCK | In-app toast/list is enough. Skip email/SMS integration. |
| 1.14 | Financial Bid / BOQ / Pricing | ⚪ SKIP | This is GeM's job, not yours. Mentioning it will hurt your scope story. |
| 1.15 | Bid History / Analytics | ⚪ SKIP | Nice-to-have, not core to the PS. |

**User MVP core loop:** Register → Upload docs → Pick tender → Check eligibility → Submit → Track status → Respond to clarification.

---

## 🏢 CLIENT (Procurement Officer) MODULE

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 2.1 | Login | 🟢 BUILD | Same auth system, role = client. |
| 2.2 | Officer Dashboard | 🟢 BUILD | Counts: active tenders, bidders, pending reviews, risk distribution. Your "wow, this looks like a real product" screen. |
| 2.3 | Tender Setup (lightweight) | 🟢 BUILD | Just enough to seed tender ID + basic eligibility requirements (turnover, local content %, required docs). Not a full tender authoring suite. |
| 2.4 | AI Tender Requirement Extraction | 🟡 MOCK or 🟢 BUILD (pick one) | If you have time: upload a tender PDF, AI extracts requirement checklist. If short on time, seed 3 tenders with pre-defined requirement JSON and skip the PDF-parsing step. |
| 2.5 | Compliance Blueprint (requirement rules per tender) | 🟢 BUILD | Officer confirms/edits AI-extracted rules before publishing. Shows human-in-the-loop control. |
| 2.6 | Bidder List per Tender | 🟢 BUILD | All bidders who submitted for a tender ID, with compliance score + risk badge. |
| 2.7 | Run Compliance Verification | 🟢 BUILD | Trigger button → pipeline runs (OCR → mock govt check → cross-check → score). This is your core engine — invest most of your build time here. |
| 2.8 | Compliance Dashboard (per bidder) | 🟢 BUILD | Score /100, risk level, checklist of ✓/⚠/✗ per requirement. This is literally what the PS asks for — must be polished. |
| 2.9 | Evidence Viewer | 🟢 BUILD | Click a failed item → show source doc, extracted value, expected value, page ref. This is your credibility feature — judges love traceability. |
| 2.10 | Cross-Document Entity Check | 🟡 MOCK | Compare company name across PAN/GST/Udyam, flag mismatch. Cheap to build (string match), high visual payoff. |
| 2.11 | Risk Classification | 🟢 BUILD | Auto-bucket into Low/Medium/High from score + weighted rules. |
| 2.12 | Bid Comparison Table | 🟢 BUILD | Side-by-side compliance/risk across bidders for one tender — easy to build (it's just a table) and a strong demo screen. |
| 2.13 | AI Recommendation | 🟢 BUILD | Simple rule-based or LLM-generated text: "Manual review recommended — local content below threshold." Ties the whole pipeline together. |
| 2.14 | Clarification Request | 🟢 BUILD | Officer selects requirement → sends message → bidder notified. Pairs with User 1.11. |
| 2.15 | Final Decision (Approve/Reject/Clarify) | 🟢 BUILD | Officer records decision + mandatory reason field. **Critical** — this is the PS's core principle: AI recommends, human decides. |
| 2.16 | Audit Trail (tender-level) | 🟢 BUILD | Timeline of tender/bid events. Can be a simple event log table rendered as a timeline. |
| 2.17 | AI Procurement Copilot (chat Q&A) | 🟡 MOCK | "Why is Bidder A high risk?" — impressive if you have LLM API time left, but not core. Build last, cut first if short on time. |
| 2.18 | Reports Export | 🟡 MOCK | One PDF/CSV export button for compliance report is enough — don't build a full reporting suite. |
| 2.19 | Financial Evaluation / Ranking | ⚪ SKIP | Out of scope per PS — final qualification is about compliance, not commercial evaluation. |

**Client MVP core loop:** Seed/set up tender → view bidders → run compliance check → review score + evidence → compare bidders → request clarification → approve/reject with reason.

---

## 👑 ADMIN MODULE

Keep this deliberately small — judges score the verification engine, not your admin panel.

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 3.1 | Admin Dashboard | 🟢 BUILD | System-wide counts: users, clients, tenders, bids, verifications run. Cheap, high visual impact. |
| 3.2 | User & Client Management | 🟢 BUILD | Basic list + activate/suspend toggle. CRUD, not complex. |
| 3.3 | Government Connector Status Panel | 🟢 BUILD | List GST/PAN/Udyam/EPFO/ESIC/MCA21/BIS-DPIIT/Startup India/NSIC/OEM/DigiLocker/Debarment with a Connected/Sandbox/Mock badge each. **This single screen visually proves you covered every requirement in the PS** — high priority to build well even though it's simple. |
| 3.4 | Compliance Rule Management | 🟢 BUILD | Admin can edit the same requirement/weight rules Client uses in 2.5 — table with editable thresholds. |
| 3.5 | Risk Threshold Configuration | 🟡 MOCK | Sliders for Low/Medium/High cutoffs — nice to show configurability, low build cost. |
| 3.6 | Audit & Security Log (global) | 🟢 BUILD | Same audit engine as Client's, filtered to show all roles' actions. Reuse component from 2.16. |
| 3.7 | AI Model / System Health Monitor | 🟡 MOCK | Static-looking status cards (OCR: Online, Risk Engine: Online). Don't wire real monitoring. |
| 3.8 | Document Type Configuration | ⚪ SKIP | Nice-to-have, not scoring-relevant. |
| 3.9 | Organization/Department Management | ⚪ SKIP | Skip unless you have spare time — not core to compliance verification story. |
| 3.10 | Data Retention / Backup Controls | ⚪ SKIP | Out of hackathon scope entirely. |

**Admin MVP core loop:** View system health → manage users/clients → view connector status → edit compliance rules → view global audit trail.

---

## 🧩 SHARED BACKEND (build once, all three roles depend on it)

| Engine | Status | What it needs to do |
|---|---|---|
| Auth + Role-based access | 🟢 BUILD | 3 roles, JWT or session-based, route guards. |
| Document OCR/Extraction | 🟢 BUILD | Use a real OCR lib (Tesseract) or an LLM vision call to pull fields from uploaded PDFs/images. This is your core AI value-add. |
| Government Verification Gateway | 🟡 MOCK | Real GST/PAN/Udyam APIs require registered credentials you won't get in time — build a mock service returning realistic responses per connector, clearly labeled "Sandbox Mode" in UI (as your original doc already proposed). |
| Compliance Rule Engine | 🟢 BUILD | Given tender rules JSON + bidder extracted data → pass/fail per rule + weighted score. This is pure logic, very buildable, and is the heart of the PS. |
| Risk Scoring | 🟢 BUILD | Score → bucket (Low/Med/High) using admin-configured thresholds. |
| Evidence Store | 🟢 BUILD | For each rule check, store: source doc, extracted value, expected value, result. Powers the Evidence Viewer. |
| Recommendation Generator | 🟢 BUILD | Rule-based text ("Manual review recommended") is enough; LLM-generated explanation is a bonus if time allows. |
| Notification Engine | 🟡 MOCK | In-app only, no real email/SMS. |
| Audit Logger | 🟢 BUILD | Every state-changing action writes one row: who/what/when/result. Reused across all three roles' audit views. |

---

## 🎯 Recommended build priority (in order)

1. Auth + roles (User/Client/Admin)
2. Document upload + OCR extraction (User)
3. Compliance rule engine + scoring (Backend)
4. Compliance Dashboard + Evidence Viewer (Client) — **your headline demo screen**
5. AI Eligibility Checker + Pre-Submission Check (User)
6. Bid comparison table + clarification workflow (Client)
7. Final decision + audit trail (Client + Admin)
8. Connector status panel (Admin) — quick to build, visually proves PS coverage
9. Everything marked 🟡 MOCK, only if time remains
10. Anything marked ⚪ SKIP stays in your architecture slide only

This gives you a genuinely **working, demoable, end-to-end** pipeline — upload → extract → verify → score → evidence → decide — instead of a wide but shallow feature list that won't survive a live demo.
