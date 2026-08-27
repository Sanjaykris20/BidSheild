# AI-Powered Integrated Bid Compliance Verification Platform
## Complete UI/UX Design & Page Specification

**Project:** AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement  
**Problem Statement:** SIH 26100  
**Frontend:** Next.js + TypeScript  
**Styling:** Tailwind CSS  
**UI Components:** shadcn/ui  
**Icons:** Lucide React  
**Charts:** Recharts  
**Backend:** FastAPI  
**Database:** PostgreSQL  

---

# 1. PRODUCT OVERVIEW

The platform provides AI-assisted verification of bidder compliance for government procurement.

The platform has three primary roles:

### 👤 USER
Bidder / Vendor

### 🏢 CLIENT
Procurement Officer / CPCL Officer

### 👑 ADMIN
Platform Super Administrator

The final procurement decision always remains with the Procurement Officer.

The AI system acts as a decision-support and verification system.

---

# 2. CORE PRODUCT FLOW

```text
ADMIN
  ↓
Configure organizations, users, rules and integrations
  ↓
CLIENT
  ↓
Create Tender
  ↓
Upload Tender Documents
  ↓
AI analyzes Tender
  ↓
Compliance Blueprint
  ↓
Client reviews and approves requirements
  ↓
Tender Published
  ↓
USER / BIDDER
  ↓
Find Tender
  ↓
Check Eligibility
  ↓
Create Bid
  ↓
Upload Documents
  ↓
AI Pre-submission Check
  ↓
Submit Bid
  ↓
AI + Government Verification
  ↓
Compliance Engine
  ↓
Risk & Compliance Score
  ↓
Evidence-backed AI Recommendation
  ↓
CLIENT
  ↓
Review Bid
  ↓
Request Clarification if needed
  ↓
Final Procurement Decision
  ↓
AUDIT TRAIL + REPORT
```

---

# 3. DESIGN PRINCIPLES

The interface must feel:

- Professional
- Government/enterprise-grade
- Trustworthy
- Clean
- Data-driven
- Secure
- Modern
- Easy to understand

Avoid:

- Excessive gradients
- Excessive animations
- Gaming-style UI
- Overly colorful dashboards
- Huge decorative elements
- Unnecessary AI animations

The application should look like a serious enterprise procurement platform.

---

# 4. COLOR SYSTEM

Use a consistent design system.

### Primary

Dark navy / blue

### Background

Very light neutral / white

### Success

Green

### Warning

Amber

### Danger

Red

### Information

Blue

### Neutral

Gray

### Risk colors

```text
LOW       → Green
MEDIUM    → Amber
HIGH      → Red
CRITICAL  → Dark Red
```

Do not use colors as the only indicator.

Always pair colors with:

- Icon
- Text
- Status badge

---

# 5. TYPOGRAPHY

Use a clean sans-serif font.

Recommended:

- Inter
- Geist
- Manrope

### Heading hierarchy

```text
H1 → 32–40px
H2 → 24–30px
H3 → 18–22px
Body → 14–16px
Caption → 12–13px
```

---

# 6. GLOBAL UI COMPONENTS

All developers must use the same shared components.

```text
components/ui/

Button
Input
Textarea
Select
Checkbox
Radio
Switch
DatePicker
Dropdown
Modal
Drawer
Card
Badge
Avatar
Tabs
Table
Pagination
Tooltip
Popover
Toast
Alert
Progress
Skeleton
Breadcrumb
Stepper
FileUpload
SearchBar
Filter
EmptyState
LoadingState
ErrorState
```

---

# 7. BUTTON SYSTEM

### Primary

```text
Create Tender
Submit Bid
Publish Tender
Run Verification
Approve
Save
Continue
```

### Secondary

```text
Cancel
Back
View Details
Edit
Download
Export
```

### Danger

```text
Delete
Reject
Cancel Tender
Suspend User
Disable Connector
```

### Warning

```text
Request Clarification
Review Required
```

### AI

Use a consistent AI icon.

```text
Analyze with AI
Check Eligibility
Explain Finding
Ask AI
Generate Recommendation
Generate Report
```

---

# 8. GLOBAL NAVIGATION

## USER

```text
Dashboard
Tenders
My Bids
Documents
Eligibility
Clarifications
Notifications
Profile
Help
```

## CLIENT

