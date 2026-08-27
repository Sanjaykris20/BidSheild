'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

import { exportAuditLedgerCsv } from '@/lib/export/exportUtils';

export default function AdminAuditPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchLogs = async () => {
    try {
      let url = '/api/audit';
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [roleFilter]);

  const filteredLogs = logs.filter(l =>
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    try {
      exportAuditLedgerCsv(filteredLogs, 'BidShield_Master_Audit_Ledger_2026-08-27.csv');
      showToast('Master audit ledger exported to CSV.', 'success');
    } catch {
      showToast('Failed to export audit ledger.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Master Platform Audit Trail
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Global immutable ledger recording all system events, AI extractions, rule updates, and officer determinations.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export Audit Ledger (CSV)
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-alt/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actions, actors, hashes..."
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex gap-2">
            {['', 'SYSTEM', 'PROCUREMENT_OFFICER', 'ADMIN', 'VENDOR'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  roleFilter === r
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-outline-variant text-neutral-muted hover:bg-surface-container'
                }`}
              >
                {r === '' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
                <th className="p-4">Timestamp & Cryptographic Hash</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Result</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{l.timestamp}</p>
                    <p className="font-mono text-[10px] text-outline truncate max-w-[130px]" title={l.hashSha256}>
                      {l.hashSha256}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{l.actor}</p>
                    <span className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-outline-variant">
                      {l.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">{l.action}</td>
                  <td className="p-4 font-medium text-on-surface-variant">{l.resource}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        l.result === 'SUCCESS'
                          ? 'bg-success/10 text-success border-success/20'
                          : l.result === 'WARNING'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-danger/10 text-danger border-danger/20'
                      }`}
                    >
                      {l.result}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant max-w-xs">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
