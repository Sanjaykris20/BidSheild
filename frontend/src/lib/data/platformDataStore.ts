import {
  Tender,
  Bid,
  DocumentItem,
  StatutoryVerification,
  ComplianceRule,
  ConnectorConfig,
  ConnectorLog,
  DocumentTypeConfig,
  AIServiceMetric,
  ScoringWeightsConfig,
  AdminUser,
  ClientEntity,
  OrganizationEntity,
  AuditLog,
  ClarificationItem,
  SecurityEvent,
  SystemNotification
} from '@/types';

// =========================================================================
// INITIAL PRE-SEEDED DEMO STATE (Reflecting Module specifications & NEW UI)
// =========================================================================

export const INITIAL_SCORING_WEIGHTS: ScoringWeightsConfig = {
  gst: 10,
  pan: 10,
  udyam: 10,
  tax: 15,
  localContent: 15,
  oem: 15,
  documents: 10,
  debarment: 15,
};

export const INITIAL_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'CONN-EPROCURE',
    name: 'eProcure / CPPP Portal',
    type: 'eProcure',
    status: 'ONLINE',
    environment: 'OPEN_DATA',
    lastChecked: '2026-08-26 10:48 IST',
    responseTime: '35ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://eprocure.gov.in/eprocure/app',
    apiKeyMasked: 'eprocure_public_open_portal',
    description: 'Central Public Procurement Portal (CPPP) public procurement tender registry and status verification gateway.',
    requests24h: 18450,
    rateLimitPerMin: 1200,
    sourceType: 'Government Public Procurement',
    sourceDataset: 'eprocure.gov.in/eprocure/app',
  },
  {
    id: 'CONN-UDYAM',
    name: 'Udyam MSME (data.gov.in)',
    type: 'Udyam',
    status: 'ONLINE',
    environment: 'OPEN_DATA',
    lastChecked: '2026-08-26 10:42 IST',
    responseTime: '45ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    apiKeyMasked: 'data_gov_in_public_catalog',
    description: 'Official Ministry of MSME Udyam registration open dataset, turnover tiers, and small enterprise fee-waiver verification.',
    requests24h: 8420,
    rateLimitPerMin: 600,
    sourceType: 'Open Government Data',
    sourceDataset: 'data.gov.in/catalog/udyam-registration-msme-registration',
  },
  {
    id: 'CONN-GSTN',
    name: 'GSTN Portal API',
    type: 'GST',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:45 IST',
    responseTime: '45ms',
    errorRate: '0.01%',
    successRate: '99.99%',
    endpointUrl: 'https://api.gstn.gov.in/v2/authenticate',
    apiKeyMasked: 'gstn_live_sec_••••••••4198',
    description: 'Direct GST identification number verification, filing timeline tracker, and status retrieval gateway.',
    requests24h: 14205,
    rateLimitPerMin: 600,
  },
  {
    id: 'CONN-PAN',
    name: 'PAN NSDL Gateway',
    type: 'PAN',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:44 IST',
    responseTime: '112ms',
    errorRate: '0.04%',
    successRate: '99.96%',
    endpointUrl: 'https://api.tin-nsdl.com/pan/verify',
    apiKeyMasked: 'nsdl_live_key_••••••••9012',
    description: 'Income Tax Department PAN ledger validation, name match verification, and status validation.',
    requests24h: 9840,
    rateLimitPerMin: 500,
  },
  {
    id: 'CONN-DEBARMENT',
    name: 'Central Debarment Registry (CVC)',
    type: 'Debarment',
    status: 'ONLINE',
    environment: 'OPEN_DATA',
    lastChecked: '2026-08-26 10:10 IST',
    responseTime: '50ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://cvc.gov.in/api/debarment-list',
    apiKeyMasked: 'cvc_public_debar_register',
    description: 'Central debarment, ban list, blacklisting register across central ministries and CPSEs.',
    requests24h: 5390,
    rateLimitPerMin: 1000,
    sourceType: 'Public Debarment Notices',
    sourceDataset: 'cvc.gov.in/debarment',
  },
  {
    id: 'CONN-ITR',
    name: 'Income Tax e-Filing API',
    type: 'Income Tax',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:40 IST',
    responseTime: '130ms',
    errorRate: '0.02%',
    successRate: '99.98%',
    endpointUrl: 'https://eportal.incometax.gov.in/iec/services/v1',
    apiKeyMasked: 'itr_gov_key_••••••••7721',
    description: '3-year Income Tax Return (ITR) filing compliance, turnover verification, and UDIN validation.',
    requests24h: 3120,
    rateLimitPerMin: 200,
  },
  {
    id: 'CONN-EPFO',
    name: 'EPFO Database Gateway',
    type: 'EPFO',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:38 IST',
    responseTime: '205ms',
    errorRate: '0.05%',
    successRate: '99.95%',
    endpointUrl: 'https://unifiedportal-epfo.gov.in/api/verify',
    apiKeyMasked: 'epfo_token_••••••••1109',
    description: 'Provident Fund establishment registration status and active employee headcount verification.',
    requests24h: 2190,
    rateLimitPerMin: 300,
  },
  {
    id: 'CONN-ESIC',
    name: 'ESIC Insurance Portal',
    type: 'ESIC',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:35 IST',
    responseTime: '160ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://esic.gov.in/api/v1/employer-check',
    apiKeyMasked: 'esic_sec_••••••••8819',
    description: 'Employees State Insurance Corporation code validity and statutory deposit status.',
    requests24h: 1840,
    rateLimitPerMin: 300,
  },
  {
    id: 'CONN-STARTUP',
    name: 'Startup India DPIIT Registry',
    type: 'Startup India',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:30 IST',
    responseTime: '92ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://api.startupindia.gov.in/dppit/v1/validate',
    apiKeyMasked: 'dpiit_auth_••••••••4431',
    description: 'DPIIT recognized startup certificate verification and exemption eligibility checker.',
    requests24h: 920,
    rateLimitPerMin: 200,
  },
  {
    id: 'CONN-NSIC',
    name: 'NSIC Single Point Registration',
    type: 'NSIC',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:25 IST',
    responseTime: '115ms',
    errorRate: '0.01%',
    successRate: '99.99%',
    endpointUrl: 'https://nsic.co.in/api/sprs/verify',
    apiKeyMasked: 'nsic_key_••••••••9941',
    description: 'National Small Industries Corporation (NSIC) SPRS certification checking for government purchase preference.',
    requests24h: 680,
    rateLimitPerMin: 200,
  },
  {
    id: 'CONN-OEM',
    name: 'OEM Direct Authorization Ledger',
    type: 'OEM',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:20 IST',
    responseTime: '140ms',
    errorRate: '0.03%',
    successRate: '99.97%',
    endpointUrl: 'https://oem-registry.gem.gov.in/v1/auth-check',
    apiKeyMasked: 'gem_oem_key_••••••••1255',
    description: 'Direct manufacturer authorization validation, validity window verification, and product serial registry.',
    requests24h: 3840,
    rateLimitPerMin: 400,
  },
  {
    id: 'CONN-DIGILOCKER',
    name: 'DigiLocker Government Document Vault',
    type: 'DigiLocker',
    status: 'ONLINE',
    environment: 'MOCK',
    lastChecked: '2026-08-26 10:15 IST',
    responseTime: '78ms',
    errorRate: '0.00%',
    successRate: '100.0%',
    endpointUrl: 'https://digilocker.meripehchan.gov.in/public/api/v2',
    apiKeyMasked: 'dl_sec_token_••••••••6602',
    description: 'National Digital Locker direct URI resolution and cryptographic signature validation.',
    requests24h: 8910,
    rateLimitPerMin: 800,
  },
];

export const INITIAL_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'RULE-MII-01',
    ruleCode: 'REQ-LC-01',
    title: 'Make-In-India (MII) Local Content %',
    description: 'Mandatory minimum local value addition in accordance with Public Procurement Order (Preference to Make in India).',
    category: 'Make-in-India',
    parameter: 'local_content_percent',
    operator: 'GREATER_EQUAL',
    thresholdValue: '50',
    weightPercent: 15,
    severity: 'CRITICAL',
    status: 'ACTIVE',
    version: '1.2',
    updatedAt: '2026-08-24 18:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-GST-01',
    ruleCode: 'REQ-GST-01',
    title: 'GSTIN Active Status & Filings',
    description: 'Verification that the bidder holds a valid, active GST registration with regular GSTR-3B filings.',
    category: 'Statutory',
    parameter: 'gst_status',
    operator: 'EQUALS',
    thresholdValue: 'ACTIVE',
    weightPercent: 10,
    severity: 'HIGH',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-PAN-01',
    ruleCode: 'REQ-PAN-01',
    title: 'PAN Entity Name Match',
    description: 'Cross-verification that the PAN card entity legal name strictly matches GSTIN and submitted tender bid legal entity.',
    category: 'Statutory',
    parameter: 'pan_status',
    operator: 'EQUALS',
    thresholdValue: 'VERIFIED',
    weightPercent: 10,
    severity: 'HIGH',
    status: 'ACTIVE',
    version: '1.1',
    updatedAt: '2026-08-21 14:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-UDYAM-01',
    ruleCode: 'REQ-UDYAM-01',
    title: 'Udyam MSME Qualification',
    description: 'Validation of valid MSME Udyam registration for enterprise category verification and fee waivers.',
    category: 'Statutory',
    parameter: 'udyam_status',
    operator: 'EQUALS',
    thresholdValue: 'VERIFIED',
    weightPercent: 10,
    severity: 'MEDIUM',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-TAX-01',
    ruleCode: 'REQ-ITR-01',
    title: '3-Year ITR Filing Compliance',
    description: 'Mandatory submission and verification of audited Income Tax Returns for the last 3 financial years.',
    category: 'Financial',
    parameter: 'itr_years',
    operator: 'GREATER_EQUAL',
    thresholdValue: '3',
    weightPercent: 15,
    severity: 'HIGH',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-OEM-01',
    ruleCode: 'REQ-OEM-01',
    title: 'OEM Authorization Validity',
    description: 'Original Equipment Manufacturer (OEM) Manufacturer Authorization Form (MAF) specific to this tender reference.',
    category: 'Technical',
    parameter: 'oem_authorized',
    operator: 'IS_TRUE',
    thresholdValue: 'true',
    weightPercent: 15,
    severity: 'HIGH',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-DOCS-01',
    ruleCode: 'REQ-DOCS-01',
    title: 'Mandatory Document Completeness',
    description: 'Verification that all statutory, financial, technical, and declaration attachments are cryptographically present and uncorrupted.',
    category: 'Documentation',
    parameter: 'documents_complete',
    operator: 'IS_TRUE',
    thresholdValue: 'true',
    weightPercent: 10,
    severity: 'MEDIUM',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
  {
    id: 'RULE-DEBAR-01',
    ruleCode: 'REQ-DEBAR-01',
    title: 'Central Debarment & Blacklist Clearance',
    description: 'Verification against the CVC and central procurement blacklists that the entity and its directors are not debarred.',
    category: 'Integrity',
    parameter: 'is_debarred',
    operator: 'EQUALS',
    thresholdValue: 'false',
    weightPercent: 15,
    severity: 'CRITICAL',
    status: 'ACTIVE',
    version: '1.0',
    updatedAt: '2026-08-20 12:00 IST',
    lastModifiedBy: 'SYSTEM_ADMIN',
  },
];

