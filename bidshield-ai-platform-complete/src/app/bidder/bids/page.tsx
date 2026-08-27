'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { exportComplianceReportPdf } from '@/lib/export/exportUtils';

export default function BidderBidsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const bids = [
    {
      id: 'BID-1024',
      bidId: 'BID-2026-1024',
      tenderNumber: 'GEM/2026/B/1024',
      title: 'Data Center Migration & Zero-Trust Security Upgrade',
      org: 'Ministry of Defence',
      quoted: '₹34,20,00,000',
      submittedAt: '2026-08-24 14:32 IST',
      score: 82,
      status: 'UNDER_EVALUATION',
      statusLabel: 'Under Evaluation',
      statusColor: 'text-info bg-info/10 border-info/20',
      flag: '1 Shortfall Flag (Local Content: 42%)',
    },
    {
      id: 'BID-8819',
      bidId: 'BID-2026-8819',
      tenderNumber: 'CPCL/2026/899120',
      title: 'Supply of High-Pressure Cryogenic Storage Valves',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      quoted: '₹17,40,00,000',
      submittedAt: '2026-08-24 18:20 IST',
      score: 78.5,
      status: 'UNDER_EVALUATION',
      statusLabel: 'Under Evaluation',
      statusColor: 'text-info bg-info/10 border-info/20',
      flag: 'Local Content 45%',
    },
    {
      id: 'BID-8820',
      bidId: 'BID-2026-8820',
      tenderNumber: 'CPCL/2026/899120',
      title: 'Supply of High-Pressure Cryogenic Storage Valves (Alt)',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      quoted: '₹18,10,00,000',
      submittedAt: '2026-08-23 11:15 IST',
      score: 94,
      status: 'QUALIFIED',
      statusLabel: 'Technically Qualified',
      statusColor: 'text-success bg-success/10 border-success/20',
      flag: 'All Criteria Cleared',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            My Bid Submissions
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Track submitted proposals, audit timeline stages, and compliance evaluation scores.
          </p>
        </div>
        <button
          onClick={() => router.push('/bidder/bids/create')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Create New Submission
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bids.map(b => (
          <div
            key={b.id}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50 font-bold">
                  {b.tenderNumber}
                </span>
                <span className="font-mono text-xs text-outline">Ref: {b.bidId}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${b.statusColor}`}>
                  {b.statusLabel}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-primary">{b.title}</h3>
              <p className="text-xs text-neutral-muted mt-1">{b.org} • Submitted on {b.submittedAt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="font-semibold text-primary">Quoted Value: <strong>{b.quoted}</strong></span>
                <span className="text-outline">|</span>
                <span className="text-on-surface-variant">AI Pre-Check: <strong className="text-primary">{b.score}/100</strong> ({b.flag})</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => router.push(`/bidder/bids/${b.id}`)}
                className="bg-surface-container border border-outline-variant text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Track Timeline
              </button>
              <button
                onClick={() => {
                  exportComplianceReportPdf(b, b.tenderNumber);
                  showToast(`Downloading submission bundle for ${b.bidId}...`, 'success');
                }}
                className="p-2 border border-outline-variant rounded-xl bg-white text-outline hover:text-primary transition-colors shadow-sm active:scale-95"
                title="Download Verified Bid Submission Package (PDF)"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