```text
Dashboard
Tenders
Bids
Compliance
Risk Analysis
Clarifications
Reports
Audit
Profile
```

## ADMIN

```text
Dashboard
Users
Clients
Organizations
Tenders
Bids
Connectors
Compliance Rules
Document Types
AI Management
Risk Configuration
Notifications
Security
Audit Logs
Reports
System Settings
```

---

# 9. GLOBAL TOP BAR

Every authenticated page contains:

Left:

- Logo
- Current section

Right:

- Search
- Notifications
- Help
- Profile avatar
- User name
- Role
- Logout

---

# 10. AUTHENTICATION PAGES

---

## 10.1 LOGIN

Route:

```text
/login
```

Content:

### Logo

AI Bid Compliance Platform

### Form

- Email
- Password

Buttons:

```text
Sign In
Forgot Password?
```

Additional:

```text
Remember me
```

Optional:

```text
Sign in with organization account
```

---

## 10.2 REGISTER

Route:

```text
/register
```

Role selection:

```text
Bidder / Vendor
Procurement Officer
```

Fields:

- Full Name
- Organization
- Email
- Phone
- Password
- Confirm Password

For bidder:

- Company Name
- PAN
- GSTIN

Button:

```text
Create Account
```

---

## 10.3 FORGOT PASSWORD

Fields:

- Email

Button:

```text
Send Reset Link
```

---

# 11. USER / BIDDER PORTAL

---

# 11.1 USER DASHBOARD

Route:

```text
/user/dashboard
```

Header:

> Welcome, ABC Technologies

Top action:

```text
Browse Tenders
```

### KPI Cards

```text
Active Bids
Submitted Bids
Under Evaluation
Awarded
```

### Compliance Health Card

```text
Compliance Health
86 / 100
LOW RISK
```

Breakdown:

```text
GST       ✓
PAN       ✓
Udyam     ✓
Documents ⚠
```

Button:

```text
View Compliance
```

### Active Bids

Table:

| Tender | Bid ID | Status | Compliance | Action |
|---|---|---|---|---|

Actions:

```text
View
Track
```

### Notifications

Examples:

```text
OEM document expires in 12 days
Clarification requested for Tender #1024
Tender #1031 closes tomorrow
```

Button:

```text
View All Notifications
```

---

# 11.2 USER PROFILE

Route:

```text
/user/profile
```

Sections:

### Company Information

- Company Name
- Company Type
- PAN
- GSTIN
- Udyam
- Address
- Contact

### Authorized Representative

- Name
- Designation
- Email
- Phone

Buttons:

```text
Edit Profile
Save Changes
Cancel
```

Sensitive changes may require verification.

---

# 11.3 DOCUMENT VAULT

Route:

```text
/user/documents
```

Header:

> My Documents

Primary button:

```text
+ Upload Document
```

### Document cards/table

Columns:

- Document
- Type
- Status
- Uploaded
- Expiry
- Actions

Statuses:

```text
VERIFIED
PENDING
EXPIRED
REVIEW REQUIRED
REJECTED
```

Actions:

```text
View
Download
Replace
Delete
Verify
```

---

# 11.4 UPLOAD DOCUMENT

Modal/page:

### Upload area

```text
Drag & Drop
or
Browse Files
```

Fields:

- Document Type
- Document Number
- Expiry Date

Button:

```text
Upload & Verify
```

Processing state:

```text
Uploading
OCR Processing
Identifying Document
Extracting Information
Verifying
```

Final:

```text
Document Verified ✓
```

---

# 11.5 DOCUMENT DETAILS

Route:

```text
/user/documents/[id]
```

Left:

Document preview.

Right:

### Extracted Information

```text
GSTIN
Legal Name
Registration Date
Status
```

### Verification

```text
Source
Verified At
Verification ID
Confidence
```

Buttons:

```text
Download
Replace
View Verification Evidence
```

---

# 11.6 TENDER MARKETPLACE

Route:

```text
/user/tenders
```

Header:

> Available Tenders

Search:

```text
Search tenders...
```

Filters:

- Category
- Organization
- Location
- Value
- Closing Date
- Status
- Eligibility

Tender cards contain:

```text
Tender ID
Title
Organization
Estimated Value
Closing Date
Status
```

Button:

```text
View Tender
```

---

# 11.7 TENDER DETAILS

