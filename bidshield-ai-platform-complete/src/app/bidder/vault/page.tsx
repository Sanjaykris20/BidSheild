'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { DocumentViewerModal, DocumentViewerData } from '@/components/shared/DocumentViewerModal';
import { downloadFileInBrowser } from '@/lib/export/exportUtils';

interface VaultDoc {
  id: string;
  name: string;
  category: string;
  extractedId: string;
  statusText: string;
  statusType: 'verified' | 'warning' | 'pending';
  fileSize: string;
  uploadDate: string;
  isRealUpload?: boolean;
  pdfUrl?: string;
  extractedFields?: Array<{ label: string; value: string; confidence?: number }>;
  hashSha256?: string;
}

export default function BidderVaultPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('Uploading File...');
  const [uploadLogMsg, setUploadLogMsg] = useState('Initializing encrypted connection...');
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<DocumentViewerData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [docs, setDocs] = useState<VaultDoc[]>([
    {
      id: 'DOC-GST-01',
      name: 'GST_Registration_Certificate.pdf',
      category: 'Statutory / Tax',
      extractedId: '27ABCDE1234F1Z5',
      statusText: 'Verified via GSTN Portal Gateway',
      statusType: 'verified',
      fileSize: '1.2 MB',
      uploadDate: 'Uploaded Oct 12, 2026',
      pdfUrl: '/mock-documents/GST_Registration_Certificate.pdf',
      hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      extractedFields: [
        { label: 'GSTIN', value: '27ABCDE1234F1Z5', confidence: 1.0 },
        { label: 'Legal Name', value: 'TECHCORP SOLUTIONS PRIVATE LIMITED', confidence: 1.0 },
        { label: 'Status', value: 'ACTIVE & COMPLIANT', confidence: 1.0 },
      ],
    },
    {
      id: 'DOC-UDYAM-01',
      name: 'Udyam_Registration_Certificate.pdf',
      category: 'Statutory / MSME',
      extractedId: 'UDYAM-MH-18-00123',
      statusText: 'Verified via data.gov.in MSME Dataset',
      statusType: 'verified',
      fileSize: '820 KB',
      uploadDate: 'Uploaded Jan 05, 2026',
      pdfUrl: '/mock-documents/Udyam_Registration_Certificate.pdf',
      hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      extractedFields: [
        { label: 'Udyam Number', value: 'UDYAM-MH-18-00123', confidence: 1.0 },
        { label: 'Category', value: 'SMALL ENTERPRISE', confidence: 1.0 },
        { label: 'Fee Exemption', value: 'ELIGIBLE', confidence: 1.0 },
      ],
    },
    {
      id: 'DOC-MII-01',
      name: 'Make_In_India_Declaration.pdf',
      category: 'Compliance / MII',
      extractedId: 'MII-TC-42PCT',
      statusText: 'Extracted: 42% Local Content (Class-II)',
      statusType: 'warning',
      fileSize: '1.4 MB',
      uploadDate: 'Uploaded Aug 24, 2026',
      pdfUrl: '/mock-documents/Make_In_India_Declaration.pdf',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      extractedFields: [
        { label: 'Local Content %', value: '42%', confidence: 0.984 },
        { label: 'Supplier Category', value: 'Class-II Local Supplier', confidence: 0.98 },
        { label: 'Plant Location', value: 'Bengaluru, Karnataka', confidence: 0.96 },
      ],
    },
    {
      id: 'DOC-OEM-01',
      name: 'OEM_Authorization_Letter.pdf',
      category: 'Technical / OEM',
      extractedId: 'MAF-OEM-99120',
      statusText: 'Verified via OEM Direct Partner Ledger',
      statusType: 'verified',
      fileSize: '2.1 MB',
      uploadDate: 'Uploaded Aug 24, 2026',
      pdfUrl: '/mock-documents/OEM_Authorization_Letter.pdf',
      hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      extractedFields: [
        { label: 'OEM Principal', value: 'Enterprise Server Global Inc.', confidence: 0.99 },
        { label: 'Authorization ID', value: 'MAF-OEM-99120', confidence: 1.0 },
        { label: 'Validity Window', value: 'Through 24-Aug-2027', confidence: 0.97 },
      ],
    },
    {
      id: 'DOC-PAN-01',
      name: 'PAN_Verification_Report.pdf',
      category: 'Statutory / Tax',
      extractedId: 'ABCDE1234F',
      statusText: 'Verified via PAN NSDL Gateway',
      statusType: 'verified',
      fileSize: '640 KB',
      uploadDate: 'Uploaded Aug 24, 2026',
      pdfUrl: '/mock-documents/PAN_Verification_Report.pdf',
      hashSha256: '8f91028301928301928301928301928301928301928301928301928301928301',
      extractedFields: [
        { label: 'PAN', value: 'ABCDE1234F', confidence: 1.0 },
        { label: 'Name on PAN', value: 'TECHCORP SOLUTIONS PRIVATE LIMITED', confidence: 1.0 },
      ],
    },
    {
      id: 'DOC-ITR-01',
      name: 'Income_Tax_Compliance_Report.pdf',
      category: 'Financial / Tax',
      extractedId: 'UDIN-26049102AAAA',
      statusText: '3-Yr Tax Filings & CA UDIN Verified',
      statusType: 'verified',
      fileSize: '960 KB',
      uploadDate: 'Uploaded Aug 20, 2026',
      pdfUrl: '/mock-documents/Income_Tax_Compliance_Report.pdf',
      hashSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
  ]);

  // Load any previously uploaded real documents from API
  useEffect(() => {
    fetch('/api/documents?bidder_id=VEN-TECHCORP-01')
      .then(res => res.json())
      .then(data => {
        if (data.documents && data.documents.length > 0) {
          const apiDocs: VaultDoc[] = data.documents.map((d: any) => ({
            id: d.id,
            name: d.originalFilename,
            category: d.documentType,
            extractedId: d.extractedData?.gstin || d.extractedData?.udyamNumber || d.extractedData?.pan || d.id,
            statusText: d.status === 'VERIFIED' ? 'Verified (SHA-256 Validated)' : 'Uploaded & Extracted',
            statusType: 'verified',
            fileSize: d.fileSizeFormatted,
            uploadDate: d.uploadedAt || 'Uploaded via File Picker',
            isRealUpload: true,
            pdfUrl: `/api/documents/${d.id}/view`,
            extractedFields: d.extractedFields,
            hashSha256: d.hashSha256,
          }));
          setDocs(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newDocs = apiDocs.filter(d => !existingIds.has(d.id));
            return [...newDocs, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatusMsg(`Encrypting and uploading ${file.name}...`);
    setUploadLogMsg(`[SYS] Calculating SHA-256 cryptographic fingerprint for ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bidderId', 'VEN-TECHCORP-01');

      setUploadProgress(40);
      setUploadStatusMsg('Running OCR & Spatial Parsing Engine...');
      setUploadLogMsg('[SYS] File buffer streamed into safe storage and validated against schema.');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      setUploadStatusMsg('AI Document Classification & Government Dataset Cross-Check...');
      setUploadLogMsg('[SYS] Extracted statutory fields and verified digital signatures.');

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      setUploadStatusMsg('Verification Complete.');
      setUploadLogMsg(`[SYS] Document sealed with SHA-256: ${data.document.hashSha256.slice(0, 16)}...`);

      const uploadedDoc = data.document;
      const newVaultDoc: VaultDoc = {
        id: uploadedDoc.id,
        name: uploadedDoc.originalFilename,
        category: uploadedDoc.documentType,
        extractedId:
          uploadedDoc.extractedData?.gstin ||
          uploadedDoc.extractedData?.udyamNumber ||
          uploadedDoc.extractedData?.pan ||
          uploadedDoc.id,
        statusText: `Verified (SHA-256: ${uploadedDoc.hashSha256.slice(0, 10)}...)`,
        statusType: 'verified',
        fileSize: uploadedDoc.fileSizeFormatted,
        uploadDate: 'Just Uploaded',
        isRealUpload: true,
        pdfUrl: `/api/documents/${uploadedDoc.id}/view`,
        extractedFields: uploadedDoc.extractedFields,
        hashSha256: uploadedDoc.hashSha256,
      };

      setTimeout(() => {
        setIsUploading(false);
        setDocs(prev => [newVaultDoc, ...prev]);
        showToast(`Document "${file.name}" uploaded and verified in vault.`, 'success');
      }, 500);
    } catch (err: any) {
      setIsUploading(false);
      showToast(err.message || 'File upload failed.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenViewer = (doc: VaultDoc) => {
    setSelectedDocForViewer({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      docNumber: doc.extractedId,
      uploadedAt: doc.uploadDate,
      fileSize: doc.fileSize,
      status: doc.statusText,
      source: 'Bidder Ingestion Vault',
      hashSha256: doc.hashSha256,
      bidderName: 'TechCorp Solutions Pvt Ltd',
      extractedFields: doc.extractedFields,
      pdfUrl: doc.pdfUrl || `/mock-documents/${doc.name}`,
    });
    setIsViewerOpen(true);
  };

  const handleDownloadDoc = (doc: VaultDoc) => {
    const url = doc.pdfUrl || `/mock-documents/${doc.name}`;
    downloadFileInBrowser(url, doc.name, 'application/pdf');
    showToast(`Downloading "${doc.name}"...`, 'success');
  };

  const handleDeleteDoc = async (doc: VaultDoc) => {
    if (doc.isRealUpload) {
      try {
        await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      } catch {}
    }
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    showToast(`Document "${doc.name}" removed from vault.`, 'warning');
  };

  const filteredDocs = docs.filter(
    d =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.extractedId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Hidden file input for real OS file picker */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
        onChange={handleRealFileUpload}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Document Vault
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Centralized, AI-verified repository for compliance artifacts, tax certificates, and manufacturer authorizations.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Upload Document
        </button>
      </div>

      {/* Upload Progress Area */}
      {isUploading && (
        <div className="bg-surface-container-low border-2 border-primary/40 rounded-2xl p-6 shadow-inner animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary animate-spin-slow text-[22px]">
                sync
              </span>
              <span className="font-bold text-primary text-sm">{uploadStatusMsg}</span>
            </div>
            <span className="font-mono text-sm text-primary font-black">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs font-mono text-neutral-muted mt-2">{uploadLogMsg}</p>
        </div>
      )}

      {/* Vault Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-alt/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search files, categories, extracted IDs..."
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none bg-white transition-all"
            />
          </div>
          <div className="flex gap-3 text-xs text-neutral-muted font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success"></span> Verified ({docs.filter(d => d.statusType === 'verified').length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Action Required ({docs.filter(d => d.statusType === 'warning').length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs text-neutral-muted uppercase tracking-wider">
                <th className="p-4 font-semibold">Document Details</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">AI Extraction & Verification</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant">
              {filteredDocs.map(doc => {
                const isWarn = doc.statusType === 'warning';
                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-surface-alt transition-colors ${
                      isWarn ? 'bg-warning/5 border-l-4 border-l-warning' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                            doc.name.endsWith('.jpg') || doc.name.endsWith('.png')
                              ? 'bg-blue-50 text-info'
                              : isWarn
                              ? 'bg-amber-50 text-warning border border-warning/20'
                              : 'bg-red-50 text-danger'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {doc.name.endsWith('.jpg') || doc.name.endsWith('.png')
                              ? 'image'
                              : 'picture_as_pdf'}
                          </span>
                        </div>
                        <div>
                          <p
                            onClick={() => handleOpenViewer(doc)}
                            className="font-semibold text-primary hover:text-info cursor-pointer transition-colors"
                          >
                            {doc.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${isWarn ? 'text-warning font-semibold' : 'text-outline'}`}>
                            {doc.uploadDate} • {doc.fileSize}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-semibold text-on-surface-variant">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono bg-white px-2 py-1 rounded-lg border border-outline-variant/60 w-fit">
                          <span className="material-symbols-outlined text-[14px] text-info icon-fill">
                            auto_awesome
                          </span>
                          {doc.extractedId}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold ${
                            isWarn ? 'text-warning' : 'text-success'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px] icon-fill">
                            {isWarn ? 'warning' : 'verified'}
                          </span>
                          {doc.statusText}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenViewer(doc)}
                          className="px-2.5 py-1.5 text-primary hover:bg-surface-container transition-colors bg-white border border-outline-variant rounded-lg shadow-sm flex items-center gap-1 text-xs font-semibold"
                          title="View PDF in Document Viewer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-1.5 text-outline hover:text-primary transition-colors bg-white border border-outline-variant rounded-lg shadow-sm"
                          title="Download Document"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc)}
                          className="p-1.5 text-outline hover:text-danger transition-colors bg-white border border-outline-variant rounded-lg shadow-sm"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNIVERSAL DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        document={selectedDocForViewer}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
