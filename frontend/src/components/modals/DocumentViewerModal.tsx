'use client';

import React from 'react';
import { useUserStore } from '@/context/UserStoreContext';
import { Modal } from '@/components/common/Modal';
import { DocStatusBadge } from '@/components/common/Badge';
import { FileText, Download, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export const DocumentViewerModal: React.FC = () => {
  const { viewingDocument, closeDocumentViewer, addToast } = useUserStore();

  if (!viewingDocument) return null;

  return (
    <Modal
      isOpen={!!viewingDocument}
      onClose={closeDocumentViewer}
      title={viewingDocument.name}
      subtitle={`Category: ${viewingDocument.category} • Hash: ${viewingDocument.hashSha256.substring(0, 24)}...`}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Side: Visual Document Simulation */}
        <div className="lg:col-span-7 bg-slate-100 rounded-2xl border border-slate-300 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Page 1 of 2 (Verified Scan)</span>
            </span>
            <span>{viewingDocument.fileSize}</span>
          </div>

          <div className="bg-white my-3 p-6 rounded-xl shadow-sm border border-slate-200/80 font-serif leading-relaxed text-slate-800 space-y-4 min-h-[340px]">
            <div className="text-center pb-3 border-b border-slate-800">
              <div className="font-sans font-black text-sm uppercase tracking-wider text-slate-900">
                GOVERNMENT OF INDIA / STATUTORY COMPLIANCE
              </div>
              <div className="font-bold text-xs text-slate-700 mt-0.5">
                {viewingDocument.name.replace(/_/g, ' ').replace('.pdf', '')}
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <p>
                <strong>Certificate / Document Reference:</strong>{' '}
                <span className="font-mono bg-slate-100 px-1 py-0.5 rounded border">
                  {viewingDocument.docNumber}
                </span>
              </p>
              <p>
                <strong>Issuing / Verification Authority:</strong>{' '}
                <span>{viewingDocument.source}</span>
              </p>
              <p>
                <strong>Issued To:</strong> ABC Technologies & Engineering Ltd (GSTIN: 33AAACA1234F1ZV)
              </p>

              {viewingDocument.category === 'Compliance / MII' ? (
                <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-xl space-y-1.5 font-sans">
                  <div className="font-bold text-amber-900">
                    Make in India Local Content Declaration Clause:
                  </div>
                  <p className="text-amber-950">
                    "We hereby certify that the percentage of local content in the offered goods/services is{' '}
                    <span className="evidence-highlight font-bold px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded">
                      42.00%
                    </span>
                    , qualifying under Class-II Local Supplier category."
                  </p>
                </div>
              ) : viewingDocument.category === 'Technical / OEM' ? (
                <div className="p-3 bg-rose-50/60 border border-rose-300 rounded-xl space-y-1.5 font-sans">
                  <div className="font-bold text-rose-900">OEM Validity Scope:</div>
                  <p className="text-rose-950">
                    "Authorization valid for Southern PSU refinery tenders expiring{' '}
                    <span className="font-bold bg-rose-200 text-rose-950 px-1 rounded">
                      31 March 2025
                    </span>
                    ."
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-1 font-sans">
                  <div className="font-bold text-emerald-900">Statutory Clearance:</div>
                  <p className="text-emerald-950">
                    All statutory particulars matched against central database with 100% cryptographic confidence.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-300 flex justify-between items-end text-[10px] font-sans">
              <div>
                <div className="font-bold text-slate-900">Authorized Signatory</div>
                <div className="font-display italic text-blue-900 font-bold mt-1">R. Ramanathan</div>
                <div className="text-slate-500">Managing Director</div>
              </div>
              <div className="text-right font-mono text-slate-500">
                <div>Digital Signature: VALID</div>
                <div>Date: {viewingDocument.uploadedAt}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Extracted Fields & Audit Trace */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">
                AI Extraction Summary
              </span>
              <DocStatusBadge status={viewingDocument.status} />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Confidence Score</span>
                <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {viewingDocument.confidence}% Confidence
                </span>
              </div>

              <div className="space-y-2">
                {viewingDocument.extractedFields && viewingDocument.extractedFields.length > 0 ? (
                  viewingDocument.extractedFields.map((field, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        {field.label}
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {field.value}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">No custom fields extracted.</div>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] space-y-1">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Verification Source Gateway</span>
              </div>
              <p className="text-blue-800 leading-relaxed font-medium">
                {viewingDocument.source} — Cryptographically attested with tamper-evident seal.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                addToast({
                  title: 'Document Export',
                  message: `Downloading ${viewingDocument.name}`,
                  type: 'info',
                });
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={closeDocumentViewer}
              className="px-5 py-2 bg-primary text-white hover:bg-slate-800 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
