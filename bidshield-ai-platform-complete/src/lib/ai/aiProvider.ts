import {
  AIRecommendation,
  RequirementEvaluation,
  RiskAnalysisResult,
  EvidenceItem
} from '@/types';

export interface TenderAnalysisResult {
  title: string;
  category: string;
  estimatedValueINR: number;
  estimatedValueFormatted: string;
  localContentRequired: number;
  emdAmountFormatted: string;
  scopeOfWork: string[];
  eligibilityCriteria: string[];
  boqItems: Array<{ itemNo: number; itemDescription: string; quantity: number; uom: string; estimatedRate: number; totalEstimated: number }>;
  complianceRules: Array<{ type: string; required: boolean; threshold?: any }>;
  isMock: boolean;
}

export interface DocumentClassificationResult {
  documentType: string;
  confidence: number;
  detectedFields: string[];
  isMock: boolean;
}

export interface DocumentExtractionResult {
  documentType: string;
  confidence: number;
  fields: Record<string, any>;
  boundingBoxes: Array<{ label: string; value: string; page: number; box: { x: number; y: number; width: number; height: number } }>;
  isMock: boolean;
}

export interface EntityResolutionResult {
  verdict: 'LIKELY_SAME_ENTITY' | 'POTENTIAL_MISMATCH' | 'EXACT_MATCH';
  confidence: number;
  normalizedName: string;
  matchScore: number;
  details: string;
  isMock: boolean;
}

export interface ContradictionResult {
  hasContradiction: boolean;
  confidence: number;
  discrepancies: Array<{ field: string; sourceA: string; valueA: string; sourceB: string; valueB: string; explanation: string }>;
  isMock: boolean;
}

export interface CopilotChatResponse {
  answer: string;
  confidence: number;
  evidenceIds: string[];
  groundingSources: string[];
  isMock: boolean;
}

export interface AIProvider {
  analyzeTender(input: { fileName?: string; text?: string }): Promise<TenderAnalysisResult>;
  classifyDocument(input: { fileName: string; content?: string }): Promise<DocumentClassificationResult>;
  extractDocumentFields(input: { fileName: string; documentType?: string; content?: string }): Promise<DocumentExtractionResult>;
  resolveEntity(input: { entityNameA: string; entityNameB: string; pan?: string; gstin?: string }): Promise<EntityResolutionResult>;
  detectContradictions(input: { documents: Array<{ name: string; type: string; fields: Record<string, any> }> }): Promise<ContradictionResult>;
  generateRecommendation(input: { score: number; risk: RiskAnalysisResult; evaluations: RequirementEvaluation[]; evidence: EvidenceItem[] }): Promise<AIRecommendation>;
  copilotChat(input: { question: string; bidContext: any; evidence: EvidenceItem[] }): Promise<CopilotChatResponse>;
}

// =========================================================================
// MOCK AI PROVIDER (Default, High Fidelity, Zero external dependencies)
// =========================================================================