export const INITIAL_AI_SERVICES: AIServiceMetric[] = [
  {
    id: 'AI-TP-01',
    name: 'Tender Parser & Blueprint Engine',
    serviceCode: 'TENDER_PARSER',
    modelVersion: 'gem-doc-v2.4-flash',
    status: 'ONLINE',
    requests24h: 1240,
    successRate: 99.4,
    failureRate: 0.6,
    averageLatencyMs: 820,
    tokenConsumption24h: 1820400,
    promptDirectives: 'Extract structured BOQ tables, eligibility clauses, and statutory gating criteria from government tender RFP documents.',
  },
  {
    id: 'AI-OCR-02',
    name: 'OCR & Spatial Bounding Box Engine',
    serviceCode: 'OCR_PIPELINE',
    modelVersion: 'paddle-ocr-v4.1',
    status: 'ONLINE',
    requests24h: 14291,
    successRate: 98.9,
    failureRate: 1.1,
    averageLatencyMs: 340,
    tokenConsumption24h: 0,
    promptDirectives: 'Extract high-resolution character tokens and pixel bounding box coordinates for evidence viewer page overlay highlights.',
  },
  {
    id: 'AI-DC-03',
    name: 'Document Classifier',
    serviceCode: 'DOC_CLASSIFIER',
    modelVersion: 'gem-doc-classify-v3',
    status: 'ONLINE',
    requests24h: 5820,
    successRate: 99.2,
    failureRate: 0.8,
    averageLatencyMs: 410,
    tokenConsumption24h: 942000,
    promptDirectives: 'Classify uploaded PDF into 12 statutory categories: GST, PAN, Udyam, ITR, OEM, EPFO, ESIC, Startup, NSIC, MII, Experience, Financial.',
  },
  {
    id: 'AI-ER-04',
    name: 'Entity Resolver & Cross-Doc Validator',
    serviceCode: 'ENTITY_RESOLVER',
    modelVersion: 'gem-entity-v2.1',
    status: 'ONLINE',
    requests24h: 4910,
    successRate: 97.8,
    failureRate: 2.2,
    averageLatencyMs: 630,
    tokenConsumption24h: 1204000,
    promptDirectives: 'Perform fuzzy string resolution and legal entity matching across PAN, GST, bank accounts, and corporate filings.',
  },
  {
    id: 'AI-CD-05',
    name: 'Contradiction Detector',
    serviceCode: 'CONTRADICTION_DETECTOR',
    modelVersion: 'gem-reason-v1.8',
    status: 'ONLINE',
    requests24h: 3180,
    successRate: 96.5,
    failureRate: 3.5,
    averageLatencyMs: 910,
    tokenConsumption24h: 2100000,
    promptDirectives: 'Detect conflicting declarations across documents (e.g., turnover reported on ITR vs tender financial statement).',
  },
  {
    id: 'AI-RE-06',
    name: 'AI Recommendation Engine',
    serviceCode: 'RECOMMENDATION_ENGINE',
    modelVersion: 'gem-procure-rec-v2',
    status: 'ONLINE',
    requests24h: 2840,
    successRate: 99.1,
    failureRate: 0.9,
    averageLatencyMs: 780,
    tokenConsumption24h: 1650000,
    promptDirectives: 'Synthesize deterministic rule outcomes and risk factors into actionable officer recommendations with evidence references.',
  },
  {
    id: 'AI-CP-07',
    name: 'AI Procurement Copilot (Conversational)',
    serviceCode: 'COPILOT_CHAT',
    modelVersion: 'gem-procure-copilot-v3',
    status: 'ONLINE',
    requests24h: 1540,
    successRate: 99.6,
    failureRate: 0.4,
    averageLatencyMs: 650,
    tokenConsumption24h: 3400000,
    promptDirectives: 'Ground conversational answers exclusively on extracted evidence IDs and audit logs. Never hallucinate facts.',
  },
];

export const INITIAL_TENDERS: Tender[] = [
  {
    id: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    title: 'Data Center Migration & Zero-Trust Security Upgrade',
    organization: 'Ministry of Defence',
    department: 'Defence Information Assurance & Technology',
    category: 'IT Services & Infrastructure',
    estimatedValue: '₹36.5 Cr ($4.5M Est.)',
    estimatedValueINR: 365000000,
    publishedDate: '2026-08-10',
    closingDate: '2026-08-31',
    daysLeft: 5,
    status: 'LIVE',
    assignedOfficer: 'P. Sharma (CPCL Senior Procurement Officer)',
    description: 'Complete overhaul of regional data centers including hardware procurement, cloud migration, and implementation of zero-trust security framework with strict Make-in-India preference.',
    scopeOfWork: [
      'Supply and installation of enterprise hyperconverged infrastructure servers.',
      'Deployment of zero-trust network access (ZTNA) with multi-factor authentication.',
      'Migration of 140+ legacy VMs with zero data loss guarantee.',
      '24x7 SOC monitoring and continuous compliance telemetry.',
    ],
    eligibilityCriteria: [
      'Must be a Class-I Local Supplier (Local Content ≥ 50.0%).',
      'Valid Active GSTIN and PAN registration with 3-year audited ITR filings.',
      'OEM Authorization (MAF) from Tier-1 Server Manufacturer.',
      'No debarment records on CVC central register.',
    ],
    boqItems: [
      { itemNo: 1, itemDescription: 'High-Density Rack Servers (2U Dual-Socket)', quantity: 24, uom: 'NOS', estimatedRate: 850000, totalEstimated: 20400000 },
      { itemNo: 2, itemDescription: 'Zero-Trust Security Gateway Appliance', quantity: 4, uom: 'NOS', estimatedRate: 1500000, totalEstimated: 6000000 },
      { itemNo: 3, itemDescription: 'Turnkey Migration & Integration Services', quantity: 1, uom: 'LOT', estimatedRate: 10100000, totalEstimated: 10100000 },
    ],
    complianceRuleIds: ['RULE-MII-01', 'RULE-GST-01', 'RULE-PAN-01', 'RULE-UDYAM-01', 'RULE-TAX-01', 'RULE-OEM-01', 'RULE-DOCS-01', 'RULE-DEBAR-01'],
    bidsCount: 8,
    location: 'New Delhi & Pune Data Centers',
    emdAmountFormatted: '₹73,00,000 (Exempt for MSME)',
    tags: ['IT Services', 'Make In India', 'Zero-Trust', 'High Priority'],
    requiredDocuments: [
      { id: 'req_mii', name: 'Make in India Declaration', category: 'Compliance / MII', weight: 15 },
      { id: 'req_gst', name: 'GST Certificate', category: 'Statutory / Tax', weight: 10 },
      { id: 'req_pan', name: 'PAN Card', category: 'Statutory / Tax', weight: 10 },
      { id: 'req_oem', name: 'OEM Authorization', category: 'Technical / OEM', weight: 15 },
      { id: 'req_epfo', name: 'EPFO Compliance Certificate', category: 'Statutory / Labour', weight: 10 },
      { id: 'req_turnover', name: 'Turnover Certificate', category: 'Financial / Audit', weight: 10 },
      { id: 'req_itr', name: 'Income Tax Returns (3 Years)', category: 'Statutory / Tax', weight: 15 },
      { id: 'req_debarment', name: 'Non-Debarment Declaration', category: 'Compliance / CVC', weight: 15 },
    ],
    maxBidsPerBidder: 1,
    womenReservationPercent: 3,
  },
  {
    id: 'TND-9041',
    tenderNumber: 'CPCL/2026/899120',
    title: 'Supply of High-Pressure Cryogenic Storage Valves',
    organization: 'Chennai Petroleum Corporation Ltd (CPCL)',
    department: 'Mechanical Maintenance & Procurement',
    category: 'Oil & Gas Equipment',
    estimatedValue: '₹18.2 Cr',
    estimatedValueINR: 182000000,
    publishedDate: '2026-08-15',
    closingDate: '2026-09-02',
    daysLeft: 8,
    status: 'LIVE',
    assignedOfficer: 'R. K. Sharma (CPCL-7821)',
    description: 'Procurement of cryogenic high-pressure ball and check valves for CPCL Manali Refinery expansion project.',
    scopeOfWork: [
      'Supply of Class 600/900 cryogenic valves with ASME B16.34 certification.',
      'Third-party inspection reports from BV / DNV.',
      'Hydrostatic and cryogenic pressure leak testing at -196°C.',
    ],
    eligibilityCriteria: [
      'Class-I Local Supplier (Local Content ≥ 50%).',
      'Valid ISO 9001 and API 6D certifications.',
      'Prior supply experience of min ₹10 Cr in PSU refineries.',
    ],
    boqItems: [
      { itemNo: 1, itemDescription: 'Cryogenic Ball Valve 8-inch Class 600', quantity: 45, uom: 'NOS', estimatedRate: 240000, totalEstimated: 10800000 },
      { itemNo: 2, itemDescription: 'Cryogenic Check Valve 6-inch Class 900', quantity: 30, uom: 'NOS', estimatedRate: 246666, totalEstimated: 7400000 },
    ],
    complianceRuleIds: ['RULE-MII-01', 'RULE-GST-01', 'RULE-PAN-01', 'RULE-UDYAM-01', 'RULE-TAX-01', 'RULE-OEM-01', 'RULE-DEBAR-01'],
    bidsCount: 3,
    location: 'CPCL Manali Refinery, Chennai',
    emdAmountFormatted: '₹36,40,000',
    tags: ['Petroleum', 'Cryogenic', 'Refinery', 'CPCL'],
    requiredDocuments: [
      { id: 'req_msme', name: 'MSME / Udyam Registration', category: 'Statutory / MSME', weight: 10 },
      { id: 'req_gst', name: 'GST Certificate', category: 'Statutory / Tax', weight: 10 },
      { id: 'req_pan', name: 'PAN Card', category: 'Statutory / Tax', weight: 10 },
      { id: 'req_mii', name: 'Local Content Declaration', category: 'Compliance / MII', weight: 15 },
      { id: 'req_iso', name: 'ISO 9001 / API 6D Certification', category: 'Technical / Quality', weight: 15 },
      { id: 'req_exp', name: 'Prior Supply Experience Certificate', category: 'Technical / Experience', weight: 15 },
      { id: 'req_epfo', name: 'EPFO Compliance Certificate', category: 'Statutory / Labour', weight: 10 },
      { id: 'req_debarment', name: 'Non-Debarment Declaration', category: 'Compliance / CVC', weight: 15 },
    ],
    maxBidsPerBidder: 1,
    womenReservationPercent: 3,
  },
  {
    id: 'TND-8812',
    tenderNumber: 'GEM/2026/C/8812',
    title: 'Regional Transit Hub Development & Smart Signage',
    organization: 'Metro Transit Authority',
    department: 'Civil Works & Urban Infrastructure',
    category: 'Infrastructure & Construction',
    estimatedValue: '₹85.0 Cr ($12.0M Est.)',
    estimatedValueINR: 850000000,
    publishedDate: '2026-08-18',
    closingDate: '2026-09-08',
    daysLeft: 14,
    status: 'LIVE',
    assignedOfficer: 'Ananya Verma (Procurement Lead)',
    description: 'Civil construction, passenger transit terminals, and automated dynamic LED passenger information display network.',
    scopeOfWork: [
      'Terminal concourse construction and roof canopy.',
      'Smart LED display matrices and integrated public address systems.',
    ],
    eligibilityCriteria: [
      'Minimum average annual turnover of ₹50 Cr over last 3 years.',
      'Class-I or Class-II local supplier with environmental compliance clearance.',
    ],
    boqItems: [
      { itemNo: 1, itemDescription: 'Terminal Structure & Civil Foundation', quantity: 1, uom: 'LOT', estimatedRate: 620000000, totalEstimated: 620000000 },
      { itemNo: 2, itemDescription: 'Smart Signage & Network Matrix', quantity: 1, uom: 'LOT', estimatedRate: 230000000, totalEstimated: 230000000 },
    ],
    complianceRuleIds: ['RULE-MII-01', 'RULE-GST-01', 'RULE-PAN-01', 'RULE-TAX-01', 'RULE-DEBAR-01'],
    bidsCount: 12,
    location: 'Sector 4 Metro Hub, Bengaluru',
    emdAmountFormatted: '₹1,70,00,000',
    tags: ['Infrastructure', 'Smart Cities', 'Metro'],
  },
];

