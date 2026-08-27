'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function ClientDecisionsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const decisions = [
    {
      id: 'DEC-1',
      bidId: 'BID-2026-8820',
      bidder: 'Alpha Defense Systems Ltd',
      tenderNumber: 'CPCL/2026/899120',
      status: 'Qualified',
      action: 'APPROVE',
      officer: 'P. Sharma (CPCL Senior Procurement Officer)',
      date: '2026-08-24 11:20 IST',
      remarks: '100% compliance across all 8 statutory rules. Lowest compliant bidder in Class-I category.',
    },
    {
      id: 'DEC-2',
      bidId: 'BID-2026-8821',
      bidder: 'Bravo Heavy Engineering Corp',
      tenderNumber: 'CPCL/2026/899120',
      status: 'Disqualified',
      action: 'REJECT',
      officer: 'P. Sharma (CPCL Senior Procurement Officer)',
      date: '2026-08-24 11:45 IST',
      remarks: 'Disqualified pursuant to CVC Debarment hard-gating policy. Entity flagged on Central Debarment registry.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Final Officer Decisions
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Official procurement qualification determinations committed to immutable audit logs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {decisions.map(d => (
          <div key={d.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-neutral-muted">{d.tenderNumber}</span>
                  <span className="font-mono text-xs text-outline">{d.bidId}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${d.action === 'APPROVE' ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}`}>
                    {d.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-primary">{d.bidder}</h3>
                <p className="text-xs text-neutral-muted mt-0.5">Determined by: <strong>{d.officer}</strong> • {d.date}</p>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary block mb-1">Mandatory Audit Justification:</span>
              &quot;{d.remarks}&quot;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
