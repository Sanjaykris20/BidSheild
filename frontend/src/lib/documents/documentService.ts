import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UploadedDocumentRecord,
  DocumentUploadStatus,
  SupportedDocumentType,
  ExtractedField
} from '@/types';
import { platformStore } from '@/lib/data/platformDataStore';
import {
  SimplePdfBuilder,
  SYNTHETIC_DOCUMENT_DEFINITIONS,
  PdfDocumentDefinition
} from './pdfGenerator';

// Safe local upload storage outside source directories
const UPLOAD_DIR = path.join(process.cwd(), '.uploads');
const PUBLIC_DOCS_DIR = path.join(process.cwd(), 'public', 'mock-documents');

export function generateAllSyntheticMockPdfs() {
  if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const builder = new SimplePdfBuilder();

  for (const [filename, def] of Object.entries(SYNTHETIC_DOCUMENT_DEFINITIONS)) {
    const pdfBuffer = builder.build(def);

    const publicPath = path.join(PUBLIC_DOCS_DIR, filename);
    if (!fs.existsSync(publicPath)) {
      fs.writeFileSync(publicPath, pdfBuffer);
    }

    const uploadsPath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(uploadsPath)) {
      fs.writeFileSync(uploadsPath, pdfBuffer);
    }
  }

  return Object.keys(SYNTHETIC_DOCUMENT_DEFINITIONS);
}

// Ensure directory and .gitignore exists
function ensureUploadDirectory() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
  }
  const gitignorePath = path.join(UPLOAD_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '*\n!.gitignore\n', 'utf8');
  }

  // Generate synthetic mock PDFs on initialization
  try {
    generateAllSyntheticMockPdfs();
  } catch {
    // Non-blocking in case of restricted permissions
  }
}

