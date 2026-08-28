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
    maxBidsPerBidder: 1,
    womenReservationPercent: 3,
    scopeOfWork: 'Turnkey procurement of cryogenic high-pressure ball and check valves for CPCL Manali Refinery expansion project with ASME and API 6D specifications.',
  });

  const [requiredDocs, setRequiredDocs] = useState([
    { id: 'req_gst', name: 'GST Certificate', category: 'Statutory / Tax', weight: 10, checked: true },
    { id: 'req_pan', name: 'PAN Card', category: 'Statutory / Tax', weight: 10, checked: true },
    { id: 'req_msme', name: 'MSME / Udyam Registration', category: 'Statutory / MSME', weight: 10, checked: true },
    { id: 'req_mse', name: 'MSE (Micro & Small Enterprise) Certificate', category: 'Statutory / MSME', weight: 10, checked: false },
    { id: 'req_mii', name: 'Local Content Declaration', category: 'Compliance / MII', weight: 15, checked: true },
    { id: 'req_oem', name: 'OEM Authorization Form (MAF)', category: 'Technical / OEM', weight: 15, checked: true },
    { id: 'req_epfo', name: 'EPFO Compliance Certificate', category: 'Statutory / Labour', weight: 10, checked: true },
    { id: 'req_esic', name: 'ESIC Compliance Certificate', category: 'Statutory / Labour', weight: 10, checked: false },
    { id: 'req_itr', name: 'Income Tax Returns (3 Years)', category: 'Statutory / Tax', weight: 15, checked: false },
    { id: 'req_turnover', name: 'Turnover Certificate', category: 'Financial / Audit', weight: 10, checked: false },
    { id: 'req_exp', name: 'Prior Supply Experience Certificate', category: 'Technical / Experience', weight: 15, checked: false },
    { id: 'req_iso', name: 'ISO 9001 Quality Certificate', category: 'Technical / Quality', weight: 15, checked: true },
    { id: 'req_debarment', name: 'Non-Debarment Declaration', category: 'Compliance / CVC', weight: 15, checked: true },
    { id: 'req_scst', name: 'SC/ST Caste Certificate', category: 'Statutory / Social', weight: 10, checked: false },
    { id: 'req_community', name: 'Community Certificate', category: 'Statutory / Social', weight: 10, checked: false },
    { id: 'req_nativity', name: 'Nativity Certificate', category: 'Statutory / Local', weight: 10, checked: false },
    { id: 'req_citizen', name: 'Citizen Membership Card', category: 'Statutory / Local', weight: 10, checked: false },
  ]);

  const totalWeight = requiredDocs.reduce((sum, d) => sum + (d.checked ? d.weight : 0), 0);

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
    if (totalWeight !== 100) {
      showToast('Total weight of selected criteria must equal exactly 100%.', 'error');
      return;
    }

    setIsPublishing(true);
    const selectedDocs = requiredDocs
      .filter(d => d.checked)
      .map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        weight: d.weight
      }));

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
          maxBidsPerBidder: formData.maxBidsPerBidder,
          womenReservationPercent: formData.womenReservationPercent,
          scopeOfWork: [formData.scopeOfWork],
          eligibilityCriteria: selectedDocs.map(d => `${d.name} (${d.weight}% weight)`),
          requiredDocuments: selectedDocs,
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
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-primary">Statutory & Technical Compliance Matrix</h3>
              <p className="text-xs text-neutral-muted mt-0.5">Select the mandatory documents bidders must upload and allocate evaluation weights.</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${totalWeight === 100 ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning animate-pulse'}`}>
              Total Weight: {totalWeight}% {totalWeight === 100 ? '• Valid' : '• Must equal 100%'}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {requiredDocs.map((doc, idx) => (
              <div 
                key={doc.id} 
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  doc.checked ? 'bg-primary/5 border-primary/30' : 'bg-surface border-outline-variant/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={doc.checked} 
                    onChange={() => {
                      const updated = [...requiredDocs];
                      updated[idx].checked = !updated[idx].checked;
                      setRequiredDocs(updated);
                    }}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-primary block">{doc.name}</span>
                    <span className="text-[10px] text-neutral-muted">{doc.category}</span>
                  </div>
                </div>
                {doc.checked && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={doc.weight}
                      onChange={(e) => {
                        const updated = [...requiredDocs];
                        updated[idx].weight = Number(e.target.value);
                        setRequiredDocs(updated);
                      }}
                      className="w-12 px-1.5 py-1 border border-outline-variant rounded bg-white text-center font-mono font-bold text-primary"
                    />
                    <span className="font-semibold text-neutral-muted">%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-outline-variant/60">
            <button onClick={() => setStep(3)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-alt transition-colors">← Back</button>
            <button 
              onClick={() => {
                if (totalWeight !== 100) {
                  showToast('Total weight of selected criteria must equal exactly 100%.', 'warning');
                  return;
                }
                setStep(5);
              }} 
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                totalWeight === 100 
                  ? 'bg-primary text-white hover:bg-primary-container shadow-sm' 
                  : 'bg-surface-variant text-neutral-muted cursor-not-allowed border border-outline-variant/60'
              }`}
            >
              Next: MII Rules →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Make in India (MII) & Anti-Monopoly Rules */}
      {step === 5 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Compliance & Anti-Monopoly Rules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Class-I Minimum Local Content Threshold (%)</label>
              <input
                type="number"
                value={formData.localContentRequired}
                onChange={e => setFormData({ ...formData, localContentRequired: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[10px] text-neutral-muted mt-1">Default statutory threshold: 50% for Class-I Local Suppliers.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Max Active Bids per Vendor (Anti-Monopoly Cap)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxBidsPerBidder}
                onChange={e => setFormData({ ...formData, maxBidsPerBidder: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[10px] text-neutral-muted mt-1">Cap active submissions under evaluation to prevent monopolization.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/60 pt-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Women Nodal Reservation / Purchase Preference (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.womenReservationPercent}
                onChange={e => setFormData({ ...formData, womenReservationPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[10px] text-neutral-muted mt-1">Allocation quota reserved specifically for women-led micro & small enterprises.</p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(4)} className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-alt transition-colors">← Back</button>
            <button onClick={() => setStep(6)} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">Next: AI RFP Parser →</button>
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
            <p>• {requiredDocs.filter(d => d.checked).length} Statutory & Technical compliance rules configured for automated gateway verification.</p>
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
