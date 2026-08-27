'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';

export default function AdminClientsPage() {
  const { showToast } = useToast();

  const clients = [
    { name: 'Chennai Petroleum Corporation Ltd (CPCL)', ministry: 'Ministry of Petroleum and Natural Gas', tendersCount: 4, activeBids: 8, status: 'VERIFIED_BUYER' },
    { name: 'Ministry of Defence (MoD)', ministry: 'Ministry of Defence', tendersCount: 12, activeBids: 24, status: 'VERIFIED_BUYER' },
    { name: 'Metro Transit Authority', ministry: 'Ministry of Housing and Urban Affairs', tendersCount: 6, activeBids: 15, status: 'VERIFIED_BUYER' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            PSU & Ministry Buyers
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Registered government procurement authorities, nodal ministries, and departmental desks.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
              <th className="p-4">Buyer Organization</th>
              <th className="p-4">Parent Ministry</th>
              <th className="p-4">Active Tenders</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {clients.map(c => (
              <tr key={c.name} className="hover:bg-surface-alt/40">
                <td className="p-4 font-bold text-primary text-sm">{c.name}</td>
                <td className="p-4 text-on-surface-variant font-medium">{c.ministry}</td>
                <td className="p-4 font-mono font-bold text-primary">{c.tendersCount} Tenders</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded border border-success/20">
                    {c.status}
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