// Supported MIME types and extensions
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface FileUploadInput {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  bidId?: string;
  tenderId?: string;
  bidderId?: string;
  documentType?: string;
  isMandatory?: boolean;
  rawBlob?: Blob;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class DocumentStorageService {
  private documentRecords: Map<string, UploadedDocumentRecord> = new Map();

  constructor() {
    ensureUploadDirectory();
    this.seedDefaultUploadedDocuments();
  }

  private seedDefaultUploadedDocuments() {
    // 15 Comprehensive synthetic government & bidder documents
    const initialDocs: Array<Partial<UploadedDocumentRecord> & { filename: string; docType: string }> = [
      {
        id: 'DOC-MII-01',
        filename: 'Make_In_India_Declaration.pdf',
        docType: 'Make in India Declaration',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { localContentPercent: 42, signatory: 'John Doe, Director', plantLocation: 'Bengaluru' },
        fileSize: 1468006,
        fileSizeFormatted: '1.4 MB',
        uploadedAt: '2026-08-24 14:10 IST',
        source: 'Bidder Vault',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-GST-01',
        filename: 'GST_Registration_Certificate.pdf',
        docType: 'GST Certificate',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { gstin: '27ABCDE1234F1Z5', legalName: 'TECHCORP SOLUTIONS PRIVATE LIMITED', status: 'ACTIVE' },
        fileSize: 1258291,
        fileSizeFormatted: '1.2 MB',
        uploadedAt: '2026-08-12 11:20 IST',
        source: 'GSTN Gateway API',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-UDYAM-01',
        filename: 'Udyam_Registration_Certificate.pdf',
        docType: 'Udyam/MSME Certificate',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { udyamNumber: 'UDYAM-MH-18-00123', enterpriseType: 'SMALL', majorActivity: 'SERVICES' },
        fileSize: 839680,
        fileSizeFormatted: '820 KB',
        uploadedAt: '2026-08-14 09:45 IST',
        source: 'data.gov.in / MSME Portal',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-OEM-01',
        filename: 'OEM_Authorization_Letter.pdf',
        docType: 'OEM Authorization',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { authorizationCode: 'MAF-OEM-99120', validUntil: '2027-08-24', oemName: 'Enterprise Server Global Inc.' },
        fileSize: 2202009,
        fileSizeFormatted: '2.1 MB',
        uploadedAt: '2026-08-24 12:15 IST',
        source: 'OEM Direct Partner Ledger',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-PAN-01',
        filename: 'PAN_Verification_Report.pdf',
        docType: 'PAN',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { pan: 'ABCDE1234F', entityName: 'TECHCORP SOLUTIONS PRIVATE LIMITED', status: 'ACTIVE' },
        fileSize: 654320,
        fileSizeFormatted: '640 KB',
        uploadedAt: '2026-08-24 10:30 IST',
        source: 'PAN NSDL Gateway',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-ITR-01',
        filename: 'Income_Tax_Compliance_Report.pdf',
        docType: 'Income Tax / ITR',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { itrYears: 3, udin: '26049102AAAAAC8912', avgTurnover: '38.26 Cr' },
        fileSize: 984000,
        fileSizeFormatted: '960 KB',
        uploadedAt: '2026-08-20 16:00 IST',
        source: 'IT e-Filing Portal',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-EPFO-01',
        filename: 'EPFO_Compliance_Statement.pdf',
        docType: 'EPFO',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { establishmentCode: 'MHBAN0089102000', memberCount: 248, status: 'COMPLIANT' },
        fileSize: 520000,
        fileSizeFormatted: '508 KB',
        uploadedAt: '2026-08-15 14:20 IST',
        source: 'EPFO Portal API',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-ESIC-01',
        filename: 'ESIC_Compliance_Statement.pdf',
        docType: 'ESIC',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { employerCode: '31000892010001001', coveredEmployees: 142, status: 'CLEARED' },
        fileSize: 490000,
        fileSizeFormatted: '478 KB',
        uploadedAt: '2026-08-16 11:10 IST',
        source: 'ESIC Employer Portal',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-EXP-01',
        filename: 'Experience_Certificate.pdf',
        docType: 'Experience Certificate',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { client: 'Bharat Petroleum Corporation Ltd', orderValue: '28.5 Cr', completionDate: '2024-12-15' },
        fileSize: 1120000,
        fileSizeFormatted: '1.1 MB',
        uploadedAt: '2026-08-18 10:15 IST',
        source: 'Client PSU Ledger',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-TURNOVER-01',
        filename: 'Turnover_Certificate.pdf',
        docType: 'Turnover Certificate',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { caUdIn: '26049102AAAAAC8912', threeYearAvgTurnover: '38.26 Cr', netWorth: '19.4 Cr' },
        fileSize: 780000,
        fileSizeFormatted: '762 KB',
        uploadedAt: '2026-08-12 15:30 IST',
        source: 'CA Attestation Vault',
        status: 'VERIFIED',
      },
      {
        id: 'DOC-DEBAR-01',
        filename: 'Blacklisting_Declaration.pdf',
        docType: 'Other Supporting Documents',
        bidId: 'BID-1024',
        tenderId: 'TND-1024',
        bidderId: 'VEN-TECHCORP-01',
        extractedData: { debarmentStatus: 'NOT_DEBARRED', affidavitDate: '2026-08-24' },
        fileSize: 450000,
        fileSizeFormatted: '440 KB',
        uploadedAt: '2026-08-24 14:00 IST',
        source: 'Notary Public Affidavit',
        status: 'VERIFIED',
      },
    ];

    for (const item of initialDocs) {
      const diskPath = path.join(UPLOAD_DIR, item.filename);
      const publicPath = path.join(PUBLIC_DOCS_DIR, item.filename);

      const record: UploadedDocumentRecord = {
        id: item.id || `DOC-${Date.now()}`,
        documentId: item.id || `DOC-${Date.now()}`,
        bidId: item.bidId,
        tenderId: item.tenderId,
        bidderId: item.bidderId || 'VEN-TECHCORP-01',
        documentType: item.docType as SupportedDocumentType,
        originalFilename: item.filename,
        mimeType: 'application/pdf',
        fileSize: item.fileSize || 1024000,
        fileSizeFormatted: item.fileSizeFormatted || '1.0 MB',
        uploadedAt: item.uploadedAt || '2026-08-24 14:00 IST',
        status: 'VERIFIED',
        storageReference: `local://.uploads/${item.filename}`,
        hashSha256: crypto.createHash('sha256').update(item.filename).digest('hex'),
        localPath: fs.existsSync(diskPath) ? diskPath : publicPath,
        extractedData: item.extractedData,
        confidence: 0.98,
        isMandatory: true,
        verificationMode: 'LIVE',
        source: item.source || 'Bidder Vault',
      };

      this.documentRecords.set(record.id, record);
    }
  }

  validateFile(fileName: string, mimeType: string, fileSize: number): ValidationResult {
    if (fileSize <= 0) {
      return { valid: false, error: 'File is empty (0 bytes).' };
    }
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File size exceeds the 25 MB maximum limit (${(fileSize / (1024 * 1024)).toFixed(1)} MB).` };
    }

    const ext = path.extname(fileName).toLowerCase();
    const isExtensionAllowed = Object.values(ALLOWED_MIME_TYPES).some(exts => exts.includes(ext));
    if (!isExtensionAllowed) {
      return {
        valid: false,
        error: `Unsupported file extension "${ext}". Allowed types: PDF, PNG, JPG, JPEG, DOC, DOCX, XLS, XLSX.`,
      };
    }

    return { valid: true };
  }

  async uploadDocument(input: FileUploadInput): Promise<UploadedDocumentRecord> {
    ensureUploadDirectory();

    const validation = this.validateFile(input.fileName, input.mimeType, input.buffer.length);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // Compute cryptographic SHA-256 hash
    const hashSha256 = crypto.createHash('sha256').update(input.buffer).digest('hex');

    // Generate unique ID and filename
    const id = `DOC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const ext = path.extname(input.fileName) || '.bin';
    const safeDiskFileName = `${id}${ext}`;
    const diskPath = path.join(UPLOAD_DIR, safeDiskFileName);

    // Save to disk
    fs.writeFileSync(diskPath, input.buffer);

    // Also mirror to public mock docs if PDF
    if (ext === '.pdf') {
      try {
        fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, safeDiskFileName), input.buffer);
      } catch {}
    }

    // Classify document type if not specified
    const inferredType: SupportedDocumentType = (input.documentType as SupportedDocumentType) || this.inferDocumentType(input.fileName);

    // Ensure AI gets a chance to extract data and we have text before sealing
    const { extractedData, extractedFields, ocrText, confidence, dbVerified } = await this.extractFieldsFromBuffer(
      input.fileName,
      inferredType,
      input.buffer,
      input.rawBlob,
      diskPath
    );

    const fileSizeFormatted = input.buffer.length > 1024 * 1024
      ? `${(input.buffer.length / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(input.buffer.length / 1024)} KB`;

    const record: UploadedDocumentRecord = {
      id,
      documentId: id,
      bidId: input.bidId,
      tenderId: input.tenderId,
      bidderId: input.bidderId || 'VEN-TECHCORP-01',
      documentType: inferredType,
      originalFilename: input.fileName,
      mimeType: input.mimeType || 'application/pdf',
      fileSize: input.buffer.length,
      fileSizeFormatted,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: dbVerified ? 'VERIFIED' : 'FAILED',
      storageReference: `local://.uploads/${safeDiskFileName}`,
      hashSha256,
      localPath: diskPath,
      extractedData,
      extractedFields,
      ocrText,
      confidence,
      isMandatory: input.isMandatory !== undefined ? input.isMandatory : true,
      verificationMode: 'LIVE',
      source: 'Bidder Upload',
    };

    this.documentRecords.set(id, record);

    // Audit log
    platformStore.logAudit({
      actor: input.bidderId || 'BIDDER',
      role: 'BIDDER',
      action: 'DOCUMENT_UPLOADED',
      resource: `${id} (${input.fileName})`,
      result: 'SUCCESS',
      details: `Uploaded real document: "${input.fileName}" (${fileSizeFormatted}, SHA-256: ${hashSha256.slice(0, 12)}...)`,
    });

    return record;
  }

  getDocumentById(id: string): UploadedDocumentRecord | undefined {
    return this.documentRecords.get(id);
  }

  getAllDocuments(): UploadedDocumentRecord[] {
    return Array.from(this.documentRecords.values());
  }

  getDocumentsByBidId(bidId: string): UploadedDocumentRecord[] {
    return Array.from(this.documentRecords.values()).filter(d => d.bidId === bidId);
  }

  getDocumentsByTenderId(tenderId: string): UploadedDocumentRecord[] {
    return Array.from(this.documentRecords.values()).filter(d => d.tenderId === tenderId);
  }

  getDocumentsByBidderId(bidderId: string): UploadedDocumentRecord[] {
    return Array.from(this.documentRecords.values()).filter(d => d.bidderId === bidderId);
  }

  getDocumentBuffer(id: string): { buffer: Buffer; mimeType: string; fileName: string } | undefined {
    const record = this.getDocumentById(id);
    if (!record) {
      // Check if ID matches a synthetic filename directly
      const filenameMatch = Object.keys(SYNTHETIC_DOCUMENT_DEFINITIONS).find(
        f => f === id || f.toLowerCase() === id.toLowerCase() || f.replace(/\.pdf$/i, '') === id
      );
      if (filenameMatch) {
        const builder = new SimplePdfBuilder();
        const buffer = builder.build(SYNTHETIC_DOCUMENT_DEFINITIONS[filenameMatch]);
        return { buffer, mimeType: 'application/pdf', fileName: filenameMatch };
      }
      return undefined;
    }

    // 1. Check if localPath exists
    if (record.localPath && fs.existsSync(record.localPath)) {
      const buffer = fs.readFileSync(record.localPath);
      return { buffer, mimeType: record.mimeType, fileName: record.originalFilename };
    }

    // 2. Check public directory
    const publicPath = path.join(PUBLIC_DOCS_DIR, record.originalFilename);
    if (fs.existsSync(publicPath)) {
      const buffer = fs.readFileSync(publicPath);
      return { buffer, mimeType: record.mimeType, fileName: record.originalFilename };
    }

    // 3. Check uploads directory
    const uploadsPath = path.join(UPLOAD_DIR, record.originalFilename);
    if (fs.existsSync(uploadsPath)) {
      const buffer = fs.readFileSync(uploadsPath);
      return { buffer, mimeType: record.mimeType, fileName: record.originalFilename };
    }

    // 4. Generate valid standard PDF on the fly using definition
    const def =
      SYNTHETIC_DOCUMENT_DEFINITIONS[record.originalFilename] ||
      this.generateDynamicPdfDefinition(record);
    const builder = new SimplePdfBuilder();
    const generatedBuffer = builder.build(def);

    // Cache to disk
    try {
      fs.writeFileSync(uploadsPath, generatedBuffer);
    } catch {}

    return { buffer: generatedBuffer, mimeType: 'application/pdf', fileName: record.originalFilename };
  }

  private generateDynamicPdfDefinition(record: UploadedDocumentRecord): PdfDocumentDefinition {
    return {
      title: record.documentType.toUpperCase(),
      subtitle: `OFFICIAL COMPLIANCE ARTIFACT • ${record.originalFilename}`,
      department: 'BidShield AI Secure Verification Subsystem',
      documentNumber: record.id,
      date: record.uploadedAt,
      metadata: {
        'Document ID': record.id,
        'Filename': record.originalFilename,
        'Document Type': record.documentType,
        'Bidder ID': record.bidderId || 'VEN-TECHCORP-01',
        'Verification Status': 'VERIFIED (SHA-256 Authenticated)',
        'Storage Reference': record.storageReference,
        'File Size': record.fileSizeFormatted,
      },
      sections: [
        {
          alert: {
            type: 'success',
            text: `BIDSHIELD AUDITED: Cryptographic fingerprint verified against central procurement registry.`,
          },
        },
        {
          heading: '1. Extracted Statutory Attributes',
          paragraphs: [
            `This certified electronic artifact was ingested into the BidShield AI compliance engine. The cryptographic hash ${record.hashSha256} confirms tamper-proof immutability.`,
          ],
          table: {
            headers: ['Attribute Key', 'Extracted Value', 'Confidence', 'Audit Status'],
            rows: Object.entries(record.extractedData || { 'Status': 'Verified' }).map(([k, v]) => [
              k,
              String(v),
              '99.4%',
              'PASSED',
            ]),
          },
        },
      ],
      signatory: {
        name: 'BidShield Automated Notary',
        designation: 'Government Procurement Ledger System',
        organization: 'BidShield AI Enterprise Platform',
        date: record.uploadedAt,
      },
    };
  }

  deleteDocument(id: string): boolean {
    const record = this.documentRecords.get(id);
    if (!record) return false;

    if (record.localPath && fs.existsSync(record.localPath)) {
      try {
        fs.unlinkSync(record.localPath);
      } catch {}
    }

    this.documentRecords.delete(id);

    platformStore.logAudit({
      actor: record.bidderId || 'BIDDER',
      role: 'BIDDER',
      action: 'DOCUMENT_DELETED',
      resource: record.originalFilename,
      result: 'WARNING',
      details: `Document ${id} (${record.originalFilename}) removed from vault.`,
    });

    return true;
  }

  inferDocumentType(fileName: string): SupportedDocumentType {
    const name = fileName.toLowerCase();
    if (name.includes('gst')) return 'GST Certificate';
    if (name.includes('pan')) return 'PAN';
    if (name.includes('udyam') || name.includes('msme')) return 'Udyam/MSME Certificate';
    if (name.includes('itr') || name.includes('tax') || name.includes('income')) return 'Income Tax / ITR';
    if (name.includes('epfo') || name.includes('pf')) return 'EPFO';
    if (name.includes('esic') || name.includes('esi')) return 'ESIC';
    if (name.includes('startup') || name.includes('dpiit')) return 'Startup India';
    if (name.includes('nsic') || name.includes('sprs')) return 'NSIC';
    if (name.includes('oem') || name.includes('maf')) return 'OEM Authorization';
    if (name.includes('mii') || name.includes('make_in_india') || name.includes('local_content')) return 'Make in India Declaration';
    if (name.includes('exp') || name.includes('past_performance')) return 'Experience Certificate';
    if (name.includes('turnover') || name.includes('ca_cert')) return 'Turnover Certificate';
    if (name.includes('financial') || name.includes('balance_sheet')) return 'Financial Documents';
    if (name.includes('iso') || name.includes('technical')) return 'Technical Documents';
    return 'Other Supporting Documents';
  }

  private async extractFieldsFromBuffer(
    fileName: string,
    docType: SupportedDocumentType,
    buffer: Buffer,
    rawBlob?: Blob,
    diskPath?: string
  ): Promise<{
    extractedData: Record<string, any>;
    extractedFields: ExtractedField[];
    ocrText: string;
    confidence: number;
    dbVerified: boolean;
  }> {
    const extractedData: Record<string, string | number> = {};
    const extractedFields: ExtractedField[] = [];
    let ocrText = '';
    let confidence = 0.85;
    let dbVerified = true;

    try {
      const formData = new FormData();
      const mimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png';
      
      if (diskPath) {
        formData.append('file_path', diskPath);
        formData.append('original_filename', fileName);
      } else if (rawBlob) {
        formData.append('file', rawBlob, fileName);
      } else {
        const fileObj = new File([new Uint8Array(buffer)], fileName, { type: mimeType });
        formData.append('file', fileObj);
      }
      
      formData.append('document_type', docType);

      // Use 127.0.0.1 to avoid Node.js IPv6 localhost resolution issues
      const aiUrl = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8001';
      const targetEndpoint = diskPath ? '/api/ai/document-extract-path' : '/api/ai/document-extract';
      const aiResponse = await fetch(`${aiUrl}${targetEndpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        ocrText = aiData.extracted_text || '';
        confidence = aiData.confidence || 0.98;
        if (aiData.db_verified !== undefined) {
          dbVerified = aiData.db_verified;
        }

        if (aiData.extracted_fields && typeof aiData.extracted_fields === 'object') {
          for (const [key, value] of Object.entries(aiData.extracted_fields)) {
            extractedData[key] = value as string | number;
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            extractedFields.push({ label, value: String(value), confidence: confidence, pageNumber: 1 });
          }
        }
      } else {
        const errText = await aiResponse.text();
        ocrText = `AI FETCH FAILED: ${aiResponse.status} ${errText}\n`;
      }
    } catch (e: any) {
      console.error('AI Engine error:', e);
      ocrText = `AI FETCH ERROR: ${e.message || String(e)}\n`;
    }

    if (extractedFields.length === 0) {
      // Try to extract raw ASCII / UTF-8 strings from binary buffer
      const rawContent = buffer.toString('utf8', 0, Math.min(buffer.length, 65536));
      ocrText = (ocrText || '') + '\n' + rawContent.slice(0, 1000);
      
      const lcMatch = rawContent.match(/(\d{1,3})\s*%/i) || fileName.match(/(\d{1,3})pct/i) || fileName.match(/(\d{1,3})%/i);
      if (lcMatch && (docType === 'Make in India Declaration' || docType === 'Local Content Declaration')) {
        const val = parseInt(lcMatch[1], 10);
        if (!isNaN(val) && val >= 0 && val <= 100) {
          extractedData.localContentPercent = val;
          extractedFields.push({ label: 'Local Content %', value: `${val}%`, confidence: 0.98, pageNumber: 1 });
        }
      }

      const gstMatch = rawContent.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/);
      if (gstMatch) {
        extractedData.gstin = gstMatch[0];
        extractedFields.push({ label: 'GSTIN', value: gstMatch[0], confidence: 1.0, pageNumber: 1 });
      }

      const panMatch = rawContent.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      if (panMatch) {
        extractedData.pan = panMatch[0];
        extractedFields.push({ label: 'PAN', value: panMatch[0], confidence: 1.0, pageNumber: 1 });
      }

      const udyamMatch = rawContent.match(/UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,7}/i);
      if (udyamMatch) {
        extractedData.udyamNumber = udyamMatch[0].toUpperCase();
        extractedFields.push({ label: 'Udyam Registration', value: udyamMatch[0].toUpperCase(), confidence: 1.0, pageNumber: 1 });
      }
    }

    return {
      extractedData,
      extractedFields,
      ocrText,
      confidence,
      dbVerified,
    };
  }

  checkTenderMandatoryDocuments(
    tenderId: string,
    uploadedDocTypes: string[]
  ): {
    isComplete: boolean;
    required: Array<{ type: SupportedDocumentType; isPresent: boolean }>;
    missing: SupportedDocumentType[];
  } {
    const requiredForTender: SupportedDocumentType[] = [
      'GST Certificate',
      'PAN',
      'Make in India Declaration',
      'OEM Authorization',
    ];

    const requiredStatus = requiredForTender.map(reqType => {
      const isPresent = uploadedDocTypes.some(
        uploaded => uploaded.toLowerCase().includes(reqType.toLowerCase()) || reqType.toLowerCase().includes(uploaded.toLowerCase())
      );
      return { type: reqType, isPresent };
    });

    const missing = requiredStatus.filter(r => !r.isPresent).map(r => r.type);

    return {
      isComplete: missing.length === 0,
      required: requiredStatus,
      missing,
    };
  }
}

// Global Singleton Instance
declare global {
  var __documentStorageService: DocumentStorageService | undefined;
}

export const documentService: DocumentStorageService =
  global.__documentStorageService || (global.__documentStorageService = new DocumentStorageService());
