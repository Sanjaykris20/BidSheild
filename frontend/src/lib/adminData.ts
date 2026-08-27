import {
  AdminUser,
  ClientEntity,
  OrganizationEntity,
  ConnectorConfig,
  ConnectorLog,
  ComplianceRule,
  DocumentTypeConfig,
  AIServiceMetric,
  RiskWeightConfig,
  RiskThresholdBand,
  SecuritySession,
  SecurityAlert,
  AuditLogEntry,
  SystemNotification,
  SystemSettingsConfig,
} from '@/types';

export const mockAdminKPIs = {
  users: 1420,
  usersActiveToday: 384,
  clients: 68,
  organizations: 24,
  tenders: 114,
  bids: 842,
  verifications: 5390,
  aiRequests24h: 28410,
  systemAlerts: 2,
};

export const mockAdminUsers: AdminUser[] = [
  {
    id: "USR-101",
    name: "Dr. Rajeshwar Sharma",
    email: "rajeshwar.sharma@cpcl.gov.in",
    organization: "Chennai Petroleum Corporation Limited (CPCL)",
    department: "Procurement & Contracts",
    role: "PROCUREMENT_OFFICER",
    status: "ACTIVE",
    createdAt: "12 Jan 2025",
    lastActive: "2 mins ago",
    twoFactorEnabled: true,
    phone: "+91 98410 12345",
    assignedTendersCount: 6,
    activeBidsCount: 18,
    verifiedAt: "15 Jan 2025"
  },
  {
    id: "USR-102",
    name: "Vikramaditya Sengupta",
    email: "vikram@abctech-eng.com",
    organization: "ABC Technologies & Engineering Ltd",
    department: "Tendering & Business Development",
    role: "BIDDER",
    status: "ACTIVE",
    createdAt: "04 Feb 2025",
    lastActive: "15 mins ago",
    twoFactorEnabled: true,
    phone: "+91 98200 98765",
    pan: "AAACA1234F",
    gstin: "33AAACA1234F1ZV",
    activeBidsCount: 3,
    verifiedAt: "05 Feb 2025"
  },
  {
    id: "USR-103",
    name: "Pooja Ananthakrishnan",
    email: "pooja.a@iocl.co.in",
    organization: "Indian Oil Corporation Ltd (IOCL)",
    department: "Pipelines Division",
    role: "PROCUREMENT_OFFICER",
    status: "ACTIVE",
    createdAt: "18 Nov 2024",
    lastActive: "1 hour ago",
    twoFactorEnabled: true,
    phone: "+91 94440 55678",
    assignedTendersCount: 4,
    activeBidsCount: 22,
    verifiedAt: "19 Nov 2024"
  },
  {
    id: "USR-104",
    name: "Anand Deshmukh",
    email: "anand@apexvalves.com",
    organization: "Apex Precision Valves Corp",
    role: "BIDDER",
    status: "ACTIVE",
    createdAt: "22 Mar 2025",
    lastActive: "3 hours ago",
    twoFactorEnabled: false,
    phone: "+91 99887 11223",
    pan: "BBBCB5678K",
    gstin: "27BBBCB5678K1ZR",
    activeBidsCount: 1,
    verifiedAt: "23 Mar 2025"
  },
  {
    id: "USR-105",
    name: "Kavitha Ranganathan",
    email: "admin.super@gem-bidverif.gov.in",
    organization: "GeM Platform Administration SPV",
    department: "Cyber Security & Operations",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "01 Jan 2024",
    lastActive: "Just now",
    twoFactorEnabled: true,
    phone: "+91 91111 00000",
    verifiedAt: "01 Jan 2024"
  },
  {
    id: "USR-106",
    name: "Rameshwar Rao",
    email: "r.rao@zenithflow.com",
    organization: "Zenith Flow Controls Pvt Ltd",
    role: "BIDDER",
    status: "SUSPENDED",
    createdAt: "14 May 2025",
    lastActive: "3 days ago",
    twoFactorEnabled: false,
    phone: "+91 94432 88990",
    pan: "CCCCD9876P",
    gstin: "29CCCCD9876P1ZX",
    activeBidsCount: 0
  },
  {
    id: "USR-107",
    name: "Major General S. K. Nair",
    email: "dgqa.audit@mod.nic.in",
    organization: "Directorate General of Quality Assurance (DGQA)",
    department: "Vigilance & Compliance",
    role: "AUDITOR",
    status: "ACTIVE",
    createdAt: "10 Jun 2025",
    lastActive: "4 hours ago",
    twoFactorEnabled: true,
    phone: "+91 98100 44332",
    verifiedAt: "11 Jun 2025"
  },
  {
    id: "USR-108",
    name: "Naveen Prakash",
    email: "naveen@quickpowerinfra.org",
    organization: "QuickPower Infra Solutions",
    role: "BIDDER",
    status: "PENDING_VERIFICATION",
    createdAt: "24 Aug 2026",
    lastActive: "22 mins ago",
    twoFactorEnabled: false,
    phone: "+91 97654 32109",
    pan: "DDDDD4321Q",
    gstin: "36DDDDD4321Q1ZY"
  }
];

