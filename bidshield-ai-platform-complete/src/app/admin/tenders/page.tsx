'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTendersPage() {
  const router = useRouter();

  const tenders = [
    { number: 'GEM/2026/B/1024', title: 'Data Center Migration & Security Upgrade', org: 'Ministry of Defence', value: '₹36.5 Cr', status: 'ACTIVE' },
    { number: 'CPCL/2026/899120', title: 'Supply of High-Pressure Cryogenic Storage Valves', org: 'CPCL', value: '₹18.2 Cr', status: 'ACTIVE' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Tender Oversight & Governance
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Global monitoring of all public procurements across central nodal portals.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
              <th className="p-4">Tender ID & Title</th>
              <th className="p-4">Buyer PSU / Ministry</th>
              <th className="p-4">Estimated Value</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {tenders.map(t => (
              <tr key={t.number} className="hover:bg-surface-alt/40">
                <td className="p-4">
                  <p className="font-bold text-primary text-sm">{t.title}</p>
                  <p className="font-mono text-neutral-muted text-[11px]">{t.number}</p>
                </td>
                <td className="p-4 text-on-surface-variant font-medium">{t.org}</td>
                <td className="p-4 font-mono font-bold text-primary">{t.value}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded border border-success/20">
                    {t.status}
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