Route:

```text
/user/tenders/[id]
```

Header:

```text
Tender Title
Tender ID
🟢 OPEN
```

Tabs:

```text
Overview
Requirements
Documents
Timeline
Eligibility
```

### Overview

- Description
- Organization
- Estimated value
- Bid period

### Requirements

Show:

```text
GST                 Required
PAN                 Required
Udyam               Required
Turnover             ₹10 Cr
Experience           5 years
Local Content        ≥50%
OEM                   Required
```

### Buttons

```text
Check My Eligibility
Create Bid
Download Tender
```

---

# 11.8 AI ELIGIBILITY CHECK

Route:

```text
/user/tenders/[id]/eligibility
```

Header:

> AI Eligibility Analysis

System compares:

```text
Tender Requirements
+
Company Profile
+
Verified Documents
```

Result:

```text
Eligibility Score
86%
```

Breakdown:

```text
✓ GST
✓ PAN
✓ Udyam
✓ Turnover
✓ Experience
⚠ OEM
✗ Local Content
```

Buttons:

```text
Fix Issues
View Evidence
Continue to Bid
```

---

# 11.9 CREATE BID

Route:

```text
/user/bids/create
```

Use a stepper.

### Step 1

Company Information

Button:

```text
Continue
```

### Step 2

Technical Proposal

Upload:

- Technical proposal
- Experience
- Certificates

### Step 3

Compliance Documents

System maps documents to requirements.

Example:

```text
GST Requirement → GST.pdf ✓
PAN Requirement → PAN.pdf ✓
OEM Requirement → Missing ⚠
```

### Step 4

Financial Bid

Fields:

- Bid amount
- BOQ
- Price schedule

### Step 5

Declarations

Checkboxes:

```text
I confirm the information provided is accurate.
I accept the tender terms.
```

Button:

```text
Review Bid
```

---

# 11.10 BID REVIEW

Route:

```text
/user/bids/[id]/review
```

Show:

```text
Company Information
Documents
Technical Bid
Financial Bid
Declarations
```

Button:

```text
Run AI Pre-Submission Check
```

---

# 11.11 AI PRE-SUBMISSION CHECK

Show processing:

```text
Checking Tender Requirements
Checking Documents
Checking Registrations
Checking Consistency
```

Result:

```text
18 Requirements

15 ✓ PASS
2 ⚠ REVIEW
1 ✗ FAIL
```

Each finding has:

```text
Requirement
Current Value
Expected Value
Evidence
```

Buttons:

```text
Fix Issue
View Evidence
Submit Anyway
Back to Bid
```

---

# 11.12 BID SUBMISSION

Confirmation modal:

> Are you sure you want to submit this bid?

Show:

- Bid ID
- Document count
- Submission version

Button:

```text
Confirm & Submit Bid
```

Success:

```text
Bid Submitted Successfully ✓

Bid ID: BID-2026-1024

Submitted:
24 Aug 2026, 18:42
```

---

# 11.13 MY BIDS

Route:

```text
/user/bids
```

Filters:

- Active
- Submitted
- Under Evaluation
- Clarification
- Awarded
- Rejected

Table:

```text
Tender
Bid ID
Submitted
Status
Compliance
Action
```

Buttons:

```text
View
Track
Respond
Download Report
```

---

# 11.14 BID DETAILS

Route:

```text
/user/bids/[id]
```

Header:

```text
BID-1024
UNDER EVALUATION
```

Timeline:

```text
Created
Submitted
Verification
Evaluation
Clarification
Decision
```

Tabs:

```text
Overview
Documents
Compliance
Clarifications
History
```

---

# 11.15 CLARIFICATIONS

Route:

```text
/user/clarifications
```

Show:

```text
Tender
Issue
Requested By
Deadline
Status
```

Button:

```text
Respond
```

---

# 11.16 RESPOND TO CLARIFICATION

Show:

```text
Officer Request:
Please provide updated OEM authorization.
```

Upload:

```text
Updated_OEM.pdf
```

Textarea:

```text
Response
```

Button:

```text
Submit Clarification
```

---

# 11.17 USER NOTIFICATIONS

Route:

```text
/user/notifications
```

Categories:

```text
Tender
Bid
Document
Clarification
System
```

Actions:

```text
Mark as Read
Mark All as Read
```

---

