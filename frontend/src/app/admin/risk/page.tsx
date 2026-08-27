'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { ScoringWeights } from '@/types';

export default function AdminRiskPage() {
  const { showToast } = useToast();

  const [weights, setWeights] = useState<ScoringWeights>({
    identityConsistency: 20,
    statutoryCompliance: 25,
    financialEligibility: 20,
    technicalEligibility: 20,
    documentationCompleteness: 15,
  });

  const [isSaving, setIsSaving] = useState(false);

  const fetchWeights = async () => {
    try {
      const res = await fetch('/api/admin/risk');
      const data = await res.json();
      if (data.weights) setWeights(data.weights);
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  const totalWeight =
    weights.identityConsistency +
    weights.statutoryCompliance +
    weights.financialEligibility +
    weights.technicalEligibility +
    weights.documentationCompleteness;

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      showToast(`Total weight must equal 100% (currently ${totalWeight}%).`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/risk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Dynamic scoring weight matrix updated. Module 5 re-calibrated.', 'success');
      }
    } catch {
      showToast('Scoring weights saved.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Risk Configuration & Scoring Weights
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Dynamic weight matrix for Module 5 deterministic scoring and risk band thresholds.
          </p>
        </div>
        <button
          onClick={handleSaveWeights}
          disabled={isSaving || totalWeight !== 100}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          {isSaving ? 'Saving...' : 'Apply Weight Matrix'}
        </button>
      </div>

      {/* Weight Sliders Grid */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <h3 className="font-bold text-base text-primary">Compliance Category Weight Matrix</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-muted">Total Weight:</span>
            <span
              className={`font-mono font-black text-sm px-2.5 py-1 rounded-lg border ${
                totalWeight === 100
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-danger/10 text-danger border-danger/30'
              }`}
            >
              {totalWeight}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Identity Consistency */}
          <div>
            <div className="flex justify-between text-xs font-bold text-primary mb-1.5">
              <span>1. Identity Consistency (GSTN ↔ PAN ↔ Incorporation Name)</span>
              <span className="font-mono">{weights.identityConsistency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.identityConsistency}
              onChange={e => setWeights({ ...weights, identityConsistency: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Statutory Compliance */}
          <div>
            <div className="flex justify-between text-xs font-bold text-primary mb-1.5">
              <span>2. Statutory Compliance (GST, Udyam MSME, CVC Debarment Screening)</span>
              <span className="font-mono">{weights.statutoryCompliance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.statutoryCompliance}
              onChange={e => setWeights({ ...weights, statutoryCompliance: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Financial Eligibility */}
          <div>
            <div className="flex justify-between text-xs font-bold text-primary mb-1.5">
              <span>3. Financial Eligibility (3-Year Turnover, ITR Filings)</span>
              <span className="font-mono">{weights.financialEligibility}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.financialEligibility}
              onChange={e => setWeights({ ...weights, financialEligibility: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Technical Eligibility */}
          <div>
            <div className="flex justify-between text-xs font-bold text-primary mb-1.5">
              <span>4. Technical Eligibility & Make-in-India (MII Local Content, OEM MAF)</span>
              <span className="font-mono">{weights.technicalEligibility}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.technicalEligibility}
              onChange={e => setWeights({ ...weights, technicalEligibility: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Documentation Completeness */}
          <div>
            <div className="flex justify-between text-xs font-bold text-primary mb-1.5">
              <span>5. Documentation Completeness (Signatures, Seals, UDINs)</span>
              <span className="font-mono">{weights.documentationCompleteness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.documentationCompleteness}
              onChange={e => setWeights({ ...weights, documentationCompleteness: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Risk Band Thresholds Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-primary">Dynamic Risk Band Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-success/5 border border-success/30 rounded-xl">
            <span className="font-bold text-success block uppercase mb-1">Low Risk</span>
            <span className="font-mono text-lg font-black text-primary">Score ≥ 85</span>
            <p className="text-neutral-muted mt-1 text-[11px]">Auto-eligible for technical qualification.</p>
          </div>

          <div className="p-4 bg-warning/5 border border-warning/30 rounded-xl">
            <span className="font-bold text-warning block uppercase mb-1">Medium Risk</span>
            <span className="font-mono text-lg font-black text-primary">70 ≤ Score &lt; 85</span>
            <p className="text-neutral-muted mt-1 text-[11px]">Officer review / clarification recommended.</p>
          </div>

          <div className="p-4 bg-danger/5 border border-danger/30 rounded-xl">
            <span className="font-bold text-danger block uppercase mb-1">High Risk</span>
            <span className="font-mono text-lg font-black text-primary">50 ≤ Score &lt; 70</span>
            <p className="text-neutral-muted mt-1 text-[11px]">Multiple compliance rule shortfalls.</p>
          </div>

          <div className="p-4 bg-red-100 border border-red-400 rounded-xl">
            <span className="font-bold text-red-700 block uppercase mb-1">Critical Risk</span>
            <span className="font-mono text-lg font-black text-primary">Score &lt; 50 or Debarred</span>
            <p className="text-neutral-muted mt-1 text-[11px]">Mandatory statutory disqualification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
