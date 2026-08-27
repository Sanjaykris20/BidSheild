'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function ClientDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const evaluations = [
    {
      id: 'BID-1024',
      bidId: 'BID-2026-1024',
      tenderNumber: 'GEM/2026/B/1024',
      tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
      org: 'Ministry of Defence',
      bidder: 'TechCorp Solutions Pvt Ltd',
      score: 82,
      riskLevel: 'MEDIUM',
      status: 'UNDER_EVALUATION',
      statusLabel: 'Evaluation In Progress',
      statusColor: 'text-info bg-info/10 border-info/20',
      findingsSummary: '1 Shortfall: Local Content 42% (Class-I requires 50%)',
      flagSeverity: 'warning',
    },
    {
      id: 'BID-8820',
      bidId: 'BID-2026-8820',
      tenderNumber: 'CPCL/2026/899120',
      tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      bidder: 'Alpha Defense Systems Ltd',
      score: 94,
      riskLevel: 'LOW',
      status: 'QUALIFIED',
      statusLabel: 'Technically Qualified',
      statusColor: 'text-success bg-success/10 border-success/20',
      findingsSummary: 'All 8 Compliance Rules Cleared (100% Pass)',
      flagSeverity: 'success',
    },
    {
      id: 'BID-8821',
      bidId: 'BID-2026-8821',
      tenderNumber: 'CPCL/2026/899120',
      tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      bidder: 'Bravo Heavy Engineering Corp',
      score: 52,
      riskLevel: 'CRITICAL',
      status: 'DISQUALIFIED',
      statusLabel: 'Flagged for Debarment',
      statusColor: 'text-danger bg-danger/10 border-danger/20',
      findingsSummary: 'Central Vigilance Commission Debarment Match',
      flagSeverity: 'danger',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header matching NEW UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Desk: CPCL-PROC-04 • Officer: P. Sharma
            </span>
            <MockBadge label="GOVT DESK ACTIVE" size="sm" variant="amber" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Procurement Desk Overview
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Deterministic AI compliance evaluation, evidence verification, and procurement determinations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/client/comparison')}
            className="bg-white border border-outline-variant text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            Comparison Matrix
          </button>
          <button
            onClick={() => router.push('/client/tenders/create')}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Create Tender Wizard
          </button>
        </div>
      </div>

      {/* KPI Cards Grid matching NEW UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Evaluations */}
        <div
          onClick={() => router.push('/client/bids')}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between hover:border-info transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Active Evaluations
            </span>
            <span className="material-symbols-outlined text-info icon-fill">pending_actions</span>
          </div>
          <div>
            <span className="text-4xl font-display font-black text-primary">03</span>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              2 with AI verification flags
            </p>
          </div>
        </div>

        {/* Average Compliance Score */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Avg Compliance
            </span>
            <span className="material-symbols-outlined text-success icon-fill">analytics</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-black text-primary">86.4</span>
              <span className="text-sm font-medium text-neutral-muted">/100</span>
            </div>
            <p className="text-xs text-neutral-muted mt-2">Across 12 evaluated proposals</p>
          </div>
        </div>

        {/* Flagged Shortfalls */}
        <div className="bg-warning/5 rounded-2xl border border-warning/30 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-warning text-xs tracking-wider uppercase">
              Shortfalls / Flags
            </span>
            <span className="material-symbols-outlined text-warning icon-fill">warning</span>
          </div>
          <div>
            <span className="text-3xl font-display font-black text-warning">02</span>
            <p className="text-xs text-warning mt-2 font-medium">
              1 Local Content • 1 Debarment
            </p>
          </div>
        </div>

        {/* Verification Engine Status */}
        <div className="bg-primary text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-semibold text-white/80 uppercase text-xs tracking-wider">
              Engine Status
            </span>
            <span className="material-symbols-outlined text-success icon-fill">check_circle</span>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold">11 Gateways</span>
            <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Deterministic Rules Active
            </p>
          </div>
        </div>
      </div>

      {/* Active Submissions Evaluation Desk matching NEW UI */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-alt/50">
          <div>
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-info icon-fill">fact_check</span>
              Pending Bid Evaluations & Discrepancy Audits
            </h3>
            <p className="text-xs text-neutral-muted mt-0.5">
              Click &quot;Inspect Evidence&quot; to open the Split-Screen OCR & Document Canvas.
            </p>
          </div>
          <button
            onClick={() => router.push('/client/bids')}
            className="text-xs font-semibold text-primary hover:text-info transition-colors"
          >
            View All Submissions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs text-neutral-muted uppercase tracking-wider">
                <th className="p-4 font-semibold w-1/4">Bidder & Reference</th>
                <th className="p-4 font-semibold w-1/4">Tender Details</th>
                <th className="p-4 font-semibold">Compliance Score</th>
                <th className="p-4 font-semibold">AI Verification Findings</th>
                <th className="p-4 font-semibold text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant">
              {evaluations.map(b => (
                <tr
                  key={b.id}
                  className={`hover:bg-surface-alt transition-colors ${
                    b.riskLevel === 'CRITICAL'
                      ? 'bg-danger/5'
                      : b.riskLevel === 'MEDIUM'
                      ? 'bg-warning/5'
                      : ''
                  }`}
                >
                  <td className="p-4">
                    <p className="font-semibold text-primary">{b.bidder}</p>
                    <p className="font-mono text-xs text-outline">{b.bidId}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-primary text-xs line-clamp-1">{b.tenderTitle}</p>
                    <p className="text-xs text-neutral-muted font-mono">{b.tenderNumber}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-black text-base ${b.score >= 90 ? 'text-success' : b.score >= 70 ? 'text-warning' : 'text-danger'}`}>
                        {b.score}/100
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${b.statusColor}`}>
                        {b.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span
                        className={`material-symbols-outlined text-[16px] icon-fill ${
                          b.flagSeverity === 'success'
                            ? 'text-success'
                            : b.flagSeverity === 'warning'
                            ? 'text-warning'
                            : 'text-danger'
                        }`}
                      >
                        {b.flagSeverity === 'success'
                          ? 'check_circle'
                          : b.flagSeverity === 'warning'
                          ? 'warning'
                          : 'cancel'}
                      </span>
                      <span className="line-clamp-1">{b.findingsSummary}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/client/bids/${b.id}/evidence`)}
                      className="bg-primary text-white hover:bg-primary-container px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Inspect Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