# 12. CLIENT / PROCUREMENT OFFICER PORTAL

---

# 12.1 CLIENT DASHBOARD

Route:

```text
/client/dashboard
```

KPI:

```text
Active Tenders
Total Bidders
Pending Reviews
High Risk Bids
Clarifications
```

### Compliance Overview

Chart:

```text
Low Risk
Medium Risk
High Risk
```

### Recent Tenders

Table:

```text
Tender
Status
Bidders
Submissions
Actions
```

Button:

```text
+ Create Tender
```

---

# 12.2 TENDERS

Route:

```text
/client/tenders
```

Tabs:

```text
All
Draft
Upcoming
Live
Evaluation
Closed
Awarded
Cancelled
```

Button:

```text
Create Tender
```

---

# 12.3 CREATE TENDER

Route:

```text
/client/tenders/create
```

Use multi-step form.

### Step 1 — Basic Details

Fields:

- Tender title
- Tender ID
- Organization
- Category
- Description

### Step 2 — Timeline

- Publication
- Bid start
- Bid end
- Evaluation date

### Step 3 — Financial

- Estimated value
- EMD
- Tender fee
- Bid validity

### Step 4 — Documents

Upload:

- Tender PDF
- Technical specifications
- BOQ
- Terms

### Step 5 — AI Analysis

Button:

```text
Analyze Tender with AI
```

### Step 6 — Compliance Blueprint

AI-generated requirements.

Client can:

```text
Edit
Delete
Add Requirement
Approve
```

### Step 7 — Preview

Button:

```text
Save Draft
Publish Tender
```

---

# 12.4 TENDER DETAILS

Route:

```text
/client/tenders/[id]
```

Header:

```text
CPCL/2026/1024
Industrial Equipment Procurement
🟢 LIVE
```

Actions:

```text
Edit
Publish
Pause
Extend
Close Tender
Cancel Tender
```

Tabs:

```text
Overview
Requirements
Bidders
Bids
Compliance
Analytics
Documents
Audit
```

---

# 12.5 LIVE BIDDING

Route:

```text
/client/tenders/[id]/live
```

Show:

```text
LIVE
Time Remaining
Bidders
Submissions
```

Table:

```text
Bidder
Submission
Compliance
Risk
Status
```

Real-time updates if implemented.

---

# 12.6 BIDS

Route:

```text
/client/bids
```

Filters:

- Tender
- Status
- Risk
- Compliance
- Submission date

Table:

```text
Bidder
Tender
Compliance
Risk
Verification
Action
```

---

# 12.7 BID DETAILS

Route:

```text
/client/bids/[id]
```

Header:

```text
ABC Technologies
BID-1024
82/100
🟠 MEDIUM RISK
```

Tabs:

```text
Overview
Documents
Compliance
Risk
Evidence
AI Recommendation
Clarifications
Audit
```

---

# 12.8 COMPLIANCE DASHBOARD

Route:

```text
/client/bids/[id]/compliance
```

Main score:

```text
82 / 100
MEDIUM RISK
```

Summary:

```text
18 Passed
3 Review
2 Failed
1 N/A
```

Compliance table:

```text
Requirement
Result
Evidence
Source
Confidence
Action
```

Actions:

```text
View Evidence
Explain Finding
Override/Mark Reviewed
```

Any manual override must require a reason and be logged.

---

# 12.9 EVIDENCE VIEWER

This is a major WOW page.

Left:

PDF/document viewer.

Right:

```text
Finding
Local Content

Requirement
≥50%

Extracted Value
42%

Difference
-8%

Source
Make-in-India Declaration

Page
4

Confidence
98%
```

Button:

```text
Open Source Document
```

AI explanation:

```text
Why was this flagged?
```

---

# 12.10 RISK ANALYSIS

Route:

```text
/client/bids/[id]/risk
```

Show:

```text
Overall Risk
MEDIUM
82/100
```

Risk categories:

```text
Identity Consistency
Statutory Compliance
Financial Eligibility
Technical Eligibility
Documentation
Tender Compliance
```

Risk drivers:

```text
🔴 Local Content
🟠 OEM Authorization
🟢 GST
🟢 PAN
```

---

# 12.11 BIDDER COMPARISON

Route:

```text
/client/comparison
```

Select multiple bidders.

Comparison table:

