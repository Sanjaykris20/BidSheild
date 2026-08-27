'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header matching NEW UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Vendor Profile: VEN-TECHCORP-01
            </span>
            <MockBadge label="DEMO VENDOR" size="sm" variant="blue" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Welcome, TechCorp Solutions
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Here is your procurement compliance health, active submissions, and tender opportunities.
          </p>
        </div>
        <button
          onClick={() => router.push('/bidder/marketplace')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span> Browse Open Tenders
        </button>
      </div>

      {/* KPI Cards Grid matching NEW UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Health */}
        <div
          onClick={() => router.push('/bidder/vault')}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-success transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full blur-xl group-hover:bg-success/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Compliance Health
            </span>
            <span className="material-symbols-outlined text-success icon-fill">verified_user</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-black text-primary">92</span>
              <span className="text-sm font-medium text-neutral-muted">/100</span>
            </div>
            <div className="mt-3 w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-success h-full rounded-full" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-neutral-muted mt-2">7 of 8 Vault docs auto-verified</p>
          </div>
        </div>

        {/* Active Submissions */}
        <div
          onClick={() => router.push('/bidder/bids')}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between hover:border-info transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Active Submissions
            </span>
            <span className="material-symbols-outlined text-info icon-fill">publish</span>
          </div>
          <div>
            <span className="text-4xl font-display font-black text-primary">03</span>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              2 under evaluation • 1 clarification
            </p>
          </div>
        </div>

        {/* Document Alerts */}
        <div
          onClick={() => router.push('/bidder/vault')}
          className="bg-warning/5 rounded-2xl border border-warning/30 p-5 shadow-sm flex flex-col justify-between hover:bg-warning/10 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-warning text-xs tracking-wider uppercase">
              Action Required
            </span>
            <span className="material-symbols-outlined text-warning icon-fill">warning</span>
          </div>
          <div>
            <span className="text-3xl font-display font-black text-warning">1 Doc</span>
            <p className="text-xs text-warning mt-2 font-medium">
              ISO 27001 expires in 12 days
            </p>
          </div>
        </div>

        {/* Marketplace Quick Link */}
        <div
          onClick={() => router.push('/bidder/marketplace')}
          className="bg-primary text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30 z-0"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <span className="font-semibold text-white/80 uppercase text-xs tracking-wider">
              Marketplace
            </span>
            <span className="material-symbols-outlined text-white">search</span>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold">Find Tenders</span>
            <p className="text-xs text-white/70 mt-2 flex items-center gap-1 group-hover:underline">
              Browse open RFPs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table matching NEW UI */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-alt/50">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-outline">history</span>
            Recent Tender Submissions
          </h3>
          <button
            onClick={() => router.push('/bidder/bids')}
            className="text-xs font-semibold text-primary hover:text-info transition-colors"
          >
            View All Submissions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs text-neutral-muted uppercase tracking-wider">
                <th className="p-4 font-semibold w-1/3">Tender Title</th>
                <th className="p-4 font-semibold">Bid ID</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">AI Pre-Check</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant">
              <tr className="hover:bg-surface-alt transition-colors">
                <td className="p-4">
                  <p className="font-semibold text-primary">Data Center Migration & Zero-Trust Security Upgrade</p>
                  <p className="text-xs text-neutral-muted">Ministry of Defence</p>
                </td>
                <td className="p-4 font-mono text-xs text-outline font-semibold">BID-2026-1024</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-info/10 text-info text-xs font-bold border border-info/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse"></span> Under Evaluation
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-warning font-medium text-xs">
                    <span className="material-symbols-outlined text-[16px] text-warning icon-fill">warning</span>
                    82/100 (1 Warning)
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => router.push('/bidder/bids/BID-1024')}
                    className="text-primary hover:text-info font-semibold text-xs transition-colors bg-surface px-3 py-1.5 rounded-lg border border-outline-variant"
                  >
                    Track Submission
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-alt transition-colors">
                <td className="p-4">
                  <p className="font-semibold text-primary">Cloud Infrastructure Upgrade</p>
                  <p className="text-xs text-neutral-muted">Dept of Education</p>
                </td>
                <td className="p-4 font-mono text-xs text-outline font-semibold">BID-24-891</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-info/10 text-info text-xs font-bold border border-info/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-info"></span> Evaluation
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-success font-medium text-xs">
                    <span className="material-symbols-outlined text-[16px] icon-fill">check_circle</span> 100% Pass
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => showToast('Opening bid tracking timeline...', 'info')}
                    className="text-primary hover:text-info font-semibold text-xs transition-colors bg-surface px-3 py-1.5 rounded-lg border border-outline-variant"
                  >
                    Track Submission
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-alt transition-colors bg-warning/5">
                <td className="p-4">
                  <p className="font-semibold text-primary">Data Center Cooling Systems</p>
                  <p className="text-xs text-neutral-muted">Transport Authority</p>
                </td>
                <td className="p-4 font-mono text-xs text-outline font-semibold">BID-24-442</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-warning/10 text-warning text-xs font-bold border border-warning/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span> Clarification
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-warning font-medium text-xs">
                    <span className="material-symbols-outlined text-[16px] icon-fill">warning</span> 1 Gap Flagged
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => router.push('/bidder/clarifications')}
                    className="text-white bg-warning hover:bg-warning/90 px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition-colors"
                  >
                    Respond
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
