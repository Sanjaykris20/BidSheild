'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderTenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const tenderId = (params.id as string) || 'TND-1024';

  const tender = {
    id: tenderId,
    number: 'GEM/2026/B/1024',
    title: 'Data Center Migration & Zero-Trust Security Upgrade',
    org: 'Ministry of Defence',
    category: 'IT Services & Infrastructure',
    valueFormatted: '₹36.5 Cr ($4.5M Est.)',
    emdAmount: '₹73,00,000 (Exempt for MSME)',
    closingDate: '2026-09-15 18:00 IST',
    localContentRequired: 50,
    scopeOfWork: [
      'Supply and installation of 24 High-Density Enterprise 2U Servers across dual zones.',
      'Deployment of Zero-Trust Network Architecture (ZTNA) hardware appliances with multi-factor biometric tokens.',
      'Turnkey workload migration and continuous compliance telemetry logging.',
    ],
    eligibilityCriteria: [
      'Mandatory Class-I Local Supplier status (Local Content ≥ 50%).',
      'Valid Active GSTIN & regular 3-year ITR filings.',
      'OEM Manufacturer Authorization (MAF) from Tier-1 Server Vendor.',
      'Clean CVC non-debarment status.',
    ],
    boq: [
      { itemNo: 1, item: 'High-Density Compute Servers (2U Dual-Socket)', qty: 24, uom: 'NOS', estRate: '₹8,50,000' },
      { itemNo: 2, item: 'Zero-Trust Appliance Gateway', qty: 4, uom: 'NOS', estRate: '₹15,00,000' },
      { itemNo: 3, item: 'Turnkey Migration & Integration Services', qty: 1, uom: 'LOT', estRate: '₹1,01,00,000' },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/bidder/marketplace')}
            className="p-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-neutral-muted">{tender.number}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-info/20 text-info bg-info/10">
                {tender.category}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-primary">{tender.title}</h2>
            <p className="text-xs text-neutral-muted mt-0.5">{tender.org} • Closes: {tender.closingDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              router.push('/bidder/bids/create');
              showToast('Starting bid proposal creation wizard...', 'info');
            }}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Prepare Submission
          </button>
        </div>
      </div>

      {/* Grid: Details & BOQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Scope of Work */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-base text-primary mb-3">Scope of Work</h3>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              {tender.scopeOfWork.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bill of Quantities (BOQ) */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-base text-primary mb-3">Bill of Quantities (BOQ) Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant font-semibold text-neutral-muted uppercase">
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">UOM</th>
                    <th className="p-3 text-right">Est. Unit Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {tender.boq.map(b => (
                    <tr key={b.itemNo} className="hover:bg-surface-alt">
                      <td className="p-3 font-mono">{b.itemNo}</td>
                      <td className="p-3 font-semibold text-primary">{b.item}</td>
                      <td className="p-3 font-mono">{b.qty}</td>
                      <td className="p-3 font-mono">{b.uom}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{b.estRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Commercial & Statutory Summary */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-primary">Commercial Terms</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span className="text-neutral-muted">Estimated RFP Value:</span>
                <span className="font-mono font-bold text-primary">{tender.valueFormatted}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span className="text-neutral-muted">EMD Deposit:</span>
                <span className="font-mono font-bold text-primary">{tender.emdAmount}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/60 pb-2">
                <span className="text-neutral-muted">Min. Local Content:</span>
                <span className="font-mono font-bold text-warning">{tender.localContentRequired}% (Class-I)</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-primary">Eligibility Requirements</h3>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              {tender.eligibilityCriteria.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-success text-[16px] icon-fill shrink-0">check_circle</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