export const mockClients: ClientEntity[] = [
  {
    id: "CLT-01",
    name: "Chennai Petroleum Corporation Limited",
    shortCode: "CPCL",
    category: "PSU",
    department: "Ministry of Petroleum & Natural Gas",
    address: "Manali, Chennai - 600068, Tamil Nadu",
    status: "ACTIVE",
    procurementOfficersCount: 14,
    activeTendersCount: 9,
    totalProcurementValue: "₹ 480.50 Cr",
    createdAt: "10 Jan 2024",
    contactEmail: "procurement@cpcl.gov.in"
  },
  {
    id: "CLT-02",
    name: "Indian Oil Corporation Ltd",
    shortCode: "IOCL",
    category: "PSU",
    department: "Refineries & Pipelines Division",
    address: "Scope Complex, Lodhi Road, New Delhi - 110003",
    status: "ACTIVE",
    procurementOfficersCount: 38,
    activeTendersCount: 24,
    totalProcurementValue: "₹ 1,840.00 Cr",
    createdAt: "15 Jan 2024",
    contactEmail: "contracts@iocl.co.in"
  },
  {
    id: "CLT-03",
    name: "Oil and Natural Gas Corporation",
    shortCode: "ONGC",
    category: "PSU",
    department: "Offshore Engineering Services",
    address: "Deendayal Urja Bhawan, Vasant Kunj, New Delhi",
    status: "ACTIVE",
    procurementOfficersCount: 42,
    activeTendersCount: 31,
    totalProcurementValue: "₹ 3,420.00 Cr",
    createdAt: "01 Feb 2024",
    contactEmail: "mmd@ongc.co.in"
  },
  {
    id: "CLT-04",
    name: "Bharat Heavy Electricals Limited",
    shortCode: "BHEL",
    category: "PSU",
    department: "Power Sector - Southern Region",
    address: "BHEL House, Siri Fort, New Delhi - 110049",
    status: "ACTIVE",
    procurementOfficersCount: 22,
    activeTendersCount: 15,
    totalProcurementValue: "₹ 920.00 Cr",
    createdAt: "20 Mar 2024",
    contactEmail: "purchase@bhel.in"
  },
  {
    id: "CLT-05",
    name: "Defence Research & Development Organisation",
    shortCode: "DRDO",
    category: "DEFENCE",
    department: "Directorate of Material Management",
    address: "DRDO Bhawan, Rajaji Marg, New Delhi",
    status: "ACTIVE",
    procurementOfficersCount: 19,
    activeTendersCount: 12,
    totalProcurementValue: "₹ 650.00 Cr",
    createdAt: "05 Apr 2024",
    contactEmail: "procure.drdo@nic.in"
  },
  {
    id: "CLT-06",
    name: "National Highways Authority of India",
    shortCode: "NHAI",
    category: "CENTRAL_MINISTRY",
    department: "Ministry of Road Transport & Highways",
    address: "G 5&6, Sector-10, Dwarka, New Delhi - 110075",
    status: "PENDING_APPROVAL",
    procurementOfficersCount: 8,
    activeTendersCount: 0,
    totalProcurementValue: "₹ 0.00 Cr",
    createdAt: "22 Aug 2026",
    contactEmail: "tenders@nhai.org"
  }
];

export const mockOrganizations: OrganizationEntity[] = [
  {
    id: "ORG-01",
    organization: "Chennai Petroleum Corporation Limited",
    department: "Instrumentation & Control Division",
    code: "CPCL-IC-01",
    address: "Manali Refinery Complex, Chennai, TN 600068",
    status: "ACTIVE",
    assignedOfficers: ["Dr. Rajeshwar Sharma", "S. Meenakshi", "R. Swaminathan"],
    tendersCount: 4,
    createdDate: "12 Jan 2024"
  },
  {
    id: "ORG-02",
    organization: "Chennai Petroleum Corporation Limited",
    department: "Mechanical & Piping Wing",
    code: "CPCL-MP-02",
    address: "Manali Refinery Complex, Chennai, TN 600068",
    status: "ACTIVE",
    assignedOfficers: ["K. Venkatesh", "G. Balaji"],
    tendersCount: 5,
    createdDate: "15 Jan 2024"
  },
  {
    id: "ORG-03",
    organization: "Indian Oil Corporation Ltd",
    department: "Northern Region Pipelines",
    code: "IOCL-NR-PL",
    address: "IndianOil Bhawan, 1 Sri Aurobindo Marg, Yusuf Sarai, New Delhi",
    status: "ACTIVE",
    assignedOfficers: ["Pooja Ananthakrishnan", "Harish Gulati"],
    tendersCount: 14,
    createdDate: "02 Feb 2024"
  },
  {
    id: "ORG-04",
    organization: "Oil and Natural Gas Corporation",
    department: "Western Offshore Basin",
    code: "ONGC-WOB-01",
    address: "NBP Green Heights, BKC, Bandra East, Mumbai - 400051",
    status: "ACTIVE",
    assignedOfficers: ["Ashok Verma", "Nalini Kaul"],
    tendersCount: 18,
    createdDate: "10 Feb 2024"
  },
  {
    id: "ORG-05",
    organization: "Bharat Heavy Electricals Limited",
    department: "Boiler Auxiliaries Plant",
    code: "BHEL-BAP-RAN",
    address: "Ranipet, Vellore District, Tamil Nadu - 632406",
    status: "ACTIVE",
    assignedOfficers: ["T. Natarajan", "V. Priya"],
    tendersCount: 8,
    createdDate: "18 Mar 2024"
  }
];

