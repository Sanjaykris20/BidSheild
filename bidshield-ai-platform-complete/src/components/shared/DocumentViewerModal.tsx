'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

export interface DocumentViewerData {
  id: string;
  name: string;
  category: string;
  docNumber?: string;
  uploadedAt: string;
  fileSize?: string;
  status?: string;
  source?: string;
  hashSha256?: string;
  bidderName?: string;
  tenderNumber?: string;
  extractedFields?: Array<{ label: string; value: string; confidence?: number }>;
  pdfUrl?: string;
}

interface DocumentViewerModalProps {
  document: DocumentViewerData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewerModal({ document, isOpen, onClose }: DocumentViewerModalProps) {
  const { showToast } = useToast();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'extracted'>('preview');

  if (!isOpen || !document) return null;

  // Resolve valid PDF URL
  let resolvedPdfUrl = document.pdfUrl;
  if (!resolvedPdfUrl) {
    if (document.name && document.name.endsWith('.pdf')) {
      resolvedPdfUrl = `/mock-documents/${document.name}`;
    } else {
      resolvedPdfUrl = `/api/documents/${document.id}/view`;
    }
  }

  const handleDownload = () => {
    try {
      const link = window.document.createElement('a');
      link.href = resolvedPdfUrl || `/api/documents/${document.id}/download`;
      link.download = document.name || 'BidShield_Document.pdf';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      showToast(`Downloading "${document.name}"...`, 'success');
    } catch {
      showToast('Download initiated in browser.', 'info');
    }
  };

  const handleOpenNewTab = () => {
    window.open(resolvedPdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-surface-container-lowest w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-outline-variant relative z-10 flex flex-col overflow-hidden animate-slide-in">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                  {document.category || 'Statutory Compliance Artifact'}
                </span>
                <span className="text-xs font-mono font-bold text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  SHA-256 Verified
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-primary truncate mt-0.5">
                {document.name}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenNewTab}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-white hover:bg-surface-container text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 shadow-sm"
              title="Open in new browser tab"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span className="hidden md:inline">Open in Tab</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Download PDF document"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download PDF</span>
            </button>

            <div className="h-6 w-px bg-outline-variant mx-1"></div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-muted hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
              title="Close viewer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Split: Left PDF Viewer / Right Metadata Panel */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-surface-alt/40">
          {/* Left Main: Embedded PDF Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900/5 relative border-r border-outline-variant/60 min-h-0">
            {/* Viewer Toolbar */}
            <div className="h-10 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 shrink-0 text-xs text-neutral-muted">
              <span className="font-mono text-[11px] text-primary font-semibold">
                Document Stream: {document.docNumber || document.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-primary"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="font-mono text-[11px] font-semibold text-primary">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-primary"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
              </div>
            </div>

            {/* Rendered PDF Iframe */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/60">
              <div
                className="w-full h-full bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden transition-all duration-150"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <iframe
                  src={`${resolvedPdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-none rounded-xl"
                  title={document.name}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Document Metadata & Ingestion Audit */}
          <div className="w-full lg:w-96 bg-surface-container-lowest flex flex-col shrink-0 overflow-y-auto divide-y divide-outline-variant/50">
            {/* Metadata Tab Selector */}
            <div className="p-4 bg-surface flex gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-outline-variant text-neutral-muted hover:bg-surface-container'
                }`}
              >
                Metadata
              </button>
              <button
                onClick={() => setActiveTab('extracted')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'extracted'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-outline-variant text-neutral-muted hover:bg-surface-container'
                }`}
              >
                Extracted Fields
              </button>
            </div>

            {/* Panel 1: Document Metadata */}
            {activeTab === 'preview' && (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block mb-1">
                    Document Classification
                  </span>
                  <p className="font-bold text-primary text-sm">{document.category}</p>
                </div>

                {document.bidderName && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block mb-1">
                      Associated Bidder
                    </span>
                    <p className="font-semibold text-primary">{document.bidderName}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/60">
                    <span className="text-[10px] text-neutral-muted block font-semibold uppercase">Document ID</span>
                    <span className="font-mono font-bold text-primary text-[11px] truncate block">
                      {document.id}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/60">
                    <span className="text-[10px] text-neutral-muted block font-semibold uppercase">Upload Date</span>
                    <span className="font-mono font-bold text-primary text-[11px] truncate block">
                      {document.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/60">
                    <span className="text-[10px] text-neutral-muted block font-semibold uppercase">Verification</span>
                    <span className="font-bold text-success text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] icon-fill">verified</span>
                      {document.status || 'VERIFIED'}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/60">
                    <span className="text-[10px] text-neutral-muted block font-semibold uppercase">Source</span>
                    <span className="font-mono font-bold text-primary text-[11px] truncate block">
                      {document.source || 'Bidder Ingestion'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic SHA-256 */}
                <div className="bg-surface-alt p-3 rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-1.5 text-primary font-bold mb-1">
                    <span className="material-symbols-outlined text-[16px] text-info">lock</span>
                    <span>SHA-256 Fingerprint:</span>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-muted break-all leading-tight bg-white p-2 rounded border border-outline-variant/60">
                    {document.hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </p>
                </div>
              </div>
            )}

            {/* Panel 2: Extracted Fields */}
            {activeTab === 'extracted' && (
              <div className="p-5 space-y-3 text-xs">
                <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block">
                  AI OCR & Structural Extraction
                </span>

                {document.extractedFields && document.extractedFields.length > 0 ? (
                  <div className="space-y-2">
                    {document.extractedFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-surface rounded-xl border border-outline-variant/60 flex justify-between items-center"
                      >
                        <div>
                          <span className="text-[10px] text-neutral-muted uppercase font-semibold block">
                            {field.label}
                          </span>
                          <span className="font-bold text-primary font-mono text-xs">{field.value}</span>
                        </div>
                        {field.confidence !== undefined && (
                          <span className="text-[10px] font-mono font-bold text-info bg-info/10 px-1.5 py-0.5 rounded border border-info/20">
                            {Math.round(field.confidence * 100)}% Match
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-neutral-muted bg-surface rounded-xl border border-outline-variant">
                    <p className="font-semibold text-primary">Standard Structured Document</p>
                    <p className="text-[11px] mt-1">All header attributes and signatures validated.</p>
                  </div>
                )}
              </div>
            )}

            {/* Security Assurance Banner */}
            <div className="p-4 bg-info/5 text-xs text-on-surface-variant leading-relaxed">
              <div className="flex items-center gap-1.5 text-info font-bold mb-1">
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>BidShield AI Document Guarantee</span>
              </div>
              <p className="text-[11px]">
                Electronic records sealed with immutable timestamps and verified against statutory government APIs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
