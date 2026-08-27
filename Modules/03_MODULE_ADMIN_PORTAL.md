# MODULE 3 — ADMIN CONTROL CENTER
### Owner: Developer 3 · Owns: `/admin/*`

> Read `00_SHARED_ARCHITECTURE.md` first — it has the DB schema, full API contract, JSON shapes, shared components, and delivery schedule. This file only covers what's specific to the Admin Portal.

## Purpose
Global control of the platform.

## Your responsibilities
```text
Users, Organizations, Connectors, Rules, AI management, Security, Audit, Reports, Settings
```

---

## 3.1 Pages
```text
/admin/dashboard
/admin/users
/admin/users/[id]
/admin/clients
/admin/organizations
/admin/tenders
/admin/bids
/admin/connectors
/admin/rules
/admin/document-types
/admin/ai
/admin/risk
/admin/notifications
/admin/security
/admin/audit
/admin/reports
/admin/settings
```

---

## 3.2 Dashboard

**KPI:** `Users, Clients, Organizations, Tenders, Bids, Verifications, AI Requests, System Alerts`

**System health:** `Database, AI, OCR, GST, Udyam, Storage, Realtime`

**Statuses:** `ONLINE, DEGRADED, OFFLINE`

---

## 3.3 User Management

**Columns:** `Name, Organization, Role, Status, Created, Last Active`

**Buttons:** `View, Edit, Verify, Suspend, Activate, Reset Access, Deactivate`

---

## 3.4 Client Management

**Buttons:** `Approve, Suspend, Activate, Edit, View`

---

## 3.5 Organization Management

**Fields:** `Organization, Department, Code, Address, Status`

**Buttons:** `Create, Edit, Assign Officer, Suspend, View`

---

## 3.6 Tender Management

Admin can view all tenders. **Buttons:** `View, Suspend, Archive, Cancel, Assign Officer`

---

## 3.7 Bid Management

Admin can view: `Bidder, Tender, Compliance, Risk, Verification, Status`. Administrative changes require audit logging.

---

## 3.8 Connector Management

**Connectors:** `GST, Udyam, PAN, Income Tax, EPFO, ESIC, Startup India, NSIC, OEM, DigiLocker, Debarment`

Each connector shows: `Status, Environment, Last Checked, Response Time, Error Rate`

**Environments:** `LIVE, SANDBOX, MOCK, UNAVAILABLE`

**Buttons:** `Test Connection, Enable, Disable, Configure, View Logs`

*(These connectors are implemented by Module 5 — you build the admin UI to monitor/configure them.)*

---

## 3.9 Compliance Rule Management

**Example rules:**
```text
GST must be active
Local Content >= X
Turnover >= X
Experience >= X
Debarment must be clear
OEM authorization required
```

**Buttons:** `Create Rule, Edit, Disable, Clone, Version History`

*(Rules feed Module 5's compliance engine — Module 2's Compliance Dashboard reflects what you configure here.)*

---

## 3.10 Document Type Management

**Manage:** `GST, PAN, Udyam, ITR, OEM, EPFO, ESIC, Startup, NSIC, MII Declaration, Experience, Financial`

**Buttons:** `Create, Edit, Disable, Configure Fields`

---

## 3.11 AI Management

**Services:** `Tender Parser, OCR, Document Classifier, Entity Resolver, Contradiction Detector, Risk Engine, Recommendation Engine, AI Copilot`

**Metrics:** `Requests, Success Rate, Failure Rate, Latency, Model Version`

**Buttons:** `Configure, Test, Enable, Disable, View Logs`

*(These are Module 4's services — you build the monitoring/config UI.)*

---

## 3.12 Risk Configuration

**Risk levels:**
```text
90–100 → LOW
70–89  → MEDIUM
50–69  → HIGH
0–49   → CRITICAL
```

**Weights (editable by admin):**
```text
GST 10%  PAN 10%  Udyam 10%  Tax 15%  Local Content 15%
OEM 15%  Documents 10%  Debarment 15%
```

---

## 3.13 Security

**Show:** `Failed Logins, Suspicious Sessions, Active Sessions, 2FA, Security Alerts`

**Buttons:** `Terminate Session, Suspend Account, View Event`

---

## 3.14 Audit Logs

**Columns:** `Timestamp, Actor, Role, Action, Resource, Result`

**Filters:** `User, Client, Tender, Bid, Action, Date`

**Button:** `Export Audit Log`

---

## 3.15 System Settings

**Sections:** `General, Security, AI, Compliance, Notifications, Storage`

**Buttons:** `Save Changes, Reset`

---

## APIs you consume (shared contract, Section 12–13 of `00_SHARED_ARCHITECTURE.md`)
```http
GET  /api/audit
GET  /api/audit/{id}
GET  /api/audit/export

GET  /api/tenders
GET  /api/bids

POST /api/verification/gst
POST /api/verification/udyam
POST /api/verification/pan
POST /api/verification/oem
POST /api/verification/debarment
```
Most admin CRUD (users, organizations, connectors, rules, document types, AI config, risk weights, system settings) needs dedicated `/api/admin/*` endpoints — define these with the integration coordinator before building, since they aren't in the base contract above and must be frozen like everything else.

## Integration checkpoints with other modules
- **Module 5 (Compliance):** you configure the compliance rules and risk weights their engine consumes, and you monitor their government connectors.
- **Module 4 (AI):** you monitor and configure their AI services.
- **Module 2 (Client Portal) / Module 1 (Bidder Portal):** you have oversight visibility into all tenders/bids/users they create, and every admin action must write to the shared `audit_logs` table.
