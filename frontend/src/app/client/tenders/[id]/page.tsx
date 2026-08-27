'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function ClientTenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const tenderId = (params.id as string) || 'TND-1024';

  const tender = {
    id: tenderId,
    number: 'GEM/2026/B/1024',
    title: 'Data Center Migration & Zero-Trust Security Upgrade',
    org: 'Ministry of Defence',
    valueFormatted: '₹36.5 Cr ($4.5M Est.)',
    closingDate: '2026-09-15 18:00 IST',
    localContentRequired: 50,
    bids: [
      {
        id: 'BID-1024',
        bidId: 'BID-2026-1024',
        bidder: 'TechCorp Solutions Pvt Ltd',
        quoted: '₹34.20 Cr',
        score: 82,
        risk: 'MEDIUM',
        status: 'UNDER_EVALUATION',
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/client/tenders')}
            className="p-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-neutral-muted">{tender.number}</span>
              <span className="px-2 py-0.5 rounded bg-info/10 text-info text-[10px] font-bold uppercase border border-info/20">
                Evaluation Stage
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-primary">{tender.title}</h2>
            <p className="text-xs text-neutral-muted mt-0.5">{tender.org} • Closes: {tender.closingDate}</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/client/comparison')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          Compare Submissions
        </button>
      </div>

      {/* Submissions Section */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
        <h3 className="font-bold text-base text-primary mb-4">Received Submissions for this Tender</h3>
        <div className="space-y-3">
          {tender.bids.map(b => (
            <div key={b.id} className="p-4 bg-surface rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <span className="font-bold text-primary text-sm">{b.bidder}</span>
                <span className="font-mono text-xs text-neutral-muted block mt-0.5">Ref: {b.bidId} • Quoted: {b.quoted}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-warning text-base">{b.score}/100</span>
                <button
                  onClick={() => router.push(`/client/bids/${b.id}/evidence`)}
                  className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container"
                >
                  Inspect Evidence
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