export const mockConnectors: ConnectorConfig[] = [
  {
    id: "CONN-GST",
    name: "GSTN Statutory API",
    type: "GST",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "Just now",
    responseTime: "142ms",
    errorRate: "0.04%",
    successRate: "99.96%",
    endpointUrl: "https://api.gstn.gov.in/v2.1/taxpayer/search",
    apiKeyMasked: "gstn_live_sec_******************9a4b",
    description: "Validates taxpayer active status, return filing frequency (GSTR-1, 3B), and legal entity identity directly with GST System.",
    requests24h: 12450,
    rateLimitPerMin: 600
  },
  {
    id: "CONN-UDYAM",
    name: "Udyam MSME Registry Gateway",
    type: "Udyam",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "1 min ago",
    responseTime: "210ms",
    errorRate: "0.12%",
    successRate: "99.88%",
    endpointUrl: "https://api.udyamregistration.gov.in/v1/verify",
    apiKeyMasked: "udyam_prod_key_******************7c12",
    description: "Fetches Micro/Small/Medium enterprise tier, turnover investment slabs, and DIC jurisdiction for fee exemption.",
    requests24h: 8930,
    rateLimitPerMin: 450
  },
  {
    id: "CONN-PAN",
    name: "PAN / NSDL Direct Verifier",
    type: "PAN",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "Just now",
    responseTime: "165ms",
    errorRate: "0.01%",
    successRate: "99.99%",
    endpointUrl: "https://tin.tin.nsdl.com/pantan/panVerification",
    apiKeyMasked: "nsdl_live_auth_******************88f1",
    description: "Direct verification of Permanent Account Number validity, legal name match, and status against ITD database.",
    requests24h: 14200,
    rateLimitPerMin: 1000
  },
  {
    id: "CONN-ITR",
    name: "Income Tax Department E-Filing API",
    type: "Income Tax",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "4 mins ago",
    responseTime: "340ms",
    errorRate: "0.85%",
    successRate: "99.15%",
    endpointUrl: "https://eportal.incometax.gov.in/api/v3/itr/verification",
    apiKeyMasked: "itd_efiling_sec_******************11a3",
    description: "Audits 3-year turnover compliance, ITR acknowledgement status, and UDIN linking for CA audit certificates.",
    requests24h: 4820,
    rateLimitPerMin: 300
  },
  {
    id: "CONN-EPFO",
    name: "EPFO Shram Suvidha Connector",
    type: "EPFO",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "2 mins ago",
    responseTime: "280ms",
    errorRate: "0.45%",
    successRate: "99.55%",
    endpointUrl: "https://shramsuvidha.gov.in/api/epfo/status",
    apiKeyMasked: "epfo_gateway_******************44d9",
    description: "Verifies establishment registration, Electronic Challan cum Return (ECR) payments, and active worker counts.",
    requests24h: 3100,
    rateLimitPerMin: 200
  },
  {
    id: "CONN-ESIC",
    name: "ESIC Employer Insurance Verification",
    type: "ESIC",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "5 mins ago",
    responseTime: "295ms",
    errorRate: "0.50%",
    successRate: "99.50%",
    endpointUrl: "https://www.esic.in/api/employer/v1/compliance",
    apiKeyMasked: "esic_auth_sec_******************55b2",
    description: "Confirms regular ESIC contribution filing and valid employer code across relevant industrial zones.",
    requests24h: 2940,
    rateLimitPerMin: 200
  },
  {
    id: "CONN-STARTUP",
    name: "DPIIT Startup India Portal",
    type: "Startup India",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "12 mins ago",
    responseTime: "190ms",
    errorRate: "0.08%",
    successRate: "99.92%",
    endpointUrl: "https://api.startupindia.gov.in/v2/recognition/status",
    apiKeyMasked: "dpiit_token_******************99e4",
    description: "Verifies DIPP/DPIIT certificate of recognition for prior experience & turnover relaxation criteria in public procurement.",
    requests24h: 1850,
    rateLimitPerMin: 150
  },
  {
    id: "CONN-NSIC",
    name: "NSIC Single Point Registration Gateway",
    type: "NSIC",
    status: "DEGRADED",
    environment: "SANDBOX",
    lastChecked: "8 mins ago",
    responseTime: "620ms",
    errorRate: "4.20%",
    successRate: "95.80%",
    endpointUrl: "https://www.nsicspronline.com/api/v1/store/verify",
    apiKeyMasked: "nsic_sbx_key_******************33f0",
    description: "Validates NSIC SPRS certificate validity, monetary limits, and enlisted commercial stores.",
    requests24h: 920,
    rateLimitPerMin: 100
  },
  {
    id: "CONN-OEM",
    name: "Global OEM Certificate Repository",
    type: "OEM",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "3 mins ago",
    responseTime: "310ms",
    errorRate: "0.90%",
    successRate: "99.10%",
    endpointUrl: "https://api.oemverify.org/v2/maf/lookup",
    apiKeyMasked: "oem_global_auth_******************77a1",
    description: "Cross-checks Manufacturer Authorization Form (MAF), unexpired territory permissions, and direct OEM warranty pledges.",
    requests24h: 5600,
    rateLimitPerMin: 400
  },
  {
    id: "CONN-DIGILOCKER",
    name: "DigiLocker NIC Institutional API",
    type: "DigiLocker",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "Just now",
    responseTime: "175ms",
    errorRate: "0.05%",
    successRate: "99.95%",
    endpointUrl: "https://api.digitallocker.gov.in/public/oauth2/1/xml/pull",
    apiKeyMasked: "digilocker_nic_******************22b8",
    description: "Pulls tamper-proof digitally signed certificates, PAN cards, incorporated registrations, and audited balance sheets.",
    requests24h: 16800,
    rateLimitPerMin: 1200
  },
  {
    id: "CONN-DEBARMENT",
    name: "Central GeM & CVC Debarment Registry",
    type: "Debarment",
    status: "ONLINE",
    environment: "LIVE",
    lastChecked: "Just now",
    responseTime: "115ms",
    errorRate: "0.00%",
    successRate: "100.0%",
    endpointUrl: "https://gem.gov.in/api/v2/registry/blacklisted-entities",
    apiKeyMasked: "cvc_gem_sec_******************99d3",
    description: "Queries active blacklisting, debarment, or vigilance ban orders across all Central Ministries, PSUs, and State Governments.",
    requests24h: 19400,
    rateLimitPerMin: 2000
  }
];

