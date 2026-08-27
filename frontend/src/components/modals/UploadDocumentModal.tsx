'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/context/UserStoreContext';
import { Modal } from '@/components/common/Modal';
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { DocCategory } from '@/types/user';

export const UploadDocumentModal: React.FC = () => {
  const { isUploadModalOpen, closeUploadModal, addDocument } = useUserStore();
  const [category, setCategory] = useState<DocCategory>('Technical / OEM');
  const [docName, setDocName] = useState('OEM_Authorization_Certificate_FY26_27.pdf');
  const [docNumber, setDocNumber] = useState('AUTH-EMR-2026-9921');
  const [expiryDate, setExpiryDate] = useState('31 Mar 2027');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [stageLog, setStageLog] = useState('');

  const handleStartUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setProgress(0);

    const stages = [
      { p: 25, title: 'Encrypting & Uploading Payload...', log: '[SYS] Payload mapped to encrypted vault storage.' },
      { p: 55, title: 'Running OCR & Layout Analysis...', log: '[AI-OCR] Text, tables & bounding coordinates extracted (98.6% confidence).' },
      { p: 80, title: 'AI Classification & Statutory Match...', log: '[RULE-E] Validated against Manufacturer Registry & Model Taxonomy.' },
      { p: 100, title: 'Verifying Cryptographic Ledger Hash...', log: '[LEDGER] SHA-256 recorded. Document verified.' },
    ];

    let currentP = 0;
    const interval = setInterval(() => {
      currentP += 4;
      setProgress(currentP);

      const matchingStage = stages.find((s) => currentP >= s.p - 10 && currentP <= s.p);
      if (matchingStage) {
        setCurrentStage(matchingStage.title);
        setStageLog(matchingStage.log);
      }

      if (currentP >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          addDocument({
            name: docName,
            category,
            docNumber,
            expiryDate,
            status: 'VERIFIED',
            source: 'AI OCR + QR Match',
            confidence: 98,
            fileSize: '2.4 MB',
            fileType: 'pdf',
            extractedFields: [
              { label: 'Manufacturer', value: 'Emerson Process Management', confidence: 99 },
              { label: 'Certificate No', value: docNumber, confidence: 98 },
              { label: 'Validity Extended To', value: expiryDate, confidence: 99 },
              { label: 'Authorization Scope', value: 'Indian Public Procurement CPCL/IOCL', confidence: 97 },
            ],
          });
          setIsUploading(false);
          closeUploadModal();
        }, 800);
      }
    }, 60);
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={() => {
        if (!isUploading) closeUploadModal();
      }}
      title="Upload Compliance Document"
      subtitle="AI-assisted Optical Character Recognition (OCR) and Government Gateway verification"
      maxWidth="lg"
    >
      {!isUploading ? (
        <form onSubmit={handleStartUpload} className="space-y-4 text-xs">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5">
              Document Classification Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value as DocCategory;
                setCategory(val);
                if (val === 'Technical / OEM') {
                  setDocName('OEM_Authorization_Certificate_FY26_27.pdf');
                  setDocNumber('AUTH-EMR-2026-9921');
                  setExpiryDate('31 Mar 2027');
                } else if (val === 'Compliance / MII') {
                  setDocName('Make_In_India_Class1_Declaration_55Percent.pdf');
                  setDocNumber('MII-55-2026-08');
                  setExpiryDate('31 Dec 2027');
                } else if (val === 'Security / ISO') {
                  setDocName('ISO_27001_Recertification_2026_2029.pdf');
                  setDocNumber('ISO-27001-RNW-8812');
                  setExpiryDate('15 Aug 2029');
                } else if (val === 'Financial / Audit') {
                  setDocName('CA_Certified_Turnover_FY26.pdf');
                  setDocNumber('UDIN-26034182BBBB1029');
                  setExpiryDate('31 Mar 2028');
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Technical / OEM">Technical / OEM Authorization Letter</option>
              <option value="Compliance / MII">Compliance / Make-in-India Self Declaration</option>
              <option value="Financial / Audit">Financial / CA Audited Statement & Turnover</option>
              <option value="Security / ISO">Security / ISO 27001 Information Security</option>
              <option value="Statutory / Tax">Statutory / GST & Direct Taxes</option>
              <option value="Technical / Experience">Technical / Work Order & Past Performance</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Document / Certificate No.</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-800 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Validity / Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-6 text-center bg-slate-50/70 cursor-pointer transition-colors group">
            <UploadCloud className="w-10 h-10 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-slate-900 text-sm">
              {docName}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Drag and drop PDF or click to browse (Max 25MB). Auto-checked for digital signatures.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 Tamper Proof Hash Auto-Generated</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeUploadModal}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Upload & Run AI OCR</span>
            </button>
          </div>
        </form>
      ) : (
        /* Progress Animation Area */
        <div className="py-6 space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>

          <div>
            <h4 className="text-base font-extrabold text-slate-900">{currentStage}</h4>
            <p className="text-xs text-slate-500 font-mono mt-1">{stageLog}</p>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Verification Pipeline Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-primary to-blue-600 h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left font-mono max-w-md mx-auto space-y-1">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Document Type: {category}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Integrity Hash: SHA-256 Calculated</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
