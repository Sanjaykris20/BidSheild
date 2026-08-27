'use client';

import React from 'react';

export default function AdminBidsPage() {
  const bids = [
    { id: 'BID-2026-1024', tender: 'GEM/2026/B/1024', bidder: 'TechCorp Solutions Pvt Ltd', score: 82, risk: 'MEDIUM', status: 'UNDER_EVALUATION' },
    { id: 'BID-2026-8820', tender: 'CPCL/2026/899120', bidder: 'Alpha Defense Systems Ltd', score: 94, risk: 'LOW', status: 'QUALIFIED' },
    { id: 'BID-2026-8821', tender: 'CPCL/2026/899120', bidder: 'Bravo Heavy Engineering Corp', score: 52, risk: 'CRITICAL', status: 'DISQUALIFIED' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Bid Governance & Oversight
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Centrally monitor evaluation scores, debarment flags, and compliance results.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
              <th className="p-4">Bid Reference</th>
              <th className="p-4">Tender Reference</th>
              <th className="p-4">Bidder</th>
              <th className="p-4">Compliance Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {bids.map(b => (
              <tr key={b.id} className="hover:bg-surface-alt/40">
                <td className="p-4 font-mono font-bold text-primary">{b.id}</td>
                <td className="p-4 font-mono text-neutral-muted">{b.tender}</td>
                <td className="p-4 font-semibold text-primary">{b.bidder}</td>
                <td className="p-4 font-display font-black text-primary text-sm">{b.score}/100 ({b.risk})</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${
                      b.status === 'QUALIFIED'
                        ? 'bg-success/10 text-success border-success/20'
                        : b.status === 'DISQUALIFIED'
                        ? 'bg-danger/10 text-danger border-danger/20'
                        : 'bg-info/10 text-info border-info/20'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