export const mockConnectorLogs: ConnectorLog[] = [
  {
    id: "LOG-901",
    connectorId: "CONN-GST",
    connectorName: "GSTN Statutory API",
    timestamp: "24 Aug 2026, 21:10:45",
    status: "SUCCESS",
    httpCode: 200,
    latencyMs: 138,
    requestPayload: '{"gstin": "33AAACA1234F1ZV", "action": "TAX_PAYER_DETAILS"}',
    responsePayload: '{"status": "ACT", "legalName": "ABC TECHNOLOGIES & ENGINEERING LTD", "filingStatus": "REGULAR", "lastReturnFiled": "2026-07-20"}'
  },
  {
    id: "LOG-902",
    connectorId: "CONN-DEBARMENT",
    connectorName: "Central GeM & CVC Debarment Registry",
    timestamp: "24 Aug 2026, 21:09:12",
    status: "SUCCESS",
    httpCode: 200,
    latencyMs: 112,
    requestPayload: '{"pan": "AAACA1234F", "cin": "U29100TN2012PLC084920"}',
    responsePayload: '{"isDebarred": false, "blacklisted": false, "alerts": []}'
  },
  {
    id: "LOG-903",
    connectorId: "CONN-NSIC",
    connectorName: "NSIC Single Point Registration Gateway",
    timestamp: "24 Aug 2026, 21:05:33",
    status: "TIMEOUT",
    httpCode: 504,
    latencyMs: 5002,
    requestPayload: '{"certificateNumber": "NSIC/TN/2024/0991"}',
    responsePayload: '{"error": "Gateway Timeout from NSIC SPRS Host server"}'
  }
];

export const mockComplianceRules: ComplianceRule[] = [
  {
    id: "RULE-01",
    ruleCode: "STAT-GST-01",
    title: "GST Status Must Be Active with Regular Filings",
    description: "Statutory requirement: GSTIN must be active and all GSTR-3B filings up to the preceding month must be submitted without defaults.",
    category: "Statutory",
    parameter: "gstin_status",
    operator: "EQUALS",
    thresholdValue: "ACTIVE_REGULAR",
    weightPercent: 10,
    severity: "CRITICAL",
    status: "ACTIVE",
    version: "v2.1",
    updatedAt: "10 Aug 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-02",
    ruleCode: "MII-CONT-02",
    title: "Local Content (Make-in-India) Minimum Percentage",
    description: "Mandatory Public Procurement (Preference to Make in India) Order: Quoted items must meet minimum local manufacturing value addition.",
    category: "Make-in-India",
    parameter: "local_content_percent",
    operator: "GREATER_EQUAL",
    thresholdValue: "50.0%",
    weightPercent: 15,
    severity: "CRITICAL",
    status: "ACTIVE",
    version: "v3.0",
    updatedAt: "14 Aug 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-03",
    ruleCode: "FIN-TURN-03",
    title: "Average Annual Turnover Threshold",
    description: "Audited 3-year turnover certified with valid CA UDIN must equal or exceed tender eligibility value.",
    category: "Financial",
    parameter: "average_turnover_in_crores",
    operator: "GREATER_EQUAL",
    thresholdValue: "₹ 10.00 Cr",
    weightPercent: 15,
    severity: "HIGH",
    status: "ACTIVE",
    version: "v1.4",
    updatedAt: "01 Jul 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-04",
    ruleCode: "TECH-EXP-04",
    title: "Prior Experience & Similar Work Execution",
    description: "Bidder must furnish work completion certificates for similar supply/EPC projects in the last 5 financial years.",
    category: "Technical",
    parameter: "executed_work_count",
    operator: "GREATER_EQUAL",
    thresholdValue: "3 Projects",
    weightPercent: 10,
    severity: "HIGH",
    status: "ACTIVE",
    version: "v2.0",
    updatedAt: "20 Jun 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-05",
    ruleCode: "DEBAR-CLR-05",
    title: "Debarment & Blacklisting Registry Must Be Clear",
    description: "Bidder entity, directors, and consortium partners must have zero active debarments on CVC, GeM, or Ministry registers.",
    category: "Integrity",
    parameter: "debarment_status",
    operator: "EQUALS",
    thresholdValue: "CLEAR",
    weightPercent: 15,
    severity: "CRITICAL",
    status: "ACTIVE",
    version: "v2.2",
    updatedAt: "12 Aug 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-06",
    ruleCode: "OEM-AUTH-06",
    title: "Valid OEM Authorization & Warranty Commitment",
    description: "Authorized channel partner must upload unexpired Manufacturer Authorization Form (MAF) with minimum 3-year warranty pledge.",
    category: "Technical",
    parameter: "oem_maf_validity",
    operator: "NOT_EXPIRED",
    thresholdValue: "FY26-27_VALID",
    weightPercent: 15,
    severity: "HIGH",
    status: "ACTIVE",
    version: "v2.3",
    updatedAt: "15 Aug 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-07",
    ruleCode: "DOC-VAULT-07",
    title: "Statutory Document Integrity & Digital Signature",
    description: "All mandatory statutory documents (PAN, TAN, MSME, Power of Attorney) must possess valid digital signatures or UDIN certificates.",
    category: "Documentation",
    parameter: "document_integrity_score",
    operator: "GREATER_EQUAL",
    thresholdValue: "90%",
    weightPercent: 10,
    severity: "MEDIUM",
    status: "ACTIVE",
    version: "v1.2",
    updatedAt: "05 Jun 2026",
    lastModifiedBy: "Super Admin"
  },
  {
    id: "RULE-08",
    ruleCode: "PAN-ITR-08",
    title: "Valid PAN with Linked Aadhar / Director KYC",
    description: "PAN must be operational and linked with Director Identification Number (DIN) and verified on NSDL database.",
    category: "Statutory",
    parameter: "pan_kyc_status",
    operator: "EQUALS",
    thresholdValue: "VERIFIED",
    weightPercent: 10,
    severity: "HIGH",
    status: "ACTIVE",
    version: "v1.0",
    updatedAt: "18 May 2026",
    lastModifiedBy: "Super Admin"
  }
];

