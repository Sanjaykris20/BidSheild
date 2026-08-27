'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderBidDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const bidId = (params.id as string) || 'BID-1024';

  const bid = {
    id: bidId,
    bidId: 'BID-2026-1024',
    tenderNumber: 'GEM/2026/B/1024',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    org: 'Ministry of Defence',
    quoted: '₹34,20,00,000',
    submittedAt: '2026-08-24 14:32 IST',
    complianceScore: 82,
    riskLevel: 'MEDIUM',
    status: 'UNDER_EVALUATION',
    stages: [
      { num: 1, title: 'Bid Submitted', status: 'COMPLETED', time: '2026-08-24 14:32 IST', desc: 'Proposal submitted with 4 attached vault artifacts.' },
      { num: 2, title: 'AI Extraction & OCR', status: 'COMPLETED', time: '2026-08-24 14:33 IST', desc: 'Spatial bounding box extraction completed.' },
      { num: 3, title: 'Govt. Verification Gateways', status: 'COMPLETED', time: '2026-08-24 14:34 IST', desc: 'GSTN, PAN, and Udyam MSME verified with 100% confidence.' },
      { num: 4, title: 'Compliance Rule Engine', status: 'COMPLETED', time: '2026-08-24 14:35 IST', desc: 'Evaluated 8 rules: 6 Passed, 1 Review, 1 Failed (Local Content 42%). Score: 82/100.' },
      { num: 5, title: 'Officer Evaluation Desk', status: 'IN_PROGRESS', time: 'Active', desc: 'Assigned to P. Sharma (CPCL Senior Procurement Officer) for determination.' },
    ],
    verifications: [
      { name: 'GSTN Portal', status: 'ACTIVE', color: 'text-success bg-success/10 border-success/20' },
      { name: 'PAN NSDL Gateway', status: 'VERIFIED', color: 'text-success bg-success/10 border-success/20' },
      { name: 'Udyam MSME', status: 'VERIFIED', color: 'text-success bg-success/10 border-success/20' },
      { name: 'CVC Debarment List', status: 'CLEARED', color: 'text-success bg-success/10 border-success/20' },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/bidder/bids')}
            className="p-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-neutral-muted">Tender: {bid.tenderNumber}</span>
              <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                {bid.bidId}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-primary">{bid.tenderTitle}</h2>
            <p className="text-xs text-neutral-muted mt-0.5">{bid.org} • Quoted: <strong>{bid.quoted}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-alt px-4 py-2 rounded-xl border border-outline-variant shadow-inner">
            <span className="text-xs font-semibold text-neutral-muted uppercase">Score</span>
            <span className="font-display font-black text-warning text-xl">{bid.complianceScore}<span className="text-xs font-normal text-outline">/100</span></span>
            <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
          </div>
          <button
            onClick={() => router.push('/bidder/clarifications')}
            className="bg-warning text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-warning/90 shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            View Clarifications
          </button>
        </div>
      </div>

      {/* Grid: Timeline & Statutory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 className="font-bold text-base text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">timeline</span>
            Submission Verification Timeline
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
            {bid.stages.map(stage => {
              const isDone = stage.status === 'COMPLETED';
              const isInProg = stage.status === 'IN_PROGRESS';

              return (
                <div key={stage.num} className="relative group">
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-bold ${
                      isDone
                        ? 'bg-success text-white border-success'
                        : isInProg
                        ? 'bg-warning text-white border-warning animate-pulse'
                        : 'bg-white text-neutral-muted border-outline-variant'
                    }`}
                  >
                    {isDone ? '✓' : stage.num}
                  </div>
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-primary">{stage.title}</h4>
                      <span className="text-[11px] font-mono text-neutral-muted">{stage.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statutory Gateways Health */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-base text-primary">Statutory Gateways</h3>
              <MockBadge label="MOCK" size="sm" variant="amber" />
            </div>
            <div className="space-y-3">
              {bid.verifications.map(v => (
                <div key={v.name} className="p-3 bg-surface rounded-xl border border-outline-variant/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{v.name}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${v.color}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-neutral-muted">
            <span className="font-bold text-primary block mb-1">Encrypted Record:</span>
            SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
        </div>
      </div>
    </div>
  );
}
