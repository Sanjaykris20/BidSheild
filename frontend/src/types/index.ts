export type UserRole = 'BIDDER' | 'CLIENT' | 'ADMIN' | 'PROCUREMENT_OFFICER' | 'AUDITOR';

export type ComplianceStatus = 
  | 'PASS' 
  | 'FAIL' 
  | 'REVIEW' 
  | 'PENDING' 
  | 'NOT_APPLICABLE' 
  | 'EXPIRED' 
  | 'MISSING' 
  | 'VERIFICATION_FAILED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TenderStatus = 
  | 'DRAFT' 
  | 'UPCOMING' 
  | 'LIVE' 
  | 'UNDER_EVALUATION' 
  | 'CLOSED' 
  | 'AWARDED' 
  | 'CANCELLED'
  | 'SUSPENDED'
  | 'ARCHIVED';

export type BidStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_VERIFICATION' 
  | 'UNDER_EVALUATION' 
  | 'CLARIFICATION_REQUIRED' 
  | 'COMPLIANCE_PASSED' 
  | 'COMPLIANCE_FAILED' 
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'AWARDED' 
  | 'REJECTED' 
  | 'WITHDRAWN';

export type DocCategory =
  | 'Statutory / Tax'
  | 'Statutory / MSME'
  | 'Financial / Audit'
  | 'Technical / OEM'
  | 'Compliance / MII'
  | 'Technical / Experience'
  | 'Security / ISO'
  | 'Legal / Debarment';

export type DocStatus = 'VERIFIED' | 'FAILED' | 'PENDING' | 'EXPIRED' | 'MISSING' | 'UPLOADED' | 'ACTION_REQUIRED';

export type VerificationMode = 'LIVE' | 'OPEN_DATA' | 'SANDBOX' | 'MOCK' | 'UNAVAILABLE';

export type VerificationStatus = 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'NOT_FOUND' 
  | 'PENDING' 
  | 'UNAVAILABLE' 
  | 'MOCK';

export type DocumentUploadStatus = 
  | 'UPLOADING' 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'MISSING' 
  | 'REJECTED';

export type SupportedDocumentType = 
  | 'GST Certificate'
  | 'PAN'
  | 'Udyam/MSME Certificate'
  | 'Income Tax / ITR'
  | 'EPFO'
  | 'ESIC'
  | 'Startup India'
  | 'NSIC'
  | 'OEM Authorization'
  | 'Make in India Declaration'
  | 'Local Content Declaration'
  | 'Experience Certificate'
  | 'Financial Documents'
  | 'Turnover Certificate'
  | 'Technical Documents'
  | 'Tender-specific Documents'
  | 'Other Supporting Documents';

export interface UploadedDocumentRecord {
  id: string;
  documentId: string;
  bidId?: string;
  tenderId?: string;
  bidderId?: string;
  documentType: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  uploadedAt: string;
  status: DocumentUploadStatus;
  storageReference: string;
  hashSha256: string;
  localPath?: string;
  extractedData?: Record<string, any>;
  extractedFields?: ExtractedField[];
  ocrText?: string;
  confidence?: number;
  isMandatory?: boolean;
  verificationMode?: VerificationMode;
  source?: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  pageNumber?: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  docNumber: string;
  uploadedAt: string;
  expiryDate?: string;
  status: DocStatus;
  source: string;
  confidence: number;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  hashSha256: string;
  extractedFields?: ExtractedField[];
  url?: string;
  isVerifiedByGovt?: boolean;
  govtVerificationSource?: string;
  storageReference?: string;
  verificationMode?: VerificationMode;
  isMandatory?: boolean;
}

export interface StatutoryVerification {
  type: 'GST' | 'Udyam' | 'PAN' | 'Income Tax' | 'EPFO' | 'ESIC' | 'Startup India' | 'NSIC' | 'OEM' | 'DigiLocker' | 'Debarment' | 'eProcure';
  status: VerificationStatus;
  source?: string;
  verification_mode?: VerificationMode;
  verifiedAt: string;
  confidence: number;
  latencyMs: number;
  data: Record<string, any>;
  remarks?: string;
}

export interface BOQItem {
  itemNo: number;
  itemDescription: string;
  quantity: number;
  uom: string;
  estimatedRate: number;
  totalEstimated: number;
}