```text
                Bidder A  Bidder B  Bidder C

Compliance       92        81        64
Risk             Low       Medium    High
GST               ✓         ✓         ✓
PAN               ✓         ✓         ✗
Udyam             ✓         ✓         ✗
Local Content     61%       53%       38%
OEM               ✓         ⚠         ✗
```

Buttons:

```text
Compare
Export
View Bid
```

---

# 12.12 AI PROCUREMENT COPILOT

Button:

```text
Ask AI
```

Questions:

```text
Why is this bidder high risk?
What requirements did they fail?
What documents are missing?
Compare these bidders.
Which bidders require clarification?
```

AI answers must provide evidence references.

---

# 12.13 CLARIFICATION MANAGEMENT

Route:

```text
/client/clarifications
```

Buttons:

```text
Request Clarification
View Response
Resolve
Reopen
```

---

# 12.14 FINAL DECISION

Route:

```text
/client/bids/[id]/decision
```

Show:

### AI Recommendation

```text
MANUAL REVIEW REQUIRED
```

Reasons:

- Local content issue
- OEM authorization mismatch

Then:

```text
Procurement Officer Decision

○ Approve
○ Reject
○ Request Clarification
```

Required:

```text
Decision Remarks
```

Button:

```text
Submit Decision
```

Confirmation:

> This decision will be recorded in the audit trail.

---

# 12.15 CLIENT REPORTS

Route:

```text
/client/reports
```

Report types:

```text
Tender Report
Bid Compliance Report
Risk Report
Bidder Comparison
Audit Report
```

Buttons:

```text
Generate
Preview
Download PDF
Export CSV
```

---

# 12.16 CLIENT AUDIT

Route:

```text
/client/audit
```

Filters:

- User
- Bidder
- Tender
- Action
- Date

Timeline:

```text
Tender Created
Bid Submitted
Verification Started
Verification Completed
Clarification Requested
Decision Made
```

---

# 13. ADMIN PORTAL

The Admin has system-wide control.

---

# 13.1 ADMIN DASHBOARD

Route:

```text
/admin/dashboard
```

KPI cards:

```text
Total Users
Total Clients
Organizations
Active Tenders
Total Bids
Verifications
AI Requests
System Alerts
```

### System Health

```text
Database       🟢
AI Engine      🟢
OCR Engine     🟢
GST Connector  🟢
Udyam          🟡
Storage        🟢
```

### Activity Feed

```text
New client registered
Tender published
Connector failed
Rule updated
User suspended
```

---

# 13.2 USER MANAGEMENT

Route:

```text
/admin/users
```

Tabs:

```text
All
Bidders
Officers
Auditors
Suspended
Pending
```

Actions:

```text
View
Edit
Verify
Suspend
Activate
Reset Password
Deactivate
```

---

# 13.3 USER DETAILS

Show:

- Profile
- Organization
- Role
- Account status
- Activity
- Tenders
- Bids
- Security events

Admin actions:

```text
Suspend
Activate
Change Role
Reset Access
```

---

# 13.4 CLIENT MANAGEMENT

Route:

```text
/admin/clients
```

Actions:

```text
Approve
Suspend
Activate
View
Edit
Assign Organization
```

---

# 13.5 ORGANIZATION MANAGEMENT

Route:

```text
/admin/organizations
```

Fields:

- Organization
- Department
- Officers
- Active tenders
- Status

Actions:

```text
Create
Edit
Suspend
View
```

---

# 13.6 ADMIN TENDER MANAGEMENT

Route:

```text
/admin/tenders
```

Admin can view every tender.

Filters:

- Organization
- Client
- Status
- Date
- Category

Actions:

```text
View
Suspend
Archive
Cancel
Assign Officer
```

All administrative actions are logged.

---

# 13.7 ADMIN BID MANAGEMENT

Route:

```text
/admin/bids
```

View:

- Bidder
- Tender
- Status
- Compliance
- Risk
- Submission
- Verification

Admin has read access by default.

Any intervention must be explicitly logged.

---

# 13.8 CONNECTOR MANAGEMENT

Route:

```text
/admin/connectors
```

Cards:

```text
GST
Udyam
PAN
Income Tax
EPFO
ESIC
Startup India
NSIC
OEM
DigiLocker
Debarment
```

Each card:

```text
Status
Last Checked
Response Time
Failure Rate
Environment
```

