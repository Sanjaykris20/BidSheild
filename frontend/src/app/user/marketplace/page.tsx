'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/context/UserStoreContext';
import {
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface EligibilityState {
  [tenderId: string]: {
    isRunning: boolean;
    isDone: boolean;
    score: number;
    passCount: number;
    reviewCount: number;
    failCount: number;
    advisory: string;
  };
}

export default function MarketplacePage() {
  const { tenders, addToast } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [eligibilityStates, setEligibilityStates] = useState<EligibilityState>({});

  const categories = ['ALL', 'IT Services & Industrial EPC', 'Smart Mobility & Telemetry', 'Industrial Automation'];

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleRunEligibility = (tenderId: string, tenderNumber: string) => {
    setEligibilityStates((prev) => ({
      ...prev,
      [tenderId]: {
        isRunning: true,
        isDone: false,
        score: 0,
        passCount: 0,
        reviewCount: 0,
        failCount: 0,
        advisory: '',
      },
    }));

    addToast({
      title: 'AI Eligibility Analysis Triggered',
      message: `Cross-referencing Vault credentials against ${tenderNumber} criteria...`,
      type: 'info',
    });

    setTimeout(() => {
      const isHighMatch = tenderId.includes('1024') || tenderId.includes('89');
      setEligibilityStates((prev) => ({
        ...prev,
        [tenderId]: {
          isRunning: false,
          isDone: true,
          score: isHighMatch ? 86 : 94,
          passCount: isHighMatch ? 18 : 22,
          reviewCount: isHighMatch ? 2 : 2,
          failCount: isHighMatch ? 1 : 0,
          advisory: isHighMatch
            ? 'Statutory & financial criteria pass 100%. Critical flag: Upload renewed OEM Authorization (FY26-27) to avoid disqualification on Rule REQ-TECH-03.'
            : 'Excellent profile alignment. Turnkey credentials and financial net worth meet all prerequisite criteria.',
        },
      }));

      addToast({
        title: 'Eligibility Evaluation Complete',
        message: `${isHighMatch ? '86%' : '94%'} compatibility determined across compliance rules.`,
        type: 'success',
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 leading-tight">
            GeM Procurement Marketplace
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Discover active public sector procurements and execute instant AI profile eligibility audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tender no, title, buyer..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Tender Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTenders.map((tender) => {
          const elig = eligibilityStates[tender.id];

          return (
            <div
              key={tender.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div>
                {/* Header Tag Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {tender.tenderNumber}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      LIVE TENDER
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Closes in {tender.daysLeft}d</span>
                  </div>
                </div>

                {/* Title & Organization */}
                <Link
                  href={`/user/tenders/${tender.id}`}
                  className="font-display font-extrabold text-base md:text-lg text-slate-900 group-hover:text-blue-700 transition-colors leading-snug block"
                >
                  {tender.title}
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tender.organization}</span>
                  <span>•</span>
                  <span>{tender.location}</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {tender.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Estimated Value
                    </span>
                    <span className="font-extrabold text-slate-900 font-display text-sm">
                      {tender.estimatedValueFormatted}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      EMD Amount
                    </span>
                    <span className="font-bold text-slate-700">
                      {tender.emdAmountFormatted}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Compliance Rules
                    </span>
                    <span className="font-bold text-primary">
                      {tender.complianceRuleCount} Mandatory Rules
                    </span>
                  </div>
                </div>

                {/* AI Eligibility Result Card (if executed) */}
                {elig && elig.isDone && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white space-y-2.5 animate-slide-in border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-extrabold text-xs text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>AI Compliance Eligibility Audit</span>
                      </span>
                      <span className="font-display font-black text-emerald-400 text-sm">
                        {elig.score}% Eligible
                      </span>
                    </div>

                    <div className="flex gap-2 text-[11px] font-semibold">
                      <span className="text-emerald-400">✓ {elig.passCount} Pass</span>
                      <span className="text-amber-400">• {elig.reviewCount} Review</span>
                      {elig.failCount > 0 && (
                        <span className="text-rose-400">• {elig.failCount} Critical Gap</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-t border-slate-800 pt-2">
                      {elig.advisory}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/user/tenders/${tender.id}`}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full RFP Specs</span>
                </Link>

                {!elig?.isDone ? (
                  <button
                    onClick={() => handleRunEligibility(tender.id, tender.tenderNumber)}
                    disabled={elig?.isRunning}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-75"
                  >
                    {elig?.isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                        <span>Checking Vault vs Criteria...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-300" />
                        <span>AI Eligibility Check</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/user/bids/create?tenderId=${tender.id}`}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Launch 5-Step Bid Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