export interface ComplianceRule {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  category: 'Statutory' | 'Financial' | 'Technical' | 'Documentation' | 'Make-in-India' | 'Integrity';
  parameter: string;
  operator: 'EQUALS' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'CONTAINS' | 'IS_TRUE' | 'NOT_EXPIRED';
  thresholdValue: string;
  weightPercent: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DISABLED';
  version: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface RuleVersion {
  version: string;
  updatedAt: string;
  modifiedBy: string;
  changeSummary: string;
  diff: string;
}

export interface EvidenceItem {
  id: string;
  requirementId: string;
  ruleId: string;
  ruleTitle: string;
  documentId?: string;
  documentName: string;
  pageNumber: number;
  extractedValue: string;
  expectedValue: string;
  actualValue: string;
  verificationSource: string;
  result: ComplianceStatus;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  snippetHtml?: string;
  aiTraceExplanation?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface RequirementEvaluation {
  id: string;
  ruleId: string;
  ruleCode: string;
  title: string;
  category: string;
  expected: string;
  extracted: string;
  difference?: string;
  status: ComplianceStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  scoreContribution: number;
  confidence: number;
  sourceDoc: string;
  page: number;
  snippetHtml?: string;
  aiExplanation?: string;
  isOverridden?: boolean;
  overrideRemarks?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface RiskDriver {
  factor: string;
  severity: RiskLevel;
  impactScore: number;
  description: string;
  evidenceRef?: string;
}

export interface RiskAnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  drivers: RiskDriver[];
  categoryBreakdown: {
    identityConsistency: number;
    statutoryCompliance: number;
    financialEligibility: number;
    technicalEligibility: number;
    documentationCompleteness: number;
    tenderCompliance: number;
  };
  summary: string;
}

export interface AIRecommendation {
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'REQUEST_CLARIFICATION';
  confidence: number;
  headline: string;
  reasons: string[];
  evidenceIds: string[];
  isMock: boolean;
  generatedAt: string;
}

export interface TenderRequiredDocument {
  id: string;
  name: string;
  category: string;
  weight: number;
}

export interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  organization: string;
  department: string;
  category: string;
  estimatedValue: string;
  estimatedValueINR: number;
  publishedDate: string;
  closingDate: string;
  daysLeft: number;
  status: TenderStatus;
  assignedOfficer: string;
  description: string;
  scopeOfWork: string[];
  eligibilityCriteria: string[];
  boqItems: BOQItem[];
  complianceRuleIds: string[];
  bidsCount: number;
  location: string;
  emdAmountFormatted: string;
  tags: string[];
  requiredDocuments?: TenderRequiredDocument[];
  maxBidsPerBidder?: number;
  womenReservationPercent?: number;
}

export interface CommercialPriceBreakdown {
  basicRateINR: number;
  gstPercentage: number;
  gstAmountINR: number;
  freightAndInstallationINR: number;
  totalQuotedINR: number;
  totalQuotedFormatted: string;
}

export interface AuditTimelineStage {
  stageNumber: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FLAGGED';
  timestamp?: string;
  description: string;
  completedBy?: string;
}

export interface Bid {
  id: string;
  bidId: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  bidderId: string;
  bidderName: string;
  gstin: string;
  pan: string;
  udyam: string;
  submittedAt: string;
  status: BidStatus;
  financialBid: string;
  quotedValueINR: number;
  priceBreakdown: CommercialPriceBreakdown;
  complianceScore: number;
  riskLevel: RiskLevel;
  localContentPercent: number;
  documents: DocumentItem[];
  verifications: StatutoryVerification[];
  requirements: RequirementEvaluation[];
  evidenceList: EvidenceItem[];
  riskResult?: RiskAnalysisResult;
  aiRecommendation?: AIRecommendation;
  auditTimeline: AuditTimelineStage[];
  officerDecision?: {
    action: 'approve' | 'clarify' | 'reject';
    decisionStatus: string;
    remarks: string;
    decidedBy: string;
    decidedAt: string;
  };
}

export interface ClarificationItem {
  id: string;
  bidId: string;
  bidderName: string;
  tenderNumber: string;
  tenderTitle: string;
  subject: string;
  message: string;
  requestedBy: string;
  requestedAt: string;
  dueDate: string;
  status: 'PENDING_RESPONSE' | 'RESPONDED' | 'RESOLVED' | 'CLOSED';
  bidderResponse?: string;
  bidderResponseAt?: string;
  attachedDocNames?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  department?: string;
  role: 'ADMIN' | 'PROCUREMENT_OFFICER' | 'CLIENT' | 'BIDDER' | 'AUDITOR';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_VERIFICATION';
  createdAt: string;
  lastActive: string;
  twoFactorEnabled: boolean;
  phone?: string;
  pan?: string;
  gstin?: string;
  assignedTendersCount?: number;
  activeBidsCount?: number;
  verifiedAt?: string;
}

export interface ClientEntity {
  id: string;
  name: string;
  shortCode: string;
  category: 'PSU' | 'CENTRAL_MINISTRY' | 'STATE_GOVT' | 'AUTONOMOUS_BODY' | 'DEFENCE';
  department: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  procurementOfficersCount: number;
  activeTendersCount: number;
  totalProcurementValue: string;
  createdAt: string;
  contactEmail: string;
}

export interface OrganizationEntity {
  id: string;
  organization: string;
  department: string;
  code: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  assignedOfficers: string[];
  tendersCount: number;
  createdDate: string;
}

export type ConnectorEnvironment = 'LIVE' | 'OPEN_DATA' | 'SANDBOX' | 'MOCK' | 'UNAVAILABLE';
export type ConnectorHealthStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface ConnectorConfig {
  id: string;
  name: string;
  type: 'GST' | 'Udyam' | 'PAN' | 'Income Tax' | 'EPFO' | 'ESIC' | 'Startup India' | 'NSIC' | 'OEM' | 'DigiLocker' | 'Debarment' | 'eProcure';
  status: ConnectorHealthStatus;
  environment: ConnectorEnvironment;
  lastChecked: string;
  responseTime: string;
  errorRate: string;
  successRate: string;
  endpointUrl: string;
  apiKeyMasked: string;
  description: string;
  requests24h: number;
  rateLimitPerMin: number;
  sourceType?: string;
  sourceDataset?: string;
}

export interface ConnectorLog {
  id: string;
  connectorId: string;
  connectorName: string;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  httpCode: number;
  latencyMs: number;
  requestPayload: string;
  responsePayload: string;
}

export interface DocumentFieldConfig {
  id: string;
  name: string;
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'REGEX' | 'BOOLEAN';
  isRequired: boolean;
  validationRegex?: string;
  ocrConfidenceThreshold: number;
  description?: string;
}

export interface DocumentTypeConfig {
  id: string;
  code: string;
  name: string;
  category: 'Statutory' | 'Technical' | 'Financial' | 'Integrity';
  fileFormatAccepted: string[];
  maxFileSizeMB: number;
  fields: DocumentFieldConfig[];
  status: 'ACTIVE' | 'DISABLED';
  updatedAt: string;
}

export interface AIServiceMetric {
  id: string;
  name: string;
  serviceCode: string;
  modelVersion: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  requests24h: number;
  successRate: number;
  failureRate: number;
  averageLatencyMs: number;
  tokenConsumption24h: number;
  promptDirectives?: string;
}

export interface ScoringWeights {
  identityConsistency: number;
  statutoryCompliance: number;
  financialEligibility: number;
  technicalEligibility: number;
  documentationCompleteness: number;
}

export interface ScoringWeightsConfig {
  gst: number;
  pan: number;
  udyam: number;
  tax: number;
  localContent: number;
  oem: number;
  documents: number;
  debarment: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED' | 'OVERRIDE' | 'BLOCKED';
  ipAddress: string;
  details: string;
  payloadJson?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'BROADCAST';
  targetAudience: 'ALL' | 'BIDDERS' | 'OFFICERS' | 'ADMINS';
  createdAt: string;
  isRead?: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'FAILED_LOGIN' | 'SUSPICIOUS_IP' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS' | 'OVERRIDE_FLAG';
  userEmail: string;
  ipAddress: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'RESOLVED' | 'INVESTIGATING' | 'BLOCKED';
  actionTaken: string;
}
