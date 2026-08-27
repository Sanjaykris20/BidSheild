'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function ClientTendersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const tenders = [
    {
      id: 'TND-1024',
      number: 'GEM/2026/B/1024',
      title: 'Data Center Migration & Zero-Trust Security Upgrade',
      org: 'Ministry of Defence',
      category: 'IT Services',
      value: '₹36.5 Cr',
      bidsCount: 1,
      closingDate: '2026-09-15',
      status: 'EVALUATION_STAGE',
      statusLabel: 'Evaluation in Progress',
      statusColor: 'text-info bg-info/10 border-info/20',
    },
    {
      id: 'TND-9041',
      number: 'CPCL/2026/899120',
      title: 'Supply of High-Pressure Cryogenic Storage Valves',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      category: 'Oil & Gas',
      value: '₹18.2 Cr',
      bidsCount: 2,
      closingDate: '2026-09-20',
      status: 'ACTIVE',
      statusLabel: 'Active Procurement',
      statusColor: 'text-success bg-success/10 border-success/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Tenders & Blueprints
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Active procurement blueprints, statutory thresholds, and associated bidder proposals.
          </p>
        </div>
        <button
          onClick={() => router.push('/client/tenders/create')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Create Tender Wizard
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenders.map(t => (
          <div
            key={t.id}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/50 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold">
                  {t.number}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${t.statusColor}`}>
                  {t.statusLabel}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-primary">{t.title}</h3>
              <p className="text-xs text-neutral-muted mt-0.5">{t.org} • Closes: {t.closingDate}</p>

              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className="font-semibold text-primary">Est. Value: <strong>{t.value}</strong></span>
                <span className="text-outline">|</span>
                <span className="text-on-surface-variant">Bids Received: <strong className="text-primary">{t.bidsCount}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/client/tenders/${t.id}`)}
                className="bg-surface-container border border-outline-variant text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                View Tender Specs
              </button>
              <button
                onClick={() => router.push('/client/bids')}
                className="bg-primary text-white hover:bg-primary-container px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Inspect Submissions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
