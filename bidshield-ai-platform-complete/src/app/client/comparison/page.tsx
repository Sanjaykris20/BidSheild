'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';
import { exportComparisonMatrixPdf } from '@/lib/export/exportUtils';

export default function ClientComparisonPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleExportPdf = () => {
    try {
      exportComparisonMatrixPdf('GEM/2026/B/1024');
      showToast('Exported Comparative Evaluation Matrix as PDF.', 'success');
    } catch {
      showToast('Failed to export comparison matrix.', 'error');
    }
  };

  const matrix = [
    {
      metric: 'Commercial Quote (L1 Ranking)',
      techcorp: '₹34.20 Cr (L2 for MoD)',
      alpha: '₹18.10 Cr (L2 for CPCL)',
      bravo: '₹17.80 Cr (L1 for CPCL)',
    },
    {
      metric: 'Compliance Score',
      techcorp: '82/100 (Medium Risk)',
      alpha: '94/100 (Low Risk)',
      bravo: '52/100 (Critical Risk)',
    },
    {
      metric: 'Make-in-India (MII) Content',
      techcorp: '42% (Class-II Shortfall)',
      alpha: '65% (Class-I Cleared)',
      bravo: '30% (Non-Compliant)',
    },
    {
      metric: 'GSTN Gateway API',
      techcorp: 'Active (27ABCDE1234F1Z5)',
      alpha: 'Active (33AABCA1234A1Z5)',
      bravo: 'Active (29AABCB5678B1Z2)',
    },
    {
      metric: 'PAN NSDL Gateway',
      techcorp: 'Verified (ABCDE1234F)',
      alpha: 'Verified (AABCA1234A)',
      bravo: 'Verified (AABCB5678B)',
    },
    {
      metric: 'Udyam MSME Status',
      techcorp: 'Verified Small Enterprise',
      alpha: 'Verified Medium Enterprise',
      bravo: 'Not Registered',
    },
    {
      metric: 'OEM Manufacturer Authorization',
      techcorp: 'Tier-1 Verified Code',
      alpha: 'Direct Manufacturer',
      bravo: 'Expired Authorization Code',
    },
    {
      metric: 'CVC Debarment Screening',
      techcorp: 'CLEARED (0 Flags)',
      alpha: 'CLEARED (0 Flags)',
      bravo: 'FLAGGED (Statutory Disqualification)',
    },
    {
      metric: 'AI Procurement Recommendation',
      techcorp: 'Request Clarification',
      alpha: 'Approve Submission',
      bravo: 'Statutory Rejection',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Procurement Matrix Evaluation
            </span>
            <MockBadge label="AI MATRIX READY" size="sm" variant="blue" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Side-by-Side Comparison Matrix
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Multi-vendor technical, financial, statutory, and AI recommendation comparative breakdown.
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container flex items-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export Matrix (PDF)
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-primary font-bold">
                <th className="p-4 w-1/4 uppercase tracking-wider text-neutral-muted">Evaluation Criterion</th>
                <th className="p-4 w-1/4 bg-blue-50/50 border-x border-outline-variant">
                  <div className="text-primary font-bold text-sm">TechCorp Solutions</div>
                  <span className="font-mono font-normal text-neutral-muted text-[11px]">BID-2026-1024</span>
                </th>
                <th className="p-4 w-1/4 bg-emerald-50/50 border-r border-outline-variant">
                  <div className="text-primary font-bold text-sm">Alpha Defense Systems</div>
                  <span className="font-mono font-normal text-neutral-muted text-[11px]">BID-2026-8820</span>
                </th>
                <th className="p-4 w-1/4 bg-rose-50/50">
                  <div className="text-primary font-bold text-sm">Bravo Heavy Eng</div>
                  <span className="font-mono font-normal text-neutral-muted text-[11px]">BID-2026-8821</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4 font-bold text-primary bg-surface/50">{row.metric}</td>
                  <td className="p-4 font-medium border-x border-outline-variant/60">
                    <span className={row.techcorp.includes('Shortfall') || row.techcorp.includes('Clarification') ? 'text-warning font-bold' : row.techcorp.includes('Verified') || row.techcorp.includes('Active') || row.techcorp.includes('CLEARED') ? 'text-success font-bold' : 'text-primary'}>
                      {row.techcorp}
                    </span>
                  </td>
                  <td className="p-4 font-medium border-r border-outline-variant/60">
                    <span className={row.alpha.includes('Cleared') || row.alpha.includes('Approve') || row.alpha.includes('Active') ? 'text-success font-bold' : 'text-primary'}>
                      {row.alpha}
                    </span>
                  </td>
                  <td className="p-4 font-medium">
                    <span className={row.bravo.includes('FLAGGED') || row.bravo.includes('Disqualification') || row.bravo.includes('Rejection') || row.bravo.includes('Expired') ? 'text-danger font-bold' : 'text-primary'}>
                      {row.bravo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-surface-alt/60 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={() => router.push('/client/bids/BID-1024/evidence')}
            className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-container shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Inspect TechCorp Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
