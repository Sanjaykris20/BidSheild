'use client';

import React from 'react';

export default function AdminOrganizationsPage() {
  const orgs = [
    { name: 'TechCorp Solutions Pvt Ltd', type: 'VENDOR', pan: 'ABCDE1234F', gstin: '27ABCDE1234F1Z5', kyc: 'VERIFIED' },
    { name: 'Alpha Defense Systems Ltd', type: 'VENDOR', pan: 'AABCA1234A', gstin: '33AABCA1234A1Z5', kyc: 'VERIFIED' },
    { name: 'Bravo Heavy Engineering Corp', type: 'VENDOR', pan: 'AABCB5678B', gstin: '29AABCB5678B1Z2', kyc: 'DEBARRED_FLAG' },
    { name: 'Chennai Petroleum Corporation Ltd', type: 'PSU_BUYER', pan: 'AAACC1234C', gstin: '33AAACC1234C1Z9', kyc: 'VERIFIED' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Organizations Master Registry
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Entities enrolled on the GeM Central Compliance Directory.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
              <th className="p-4">Legal Entity Name</th>
              <th className="p-4">Entity Type</th>
              <th className="p-4">PAN & GSTIN</th>
              <th className="p-4">Statutory KYC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {orgs.map(o => (
              <tr key={o.name} className="hover:bg-surface-alt/40">
                <td className="p-4 font-bold text-primary text-sm">{o.name}</td>
                <td className="p-4 font-mono font-semibold">{o.type}</td>
                <td className="p-4 font-mono text-neutral-muted">{o.pan} • {o.gstin}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${
                      o.kyc === 'VERIFIED'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}
                  >
                    {o.kyc}
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