export const INITIAL_BIDS: Bid[] = [
  {
    id: 'BID-1024',
    bidId: 'BID-2026-1024',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-TECHCORP-01',
    bidderName: 'TechCorp Solutions Pvt Ltd',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    udyam: 'UDYAM-MH-18-00123',
    submittedAt: '2026-08-24 14:32 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹34,20,00,000',
    quotedValueINR: 342000000,
    priceBreakdown: {
      basicRateINR: 289830508,
      gstPercentage: 18,
      gstAmountINR: 52169492,
      freightAndInstallationINR: 0,
      totalQuotedINR: 342000000,
      totalQuotedFormatted: '₹34,20,00,000',
    },
    complianceScore: 82,
    riskLevel: 'MEDIUM',
    localContentPercent: 42,
    documents: [
      {
        id: 'DOC-MII-01',
        name: 'Make_In_India_Declaration.pdf',
        category: 'Compliance / MII',
        docNumber: 'MII-TC-2026-04',
        uploadedAt: '2026-08-24 14:10 IST',
        status: 'VERIFIED',
        source: 'Bidder Vault',
        confidence: 0.98,
        fileSize: '1.4 MB',
        fileType: 'pdf',
        hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        extractedFields: [
          { label: 'Local Content %', value: '42%', confidence: 0.98, pageNumber: 1 },
          { label: 'Manufacturing Facility', value: 'Plot 44, Electronic City, Bangalore', confidence: 0.96, pageNumber: 1 },
          { label: 'Signatory', value: 'John Doe, Director', confidence: 0.99, pageNumber: 1 },
        ],
      },
      {
        id: 'DOC-GST-01',
        name: 'GST_Certificate_Maharashtra.pdf',
        category: 'Statutory / Tax',
        docNumber: '27ABCDE1234F1Z5',
        uploadedAt: '2026-08-12 11:20 IST',
        status: 'VERIFIED',
        source: 'GSTN Gateway API',
        confidence: 1.0,
        fileSize: '1.2 MB',
        fileType: 'pdf',
        hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        isVerifiedByGovt: true,
        govtVerificationSource: 'GSTN Portal API',
      },
      {
        id: 'DOC-UDYAM-01',
        name: 'Udyam_Registration_2024.pdf',
        category: 'Statutory / MSME',
        docNumber: 'UDYAM-MH-18-00123',
        uploadedAt: '2026-08-14 09:45 IST',
        status: 'VERIFIED',
        source: 'MSME Registry Sandbox',
        confidence: 0.99,
        fileSize: '820 KB',
        fileType: 'pdf',
        hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        isVerifiedByGovt: true,
        govtVerificationSource: 'Udyam Portal',
      },
      {
        id: 'DOC-OEM-01',
        name: 'OEM_Tier1_MAF_Authorization.pdf',
        category: 'Technical / OEM',
        docNumber: 'MAF-OEM-99120',
        uploadedAt: '2026-08-24 12:15 IST',
        expiryDate: '2027-08-24',
        status: 'VERIFIED',
        source: 'OEM Direct Ledger',
        confidence: 0.97,
        fileSize: '2.1 MB',
        fileType: 'pdf',
        hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      },
    ],
    verifications: [
      {
        type: 'eProcure',
        status: 'VERIFIED',
        source: 'eprocure.gov.in (CPPP)',
        verification_mode: 'OPEN_DATA',
        verifiedAt: '2026-08-26 10:48 IST',
        confidence: 1.0,
        latencyMs: 35,
        data: { tenderReferenceNumber: 'GEM/2026/B/1024', tenderStatus: 'Live', organization: 'Ministry of Defence' },
      },
      {
        type: 'Udyam',
        status: 'VERIFIED',
        source: 'data.gov.in / Ministry of MSME',
        verification_mode: 'OPEN_DATA',
        verifiedAt: '2026-08-26 10:42 IST',
        confidence: 1.0,
        latencyMs: 45,
        data: { udyamNumber: 'UDYAM-MH-18-00123', enterpriseType: 'SMALL', majorActivity: 'SERVICES', dataset: 'data.gov.in/catalog/udyam-registration-msme-registration' },
      },
      {
        type: 'GST',
        status: 'VERIFIED',
        source: 'GSTN Gateway API',
        verification_mode: 'MOCK',
        verifiedAt: '2026-08-26 10:45 IST',
        confidence: 1.0,
        latencyMs: 45,
        data: { gstin: '27ABCDE1234F1Z5', legalName: 'TECHCORP SOLUTIONS PRIVATE LIMITED', status: 'ACTIVE', state: 'Maharashtra' },
      },
      {
        type: 'PAN',
        status: 'VERIFIED',
        source: 'PAN NSDL Gateway',
        verification_mode: 'MOCK',
        verifiedAt: '2026-08-26 10:44 IST',
        confidence: 1.0,
        latencyMs: 112,
        data: { pan: 'ABCDE1234F', entityName: 'TECHCORP SOLUTIONS PRIVATE LIMITED', status: 'VALID' },
      },
      {
        type: 'Debarment',
        status: 'VERIFIED',
        source: 'Central Debarment Registry (CVC)',
        verification_mode: 'OPEN_DATA',
        verifiedAt: '2026-08-26 10:10 IST',
        confidence: 1.0,
        latencyMs: 50,
        data: { isDebarred: false, debarmentListMatch: false },
      },
      {
        type: 'OEM',
        status: 'VERIFIED',
        source: 'OEM Direct Ledger',
        verification_mode: 'MOCK',
        verifiedAt: '2026-08-26 10:20 IST',
        confidence: 0.97,
        latencyMs: 140,
        data: { oemName: 'Enterprise Server Global Inc', authorizationCode: 'MAF-OEM-99120', validUntil: '2027-08-24' },
      },
    ],
    requirements: [
      {
        id: 'EVAL-MII',
        ruleId: 'RULE-MII-01',
        ruleCode: 'REQ-LC-01',
        title: 'Make-In-India (MII) Local Content %',
        category: 'Make-in-India',
        expected: '≥ 50.0% (Class-I Local Supplier)',
        extracted: '42.0% (Class-II Status)',
        difference: '-8.0% shortfall vs Class-I threshold',
        status: 'FAIL',
        severity: 'CRITICAL',
        weight: 15,
        scoreContribution: 0,
        confidence: 0.984,
        sourceDoc: 'Make_In_India_Declaration.pdf',
        page: 1,
        snippetHtml: '2. The percentage of local content in the offered item/service is: <mark class="bg-amber-200 text-slate-900 font-bold px-1 rounded">42%</mark>',
        aiExplanation: 'Value deterministically extracted from Make_In_India_Declaration.pdf (Page 1, Paragraph 2). The extracted numerical value (42%) falls below the mandatory Class-I local supplier threshold (≥ 50%) required by Rule ID: REQ-LC-01.',
      },
      {
        id: 'EVAL-GST',
        ruleId: 'RULE-GST-01',
        ruleCode: 'REQ-GST-01',
        title: 'GSTIN Active Status & Filings',
        category: 'Statutory',
        expected: 'Active GSTIN & Regular Filings',
        extracted: '27ABCDE1234F1Z5 (ACTIVE)',
        status: 'PASS',
        severity: 'HIGH',
        weight: 10,
        scoreContribution: 10,
        confidence: 1.0,
        sourceDoc: 'GSTN Portal API',
        page: 1,
        snippetHtml: 'Status: ACTIVE | Regular Taxpayer | Zero Default Flags',
        aiExplanation: 'Direct API cross-reference confirms active taxpayer status with no default flags on the GSTN registry.',
      },
      {
        id: 'EVAL-PAN',
        ruleId: 'RULE-PAN-01',
        ruleCode: 'REQ-PAN-01',
        title: 'PAN Entity Name Match',
        category: 'Statutory',
        expected: '100% Legal Name Consistency',
        extracted: 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        status: 'PASS',
        severity: 'HIGH',
        weight: 10,
        scoreContribution: 10,
        confidence: 1.0,
        sourceDoc: 'PAN NSDL Gateway',
        page: 1,
        snippetHtml: 'PAN Verified: ABCDE1234F -> TECHCORP SOLUTIONS PRIVATE LIMITED',
        aiExplanation: 'Entity name perfectly matches across PAN and GSTN registries with 100% confidence.',
      },
      {
        id: 'EVAL-UDYAM',
        ruleId: 'RULE-UDYAM-01',
        ruleCode: 'REQ-UDYAM-01',
        title: 'Udyam MSME Qualification',
        category: 'Statutory',
        expected: 'Valid MSME Certificate',
        extracted: 'UDYAM-MH-18-00123 (SMALL)',
        status: 'PASS',
        severity: 'MEDIUM',
        weight: 10,
        scoreContribution: 10,
        confidence: 0.99,
        sourceDoc: 'Udyam_Registration_2024.pdf',
        page: 1,
        snippetHtml: 'Udyam Registration: UDYAM-MH-18-00123 | Type: SMALL ENTERPRISE',
        aiExplanation: 'Udyam portal lookup verifies valid Small Enterprise status. Bidder is eligible for tender fee waiver.',
      },
      {
        id: 'EVAL-TAX',
        ruleId: 'RULE-TAX-01',
        ruleCode: 'REQ-ITR-01',
        title: '3-Year ITR Filing Compliance',
        category: 'Financial',
        expected: '3 Audited Financial Years Filed',
        extracted: '3 Years (FY23-24, FY24-25, FY25-26)',
        status: 'PASS',
        severity: 'HIGH',
        weight: 15,
        scoreContribution: 15,
        confidence: 0.96,
        sourceDoc: 'Audited_Financials_3Yr.pdf',
        page: 2,
        snippetHtml: 'Audited balance sheets confirmed with valid UDIN strings across all 3 years.',
        aiExplanation: '3 years of continuous tax filing verified with chartered accountant UDIN verification.',
      },
      {
        id: 'EVAL-OEM',
        ruleId: 'RULE-OEM-01',
        ruleCode: 'REQ-OEM-01',
        title: 'OEM Authorization Validity',
        category: 'Technical',
        expected: 'Valid MAF Authorization',
        extracted: 'MAF-OEM-99120 (Valid till 2027)',
        status: 'PASS',
        severity: 'HIGH',
        weight: 15,
        scoreContribution: 15,
        confidence: 0.97,
        sourceDoc: 'OEM_Tier1_MAF_Authorization.pdf',
        page: 1,
        snippetHtml: 'Official Manufacturer Authorization for Tender GEM/2026/B/1024 valid through Aug 2027.',
        aiExplanation: 'Manufacturer Authorization verified against OEM registry with authorized digital signature.',
      },
      {
        id: 'EVAL-DEBAR',
        ruleId: 'RULE-DEBAR-01',
        ruleCode: 'REQ-DEBAR-01',
        title: 'Central Debarment & Blacklist Clearance',
        category: 'Integrity',
        expected: 'No Blacklist / Debarment Record',
        extracted: 'CLEARED (0 Hits)',
        status: 'PASS',
        severity: 'CRITICAL',
        weight: 15,
        scoreContribution: 15,
        confidence: 1.0,
        sourceDoc: 'CVC Debarment Gateway',
        page: 1,
        snippetHtml: 'Entity and Director PANs checked against Central Vigilance Commission debarment list: ZERO MATCHES.',
        aiExplanation: 'Zero hits on government debarment lists across corporate CIN and individual director PAN numbers.',
      },
      {
        id: 'EVAL-DOCS',
        ruleId: 'RULE-DOCS-01',
        ruleCode: 'REQ-DOCS-01',
        title: 'Mandatory Document Completeness',
        category: 'Documentation',
        expected: 'All 8 Mandatory Artifacts Present',
        extracted: '7 of 8 Documents Verified (1 Clarification Needed)',
        status: 'REVIEW',
        severity: 'MEDIUM',
        weight: 10,
        scoreContribution: 7,
        confidence: 0.94,
        sourceDoc: 'Bid Document Vault',
        page: 1,
        snippetHtml: 'Missing ISO 27001 renewal annexure; existing certificate expires within 12 days.',
        aiExplanation: 'ISO 27001 certification expires in 12 days. Requires bidder submission of pending recertification audit acknowledgement.',
      },
    ],
    evidenceList: [
      {
        id: 'EV-1024-01',
        requirementId: 'REQ-LC-01',
        ruleId: 'RULE-MII-01',
        ruleTitle: 'Make-In-India (MII) Local Content %',
        documentId: 'DOC-MII-01',
        documentName: 'Make_In_India_Declaration.pdf',
        pageNumber: 1,
        extractedValue: '42%',
        expectedValue: '≥ 50%',
        actualValue: '42% (Shortfall of 8%)',
        verificationSource: 'AI Parser + OCR Bounding Box Engine',
        result: 'FAIL',
        confidence: 0.984,
        severity: 'CRITICAL',
        snippetHtml: '2. The percentage of local content in the offered item/service is: 42%',
        aiTraceExplanation: "Extracted numerical percentage '42' from paragraph 2 of self-declaration. Does not meet Class-I threshold (50%).",
        boundingBox: { x: 120, y: 340, width: 90, height: 28 },
      },
      {
        id: 'EV-1024-02',
        requirementId: 'REQ-GST-01',
        ruleId: 'RULE-GST-01',
        ruleTitle: 'GSTIN Active Status & Filings',
        documentId: 'DOC-GST-01',
        documentName: 'GST_Certificate_Maharashtra.pdf',
        pageNumber: 1,
        extractedValue: '27ABCDE1234F1Z5',
        expectedValue: 'Active GSTIN',
        actualValue: 'ACTIVE (Regular)',
        verificationSource: 'GSTN Gateway API',
        result: 'PASS',
        confidence: 1.0,
        severity: 'HIGH',
        snippetHtml: 'GSTIN: 27ABCDE1234F1Z5 | Status: ACTIVE',
        aiTraceExplanation: 'Real-time API lookup matches active registration on GSTN portal.',
      },
    ],
    riskResult: {
      score: 82,
      riskLevel: 'MEDIUM',
      drivers: [
        {
          factor: 'LOCAL_CONTENT_SHORTFALL',
          severity: 'HIGH',
          impactScore: 15,
          description: 'Local Content declared is 42%, which is 8% below the mandatory 50% Class-I threshold.',
          evidenceRef: 'EV-1024-01',
        },
        {
          factor: 'CERTIFICATION_EXPIRY_APPROACHING',
          severity: 'LOW',
          impactScore: 3,
          description: 'Attached ISO 27001 certification approaches expiry within 12 days.',
        },
      ],
      categoryBreakdown: {
        identityConsistency: 100,
        statutoryCompliance: 100,
        financialEligibility: 95,
        technicalEligibility: 90,
        documentationCompleteness: 75,
        tenderCompliance: 65,
      },
      summary: 'Medium Risk. Strong statutory compliance across GST, PAN, Udyam, and Debarment, but failed Class-I Local Content requirement (42% vs 50%). Clarification or review required before final award.',
    },
    aiRecommendation: {
      recommendation: 'REQUEST_CLARIFICATION',
      confidence: 0.91,
      headline: 'Request Clarification on Local Content Breakdown (Recommended)',
      reasons: [
        'Deterministic failure on mandatory Local Content rule REQ-LC-01 (42% extracted vs 50% required).',
        'Bidder qualifies as Class-II local supplier. If RFP permits Class-II with margin of preference, clarification of indigenous bill of materials is suggested.',
        'All statutory checks (GSTN, PAN, MSME, Debarment) are 100% verified with clean records.',
      ],
      evidenceIds: ['EV-1024-01', 'EV-1024-02'],
      isMock: true,
      generatedAt: '2026-08-26 10:45 IST',
    },
    auditTimeline: [
      { stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-24 14:32 IST', description: 'Bidder submitted tender bid and attached 4 primary documents.' },
      { stageNumber: 2, title: 'AI Extraction & OCR', status: 'COMPLETED', timestamp: '2026-08-24 14:33 IST', description: 'OCR pipeline extracted 24 field attributes and bounding boxes.' },
      { stageNumber: 3, title: 'Govt. Verification Gateways', status: 'COMPLETED', timestamp: '2026-08-24 14:34 IST', description: 'Statutory verification completed across GSTN, PAN, and Udyam.' },
      { stageNumber: 4, title: 'Compliance Rule Engine', status: 'COMPLETED', timestamp: '2026-08-24 14:35 IST', description: '8 rules evaluated: 6 Passed, 1 Review, 1 Failed (Local Content).' },
      { stageNumber: 5, title: 'Officer Evaluation Desk', status: 'IN_PROGRESS', description: 'Pending procurement officer determination and binding decision.' },
    ],
  },
  {
    id: 'BID-8819',
    bidId: 'BID-2026-8819',
    tenderId: 'TND-9041',
    tenderNumber: 'CPCL/2026/899120',
    tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
    bidderId: 'VEN-ALPHA-02',
    bidderName: 'Alpha Defense Logistics Pvt Ltd',
    gstin: '33ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    udyam: 'UDYAM-TN-02-0012345',
    submittedAt: '2026-08-24 18:20 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹17,40,00,000',
    quotedValueINR: 174000000,
    priceBreakdown: {
      basicRateINR: 147457627,
      gstPercentage: 18,
      gstAmountINR: 26542373,
      freightAndInstallationINR: 0,
      totalQuotedINR: 174000000,
      totalQuotedFormatted: '₹17,40,00,000',
    },
    complianceScore: 78.5,
    riskLevel: 'MEDIUM',
    localContentPercent: 45,
    documents: [
      {
        id: 'DOC-ALPHA-MII',
        name: 'Doc_MII_SelfDeclaration.pdf',
        category: 'Compliance / MII',
        docNumber: 'MII-ADL-2026',
        uploadedAt: '2026-08-24 18:00 IST',
        status: 'VERIFIED',
        source: 'Bidder Vault',
        confidence: 0.96,
        fileSize: '1.8 MB',
        fileType: 'pdf',
        hashSha256: '7b8b85770c0c6665bd8a008d5460e6113b82d3341485d1c2d5ffe52e0714f701',
      },
    ],
    verifications: [
      { type: 'GST', status: 'VERIFIED', source: 'GSTN Gateway API', verification_mode: 'MOCK', verifiedAt: '2026-08-24 18:22 IST', confidence: 1.0, latencyMs: 42, data: { gstin: '33ABCDE1234F1Z5', status: 'ACTIVE' } },
      { type: 'Udyam', status: 'VERIFIED', source: 'data.gov.in / Ministry of MSME', verification_mode: 'OPEN_DATA', verifiedAt: '2026-08-24 18:23 IST', confidence: 0.99, latencyMs: 80, data: { udyam: 'UDYAM-TN-02-0012345', type: 'SMALL' } },
    ],
    requirements: [
      {
        id: 'EVAL-ALPHA-MII',
        ruleId: 'RULE-MII-01',
        ruleCode: 'REQ-LC-01',
        title: 'Make-In-India (MII) Local Content %',
        category: 'Make-in-India',
        expected: '≥ 50.0% (Class-I Local Supplier)',
        extracted: '45.0% (Class-II Status)',
        difference: '-5.0% shortfall',
        status: 'REVIEW',
        severity: 'CRITICAL',
        weight: 15,
        scoreContribution: 5,
        confidence: 0.962,
        sourceDoc: 'Doc_MII_SelfDeclaration.pdf',
        page: 2,
        snippetHtml: 'Local content added in manufacturing is 45.0% at our Chennai plant.',
        aiExplanation: 'Tender criteria mandates minimum 50% for Class-I preference. Bidder holds Class-II status (45%).',
      },
    ],
    evidenceList: [],
    auditTimeline: [
      { stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-24 18:20 IST', description: 'Submitted bid.' },
    ],
  },
  {
    id: 'BID-TC-A',
    bidId: 'BID-2026-TC-A',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-ALPHA-02',
    bidderName: 'Alpha Defense Logistics Pvt Ltd',
    gstin: '33ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    udyam: 'UDYAM-TN-02-0012345',
    submittedAt: '2026-08-25 10:15 IST',
    status: 'QUALIFIED',
    financialBid: '₹33,80,00,000',
    quotedValueINR: 338000000,
    priceBreakdown: {
      basicRateINR: 286440678,
      gstPercentage: 18,
      gstAmountINR: 51559322,
      freightAndInstallationINR: 0,
      totalQuotedINR: 338000000,
      totalQuotedFormatted: '₹33,80,00,000',
    },
    complianceScore: 98,
    riskLevel: 'LOW',
    localContentPercent: 68,
    documents: [
      { id: 'DOC-TC-A-GST', name: 'GST_Registration_Certificate.pdf', category: 'Statutory / Tax', docNumber: '33ABCDE1234F1Z5', uploadedAt: '2026-08-25', status: 'VERIFIED', source: 'GSTN Gateway API', confidence: 1.0, fileSize: '1.2 MB', fileType: 'pdf', hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
      { id: 'DOC-TC-A-MII', name: 'Make_In_India_Declaration.pdf', category: 'Compliance / MII', docNumber: 'MII-ADL-68', uploadedAt: '2026-08-25', status: 'VERIFIED', source: 'Bidder Vault', confidence: 1.0, fileSize: '1.4 MB', fileType: 'pdf', hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    ],
    verifications: [
      { type: 'GST', status: 'VERIFIED', source: 'GSTN Gateway API', verifiedAt: '2026-08-25 10:20 IST', confidence: 1.0, latencyMs: 40, data: { status: 'ACTIVE', filing: 'REGULAR' } },
      { type: 'PAN', status: 'VERIFIED', source: 'PAN NSDL Gateway', verifiedAt: '2026-08-25 10:21 IST', confidence: 1.0, latencyMs: 95, data: { status: 'VALID', match: 'EXACT' } },
      { type: 'Debarment', status: 'VERIFIED', source: 'Central Debarment Registry (CVC)', verifiedAt: '2026-08-25 10:22 IST', confidence: 1.0, latencyMs: 50, data: { isDebarred: false } },
    ],
    requirements: [
      { id: 'EVAL-TCA-MII', ruleId: 'RULE-MII-01', ruleCode: 'REQ-LC-01', title: 'Make-In-India (MII) Local Content %', category: 'Make-in-India', expected: '≥ 50.0% (Class-I)', extracted: '68.0% (Class-I Qualified)', status: 'PASS', severity: 'CRITICAL', weight: 15, scoreContribution: 15, confidence: 0.99, sourceDoc: 'Make_In_India_Declaration.pdf', page: 1, aiExplanation: 'Exceeds Class-I requirement by +18%.' },
      { id: 'EVAL-TCA-GST', ruleId: 'RULE-GST-01', ruleCode: 'REQ-GST-01', title: 'GST Active & Filing Compliance', category: 'Taxation', expected: 'Active regular taxpayer', extracted: 'Active with 100% filing record', status: 'PASS', severity: 'CRITICAL', weight: 15, scoreContribution: 15, confidence: 1.0, sourceDoc: 'GSTN Gateway API', page: 1, aiExplanation: 'Zero defaults on monthly returns.' },
    ],
    evidenceList: [],
    riskResult: { score: 98, riskLevel: 'LOW', drivers: [], categoryBreakdown: { identityConsistency: 100, statutoryCompliance: 100, financialEligibility: 95, technicalEligibility: 98, documentationCompleteness: 100, tenderCompliance: 98 }, summary: 'Fully compliant submission with zero statutory discrepancies.' },
    aiRecommendation: { recommendation: 'APPROVE', confidence: 0.98, headline: 'Fully Qualified Class-I Supplier', reasons: ['Exceeds all statutory thresholds.', 'Clean debarment track record.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 10:30 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted & Verified', status: 'COMPLETED', timestamp: '2026-08-25 10:15 IST', description: 'All statutory gateway checks passed.' }],
  },
  {
    id: 'BID-TC-B',
    bidId: 'BID-2026-TC-B',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-VERTEX-05',
    bidderName: 'Vertex Industrial Systems',
    gstin: '07AAACV1290K1Z4',
    pan: 'AAACV1290K',
    udyam: 'UDYAM-DL-01-0048192',
    submittedAt: '2026-08-25 11:30 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹34,10,00,000',
    quotedValueINR: 341000000,
    priceBreakdown: {
      basicRateINR: 288983051,
      gstPercentage: 18,
      gstAmountINR: 52016949,
      freightAndInstallationINR: 0,
      totalQuotedINR: 341000000,
      totalQuotedFormatted: '₹34,10,00,000',
    },
    complianceScore: 64,
    riskLevel: 'HIGH',
    localContentPercent: 52,
    documents: [],
    verifications: [
      { type: 'GST', status: 'VERIFIED', source: 'GSTN Gateway API', verifiedAt: '2026-08-25 11:35 IST', confidence: 1.0, latencyMs: 44, data: { status: 'ACTIVE' } },
      { type: 'OEM', status: 'FAILED', source: 'OEM Direct Authorization Ledger', verifiedAt: '2026-08-25 11:36 IST', confidence: 1.0, latencyMs: 120, data: { status: 'MISSING_MANDATORY_DOCUMENT' } },
    ],
    requirements: [
      { id: 'EVAL-TCB-OEM', ruleId: 'RULE-OEM-01', ruleCode: 'REQ-OEM-01', title: 'Manufacturer Authorization (MAF)', category: 'Technical', expected: 'Valid OEM Authorization Code', extracted: 'Document Not Uploaded in Vault', status: 'FAIL', severity: 'CRITICAL', weight: 20, scoreContribution: 0, confidence: 1.0, sourceDoc: 'Bidder Vault', page: 1, aiExplanation: 'Mandatory OEM MAF document missing from submission.' },
    ],
    evidenceList: [],
    riskResult: { score: 64, riskLevel: 'HIGH', drivers: [{ factor: 'DOCUMENTATION', severity: 'HIGH', impactScore: -20, description: 'Missing mandatory OEM Authorization' }], categoryBreakdown: { identityConsistency: 95, statutoryCompliance: 90, financialEligibility: 85, technicalEligibility: 30, documentationCompleteness: 40, tenderCompliance: 50 }, summary: 'High risk due to missing technical authorization.' },
    aiRecommendation: { recommendation: 'REJECT', confidence: 0.92, headline: 'Missing Mandatory OEM Authorization', reasons: ['Failed mandatory criterion REQ-OEM-01.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 11:40 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-25 11:30 IST', description: 'Missing MAF flagged by rule engine.' }],
  },
  {
    id: 'BID-TC-C',
    bidId: 'BID-2026-TC-C',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-APEX-07',
    bidderName: 'Apex Logistics & Infrastructure Pvt Ltd',
    gstin: '24AAACA9910L1Z1',
    pan: 'AAACA9910L',
    udyam: 'UDYAM-GJ-01-0091823',
    submittedAt: '2026-08-25 12:00 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹35,00,00,000',
    quotedValueINR: 350000000,
    priceBreakdown: {
      basicRateINR: 296610169,
      gstPercentage: 18,
      gstAmountINR: 53389831,
      freightAndInstallationINR: 0,
      totalQuotedINR: 350000000,
      totalQuotedFormatted: '₹35,00,00,000',
    },
    complianceScore: 54,
    riskLevel: 'HIGH',
    localContentPercent: 55,
    documents: [],
    verifications: [
      { type: 'GST', status: 'FAILED', source: 'GSTN Gateway API', verifiedAt: '2026-08-25 12:05 IST', confidence: 1.0, latencyMs: 48, data: { status: 'OVERDUE_RETURNS', overdueMonths: 3 } },
    ],
    requirements: [
      { id: 'EVAL-TCC-GST', ruleId: 'RULE-GST-01', ruleCode: 'REQ-GST-01', title: 'GST Return Filing Regularity', category: 'Taxation', expected: 'Zero overdue returns in 12 months', extracted: '3 consecutive GSTR-3B filings overdue', status: 'FAIL', severity: 'CRITICAL', weight: 15, scoreContribution: 0, confidence: 1.0, sourceDoc: 'GSTN Gateway API', page: 1, aiExplanation: 'Default notice flagged on GSTN portal.' },
    ],
    evidenceList: [],
    riskResult: { score: 54, riskLevel: 'HIGH', drivers: [{ factor: 'STATUTORY', severity: 'HIGH', impactScore: -25, description: 'Statutory tax default detected on GSTN portal' }], categoryBreakdown: { identityConsistency: 90, statutoryCompliance: 30, financialEligibility: 70, technicalEligibility: 80, documentationCompleteness: 80, tenderCompliance: 60 }, summary: 'High risk due to statutory tax non-compliance.' },
    aiRecommendation: { recommendation: 'REJECT', confidence: 0.94, headline: 'Statutory GST Return Default', reasons: ['Tax compliance failed on GSTN gateway.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 12:10 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-25 12:00 IST', description: 'GST gateway returned default notice.' }],
  },
  {
    id: 'BID-TC-D',
    bidId: 'BID-2026-TC-D',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-DELTA-08',
    bidderName: 'Delta Infra Corporation',
    gstin: '29AAACD4410M1Z3',
    pan: 'AAACD4410M',
    udyam: 'UDYAM-KA-03-0091823',
    submittedAt: '2026-08-25 14:00 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹34,80,00,000',
    quotedValueINR: 348000000,
    priceBreakdown: {
      basicRateINR: 294915254,
      gstPercentage: 18,
      gstAmountINR: 53084746,
      freightAndInstallationINR: 0,
      totalQuotedINR: 348000000,
      totalQuotedFormatted: '₹34,80,00,000',
    },
    complianceScore: 68,
    riskLevel: 'MEDIUM',
    localContentPercent: 58,
    documents: [],
    verifications: [
      { type: 'PAN', status: 'FAILED', source: 'PAN NSDL Gateway', verifiedAt: '2026-08-25 14:05 IST', confidence: 0.78, latencyMs: 110, data: { legalNameOnPan: 'DELTA INFRA PRIVATE LIMITED', tradeNameOnGst: 'DELTA INFRA SOLUTIONS' } },
    ],
    requirements: [
      { id: 'EVAL-TCD-PAN', ruleId: 'RULE-PAN-01', ruleCode: 'REQ-PAN-01', title: 'PAN Legal Entity Consistency', category: 'Identity', expected: '100% legal name match', extracted: 'Name discrepancy: Private Limited vs Solutions', status: 'REVIEW', severity: 'HIGH', weight: 10, scoreContribution: 3, confidence: 0.82, sourceDoc: 'PAN NSDL Gateway', page: 1, aiExplanation: 'Entity name mismatch between PAN registry and GST profile.' },
    ],
    evidenceList: [],
    riskResult: { score: 68, riskLevel: 'MEDIUM', drivers: [{ factor: 'IDENTITY', severity: 'MEDIUM', impactScore: -10, description: 'Entity name mismatch between PAN and GST' }], categoryBreakdown: { identityConsistency: 50, statutoryCompliance: 80, financialEligibility: 85, technicalEligibility: 85, documentationCompleteness: 85, tenderCompliance: 75 }, summary: 'Medium risk: legal identity clarification required.' },
    aiRecommendation: { recommendation: 'REQUEST_CLARIFICATION', confidence: 0.88, headline: 'Clarify Legal Entity Name Discrepancy', reasons: ['PAN registered name differs from bid declaration.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 14:15 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-25 14:00 IST', description: 'PAN name mismatch flagged.' }],
  },
  {
    id: 'BID-TC-E',
    bidId: 'BID-2026-TC-E',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-OMEGA-09',
    bidderName: 'Omega Technologies Corp',
    gstin: '19AAACO3310N1Z9',
    pan: 'AAACO3310N',
    udyam: 'UDYAM-WB-10-0019283',
    submittedAt: '2026-08-25 15:00 IST',
    status: 'UNDER_EVALUATION',
    financialBid: '₹34,60,00,000',
    quotedValueINR: 346000000,
    priceBreakdown: {
      basicRateINR: 293220339,
      gstPercentage: 18,
      gstAmountINR: 52779661,
      freightAndInstallationINR: 0,
      totalQuotedINR: 346000000,
      totalQuotedFormatted: '₹34,60,00,000',
    },
    complianceScore: 58,
    riskLevel: 'HIGH',
    localContentPercent: 54,
    documents: [],
    verifications: [
      { type: 'OEM', status: 'FAILED', source: 'OEM Direct Authorization Ledger', verifiedAt: '2026-08-25 15:05 IST', confidence: 1.0, latencyMs: 140, data: { status: 'EXPIRED', expiredDate: '15-Jul-2026' } },
    ],
    requirements: [
      { id: 'EVAL-TCE-OEM', ruleId: 'RULE-OEM-01', ruleCode: 'REQ-OEM-01', title: 'OEM Authorization Validity Window', category: 'Technical', expected: 'Valid throughout tender execution period', extracted: 'MAF expired on 15-Jul-2026 (40 days prior)', status: 'FAIL', severity: 'CRITICAL', weight: 20, scoreContribution: 0, confidence: 1.0, sourceDoc: 'OEM Direct Authorization Ledger', page: 1, aiExplanation: 'Manufacturer authorization is expired.' },
    ],
    evidenceList: [],
    riskResult: { score: 58, riskLevel: 'HIGH', drivers: [{ factor: 'TECHNICAL', severity: 'HIGH', impactScore: -20, description: 'Expired Manufacturer Authorization Form (MAF)' }], categoryBreakdown: { identityConsistency: 95, statutoryCompliance: 90, financialEligibility: 85, technicalEligibility: 25, documentationCompleteness: 70, tenderCompliance: 50 }, summary: 'High risk: Expired OEM authorization.' },
    aiRecommendation: { recommendation: 'REJECT', confidence: 0.95, headline: 'Expired Manufacturer Authorization', reasons: ['MAF validity expired prior to bid submission.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 15:15 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-25 15:00 IST', description: 'Expired MAF flagged by OEM ledger.' }],
  },
  {
    id: 'BID-TC-H',
    bidId: 'BID-2026-TC-H',
    tenderId: 'TND-9041',
    tenderNumber: 'CPCL/2026/899120',
    tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
    bidderId: 'VEN-BRAVO-03',
    bidderName: 'Bravo Heavy Engineering Corp',
    gstin: '27AAACB9876G1Z2',
    pan: 'AAACB9876G',
    udyam: 'UDYAM-MH-12-0099881',
    submittedAt: '2026-08-23 11:15 IST',
    status: 'DISQUALIFIED',
    financialBid: '₹17,80,00,000',
    quotedValueINR: 178000000,
    priceBreakdown: {
      basicRateINR: 150847458,
      gstPercentage: 18,
      gstAmountINR: 27152542,
      freightAndInstallationINR: 0,
      totalQuotedINR: 178000000,
      totalQuotedFormatted: '₹17,80,00,000',
    },
    complianceScore: 28,
    riskLevel: 'CRITICAL',
    localContentPercent: 30,
    documents: [],
    verifications: [
      { type: 'Debarment', status: 'FAILED', source: 'Central Debarment Registry (CVC)', verifiedAt: '2026-08-23 11:21 IST', confidence: 1.0, latencyMs: 50, data: { isDebarred: true, debarredBy: 'Ministry of Petroleum', debarredTill: '31-Dec-2027' } },
    ],
    requirements: [
      { id: 'EVAL-TCH-DEBAR', ruleId: 'RULE-DEBAR-01', ruleCode: 'REQ-DEBAR-01', title: 'Central Vigilance Debarment Check', category: 'Integrity', expected: 'Clean debarment record across all CPSEs', extracted: 'MATCH FOUND: Debarred by MoP till Dec 2027', status: 'FAIL', severity: 'CRITICAL', weight: 30, scoreContribution: 0, confidence: 1.0, sourceDoc: 'Central Debarment Registry (CVC)', page: 1, aiExplanation: 'Entity is blacklisted under CVC Central Debarment Database.' },
    ],
    evidenceList: [],
    riskResult: { score: 28, riskLevel: 'CRITICAL', drivers: [{ factor: 'STATUTORY', severity: 'CRITICAL', impactScore: -40, description: 'Active CVC Debarment record found' }], categoryBreakdown: { identityConsistency: 90, statutoryCompliance: 10, financialEligibility: 60, technicalEligibility: 50, documentationCompleteness: 60, tenderCompliance: 10 }, summary: 'CRITICAL RISK: Statutory debarment forces immediate disqualification.' },
    aiRecommendation: { recommendation: 'REJECT', confidence: 1.0, headline: 'Statutory Debarment Detected', reasons: ['Blacklisted under CVC registry through Dec 2027.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-23 11:25 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-23 11:15 IST', description: 'CVC debarment match triggered automated rejection flag.' }],
  },
  {
    id: 'BID-TC-J',
    bidId: 'BID-2026-TC-J',
    tenderId: 'TND-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    bidderId: 'VEN-BHARAT-06',
    bidderName: 'Bharat Heavy Electric Infrastructure Ltd',
    gstin: '23AAACB1102P1Z0',
    pan: 'AAACB1102P',
    udyam: 'UDYAM-MP-08-0021901',
    submittedAt: '2026-08-25 16:30 IST',
    status: 'QUALIFIED',
    financialBid: '₹34,50,00,000',
    quotedValueINR: 345000000,
    priceBreakdown: {
      basicRateINR: 292372881,
      gstPercentage: 18,
      gstAmountINR: 52627119,
      freightAndInstallationINR: 0,
      totalQuotedINR: 345000000,
      totalQuotedFormatted: '₹34,50,00,000',
    },
    complianceScore: 99,
    riskLevel: 'LOW',
    localContentPercent: 75,
    documents: [],
    verifications: [
      { type: 'GST', status: 'VERIFIED', source: 'GSTN Gateway API', verifiedAt: '2026-08-25 16:35 IST', confidence: 1.0, latencyMs: 38, data: { status: 'ACTIVE' } },
      { type: 'PAN', status: 'VERIFIED', source: 'PAN NSDL Gateway', verifiedAt: '2026-08-25 16:36 IST', confidence: 1.0, latencyMs: 90, data: { status: 'VALID' } },
      { type: 'Debarment', status: 'VERIFIED', source: 'Central Debarment Registry (CVC)', verifiedAt: '2026-08-25 16:37 IST', confidence: 1.0, latencyMs: 45, data: { isDebarred: false } },
    ],
    requirements: [
      { id: 'EVAL-TCJ-MII', ruleId: 'RULE-MII-01', ruleCode: 'REQ-LC-01', title: 'Make-In-India (MII) Local Content %', category: 'Make-in-India', expected: '≥ 50.0%', extracted: '75.0% (Class-I Cleared)', status: 'PASS', severity: 'CRITICAL', weight: 15, scoreContribution: 15, confidence: 1.0, sourceDoc: 'Make_In_India_Declaration.pdf', page: 1, aiExplanation: 'Indigenous manufacturing verified at Bhopal facility.' },
    ],
    evidenceList: [],
    riskResult: { score: 99, riskLevel: 'LOW', drivers: [], categoryBreakdown: { identityConsistency: 100, statutoryCompliance: 100, financialEligibility: 100, technicalEligibility: 100, documentationCompleteness: 100, tenderCompliance: 100 }, summary: 'Exemplary PSU submission with premier compliance pedigree.' },
    aiRecommendation: { recommendation: 'APPROVE', confidence: 0.99, headline: 'Premier Qualified PSU Supplier', reasons: ['100% compliance across all statutory and technical gateways.'], evidenceIds: [], isMock: true, generatedAt: '2026-08-25 16:45 IST' },
    auditTimeline: [{ stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: '2026-08-25 16:30 IST', description: 'All statutory criteria cleared on first pass.' }],
  },
];

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'USR-ADM-01',
    name: 'Central System Administrator',
    email: 'admin@gem.gov.in',
    organization: 'GeM Central Operations & Governance',
    department: 'Platform Architecture & Gating',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-01-10',
    lastActive: 'Just now',
    twoFactorEnabled: true,
    phone: '+91 11 2345 6789',
    pan: 'GOVIN9999A',
  },
  {
    id: 'USR-OFF-01',
    name: 'P. Sharma (CPCL Senior Procurement Officer)',
    email: 'p.sharma@cpcl.gov.in',
    organization: 'Chennai Petroleum Corporation Ltd (CPCL)',
    department: 'Procurement & Contracts Cell',
    role: 'PROCUREMENT_OFFICER',
    status: 'ACTIVE',
    createdAt: '2025-03-15',
    lastActive: '5 mins ago',
    twoFactorEnabled: true,
    phone: '+91 44 2594 1200',
    pan: 'CPCLP1234K',
    assignedTendersCount: 4,
    activeBidsCount: 18,
  },
  {
    id: 'USR-BID-01',
    name: 'TechCorp Solutions Representative',
    email: 'bids@techcorp.example.com',
    organization: 'TechCorp Solutions Pvt Ltd',
    department: 'Public Sector Bidding Desk',
    role: 'BIDDER',
    status: 'ACTIVE',
    createdAt: '2025-06-20',
    lastActive: '12 mins ago',
    twoFactorEnabled: true,
    phone: '+91 22 8899 7700',
    pan: 'ABCDE1234F',
    gstin: '27ABCDE1234F1Z5',
    activeBidsCount: 4,
    verifiedAt: '2025-06-21',
  },
];

export const INITIAL_CLIENTS: ClientEntity[] = [
  {
    id: 'CLI-CPCL-01',
    name: 'Chennai Petroleum Corporation Ltd (CPCL)',
    shortCode: 'CPCL',
    category: 'PSU',
    department: 'Ministry of Petroleum & Natural Gas',
    address: 'Manali, Chennai, Tamil Nadu - 600068',
    status: 'ACTIVE',
    procurementOfficersCount: 14,
    activeTendersCount: 8,
    totalProcurementValue: '₹420.5 Cr',
    createdAt: '2024-05-10',
    contactEmail: 'tenders@cpcl.gov.in',
  },
  {
    id: 'CLI-IOCL-02',
    name: 'Indian Oil Corporation Limited',
    shortCode: 'IOCL',
    category: 'PSU',
    department: 'Ministry of Petroleum & Natural Gas',
    address: 'Refineries Division, New Delhi - 110003',
    status: 'ACTIVE',
    procurementOfficersCount: 32,
    activeTendersCount: 24,
    totalProcurementValue: '₹1,850.0 Cr',
    createdAt: '2024-02-14',
    contactEmail: 'eprocure@indianoil.in',
  },
  {
    id: 'CLI-MOD-03',
    name: 'Ministry of Defence (MoD)',
    shortCode: 'MOD-DIAT',
    category: 'DEFENCE',
    department: 'Department of Defence Production',
    address: 'South Block, New Delhi - 110011',
    status: 'ACTIVE',
    procurementOfficersCount: 45,
    activeTendersCount: 18,
    totalProcurementValue: '₹3,400.0 Cr',
    createdAt: '2024-01-05',
    contactEmail: 'defence-procure@mod.gov.in',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-8801',
    timestamp: '2026-08-26 10:45:00 IST',
    actor: 'SYSTEM_AUTOMATION',
    role: 'SYSTEM',
    action: 'FULL_VERIFICATION_PIPELINE_RUN',
    resource: 'BID-1024 (TechCorp Solutions)',
    result: 'WARNING',
    ipAddress: '10.0.12.44',
    details: 'Verification executed. 8 rules checked: 6 PASS, 1 REVIEW, 1 CRITICAL FAIL on Local Content (42% vs 50%). Compliance Score: 82. Risk: MEDIUM.',
    payloadJson: JSON.stringify({ bidId: 'BID-1024', score: 82, risk: 'MEDIUM', failedRules: ['REQ-LC-01'] }),
  },
  {
    id: 'LOG-8802',
    timestamp: '2026-08-26 10:45:05 IST',
    actor: 'GSTN_GATEWAY_SERVICE',
    role: 'SYSTEM',
    action: 'GSTN_API_QUERY_SUCCESS',
    resource: '27ABCDE1234F1Z5',
    result: 'SUCCESS',
    ipAddress: '164.100.12.18',
    details: 'GSTN API queried for TechCorp Solutions. Returned ACTIVE regular status, filing up-to-date through July 2026. Latency: 45ms.',
  },
  {
    id: 'LOG-8803',
    timestamp: '2026-08-26 10:45:10 IST',
    actor: 'AI_INFERENCE_CORE',
    role: 'AI_SERVICE',
    action: 'OCR_BOUNDING_BOX_EXTRACT',
    resource: 'Make_In_India_Declaration.pdf',
    result: 'SUCCESS',
    ipAddress: '10.0.88.19',
    details: "Extracted value '42%' with bounding box [120, 340, 210, 368] on Page 1. Confidence: 98.4%.",
  },
  {
    id: 'LOG-8804',
    timestamp: '2026-08-26 10:46:00 IST',
    actor: 'P. Sharma (Officer)',
    role: 'PROCUREMENT_OFFICER',
    action: 'EVIDENCE_VIEWER_ACCESS',
    resource: 'BID-1024 (TechCorp Solutions)',
    result: 'SUCCESS',
    ipAddress: '192.168.1.105',
    details: 'Procurement Officer accessed Split-Screen Evidence Matrix and AI Trace explanations.',
  },
];

export const INITIAL_CLARIFICATIONS: ClarificationItem[] = [
  {
    id: 'CLR-2026-01',
    bidId: 'BID-1024',
    bidderName: 'TechCorp Solutions Pvt Ltd',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    subject: 'Clarification regarding Local Content calculation (42% vs 50% threshold)',
    message: 'Please provide detailed cost breakdown and tier-2 vendor local value-addition certifications explaining the declared 42% local content percentage for Class-I compliance consideration.',
    requestedBy: 'P. Sharma (CPCL Senior Procurement Officer)',
    requestedAt: '2026-08-25 15:00 IST',
    dueDate: '2026-08-29 18:00 IST',
    status: 'PENDING_RESPONSE',
  },
];

// =========================================================================
// SINGLETON IN-MEMORY PLATFORM STORE WITH REACTIVE MUTATION METHODS
// =========================================================================

class PlatformDataStore {
  private tenders: Tender[] = INITIAL_TENDERS;
  private bids: Bid[] = INITIAL_BIDS;
  private connectors: ConnectorConfig[] = INITIAL_CONNECTORS;
  private rules: ComplianceRule[] = INITIAL_COMPLIANCE_RULES;
  private scoringWeights: ScoringWeightsConfig = INITIAL_SCORING_WEIGHTS;
  private aiServices: AIServiceMetric[] = INITIAL_AI_SERVICES;
  private users: AdminUser[] = INITIAL_USERS;
  private clients: ClientEntity[] = INITIAL_CLIENTS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  private clarifications: ClarificationItem[] = INITIAL_CLARIFICATIONS;
  private notifications: SystemNotification[] = [
    { id: 'NOTIF-01', title: 'New Bid Evaluation Ready', message: 'BID-1024 submitted by TechCorp Solutions is ready for review.', type: 'INFO', targetAudience: 'OFFICERS', createdAt: '2026-08-26 10:46 IST' },
    { id: 'NOTIF-02', title: 'System Heartbeat Nominal', message: 'All 11 statutory verification gateways are active and responsive.', type: 'SUCCESS', targetAudience: 'ALL', createdAt: '2026-08-26 09:00 IST' },
  ];

  // --- Tenders ---
  getTenders(): Tender[] {
    return this.tenders;
  }
  getTenderById(id: string): Tender | undefined {
    return this.tenders.find(t => t.id === id || t.tenderNumber === id);
  }
  createTender(tender: Omit<Tender, 'id' | 'publishedDate' | 'bidsCount'>): Tender {
    const newTender: Tender = {
      ...tender,
      id: `TND-${Date.now().toString().slice(-4)}`,
      publishedDate: new Date().toISOString().split('T')[0],
      bidsCount: 0,
    };
    this.tenders.unshift(newTender);
    this.logAudit({
      actor: 'PROCUREMENT_OFFICER',
      role: 'OFFICER',
      action: 'TENDER_CREATED',
      resource: newTender.tenderNumber,
      result: 'SUCCESS',
      details: `Tender created: ${newTender.title} (Est. ${newTender.estimatedValue})`,
    });
    return newTender;
  }

  // --- Bids ---
  getBids(): Bid[] {
    return this.bids;
  }
  getBidById(id: string): Bid | undefined {
    return this.bids.find(b => b.id === id || b.bidId === id);
  }
  getBidsByTenderId(tenderId: string): Bid[] {
    return this.bids.filter(b => b.tenderId === tenderId || b.tenderNumber === tenderId);
  }
  createBid(bid: Omit<Bid, 'id' | 'submittedAt' | 'auditTimeline'>): Bid {
    const newBid: Bid = {
      ...bid,
      id: `BID-${Date.now().toString().slice(-4)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      auditTimeline: [
        { stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST', description: 'Bidder submitted tender bid.' },
        { stageNumber: 2, title: 'AI Extraction & OCR', status: 'PENDING', description: 'Scheduled for automatic execution.' },
        { stageNumber: 3, title: 'Govt. Verification Gateways', status: 'PENDING', description: 'Scheduled for automatic execution.' },
        { stageNumber: 4, title: 'Compliance Rule Engine', status: 'PENDING', description: 'Pending rule evaluation.' },
        { stageNumber: 5, title: 'Officer Evaluation Desk', status: 'PENDING', description: 'Pending officer review.' },
      ],
    };
    this.bids.unshift(newBid);

    // Update tender bidsCount
    const tender = this.getTenderById(bid.tenderId);
    if (tender) {
      tender.bidsCount += 1;
    }

    this.logAudit({
      actor: bid.bidderName,
      role: 'BIDDER',
      action: 'BID_SUBMITTED',
      resource: `${newBid.id} -> ${newBid.tenderNumber}`,
      result: 'SUCCESS',
      details: `Bid submitted with quoted value ${newBid.financialBid}`,
    });

    return newBid;
  }
  updateBid(bidId: string, updates: Partial<Bid>): Bid | undefined {
    const bid = this.getBidById(bidId);
    if (!bid) return undefined;
    Object.assign(bid, updates);
    return bid;
  }

  // --- Connectors ---
  getConnectors(): ConnectorConfig[] {
    return this.connectors;
  }
  getConnectorById(id: string): ConnectorConfig | undefined {
    return this.connectors.find(c => c.id === id || c.type === id);
  }
  updateConnector(id: string, updates: Partial<ConnectorConfig>): ConnectorConfig | undefined {
    const conn = this.connectors.find(c => c.id === id);
    if (!conn) return undefined;
    Object.assign(conn, updates);
    this.logAudit({
      actor: 'SYSTEM_ADMIN',
      role: 'ADMIN',
      action: 'CONNECTOR_CONFIG_UPDATED',
      resource: conn.name,
      result: 'SUCCESS',
      details: `Connector ${conn.name} environment set to ${conn.environment}, status ${conn.status}`,
    });
    return conn;
  }

  // --- Rules ---
  getRules(): ComplianceRule[] {
    return this.rules;
  }
  getRuleById(id: string): ComplianceRule | undefined {
    return this.rules.find(r => r.id === id || r.ruleCode === id);
  }
  updateRule(id: string, updates: Partial<ComplianceRule>): ComplianceRule | undefined {
    const rule = this.rules.find(r => r.id === id);
    if (!rule) return undefined;
    const oldThreshold = rule.thresholdValue;
    Object.assign(rule, updates, { updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST' });
    this.logAudit({
      actor: 'SYSTEM_ADMIN',
      role: 'ADMIN',
      action: 'COMPLIANCE_RULE_UPDATED',
      resource: rule.ruleCode,
      result: 'SUCCESS',
      details: `Rule ${rule.ruleCode} (${rule.title}) threshold modified from ${oldThreshold} to ${rule.thresholdValue}. Weight: ${rule.weightPercent}%`,
    });
    return rule;
  }

  // --- Scoring Weights ---
  getScoringWeights(): ScoringWeightsConfig {
    return this.scoringWeights;
  }
  updateScoringWeights(weights: ScoringWeightsConfig): ScoringWeightsConfig {
    this.scoringWeights = { ...weights };
    this.logAudit({
      actor: 'SYSTEM_ADMIN',
      role: 'ADMIN',
      action: 'RISK_WEIGHTS_UPDATED',
      resource: 'GLOBAL_WEIGHT_MATRIX',
      result: 'SUCCESS',
      details: `Scoring weights updated: Local Content=${weights.localContent}%, Debarment=${weights.debarment}%, Tax=${weights.tax}%, GST=${weights.gst}%`,
    });
    return this.scoringWeights;
  }

  // --- AI Services ---
  getAIServices(): AIServiceMetric[] {
    return this.aiServices;
  }
  updateAIService(id: string, updates: Partial<AIServiceMetric>): AIServiceMetric | undefined {
    const service = this.aiServices.find(s => s.id === id);
    if (!service) return undefined;
    Object.assign(service, updates);
    return service;
  }

  // --- Users ---
  getUsers(): AdminUser[] {
    return this.users;
  }
  getUserById(id: string): AdminUser | undefined {
    return this.users.find(u => u.id === id);
  }
  updateUser(id: string, updates: Partial<AdminUser>): AdminUser | undefined {
    const user = this.users.find(u => u.id === id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.logAudit({
      actor: 'SYSTEM_ADMIN',
      role: 'ADMIN',
      action: 'USER_ACCOUNT_UPDATED',
      resource: user.email,
      result: 'SUCCESS',
      details: `User ${user.name} (${user.role}) status set to ${user.status}`,
    });
    return user;
  }

  // --- Clients & Orgs ---
  getClients(): ClientEntity[] {
    return this.clients;
  }

  // --- Clarifications ---
  getClarifications(): ClarificationItem[] {
    return this.clarifications;
  }
  createClarification(item: Omit<ClarificationItem, 'id' | 'requestedAt' | 'status'>): ClarificationItem {
    const newClarification: ClarificationItem = {
      ...item,
      id: `CLR-${Date.now().toString().slice(-4)}`,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: 'PENDING_RESPONSE',
    };
    this.clarifications.unshift(newClarification);
    this.logAudit({
      actor: item.requestedBy,
      role: 'OFFICER',
      action: 'CLARIFICATION_ISSUED',
      resource: `${item.bidId} (${item.bidderName})`,
      result: 'WARNING',
      details: `Clarification requested: "${item.subject}"`,
    });
    return newClarification;
  }
  respondToClarification(id: string, response: string, attachedDocs?: string[]): ClarificationItem | undefined {
    const clr = this.clarifications.find(c => c.id === id);
    if (!clr) return undefined;
    clr.bidderResponse = response;
    clr.bidderResponseAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST';
    clr.status = 'RESPONDED';
    clr.attachedDocNames = attachedDocs;
    this.logAudit({
      actor: clr.bidderName,
      role: 'BIDDER',
      action: 'CLARIFICATION_RESPONDED',
      resource: clr.id,
      result: 'SUCCESS',
      details: `Bidder provided response to clarification: "${response.slice(0, 80)}..."`,
    });
    return clr;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
  logAudit(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }): AuditLog {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
      ipAddress: entry.ipAddress || '10.0.12.44',
      ...entry,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return newLog;
  }
}

// Global Singleton Instance
declare global {
  var __platformDataStore: PlatformDataStore | undefined;
}

export const platformStore: PlatformDataStore =
  global.__platformDataStore || (global.__platformDataStore = new PlatformDataStore());
