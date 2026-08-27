'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';
import { exportAuditLedgerCsv } from '@/lib/export/exportUtils';

export default function ClientAuditPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/audit')
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {});
  }, []);

  const handleExportCsv = () => {
    try {
      exportAuditLedgerCsv(logs, 'BidShield_Audit_Log_Client_2026-08-27.csv');
      showToast('Exported audit ledger to CSV.', 'success');
    } catch {
      showToast('Failed to export audit log.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              CVC & CAG Audit Compliant
            </span>
            <MockBadge label="LEDGER IMMUTABLE" size="sm" variant="blue" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Procurement Desk Audit Trail
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Tamper-evident timestamped ledger of all verification executions, AI extractions, and officer determinations.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="bg-white border border-outline-variant text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container flex items-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export Audit CSV
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
                <th className="p-4">Timestamp & Hash</th>
                <th className="p-4">Actor & Role</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Result</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{log.timestamp}</p>
                    <p className="font-mono text-[10px] text-outline truncate max-w-[140px]" title={log.hashSha256}>
                      {log.hashSha256}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-primary">{log.actor}</p>
                    <span className="text-[10px] font-mono text-neutral-muted bg-surface px-1.5 py-0.5 rounded border border-outline-variant">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">{log.action}</td>
                  <td className="p-4 font-medium text-on-surface-variant">{log.resource}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        log.result === 'SUCCESS'
                          ? 'bg-success/10 text-success border-success/20'
                          : log.result === 'WARNING'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-danger/10 text-danger border-danger/20'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