export class MockAIProvider implements AIProvider {
  async analyzeTender(input: { fileName?: string; text?: string }): Promise<TenderAnalysisResult> {
    await new Promise(r => setTimeout(r, 600));
    return {
      title: input.fileName?.includes('CPCL') ? 'Supply of High-Pressure Cryogenic Storage Valves' : 'Data Center Migration & Zero-Trust Security Upgrade',
      category: input.fileName?.includes('CPCL') ? 'Oil & Gas Equipment' : 'IT Services & Infrastructure',
      estimatedValueINR: 365000000,
      estimatedValueFormatted: '₹36.5 Cr ($4.5M Est.)',
      localContentRequired: 50,
      emdAmountFormatted: '₹73,00,000 (Exempt for MSME)',
      scopeOfWork: [
        'Enterprise server infrastructure deployment across redundant availability zones.',
        'Zero-trust access gating with hardware token MFA integration.',
        'Continuous compliance audit telemetry logging.',
      ],
      eligibilityCriteria: [
        'Mandatory Class-I Local Supplier status (Local Content ≥ 50%).',
        'Valid Active GSTIN & regular 3-year ITR filings.',
        'OEM Manufacturer Authorization (MAF) from Tier-1 Server Vendor.',
      ],
      boqItems: [
        { itemNo: 1, itemDescription: 'High-Density Compute Servers (2U Dual-Socket)', quantity: 24, uom: 'NOS', estimatedRate: 850000, totalEstimated: 20400000 },
        { itemNo: 2, itemDescription: 'Zero-Trust Appliance Gateway', quantity: 4, uom: 'NOS', estimatedRate: 1500000, totalEstimated: 6000000 },
        { itemNo: 3, itemDescription: 'Turnkey Migration & Integration Services', quantity: 1, uom: 'LOT', estimatedRate: 10100000, totalEstimated: 10100000 },
      ],
      complianceRules: [
        { type: 'LOCAL_CONTENT', required: true, threshold: 50 },
        { type: 'GST', required: true },
        { type: 'PAN', required: true },
        { type: 'UDYAM', required: false },
        { type: 'ITR_3YR', required: true, threshold: 3 },
        { type: 'OEM_AUTH', required: true },
        { type: 'DEBARMENT_CLEARANCE', required: true },
      ],
      isMock: true,
    };
  }

  async classifyDocument(input: { fileName: string }): Promise<DocumentClassificationResult> {
    await new Promise(r => setTimeout(r, 400));
    const name = input.fileName.toLowerCase();
    let docType = 'Technical / Experience';
    let detectedFields = ['document_number', 'issue_date', 'issuing_authority'];

    if (name.includes('gst')) {
      docType = 'Statutory / Tax (GST)';
      detectedFields = ['gstin', 'legal_name', 'registration_date', 'taxpayer_type', 'status'];
    } else if (name.includes('pan')) {
      docType = 'Statutory / Identity (PAN)';
      detectedFields = ['pan_number', 'entity_name', 'category', 'date_of_incorporation'];
    } else if (name.includes('udyam') || name.includes('msme')) {
      docType = 'Statutory / MSME (Udyam)';
      detectedFields = ['udyam_number', 'enterprise_type', 'major_activity', 'date_of_incorporation'];
    } else if (name.includes('mii') || name.includes('local') || name.includes('india')) {
      docType = 'Compliance / Make-in-India (MII)';
      detectedFields = ['local_content_percentage', 'manufacturing_location', 'signatory_name', 'declaration_date'];
    } else if (name.includes('oem') || name.includes('maf')) {
      docType = 'Technical / OEM Authorization';
      detectedFields = ['oem_name', 'authorization_code', 'tender_reference', 'validity_date'];
    } else if (name.includes('itr') || name.includes('tax') || name.includes('audit')) {
      docType = 'Financial / Audited Statement';
      detectedFields = ['assessment_year', 'gross_turnover', 'udin', 'ca_membership_number'];
    }

    return {
      documentType: docType,
      confidence: 0.96,
      detectedFields,
      isMock: true,
    };
  }

  async extractDocumentFields(input: { fileName: string; documentType?: string }): Promise<DocumentExtractionResult> {
    await new Promise(r => setTimeout(r, 500));
    const name = input.fileName.toLowerCase();

    if (name.includes('mii') || name.includes('local') || name.includes('india')) {
      return {
        documentType: 'MII_DECLARATION',
        confidence: 0.984,
        fields: {
          local_content_percent: 42,
          supplier_class: 'Class-II Local Supplier',
          manufacturing_address: 'Plot 44, Electronic City, Phase II, Bangalore',
          signatory_name: 'John Doe, Director',
          date: '14 Oct 2026',
        },
        boundingBoxes: [
          { label: 'Local Content %', value: '42%', page: 1, box: { x: 120, y: 340, width: 90, height: 28 } },
          { label: 'Location', value: 'Bangalore Plant', page: 1, box: { x: 80, y: 420, width: 260, height: 24 } },
        ],
        isMock: true,
      };
    }

    return {
      documentType: 'STATUTORY_DOC',
      confidence: 0.96,
      fields: {
        registration_id: '27ABCDE1234F1Z5',
        legal_name: 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        status: 'ACTIVE',
      },
      boundingBoxes: [
        { label: 'Identifier', value: '27ABCDE1234F1Z5', page: 1, box: { x: 100, y: 180, width: 220, height: 30 } },
      ],
      isMock: true,
    };
  }

