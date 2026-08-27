'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { exportAnalyticsReportPdf } from '@/lib/export/exportUtils';

export default function ClientReportsPage() {
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      exportAnalyticsReportPdf('BidShield_Analytics_Executive_Report_2026-08-27.pdf');
      showToast('Exported Executive BI Report to PDF.', 'success');
    } catch {
      showToast('Failed to generate report PDF.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            BI Analytics & Compliance Intelligence
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Aggregated procurement metrics, statutory verification pass rates, and vendor qualification distributions.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export Executive BI Report (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Verification Pass Rate
          </span>
          <div className="text-4xl font-display font-black text-primary">87.5%</div>
          <p className="text-xs text-success font-semibold mt-1">↑ +4.2% from previous quarter</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Make in India Adoption
          </span>
          <div className="text-4xl font-display font-black text-primary">74.2%</div>
          <p className="text-xs text-info font-semibold mt-1">Class-I & Class-II certified</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Avg Evaluation Cycle Time
          </span>
          <div className="text-4xl font-display font-black text-primary">1.4 Days</div>
          <p className="text-xs text-success font-semibold mt-1">↓ -68% reduction via AI pipeline</p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 className="font-bold text-base text-primary mb-4">Statutory Gateways Pass/Fail Breakdown</h3>
          <div className="space-y-3 text-xs">
            {[
              { name: 'GSTN Gateway API', rate: '98%', count: '48/49 verified' },
              { name: 'PAN NSDL Gateway', rate: '100%', count: '49/49 verified' },
              { name: 'Udyam MSME Sandbox', rate: '85%', count: '42/49 verified' },
              { name: 'Make in India Local Content', rate: '71%', count: '35/49 passed Class-I' },
              { name: 'CVC Debarment Screening', rate: '96%', count: '2 debarred entities blocked' },
            ].map(item => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-outline-variant/60">
                <span className="font-semibold text-primary">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-muted font-mono">{item.count}</span>
                  <span className="font-bold font-mono text-primary bg-white px-2 py-0.5 rounded border border-outline-variant">{item.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 className="font-bold text-base text-primary mb-4">Risk Profile Distribution</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-success/5 border border-success/20 rounded-xl flex justify-between items-center">
              <span className="font-bold text-success">LOW RISK (Score &gt; 85)</span>
              <span className="font-mono font-bold text-success text-sm">62% (30 Bids)</span>
            </div>
            <div className="p-3.5 bg-warning/5 border border-warning/20 rounded-xl flex justify-between items-center">
              <span className="font-bold text-warning">MEDIUM RISK (Score 70 - 85)</span>
              <span className="font-mono font-bold text-warning text-sm">26% (13 Bids)</span>
            </div>
            <div className="p-3.5 bg-danger/5 border border-danger/20 rounded-xl flex justify-between items-center">
              <span className="font-bold text-danger">CRITICAL RISK (Debarment / Disqualified)</span>
              <span className="font-mono font-bold text-danger text-sm">12% (6 Bids)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
