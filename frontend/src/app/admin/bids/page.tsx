'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch('/api/bids');
        const data = await res.json();
        if (data.bids) {
          setBids(data.bids);
        }
      } catch (err) {
        console.error('Failed to fetch bids', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

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
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-muted">Loading bids...</td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-muted">No bids submitted yet.</td>
              </tr>
            ) : (
              bids.map(b => (
                <tr key={b.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary">{b.id}</td>
                  <td className="p-4 font-mono text-neutral-muted">{b.tenderNumber || b.tenderId}</td>
                  <td className="p-4 font-semibold text-primary">{b.bidderName || b.bidderId}</td>
                  <td className="p-4 font-display font-black text-primary text-sm">
                    {b.complianceScore}/100 <span className="font-normal text-[10px] text-neutral-muted">({b.riskLevel})</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${
                        b.status === 'QUALIFIED' || b.status === 'ACCEPTED'
                          ? 'bg-success/10 text-success border-success/20'
                          : b.status === 'DISQUALIFIED' || b.status === 'REJECTED'
                          ? 'bg-danger/10 text-danger border-danger/20'
                          : 'bg-info/10 text-info border-info/20'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/admin/bids/${b.id}`)}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors border border-outline-variant bg-white px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