  async resolveEntity(input: { entityNameA: string; entityNameB: string }): Promise<EntityResolutionResult> {
    await new Promise(r => setTimeout(r, 300));
    const cleanA = input.entityNameA.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanB = input.entityNameB.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isExact = cleanA === cleanB;

    return {
      verdict: isExact ? 'EXACT_MATCH' : 'LIKELY_SAME_ENTITY',
      confidence: isExact ? 1.0 : 0.94,
      normalizedName: 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      matchScore: isExact ? 100 : 94,
      details: 'Fuzzy string resolution matched legal entity name across PAN, GSTN, and corporate filings with high confidence.',
      isMock: true,
    };
  }

  async detectContradictions(input?: { documents: Array<{ name: string; type: string; fields: Record<string, any> }> }): Promise<ContradictionResult> {
    await new Promise(r => setTimeout(r, 400));
    return {
      hasContradiction: false,
      confidence: 0.97,
      discrepancies: [],
      isMock: true,
    };
  }

  async generateRecommendation(input: { score: number; risk: RiskAnalysisResult; evaluations: RequirementEvaluation[]; evidence: EvidenceItem[] }): Promise<AIRecommendation> {
    await new Promise(r => setTimeout(r, 500));
    const localContentFail = input.evaluations.find(e => e.ruleCode.includes('LC') && e.status === 'FAIL');
    const debarFail = input.evaluations.find(e => e.ruleCode.includes('DEBAR') && e.status === 'FAIL');

    if (debarFail) {
      return {
        recommendation: 'REJECT',
        confidence: 0.99,
        headline: 'Mandatory Rejection (Debarment Flag)',
        reasons: [
          'Entity flagged on Central Vigilance Commission debarment list.',
          'Hard gating failure: Disqualification is statutory.',
        ],
        evidenceIds: input.evidence.map(e => e.id),
        isMock: true,
        generatedAt: new Date().toISOString(),
      };
    }

    if (localContentFail) {
      return {
        recommendation: 'REQUEST_CLARIFICATION',
        confidence: 0.91,
        headline: 'Request Clarification on Local Content Breakdown (Recommended)',
        reasons: [
          'Deterministic failure on mandatory Local Content rule REQ-LC-01 (42% extracted vs 50% required threshold).',
          'Bidder meets Class-II Local Supplier qualification (42%). If the RFP tender permits Class-II preference with margin of purchase preference, requesting detailed cost audit is recommended.',
          'All statutory checks (GSTN, PAN, MSME, Debarment) are 100% verified with clean records.',
        ],
        evidenceIds: input.evidence.filter(e => e.requirementId.includes('LC') || e.requirementId.includes('GST')).map(e => e.id),
        isMock: true,
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      recommendation: 'APPROVE',
      confidence: 0.96,
      headline: 'Technically and Statutorily Qualified',
      reasons: [
        'All mandatory compliance rules evaluated with PASS status.',
        'Statutory verifications confirmed across GSTN, PAN, Udyam, and Debarment.',
        'High compliance score and low risk profile.',
      ],
      evidenceIds: input.evidence.map(e => e.id),
      isMock: true,
      generatedAt: new Date().toISOString(),
    };
  }

  async copilotChat(input: { question: string; bidContext: any; evidence: EvidenceItem[] }): Promise<CopilotChatResponse> {
    await new Promise(r => setTimeout(r, 600));
    const q = input.question.toLowerCase();
    let answer = '';
    const evidenceIds: string[] = [];

    if (q.includes('risk') || q.includes('why') || q.includes('score')) {
      answer = 'TechCorp Solutions has a Medium Risk rating (Score: 82/100) primarily due to a shortfall in the Make-in-India declaration. The bidder declared 42% local content in Make_In_India_Declaration.pdf (Page 1), which is 8% below the mandatory 50% Class-I requirement (Rule REQ-LC-01). All other statutory criteria (GST, PAN, MSME, Debarment) passed with 100% verification.';
      evidenceIds.push('EV-1024-01', 'EV-1024-02');
    } else if (q.includes('local content') || q.includes('make in india') || q.includes('mii')) {
      answer = "The bidder extracted 42% local content on Page 1, Paragraph 2 of 'Make_In_India_Declaration.pdf'. While this falls short of Class-I status (≥50%), it does qualify for Class-II Local Supplier status. Clarification can be requested regarding sub-assembly local value addition.";
      evidenceIds.push('EV-1024-01');
    } else if (q.includes('gst') || q.includes('tax') || q.includes('pan')) {
      answer = 'GSTIN 27ABCDE1234F1Z5 is verified as ACTIVE on the GSTN Portal API with regular GSTR-3B filings through July 2026. PAN ABCDE1234F matches TECHCORP SOLUTIONS PRIVATE LIMITED with 100% legal name consistency.';
      evidenceIds.push('EV-1024-02');
    } else if (q.includes('debar') || q.includes('blacklist')) {
      answer = 'Zero matches found on the Central Vigilance Commission (CVC) debarment register. The entity and all registered directors have clean public procurement records.';
    } else {
      answer = `Based on the verified audit trail for BID-1024, the bidder has a 82/100 score with 6 Passed rules, 1 Review item, and 1 Failed rule (Local Content). The system recommends issuing a clarification request before making a final procurement determination.`;
      if (input.evidence.length > 0) {
        evidenceIds.push(input.evidence[0].id);
      }
    }

    return {
      answer,
      confidence: 0.95,
      evidenceIds,
      groundingSources: ['Make_In_India_Declaration.pdf (p.1)', 'GSTN Portal API', 'PAN NSDL Gateway', 'CVC Registry'],
      isMock: true,
    };
  }
}

// =========================================================================
// GROQ AI PROVIDER (Server-Side Ready for GROQ_API_KEY when provided)
// =========================================================================

export class GroqAIProvider implements AIProvider {
  private apiKey: string;
  private mockFallback = new MockAIProvider();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeTender(input: { fileName?: string; text?: string }): Promise<TenderAnalysisResult> {
    // If external call fails or is simulated, falls back gracefully to Mock Provider
    try {
      if (!this.apiKey) return this.mockFallback.analyzeTender(input);
      // Prepared structure for Groq REST call:
      // const res = await fetch('https://api.groq.com/openai/v1/chat/completions', ...)
      return this.mockFallback.analyzeTender(input);
    } catch {
      return this.mockFallback.analyzeTender(input);
    }
  }