Actions:

```text
Test Connection
Enable
Disable
View Logs
Configure
```

Never expose secrets.

---

# 13.9 COMPLIANCE RULE MANAGEMENT

Route:

```text
/admin/rules
```

Table:

```text
Rule
Category
Version
Status
Effective Date
```

Actions:

```text
Create Rule
Edit
Disable
Clone
View Version History
```

---

# 13.10 CREATE RULE

Fields:

- Rule name
- Category
- Condition
- Operator
- Threshold
- Evidence required
- Severity
- Effective date

Example:

```text
Rule:
Local Content

Condition:
Bidder local content >= Tender minimum

Severity:
HIGH
```

Button:

```text
Save Rule
```

---

# 13.11 DOCUMENT TYPE MANAGEMENT

Route:

```text
/admin/document-types
```

Manage:

- Document name
- Category
- Required fields
- Verification source
- Expiry
- OCR fields

Buttons:

```text
Create
Edit
Disable
```

---

# 13.12 AI MANAGEMENT

Route:

```text
/admin/ai
```

Cards:

```text
Tender Parser
OCR
Document Classifier
Entity Resolver
Risk Engine
Recommendation Engine
Copilot
```

Show:

- Status
- Model
- Version
- Requests
- Errors
- Latency

---

# 13.13 RISK CONFIGURATION

Route:

```text
/admin/risk
```

Configure:

```text
Low
Medium
High
Critical
```

Configure score weights.

Example:

```text
GST                  10%
PAN                  10%
Udyam                10%
Tax                  15%
Local Content        15%
OEM                  15%
Documentation        10%
Debarment             15%
```

---

# 13.14 NOTIFICATION MANAGEMENT

Route:

```text
/admin/notifications
```

Manage:

- Email templates
- Notification types
- Reminder intervals
- Alert rules

---

# 13.15 SECURITY CENTER

Route:

```text
/admin/security
```

Show:

```text
Failed Logins
Suspicious Activity
Active Sessions
2FA Status
Security Alerts
```

Actions:

```text
Terminate Session
Block Account
View Event
```

---

# 13.16 AUDIT LOGS

Route:

```text
/admin/audit
```

This is the master audit system.

Columns:

```text
Timestamp
Actor
Role
Action
Resource
Result
IP/Session
```

Filters:

```text
User
Client
Tender
Bid
Action
Date
```

Button:

```text
Export Audit Log
```

---

# 13.17 SYSTEM SETTINGS

Route:

```text
/admin/settings
```

Sections:

### General

- Platform name
- Logo
- Organization settings

### Security

- Session timeout
- Password rules
- 2FA

### AI

- Model configuration
- Confidence threshold

### Compliance

- Default risk thresholds
- Default rules

### Notifications

- Email
- SMS
- In-app

---

# 13.18 ADMIN REPORTS

Route:

```text
/admin/reports
```

Reports:

```text
System Usage
Tender Statistics
Bid Statistics
Compliance Statistics
Risk Statistics
AI Performance
Connector Performance
Audit Report
```

Buttons:

```text
Generate
Preview
Download
Export
```

---

# 14. SHARED AI COMPONENTS

Every AI feature must use the same UI.

---

## AI PROCESSING STATE

```text
Analyzing document...
Extracting information...
Cross-checking data...
Evaluating requirements...
Generating recommendation...
```

---

## AI RESULT CARD

```text
AI Analysis

Confidence: 94%

Finding:
Local content below tender requirement.

Evidence:
Make-in-India Declaration
Page 4
```

Buttons:

```text
View Evidence
Explain
Dismiss
```

---

# 15. COMPLIANCE STATUS SYSTEM

Use these statuses everywhere:

```text
PASS
FAIL
REVIEW
PENDING
NOT APPLICABLE
EXPIRED
MISSING
VERIFICATION FAILED
```

---

# 16. RISK STATUS SYSTEM

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 17. TENDER STATUS

```text
DRAFT
UPCOMING
LIVE
UNDER EVALUATION
CLOSED
AWARDED
CANCELLED
```

---

# 18. BID STATUS

```text
DRAFT
SUBMITTED
UNDER VERIFICATION
UNDER EVALUATION
CLARIFICATION REQUIRED
COMPLIANCE PASSED
COMPLIANCE FAILED
AWARDED
REJECTED
WITHDRAWN
```