export const mockDocumentTypes: DocumentTypeConfig[] = [
  {
    id: "DOC-GST",
    code: "GST",
    name: "Goods & Services Tax Registration Certificate (GST REG-06)",
    category: "Statutory",
    mandatoryFields: [
      { id: "f1", name: "GSTIN", key: "gstin", dataType: "REGEX", isRequired: true, validationRegex: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" },
      { id: "f2", name: "Legal Name", key: "legalName", dataType: "STRING", isRequired: true },
      { id: "f3", name: "Registration Date", key: "registrationDate", dataType: "DATE", isRequired: true }
    ],
    allowedFormats: ["PDF", "JPG", "PNG"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Official certificate issued by GST Council evidencing valid taxpayer registration.",
    updatedAt: "10 Aug 2026"
  },
  {
    id: "DOC-PAN",
    code: "PAN",
    name: "Permanent Account Number Card (Income Tax Dept)",
    category: "Statutory",
    mandatoryFields: [
      { id: "f4", name: "PAN Number", key: "pan", dataType: "REGEX", isRequired: true, validationRegex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" },
      { id: "f5", name: "Name on Card", key: "name", dataType: "STRING", isRequired: true },
      { id: "f6", name: "Date of Incorporation / Birth", key: "doi", dataType: "DATE", isRequired: true }
    ],
    allowedFormats: ["PDF", "JPG", "PNG"],
    maxFileSizeMB: 5,
    ocrConfidenceThreshold: 90,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Identity verification card issued by Income Tax Department under NSDL/UTIITSL.",
    updatedAt: "12 Aug 2026"
  },
  {
    id: "DOC-UDYAM",
    code: "Udyam",
    name: "Udyam MSME Registration Certificate",
    category: "Statutory",
    mandatoryFields: [
      { id: "f7", name: "Udyam Registration Number", key: "udyamNo", dataType: "REGEX", isRequired: true, validationRegex: "^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$" },
      { id: "f8", name: "Enterprise Classification", key: "tier", dataType: "STRING", isRequired: true },
      { id: "f9", name: "Major Activity", key: "activity", dataType: "STRING", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 88,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Government of India MSME recognition certificate for micro, small, and medium enterprises.",
    updatedAt: "15 Aug 2026"
  },
  {
    id: "DOC-ITR",
    code: "ITR",
    name: "Income Tax Return Acknowledgement (ITR-V / CA Audited)",
    category: "Financial",
    mandatoryFields: [
      { id: "f10", name: "Assessment Year", key: "ay", dataType: "STRING", isRequired: true },
      { id: "f11", name: "Gross Total Income / Turnover", key: "turnover", dataType: "NUMBER", isRequired: true },
      { id: "f12", name: "UDIN Reference", key: "udin", dataType: "STRING", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 20,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: true,
    status: "ACTIVE",
    description: "3-year audited financial statements and IT e-filing acknowledgements.",
    updatedAt: "08 Aug 2026"
  },
  {
    id: "DOC-OEM",
    code: "OEM",
    name: "Manufacturer Authorization Form (MAF)",
    category: "Technical",
    mandatoryFields: [
      { id: "f13", name: "OEM Legal Name", key: "oemName", dataType: "STRING", isRequired: true },
      { id: "f14", name: "Authorized Territory", key: "territory", dataType: "STRING", isRequired: true },
      { id: "f15", name: "Validity Expiry Date", key: "expiryDate", dataType: "DATE", isRequired: true },
      { id: "f16", name: "Warranty Commitment Years", key: "warrantyYears", dataType: "NUMBER", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 15,
    ocrConfidenceThreshold: 80,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Direct OEM authorization letter endorsing bidder to quote, supply, and warranty products.",
    updatedAt: "18 Aug 2026"
  },
  {
    id: "DOC-EPFO",
    code: "EPFO",
    name: "Employees' Provident Fund Organisation Registration & ECR",
    category: "Statutory",
    mandatoryFields: [
      { id: "f17", name: "Establishment Code", key: "epfoCode", dataType: "STRING", isRequired: true },
      { id: "f18", name: "Last Challan Month", key: "challanMonth", dataType: "STRING", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Proof of active EPFO compliance and employee provident fund deposits.",
    updatedAt: "01 Jul 2026"
  },
  {
    id: "DOC-ESIC",
    code: "ESIC",
    name: "Employees' State Insurance Corporation Certificate",
    category: "Statutory",
    mandatoryFields: [
      { id: "f19", name: "Employer Code", key: "esicCode", dataType: "STRING", isRequired: true },
      { id: "f20", name: "Contribution Status", key: "status", dataType: "STRING", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Proof of ESIC registration for eligible workforce.",
    updatedAt: "01 Jul 2026"
  },
  {
    id: "DOC-STARTUP",
    code: "Startup",
    name: "DPIIT Startup India Recognition Certificate",
    category: "Legal",
    mandatoryFields: [
      { id: "f21", name: "DIPP Number", key: "dippNo", dataType: "STRING", isRequired: true },
      { id: "f22", name: "Valid Until", key: "validUntil", dataType: "DATE", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 88,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Certificate granted by DPIIT enabling tender relaxation for startups.",
    updatedAt: "10 Jun 2026"
  },
  {
    id: "DOC-NSIC",
    code: "NSIC",
    name: "NSIC Single Point Registration Scheme (SPRS) Certificate",
    category: "Statutory",
    mandatoryFields: [
      { id: "f23", name: "NSIC Registration No", key: "nsicNo", dataType: "STRING", isRequired: true },
      { id: "f24", name: "Monetary Limit", key: "monetaryLimit", dataType: "NUMBER", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 10,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Government purchase enlisting certificate under National Small Industries Corporation.",
    updatedAt: "15 Jun 2026"
  },
  {
    id: "DOC-MII",
    code: "MII Declaration",
    name: "Make-in-India (Local Content) Self Declaration",
    category: "Legal",
    mandatoryFields: [
      { id: "f25", name: "Class Supplier Tier", key: "classTier", dataType: "STRING", isRequired: true },
      { id: "f26", name: "Local Content Percentage", key: "localContentPct", dataType: "NUMBER", isRequired: true },
      { id: "f27", name: "Manufacturing Location", key: "location", dataType: "STRING", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 15,
    ocrConfidenceThreshold: 90,
    requiresCAVerification: true,
    status: "ACTIVE",
    description: "Statutory self-certificate stating percentage of domestic value addition and plant location.",
    updatedAt: "20 Aug 2026"
  },
  {
    id: "DOC-EXP",
    code: "Experience",
    name: "Past Work Orders & Client Completion Certificates",
    category: "Technical",
    mandatoryFields: [
      { id: "f28", name: "Client Organization", key: "clientOrg", dataType: "STRING", isRequired: true },
      { id: "f29", name: "Executed Order Value", key: "orderValue", dataType: "NUMBER", isRequired: true },
      { id: "f30", name: "Completion Date", key: "completionDate", dataType: "DATE", isRequired: true }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 30,
    ocrConfidenceThreshold: 80,
    requiresCAVerification: false,
    status: "ACTIVE",
    description: "Documentary evidence of similar project deliveries within the mandated time window.",
    updatedAt: "12 May 2026"
  },
  {
    id: "DOC-FIN",
    code: "Financial",
    name: "Audited Balance Sheets & Profit & Loss Statement",
    category: "Financial",
    mandatoryFields: [
      { id: "f31", name: "CA Firm Name", key: "caFirm", dataType: "STRING", isRequired: true },
      { id: "f32", name: "CA Membership Number", key: "caMemberNo", dataType: "STRING", isRequired: true },
      { id: "f33", name: "UDIN Number", key: "udin", dataType: "REGEX", isRequired: true, validationRegex: "^[0-9]{8}[A-Z]{4}[0-9]{4}$" }
    ],
    allowedFormats: ["PDF"],
    maxFileSizeMB: 25,
    ocrConfidenceThreshold: 85,
    requiresCAVerification: true,
    status: "ACTIVE",
    description: "Audited financial balance sheets certifying net worth, liquidity, and solvency.",
    updatedAt: "18 Jun 2026"
  }
];

export const mockAIServices: AIServiceMetric[] = [
  {
    id: "AI-01",
    serviceName: "Tender Parser",
    description: "Extracts clauses, eligibility criteria, turnover rules, and penalty conditions from raw PDF tender documents into structured JSON.",
    status: "ONLINE",
    requests24h: 3420,
    successRate: 99.4,
    failureRate: 0.6,
    latencyMs: 420,
    modelVersion: "Gemini 1.5 Pro (Tender-Specialized v3)",
    tokenConsumption: "14.8M tokens",
    temperature: 0.1,
    maxTokens: 4096,
    systemPromptSummary: "Specialized in Indian GeM, CPWD, and PSU standard bid formats. High-precision clause extraction."
  },
  {
    id: "AI-02",
    serviceName: "OCR",
    description: "Optical Character Recognition engine fine-tuned for scanned Indian official stamp papers, seals, UDIN barcodes, and handwritten signatures.",
    status: "ONLINE",
    requests24h: 8940,
    successRate: 98.9,
    failureRate: 1.1,
    latencyMs: 280,
    modelVersion: "Tesseract-Custom-OCR-v5.2 + Vision Pro",
    tokenConsumption: "22.1M tokens",
    temperature: 0.0,
    maxTokens: 2048,
    systemPromptSummary: "Extracts high-resolution tabular data, UDIN verification codes, and Hindi/English multilingual stamps."
  },
  {
    id: "AI-03",
    serviceName: "Document Classifier",
    description: "Automated multi-label document classifier identifying document types, certificate validity periods, and issuing government authorities.",
    status: "ONLINE",
    requests24h: 6720,
    successRate: 99.7,
    failureRate: 0.3,
    latencyMs: 140,
    modelVersion: "Classifier-BERT-Procure-v4",
    tokenConsumption: "6.2M tokens",
    temperature: 0.1,
    maxTokens: 1024,
    systemPromptSummary: "Categorizes uploaded files into 12 recognized statutory/technical/financial buckets."
  },
  {
    id: "AI-04",
    serviceName: "Entity Resolver",
    description: "Fuzzy matching and cross-document reconciliation of company legal names, PAN-GSTIN bindings, directors, and registered addresses.",
    status: "ONLINE",
    requests24h: 4280,
    successRate: 99.1,
    failureRate: 0.9,
    latencyMs: 195,
    modelVersion: "Entity-Graph-Neural-v2",
    tokenConsumption: "8.4M tokens",
    temperature: 0.2,
    maxTokens: 2048,
    systemPromptSummary: "Reconciles naming variations (e.g. 'Pvt Ltd' vs 'Private Limited' vs 'LLP') across filings."
  },
  {
    id: "AI-05",
    serviceName: "Contradiction Detector",
    description: "Semantic logic validator finding discrepancies between claimed values in self-declarations and verified third-party API data or CA certificates.",
    status: "ONLINE",
    requests24h: 3180,
    successRate: 98.6,
    failureRate: 1.4,
    latencyMs: 360,
    modelVersion: "Gemini 1.5 Flash (Contradiction-Detector-v2)",
    tokenConsumption: "11.2M tokens",
    temperature: 0.1,
    maxTokens: 3072,
    systemPromptSummary: "Identifies mathematical mismatches, expired certificate references, and conflicting declaration figures."
  },
  {
    id: "AI-06",
    serviceName: "Risk Engine",
    description: "Multi-parameter risk scoring algorithm applying administrative weights, severity penalties, and confidence multipliers to generate 0-100 score.",
    status: "ONLINE",
    requests24h: 4890,
    successRate: 100.0,
    failureRate: 0.0,
    latencyMs: 85,
    modelVersion: "RiskMatrix-Weighted-Engine-v3.1",
    tokenConsumption: "1.5M tokens",
    temperature: 0.0,
    maxTokens: 512,
    systemPromptSummary: "Calculates deterministic compliance scores with statutory gating checks."
  },
  {
    id: "AI-07",
    serviceName: "Recommendation Engine",
    description: "Generates actionable procurement recommendations (Approve, Clarification, Reject) with citations and statutory justification clauses.",
    status: "ONLINE",
    requests24h: 2950,
    successRate: 99.2,
    failureRate: 0.8,
    latencyMs: 310,
    modelVersion: "Gemini 1.5 Pro (Procurement-Advise-v2)",
    tokenConsumption: "9.6M tokens",
    temperature: 0.2,
    maxTokens: 2048,
    systemPromptSummary: "Synthesizes multi-document findings into structured guidance for procurement officers."
  },
  {
    id: "AI-08",
    serviceName: "AI Copilot",
    description: "Interactive conversational procurement assistant answering questions regarding tender clauses, bidder evidence, and statutory precedents.",
    status: "ONLINE",
    requests24h: 5120,
    successRate: 98.8,
    failureRate: 1.2,
    latencyMs: 450,
    modelVersion: "Gemini 1.5 Pro (Interactive-Copilot-v2.4)",
    tokenConsumption: "18.3M tokens",
    temperature: 0.3,
    maxTokens: 4096,
    systemPromptSummary: "Context-aware grounded chat bot citing tender page numbers and requirement IDs."
  }
];

export const defaultRiskWeights: RiskWeightConfig = {
  gst: 10,
  pan: 10,
  udyam: 10,
  tax: 15,
  localContent: 15,
  oem: 15,
  documents: 10,
  debarment: 15
};

export const defaultRiskBands: RiskThresholdBand[] = [
  {
    level: "LOW",
    minScore: 90,
    maxScore: 100,
    actionRequired: "Direct Technical Qualification Recommended",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
  },
  {
    level: "MEDIUM",
    minScore: 70,
    maxScore: 89,
    actionRequired: "Officer Review / Clarification Letter Triggered",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
  },
  {
    level: "HIGH",
    minScore: 50,
    maxScore: 69,
    actionRequired: "Detailed Scrutiny & Mandatory Proof Submission",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300"
  },
  {
    level: "CRITICAL",
    minScore: 0,
    maxScore: 49,
    actionRequired: "Automatic Rejection / Statutory Gating Failure",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
  }
];

export const mockSecuritySessions: SecuritySession[] = [
  {
    id: "SES-8821",
    userId: "USR-105",
    userName: "Kavitha Ranganathan (Super Admin)",
    role: "ADMIN",
    ipAddress: "14.139.183.42",
    location: "New Delhi, India (NIC Gov Net)",
    browser: "Chrome 128 / Windows 11",
    device: "Desktop Workstation",
    loginTime: "24 Aug 2026, 20:45:10",
    lastActive: "Just now",
    status: "ACTIVE",
    isTwoFactor: true
  },
  {
    id: "SES-8819",
    userId: "USR-101",
    userName: "Dr. Rajeshwar Sharma (CPCL)",
    role: "PROCUREMENT_OFFICER",
    ipAddress: "115.112.240.18",
    location: "Chennai, Tamil Nadu",
    browser: "Edge 127 / Windows 10",
    device: "Office PC",
    loginTime: "24 Aug 2026, 19:12:00",
    lastActive: "2 mins ago",
    status: "ACTIVE",
    isTwoFactor: true
  },
  {
    id: "SES-8804",
    userId: "USR-102",
    userName: "Vikramaditya Sengupta (ABC Tech)",
    role: "BIDDER",
    ipAddress: "182.73.190.22",
    location: "Mumbai, Maharashtra",
    browser: "Chrome 128 / macOS",
    device: "MacBook Pro",
    loginTime: "24 Aug 2026, 18:30:15",
    lastActive: "15 mins ago",
    status: "ACTIVE",
    isTwoFactor: true
  },
  {
    id: "SES-8790",
    userId: "USR-106",
    userName: "Rameshwar Rao (Zenith Flow)",
    role: "BIDDER",
    ipAddress: "103.248.112.89",
    location: "Bengaluru, Karnataka (Unrecognized VPN)",
    browser: "Firefox 129 / Linux",
    device: "Unknown Terminal",
    loginTime: "24 Aug 2026, 17:02:40",
    lastActive: "3 days ago",
    status: "SUSPICIOUS",
    isTwoFactor: false
  }
];

export const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: "SEC-ALT-01",
    severity: "HIGH",
    title: "Multiple Failed Login Attempts from Flagged Subnet",
    description: "7 failed authentication attempts detected for user 'naveen@quickpowerinfra.org' from IP 194.26.29.11 within 2 minutes.",
    timestamp: "24 Aug 2026, 20:15:30",
    ipAddress: "194.26.29.11",
    actor: "Unknown External Actor",
    status: "OPEN"
  },
  {
    id: "SEC-ALT-02",
    severity: "CRITICAL",
    title: "Attempted Debarment Bypass Flagged by AI Verification",
    description: "Bidder submitted altered PAN document with mismatching UDIN. Flagged by Contradiction Detector & Debarment Registry.",
    timestamp: "24 Aug 2026, 19:48:12",
    ipAddress: "103.248.112.89",
    actor: "Zenith Flow Controls Pvt Ltd",
    status: "INVESTIGATING"
  },
  {
    id: "SEC-ALT-03",
    severity: "MEDIUM",
    title: "Non-2FA Login from New Geographic Region",
    description: "Successful login from Pune, Maharashtra for user with 2FA exemption.",
    timestamp: "24 Aug 2026, 16:30:00",
    ipAddress: "122.170.88.14",
    actor: "Anand Deshmukh",
    status: "RESOLVED",
    resolvedBy: "Super Admin"
  }
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "AUD-1001",
    timestamp: "24 Aug 2026, 21:05:12",
    actor: "Dr. Rajeshwar Sharma",
    role: "PROCUREMENT_OFFICER",
    action: "UPDATE",
    resource: "BID",
    resourceId: "BID-2026-1024",
    result: "SUCCESS",
    ipAddress: "115.112.240.18",
    details: "Initiated clarification request for OEM authorization certificate validity and MII threshold."
  },
  {
    id: "AUD-1002",
    timestamp: "24 Aug 2026, 20:50:40",
    actor: "Kavitha Ranganathan",
    role: "ADMIN",
    action: "CONFIG_CHANGE",
    resource: "RULE",
    resourceId: "RULE-02",
    result: "SUCCESS",
    ipAddress: "14.139.183.42",
    details: "Updated MII rule threshold operator to GREATER_EQUAL 50.0% (Class-I preference)."
  },
  {
    id: "AUD-1003",
    timestamp: "24 Aug 2026, 20:30:15",
    actor: "Kavitha Ranganathan",
    role: "ADMIN",
    action: "OVERRIDE",
    resource: "CONNECTOR",
    resourceId: "CONN-NSIC",
    result: "SUCCESS",
    ipAddress: "14.139.183.42",
    details: "Switched NSIC Connector environment from LIVE to SANDBOX due to upstream gateway latency."
  },
  {
    id: "AUD-1004",
    timestamp: "24 Aug 2026, 19:40:00",
    actor: "Vikramaditya Sengupta",
    role: "BIDDER",
    action: "CREATE",
    resource: "BID",
    resourceId: "BID-2026-1024",
    result: "SUCCESS",
    ipAddress: "182.73.190.22",
    details: "Submitted bid package with 5 statutory/technical attachments for CPCL/2026/1024."
  },
  {
    id: "AUD-1005",
    timestamp: "24 Aug 2026, 18:22:19",
    actor: "System AI Pipeline",
    role: "SYSTEM",
    action: "VERIFY",
    resource: "BID",
    resourceId: "BID-2026-1024",
    result: "SUCCESS",
    ipAddress: "10.0.4.12",
    details: "Executed automated statutory verification against GSTN, NSDL PAN, and CVC Debarment."
  },
  {
    id: "AUD-1006",
    timestamp: "24 Aug 2026, 17:15:33",
    actor: "Kavitha Ranganathan",
    role: "ADMIN",
    action: "SUSPEND",
    resource: "USER",
    resourceId: "USR-106",
    result: "SUCCESS",
    ipAddress: "14.139.183.42",
    details: "Account suspended following severe document contradiction and blacklisting registry match."
  },
  {
    id: "AUD-1007",
    timestamp: "24 Aug 2026, 16:00:10",
    actor: "Major General S. K. Nair",
    role: "AUDITOR",
    action: "EXPORT",
    resource: "BID",
    resourceId: "T-1024",
    result: "SUCCESS",
    ipAddress: "14.140.90.11",
    details: "Downloaded comprehensive compliance audit trail and CA UDIN evidence package."
  }
];

export const mockNotifications: SystemNotification[] = [
  {
    id: "NOTIF-01",
    title: "Scheduled Maintenance: GSTN API V2.1 Gateway Upgrade",
    message: "The GSTN statutory verification gateway will undergo scheduled maintenance on 28 Aug 2026 from 01:00 AM to 03:00 AM IST. Verification requests will fall back to cached cache ledger.",
    type: "MAINTENANCE",
    priority: "HIGH",
    targetAudience: "ALL",
    createdAt: "24 Aug 2026, 14:00",
    expiresAt: "28 Aug 2026, 04:00",
    status: "ACTIVE",
    channels: ["IN_APP", "EMAIL"]
  },
  {
    id: "NOTIF-02",
    title: "New Public Procurement Order (Make in India) Class-I Mandate",
    message: "Advisory: All PSUs and Central Ministries are advised to strictly verify Class-I Local Content (≥50%) self-declarations using the updated AI Contradiction Detector.",
    type: "COMPLIANCE",
    priority: "NORMAL",
    targetAudience: "CLIENTS",
    createdAt: "22 Aug 2026, 10:00",
    expiresAt: "30 Sep 2026, 23:59",
    status: "ACTIVE",
    channels: ["IN_APP"]
  },
  {
    id: "NOTIF-03",
    title: "Urgent Security Patch Deployed on Document Classifier Engine",
    message: "Security patch v4.2 applied addressing OCR text injection vulnerabilities in scanned PDF balance sheets.",
    type: "SECURITY",
    priority: "NORMAL",
    targetAudience: "ADMINS",
    createdAt: "20 Aug 2026, 18:30",
    expiresAt: "27 Aug 2026, 18:30",
    status: "ACTIVE",
    channels: ["IN_APP"]
  }
];

export const mockSystemSettings: SystemSettingsConfig = {
  general: {
    platformName: "GeM BidVerif AI Enterprise Control Center",
    maintenanceMode: false,
    supportEmail: "support.bidverif@gem.gov.in",
    defaultTimezone: "Asia/Kolkata (IST +5:30)",
    sessionTimeoutMinutes: 30,
    auditRetentionDays: 2555 // 7 years statutory requirement
  },
  security: {
    enforce2FA: true,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    ipWhitelist: "14.139.0.0/16, 115.112.0.0/16, 10.0.0.0/8",
    passwordExpiryDays: 90,
    enableSSLStrict: true
  },
  ai: {
    primaryModel: "Gemini 1.5 Pro (Specialized GovProcure v3)",
    fallbackModel: "Gemini 1.5 Flash (Fast-Inference)",
    enableLiveCopilot: true,
    confidenceThreshold: 85,
    maxTokensPerRequest: 4096,
    autoFlagContradictions: true
  },
  compliance: {
    strictStatutoryVerification: true,
    allowProvisionalBids: false,
    autoRejectBlacklisted: true,
    defaultClarificationWindowHours: 72,
    requireCAUDINVerification: true
  },
  notifications: {
    enableEmailNotifications: true,
    enableSmsAlerts: true,
    slackWebhookUrl: "https://hooks.slack.com/services/T00/B00/GeMAlerts",
    digestFrequency: "INSTANT"
  },
  storage: {
    primaryProvider: "DIGILOCKER_NIC",
    autoVirusScan: true,
    maxUploadSizeMB: 50,
    backupFrequency: "HOURLY"
  }
};
