'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { exportTelemetryReportPdf } from '@/lib/export/exportUtils';

export default function AdminReportsPage() {
  const { showToast } = useToast();

  const handleExportTelemetry = () => {
    try {
      exportTelemetryReportPdf('BidShield_Platform_Telemetry_2026-08-27.pdf');
      showToast('Exported Platform Telemetry Report as PDF.', 'success');
    } catch {
      showToast('Failed to export telemetry report.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Platform System Reports
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            System performance telemetry, gateway reliability benchmarks, and procurement compliance metrics.
          </p>
        </div>
        <button
          onClick={handleExportTelemetry}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export Telemetry (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Gateway Uptime
          </span>
          <div className="text-4xl font-display font-black text-success">99.98%</div>
          <p className="text-xs text-neutral-muted mt-1">Across 12 integrated providers</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Average Verification Latency
          </span>
          <div className="text-4xl font-display font-black text-primary">145 ms</div>
          <p className="text-xs text-success font-semibold mt-1">Fast deterministic checks</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Total Bids Evaluated
          </span>
          <div className="text-4xl font-display font-black text-info">1,248</div>
          <p className="text-xs text-neutral-muted mt-1">Across 14 Central PSUs</p>
        </div>
      </div>
    </div>
  );
}
