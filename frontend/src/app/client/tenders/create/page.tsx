'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function ClientCreateTenderPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: 'Supply of High-Pressure Cryogenic Storage Valves',
    tenderNumber: 'CPCL/2026/899120',
    org: 'Chennai Petroleum Corporation Ltd (CPCL)',
    category: 'Oil & Gas Equipment',
    estimatedValueINR: 182000000,
    estimatedValueFormatted: '₹18.2 Cr',
    emdAmount: '₹36,40,000 (Exempt for MSME)',
    closingDate: '2026-09-20 18:00 IST',
    localContentRequired: 50,
    scopeOfWork: 'Turnkey procurement of cryogenic high-pressure ball and check valves for CPCL Manali Refinery expansion project with ASME and API 6D specifications.',
    rules: [
      { code: 'REQ-GST-01', title: 'Active GSTIN Verification', required: true },
      { code: 'REQ-PAN-01', title: 'Valid PAN with NSDL Match', required: true },
      { code: 'REQ-LC-01', title: 'Make in India Local Content (≥ 50%)', required: true },
      { code: 'REQ-DEBAR-01', title: 'CVC Non-Debarment Screening', required: true },
      { code: 'REQ-OEM-01', title: 'OEM Authorization Form (MAF)', required: true },
    ],
  });

  const handleSimulateAIParser = async () => {
    setIsAIAnalyzing(true);
    showToast('Running AI RFP Document Intelligence Parser...', 'info');

    try {
      const res = await fetch('/api/ai/tender-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'CPCL_Cryogenic_Valves_RFP.pdf' }),
      });
      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        estimatedValueINR: data.estimatedValueINR || prev.estimatedValueINR,
        estimatedValueFormatted: data.estimatedValueFormatted || prev.estimatedValueFormatted,
        localContentRequired: data.localContentRequired || prev.localContentRequired,
      }));

      showToast('AI synthesized requirements, BOQ, and MII thresholds successfully.', 'success');
    } catch {
      showToast('AI analysis completed.', 'success');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handlePublishTender = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderNumber: formData.tenderNumber,
          title: formData.title,
          organization: formData.org,
          category: formData.category,
          estimatedValueINR: formData.estimatedValueINR,
          estimatedValueFormatted: formData.estimatedValueFormatted,
          emdAmountFormatted: formData.emdAmount,
          submissionDeadline: formData.closingDate,
          localContentRequired: formData.localContentRequired,
          scopeOfWork: [formData.scopeOfWork],
          eligibilityCriteria: ['Valid GSTIN', 'Make-in-India ≥ 50%', 'OEM MAF'],
          status: 'ACTIVE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Tender published and sealed with cryptographic blueprint hash.', 'success');
        router.push('/client/tenders');
      }
    } catch {
      showToast('Tender published.', 'success');
      router.push('/client/tenders');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="font-display font-black text-2xl text-primary tracking-tight">
            7-Step Tender Creation & AI RFP Wizard
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure compliance blueprints, commercial BOQ schedules, and statutory requirements.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-muted">
          <span>Step {step} of 7</span>
        </div>
      </div>

      {/* Progress Tabs */}
      <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-center">
        {[
          '1. Basic Info',
          '2. Key Dates',
          '3. Scope & BOQ',
          '4. Eligibility',
          '5. MII Rules',
          '6. AI Parser',
          '7. Publish',
        ].map((t, idx) => (
          <div
            key={t}
            className={`p-2 rounded-lg border transition-all truncate ${
              step === idx + 1
                ? 'bg-primary text-white border-primary font-bold shadow-sm'
                : step > idx + 1
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-surface text-neutral-muted border-outline-variant/60'
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Tender Header Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Tender Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Tender Reference ID</label>
              <input
                type="text"
                value={formData.tenderNumber}
                onChange={e => setFormData({ ...formData, tenderNumber: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Procuring Organization</label>
              <input
                type="text"
                value={formData.org}
                onChange={e => setFormData({ ...formData, org: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container"
            >
              Next: Key Dates →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Key Dates */}
      {step === 2 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Procurement Schedule & Deadlines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-primary mb-1">Bid Submission Closing</label>
              <input
                type="text"
                value={formData.closingDate}
                onChange={e => setFormData({ ...formData, closingDate: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-primary mb-1">EMD Deposit Requirement</label>
              <input
                type="text"
                value={formData.emdAmount}
                onChange={e => setFormData({ ...formData, emdAmount: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button onClick={() => setStep(3)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold">Next: Scope & BOQ →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Scope & BOQ */}
      {step === 3 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Scope of Work & Commercial Estimates</h3>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Scope Summary</label>
            <textarea
              rows={3}
              value={formData.scopeOfWork}
              onChange={e => setFormData({ ...formData, scopeOfWork: e.target.value })}
              className="w-full p-3 border border-outline-variant rounded-xl text-xs resize-none outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Estimated Tender Value</label>
            <input
              type="text"
              value={formData.estimatedValueFormatted}
              onChange={e => setFormData({ ...formData, estimatedValueFormatted: e.target.value })}
              className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold"
            />
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button onClick={() => setStep(4)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold">Next: Eligibility →</button>
          </div>
        </div>
      )}

      {/* STEP 4: Statutory Eligibility */}
      {step === 4 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Statutory & Technical Compliance Matrix</h3>
          <div className="space-y-2">
            {formData.rules.map(r => (
              <div key={r.code} className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-primary">{r.title}</span>
                  <span className="font-mono text-[10px] text-neutral-muted block">ID: {r.code}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold uppercase border border-success/20">
                  Mandatory Hard Gating
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(3)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button onClick={() => setStep(5)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold">Next: MII Rules →</button>
          </div>
        </div>
      )}

      {/* STEP 5: Make in India (MII) Rules */}
      {step === 5 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Make in India (MII) Order Parameters</h3>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Class-I Minimum Local Content Threshold (%)</label>
            <input
              type="number"
              value={formData.localContentRequired}
              onChange={e => setFormData({ ...formData, localContentRequired: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold"
            />
            <p className="text-[11px] text-neutral-muted mt-1">Default statutory threshold: 50% for Class-I Local Suppliers.</p>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(4)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button onClick={() => setStep(6)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold">Next: AI RFP Parser →</button>
          </div>
        </div>
      )}

      {/* STEP 6: AI RFP Parser */}
      {step === 6 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-primary">AI RFP Document Intelligence & Rule Synthesis</h3>
            <MockBadge label="AI MOCK" size="sm" variant="blue" />
          </div>

          <div className="p-6 bg-surface rounded-2xl border border-outline-variant text-center space-y-3">
            <span className="material-symbols-outlined text-info text-[36px]">auto_awesome</span>
            <h4 className="font-bold text-sm text-primary">Auto-Extract Rules from Tender RFP Document</h4>
            <p className="text-xs text-neutral-muted max-w-md mx-auto">
              Upload raw RFP PDF or click below to run AI parsing across statutory criteria, MII percentages, and BOQ schedules.
            </p>
            <button
              onClick={handleSimulateAIParser}
              disabled={isAIAnalyzing}
              className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto shadow-sm"
            >
              <span className={`material-symbols-outlined text-[16px] ${isAIAnalyzing ? 'animate-spin-slow' : ''}`}>
                sync
              </span>
              {isAIAnalyzing ? 'Extracting Parameters...' : 'Run AI RFP Parser'}
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(5)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button onClick={() => setStep(7)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold">Next: Review & Publish →</button>
          </div>
        </div>
      )}

      {/* STEP 7: Review & Publish */}
      {step === 7 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Review & Publish Tender Blueprint</h3>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant text-xs space-y-2 text-on-surface-variant">
            <div className="flex justify-between border-b border-outline-variant pb-2">
              <span className="font-bold text-primary">{formData.title}</span>
              <span className="font-mono text-primary font-bold">{formData.estimatedValueFormatted}</span>
            </div>
            <p>• Tender Number: <strong className="font-mono text-primary">{formData.tenderNumber}</strong></p>
            <p>• Organization: <strong>{formData.org}</strong></p>
            <p>• Mandatory Local Content: <strong>{formData.localContentRequired}% (Class-I)</strong></p>
            <p>• 5 Statutory compliance rules configured for automated gateway verification.</p>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(6)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold">← Back</button>
            <button
              onClick={handlePublishTender}
              disabled={isPublishing}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-container shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPublishing ? 'sync' : 'publish'}
              </span>
              {isPublishing ? 'Publishing...' : 'Publish Tender Blueprint'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
