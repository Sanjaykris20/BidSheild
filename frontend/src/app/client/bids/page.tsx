'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function ClientBidsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | 'UNDER_EVALUATION' | 'QUALIFIED' | 'DISQUALIFIED'>('ALL');

  const bids = [
    {
      id: 'BID-1024',
      bidId: 'BID-2026-1024',
      bidder: 'TechCorp Solutions Pvt Ltd',
      tenderNumber: 'GEM/2026/B/1024',
      tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
      quoted: '₹34.20 Cr',
      score: 82,
      riskLevel: 'MEDIUM',
      status: 'UNDER_EVALUATION',
      statusLabel: 'Under Evaluation',
      statusColor: 'text-info bg-info/10 border-info/20',
      findings: '1 Shortfall Flag: Local Content 42% (Class-I requires 50%)',
    },
    {
      id: 'BID-8820',
      bidId: 'BID-2026-8820',
      bidder: 'Alpha Defense Systems Ltd',
      tenderNumber: 'CPCL/2026/899120',
      tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
      quoted: '₹18.10 Cr',
      score: 94,
      riskLevel: 'LOW',
      status: 'QUALIFIED',
      statusLabel: 'Technically Qualified',
      statusColor: 'text-success bg-success/10 border-success/20',
      findings: 'All 8 rules passed with verified certificates.',
    },
    {
      id: 'BID-8821',
      bidId: 'BID-2026-8821',
      bidder: 'Bravo Heavy Engineering Corp',
      tenderNumber: 'CPCL/2026/899120',
      tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
      quoted: '₹17.80 Cr',
      score: 52,
      riskLevel: 'CRITICAL',
      status: 'DISQUALIFIED',
      statusLabel: 'Disqualified',
      statusColor: 'text-danger bg-danger/10 border-danger/20',
      findings: 'Critical CVC Debarment match: Hard-gating statutory block.',
    },
  ];

  const filteredBids = filter === 'ALL' ? bids : bids.filter(b => b.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Bid Evaluations Desk
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Review incoming tender submissions, inspect OCR evidence boxes, and issue determinations.
          </p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'UNDER_EVALUATION', 'QUALIFIED', 'DISQUALIFIED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === st
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-outline-variant text-neutral-muted hover:bg-surface-container'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBids.map(b => (
          <div
            key={b.id}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/40 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold">
                  {b.tenderNumber}
                </span>
                <span className="font-mono text-xs text-outline">{b.bidId}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${b.statusColor}`}>
                  {b.statusLabel}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-primary">{b.bidder}</h3>
              <p className="text-xs text-neutral-muted mt-0.5">{b.tenderTitle} • Quoted: <strong>{b.quoted}</strong></p>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="font-semibold text-primary">Compliance Score: <strong className="text-info">{b.score}/100</strong> ({b.riskLevel} Risk)</span>
                <span className="text-outline">|</span>
                <span className="text-neutral-muted">{b.findings}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/client/bids/${b.id}/evidence`)}
                className="bg-primary text-white hover:bg-primary-container px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Inspect Evidence
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
