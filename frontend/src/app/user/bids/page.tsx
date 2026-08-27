'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/context/UserStoreContext';
import { BidStatusBadge, RiskBadge } from '@/components/common/Badge';
import {
  FileCheck2,
  Search,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Building,
  Filter,
} from 'lucide-react';
import { BidStatus } from '@/types/user';

export default function MyBidsPage() {
  const { bids } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredBids = bids.filter((b) => {
    const matchesSearch =
      b.bidId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tenderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.organization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & New Bid CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 leading-tight">
            My Bid Submissions & Lifecycles
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track submitted bids, 5-stage evaluation progress, and AI compliance audit scorecards.
          </p>
        </div>

        <Link
          href="/user/bids/create"
          className="px-5 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Bid Submission</span>
        </Link>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search and Status Pills */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bid ID, tender no, buyer..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            {['ALL', 'CLARIFICATION_REQUIRED', 'UNDER_EVALUATION', 'SUBMITTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All Bids' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Bids Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="p-4">Bid ID & Date</th>
                <th className="p-4">Tender Specification</th>
                <th className="p-4">Quoted Amount</th>
                <th className="p-4">Status & Stage</th>
                <th className="p-4">Compliance & Risk</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBids.length > 0 ? (
                filteredBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Bid ID & Date */}
                    <td className="p-4">
                      <Link
                        href={`/user/bids/${bid.id}`}
                        className="font-mono font-extrabold text-xs text-primary hover:text-blue-600 transition-colors block"
                      >
                        {bid.bidId}
                      </Link>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {bid.submittedAt}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {bid.sealedEnvelopeHash.substring(0, 16)}...
                      </div>
                    </td>

                    {/* Tender Details */}
                    <td className="p-4 max-w-sm">
                      <Link
                        href={`/user/bids/${bid.id}`}
                        className="font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors"
                      >
                        {bid.tenderTitle}
                      </Link>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {bid.organization} • {bid.tenderNumber}
                      </div>
                    </td>

                    {/* Quoted Amount */}
                    <td className="p-4">
                      <div className="font-display font-black text-slate-900 text-sm">
                        {bid.quotedValueFormatted}
                      </div>
                      <span className="text-[10px] text-slate-400">Incl. 18% GST</span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <BidStatusBadge status={bid.status} />
                    </td>

                    {/* Compliance & Risk */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                          <span className="material-symbols-outlined text-[15px] icon-fill text-emerald-600">
                            verified
                          </span>
                          <span>{bid.complianceScore} / 100 Score</span>
                        </div>
                        <RiskBadge risk={bid.riskLevel} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {bid.status === 'CLARIFICATION_REQUIRED' ? (
                        <Link
                          href="/user/clarifications"
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>Respond</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/user/bids/${bid.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Track Audit</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No bid submissions found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