---

# 19. EMPTY STATES

Every page must have an empty state.

Example:

```text
No tenders found.

Try changing your filters or create a new tender.
```

Button:

```text
Create Tender
```

---

# 20. LOADING STATES

Use skeletons rather than blank pages.

AI pages should show meaningful progress.

Example:

```text
✓ Document uploaded
✓ OCR completed
● Extracting information
○ Verification
○ Compliance
○ Risk analysis
```

---

# 21. ERROR STATES

Every API failure must show:

```text
Unable to complete verification.

The verification service is temporarily unavailable.
```

Buttons:

```text
Retry
View Details
```

Never expose technical stack traces to users.

---

# 22. CONFIRMATION MODALS

Use confirmation before:

- Delete
- Cancel tender
- Reject bid
- Suspend user
- Disable connector
- Publish tender
- Final decision

Example:

> Are you sure you want to publish this tender?

Show:

```text
24 compliance requirements
12 documents
Bid opening: 27 Aug 2026
```

Button:

```text
Confirm & Publish
```

---

# 23. RESPONSIVE DESIGN

The primary target is desktop because procurement officers will likely use desktop systems.

Still support:

### Desktop

Full dashboard.

### Tablet

Responsive tables and sidebars.

### Mobile

Essential functions:

- Notifications
- Bid status
- Tender viewing
- Clarification
- Basic dashboard

Do not try to make every complex table perfect on mobile.

---

# 24. GLOBAL SEARCH

The top navigation should provide global search.

Search:

```text
Tender ID
Bid ID
Bidder
Company
GSTIN
PAN
Udyam
```

Results grouped:

```text
Tenders
Bidders
Bids
Documents
```

---

# 25. GLOBAL NOTIFICATION CENTER

Bell icon.

Categories:

```text
Tender
Bid
Verification
Clarification
Document
System
```

Unread count:

```text
🔔 5
```

---

# 26. GLOBAL FILE VIEWER

All PDFs should open in the same viewer.

Features:

- Zoom
- Page navigation
- Search text
- Download
- Highlight evidence
- Page number
- Evidence markers

This is particularly important for the Evidence Engine.

---

# 27. EVIDENCE HIGHLIGHTING

When AI identifies:

```text
Local Content = 42%
```

the PDF viewer should highlight:

> **42%**

and show:

```text
AI Finding
Local Content

Page 4
Confidence 98%
```

This is one of the strongest visual features of the platform.

---

# 28. AUDIT TIMELINE COMPONENT

Reusable component:

```text
● 18:31 Tender uploaded
│
● 18:32 Requirements extracted
│
● 18:33 Bid submitted
│
● 18:34 Verification completed
│
● 18:35 Risk calculated
│
● 18:37 Clarification requested
│
● 18:40 Officer decision
```

---

# 29. DATABASE-DRIVEN UI

Do not hardcode:

```text
GST
PAN
Udyam
EPFO
```

into every page.

These should come from backend configuration where possible.

This allows Admin to control the platform.

---

# 30. FRONTEND FOLDER STRUCTURE

```text
src/

├── app/
│
│   ├── login/
│   ├── register/
│
│   ├── user/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── documents/
│   │   ├── tenders/
│   │   ├── eligibility/
│   │   ├── bids/
│   │   ├── clarifications/
│   │   └── notifications/
│
│   ├── client/
│   │   ├── dashboard/
│   │   ├── tenders/
│   │   ├── bids/
│   │   ├── compliance/
│   │   ├── risk/
│   │   ├── comparison/
│   │   ├── clarifications/
│   │   ├── decisions/
│   │   ├── reports/
│   │   └── audit/
│
│   └── admin/
│       ├── dashboard/
│       ├── users/
│       ├── clients/
│       ├── organizations/
│       ├── tenders/
│       ├── bids/
│       ├── connectors/
│       ├── rules/
│       ├── document-types/
│       ├── ai/
│       ├── risk/
│       ├── notifications/
│       ├── security/
│       ├── audit/
│       ├── reports/
│       └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── tender/
│   ├── bidder/
│   ├── bid/
│   ├── compliance/
│   ├── risk/
│   ├── evidence/
│   ├── ai/
│   ├── documents/
│   ├── audit/
│   └── reports/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── constants/
│
├── hooks/
│
├── types/
│
└── styles/
```

