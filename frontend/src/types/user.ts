export type BidStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'UNDER_EVALUATION'
  | 'CLARIFICATION_REQUIRED'
  | 'COMPLIANCE_PASSED'
  | 'COMPLIANCE_FAILED'
  | 'AWARDED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ComplianceStatus =
  | 'PASS'
  | 'FAIL'
  | 'REVIEW'
  | 'PENDING'
  | 'NOT_APPLICABLE';

export type RiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type DocStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'EXPIRED'
  | 'MISSING'
  | 'REVIEW_REQUIRED'
  | 'REJECTED';

export type DocCategory =
  | 'Statutory / Tax'
  | 'Statutory / MSME'
  | 'Financial / Audit'
  | 'Technical / OEM'
  | 'Compliance / MII'
  | 'Technical / Experience'
  | 'Security / ISO';

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  docNumber: string;
  uploadedAt: string;
  expiryDate: string;
  status: DocStatus;
  source: string;
  confidence: number;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  hashSha256: string;
  extractedFields?: ExtractedField[];
  url?: string;
}

export interface StatutoryVerification {
  type: 'GSTN' | 'NSDL' | 'UDYAM' | 'MCA' | 'ICAI_UDIN';
  status: 'ACTIVE' | 'VERIFIED' | 'SANDBOX' | 'FLAGGED';
  latencyMs: number;
  lastChecked: string;
}

export interface UserProfile {
  companyName: string;
  tradeName: string;
  companyType: string;
  cin: string;
  pan: string;
  gstin: string;
  udyam: string;
  epfoCode: string;
  registeredAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  authorizedSignatory: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    dinOrDsc: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    branch: string;
  };
  verifications: StatutoryVerification[];
}

export interface BOQItem {
  itemNo: number;
  itemDescription: string;
  quantity: number;
  uom: string;
  estimatedRate: number;
}

export interface ComplianceRuleDefinition {
  ruleId: string;
  category: 'Statutory' | 'Financial' | 'Technical' | 'Local Content' | 'Legal';
  title: string;
  tenderRequirement: string;
  clauseReference: string;
  isMandatory: boolean;
}

export interface TenderSummary {
  id: string;
  tenderNumber: string;
  title: string;
  organization: string;
  department: string;
  category: string;
  estimatedValueINR: number;
  estimatedValueFormatted: string;
  closingDate: string;
  daysLeft: number;
  location: string;
  matchScore: number;
  complianceRuleCount: number;
  status: 'OPEN' | 'CLOSING_SOON' | 'EVALUATION' | 'CLOSED';
  tags: string[];
  emdAmountFormatted: string;
}

export interface TenderDetail extends TenderSummary {
  description: string;
  scopeOfWork: string[];
  eligibilityCriteria: string[];
  boqItems: BOQItem[];
  complianceRules: ComplianceRuleDefinition[];
  publishingDate: string;
  officerInCharge: {
    name: string;
    designation: string;
    department: string;
  };
}

export interface RequirementAuditItem {
  ruleId: string;
  category: 'Statutory' | 'Financial' | 'Technical' | 'Local Content' | 'Legal';
  title: string;
  tenderRequirement: string;
  bidderExtractedValue: string;
  status: ComplianceStatus;
  confidence: number;
  evidenceLocation?: string;
  sourceDocName?: string;
  notes?: string;
}

export interface AuditTimelineStage {
  stageNumber: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FLAGGED';
  timestamp?: string;
  description: string;
  completedBy?: string;
}

export interface CommercialPriceBreakdown {
  basicRateINR: number;
  gstPercentage: number;
  gstAmountINR: number;
  freightAndInstallationINR: number;
  totalQuotedINR: number;
  totalQuotedFormatted: string;
}

export interface BidItem {
  id: string;
  bidId: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  organization: string;
  quotedValueINR: number;
  quotedValueFormatted: string;
  priceBreakdown: CommercialPriceBreakdown;
  status: BidStatus;
  complianceScore: number;
  riskLevel: RiskLevel;
  submittedAt: string;
  sealedEnvelopeHash: string;
  auditTimeline: AuditTimelineStage[];
  auditSummary: {
    passedRules: number;
    reviewRules: number;
    failedRules: number;
    totalRules: number;
  };
  auditMatrix: RequirementAuditItem[];
  attachedDocIds: string[];
}

export interface ClarificationItem {
  id: string;
  bidId: string;
  tenderNumber: string;
  tenderTitle: string;
  organization: string;
  officerName: string;
  queryTitle: string;
  queryDetails: string;
  queryRaisedAt: string;
  deadlineDate: string;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  flaggedRuleId: string;
  flaggedDocName: string;
  bidderResponse?: {
    remarks: string;
    attachedDocName?: string;
    attachedDocSize?: string;
    respondedAt: string;
  };
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number;
}
