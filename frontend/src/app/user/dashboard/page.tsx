'use client';

import React from 'react';
import Link from 'next/link';
import { useUserStore } from '@/context/UserStoreContext';
import { ShieldCheck, ArrowRight, Upload, Activity, Briefcase, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { profile, bids, openUploadModal } = useUserStore();

  const totalQuotedINR = bids.reduce((acc, b) => acc + b.quotedValueINR, 0);
  const totalQuotedFormatted =
    totalQuotedINR >= 10000000
      ? `₹ ${(totalQuotedINR / 10000000).toFixed(2)} Cr`
      : `₹ ${(totalQuotedINR / 100000).toFixed(2)} Lakh`;

  return (
    <div className="space-y-10">
      {/* Premium Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-4 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Compliance Score: 92% (Low Risk)
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight text-balance">
            Good morning, {profile.tradeName}.
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl text-pretty">
            Here is your live compliance overview and active bid telemetry. You have 2 bids under committee review.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={openUploadModal}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload Doc
          </button>
          <Link
            href="/user/marketplace"
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 shadow-soft"
          >
            Find Tenders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Minimalist Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Bids', value: bids.length.toString(), icon: <Briefcase className="w-5 h-5 text-slate-400" /> },
          { label: 'Total Value Quoted', value: totalQuotedFormatted, icon: <Activity className="w-5 h-5 text-slate-400" /> },
          { label: 'Documents in Vault', value: '18', icon: <Upload className="w-5 h-5 text-slate-400" /> },
          { label: 'Pending Queries', value: '1', icon: <ShieldCheck className="w-5 h-5 text-warning" /> },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-glass hover:shadow-soft transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-500">{metric.label}</span>
              {metric.icon}
            </div>
            <div className="text-3xl font-display font-bold text-primary truncate">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Elegant Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-lg font-display font-bold text-primary">Recent Submissions</h2>
          <Link href="/user/bids" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-5 font-medium">Tender Reference</th>
                <th className="p-5 font-medium">Quoted Amount</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((bid) => (
                <tr key={bid.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 max-w-[250px]">
                    <div className="font-semibold text-primary truncate" title={bid.tenderTitle}>
                      {bid.tenderTitle}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate">
                      {bid.organization} • {bid.bidId}
                    </div>
                  </td>
                  <td className="p-5 font-semibold text-slate-700">
                    {bid.quotedValueFormatted}
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {bid.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <Link
                      href={`/user/bids/${bid.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