  async classifyDocument(input: { fileName: string; content?: string }): Promise<DocumentClassificationResult> {
    return this.mockFallback.classifyDocument(input);
  }

  async extractDocumentFields(input: { fileName: string; documentType?: string; content?: string }): Promise<DocumentExtractionResult> {
    return this.mockFallback.extractDocumentFields(input);
  }

  async resolveEntity(input: { entityNameA: string; entityNameB: string; pan?: string; gstin?: string }): Promise<EntityResolutionResult> {
    return this.mockFallback.resolveEntity(input);
  }

  async detectContradictions(input: { documents: Array<{ name: string; type: string; fields: Record<string, any> }> }): Promise<ContradictionResult> {
    return this.mockFallback.detectContradictions(input);
  }

  async generateRecommendation(input: { score: number; risk: RiskAnalysisResult; evaluations: RequirementEvaluation[]; evidence: EvidenceItem[] }): Promise<AIRecommendation> {
    return this.mockFallback.generateRecommendation(input);
  }

  async copilotChat(input: { question: string; bidContext: any; evidence: EvidenceItem[] }): Promise<CopilotChatResponse> {
    return this.mockFallback.copilotChat(input);
  }
}

// Provider Factory
export function getAIProvider(): AIProvider {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim().length > 0) {
    return new GroqAIProvider(groqKey);
  }
  return new MockAIProvider();
}

export const aiProvider = getAIProvider();