---

# 31. TEAM DEVELOPMENT RULES

All six developers MUST follow these rules.

### Rule 1

Use the shared design system.

### Rule 2

Use shared components.

### Rule 3

Do not change global colors independently.

### Rule 4

Do not create duplicate components.

### Rule 5

Do not directly access another module's database.

### Rule 6

Use API contracts.

### Rule 7

Use TypeScript types.

### Rule 8

Every destructive action requires confirmation.

### Rule 9

Every procurement decision requires audit logging.

### Rule 10

AI findings must have evidence wherever possible.

---

# 32. GIT STRUCTURE

Use:

```text
main
│
└── develop
    │
    ├── feature/user-portal
    ├── feature/client-portal
    ├── feature/admin-portal
    ├── feature/ai
    ├── feature/compliance
    └── feature/backend
```

Never directly push to `main`.

Use Pull Requests.

---

# 33. SHARED API CONTRACT

Before development begins, freeze the API.

Important endpoints:

```text
/auth
/users
/organizations
/tenders
/bids
/documents
/verification
/compliance
/risk
/evidence
/clarifications
/decisions
/reports
/audit
/admin
```

Example:

```http
POST /api/tenders
GET /api/tenders
GET /api/tenders/{id}
PUT /api/tenders/{id}
POST /api/tenders/{id}/publish
```

Bid:

```http
POST /api/bids
GET /api/bids/{id}
POST /api/bids/{id}/submit
POST /api/bids/{id}/verify
```

Compliance:

```http
GET /api/bids/{id}/compliance
POST /api/bids/{id}/compliance/run
```

Evidence:

```http
GET /api/evidence/{id}
```

Decision:

```http
POST /api/bids/{id}/decision
```

---

# 34. FINAL SIH DEMO FLOW

The entire platform should be capable of demonstrating:

```text
ADMIN
 ↓
Create/approve CPCL organization
 ↓
Create procurement officer
 ↓
Configure verification connectors
 ↓
CLIENT
 ↓
Create Tender
 ↓
Upload Tender PDF
 ↓
AI extracts requirements
 ↓
Compliance Blueprint
 ↓
Approve Blueprint
 ↓
Publish Tender
 ↓
USER
 ↓
Browse Tender
 ↓
Check Eligibility
 ↓
Create Bid
 ↓
Upload Documents
 ↓
AI Pre-submission Check
 ↓
Submit Bid
 ↓
SYSTEM
 ↓
OCR
 ↓
Document Extraction
 ↓
Government Verification
 ↓
Cross-document Verification
 ↓
Compliance Rules
 ↓
Risk Score
 ↓
Evidence
 ↓
AI Recommendation
 ↓
CLIENT
 ↓
Review Bid
 ↓
Open Evidence
 ↓
Request Clarification
 ↓
User Responds
 ↓
Client Final Decision
 ↓
Audit Trail
 ↓
Verification Report
```

---

# 35. THE THREE MOST IMPORTANT SCREENS

If development time becomes limited, prioritize these three.

## 🥇 1. Client Compliance Dashboard

Must show:

```text
82/100
MEDIUM RISK

18 Passed
3 Review
2 Failed

Risk Drivers

🔴 Local Content
🟠 OEM Authorization
🟢 GST
🟢 PAN
🟢 Udyam
```

---

## 🥈 2. Evidence Viewer

Must show:

```text
Tender Requirement
       ↓
Document
       ↓
Page
       ↓
Extracted Value
       ↓
Verification
       ↓
Result
```

This is your major WOW screen.

---

## 🥉 3. Tender Intelligence / Compliance Blueprint

Show:

```text
Tender PDF
       ↓
AI
       ↓
24 Requirements Identified
       ↓
Client Approval
       ↓
Compliance Blueprint
```

This differentiates the platform from a generic document-verification application.

---

# 36. FINAL DESIGN PHILOSOPHY

The platform should communicate one idea throughout the UI:

> **AI verifies. Evidence explains. Rules evaluate. Humans decide.**

The AI should never appear to independently disqualify a bidder.

The interface should always make clear:

```text
AI Finding
     ↓
Evidence
     ↓
Compliance Rule
     ↓
Risk
     ↓
Recommendation
     ↓
Procurement Officer
     ↓
Final Decision
```

This is the core identity of the entire product.