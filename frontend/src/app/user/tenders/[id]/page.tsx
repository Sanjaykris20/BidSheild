'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/context/UserStoreContext';
import { ComplianceBadge } from '@/components/common/Badge';
import {
  ArrowLeft,
  ShoppingBag,
  Building,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params?.id as string;
  const { getTenderById, addToast } = useUserStore();

  const tender = getTenderById(tenderId) || getTenderById('GEM-2026-B-1024');
  const [activeTab, setActiveTab] = useState<'rules' | 'boq' | 'eligibility'>('rules');

  if (!tender) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Tender Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested tender identifier does not exist.</p>
        <Link
          href="/user/marketplace"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/marketplace"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              addToast({
                title: 'RFP Download',
                message: `Downloading complete RFP document for ${tender.tenderNumber}`,
                type: 'info',
              })
            }
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download RFP (PDF)</span>
          </button>
          <Link
            href={`/user/bids/create?tenderId=${tender.id}`}
            className="px-4 py-1.5 bg-primary hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Start 5-Step Bid Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tender Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-primary bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                {tender.tenderNumber}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                OPEN ENQUIRY
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {tender.category}</span>
            </div>

            <h1 className="font-display font-black text-xl md:text-2xl text-slate-900 leading-tight">
              {tender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <strong className="text-slate-800">{tender.organization}</strong>
              </span>
              <span>•</span>
              <span>{tender.department}</span>
              <span>•</span>
              <span>{tender.location}</span>
            </div>
          </div>

          {/* Pricing & Closing Stat Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right shrink-0 w-full lg:w-auto">
            <div className="text-[11px] uppercase font-bold text-slate-400">Estimated Project Value</div>
            <div className="font-display font-black text-2xl text-slate-900 mt-0.5">
              {tender.estimatedValueFormatted}
            </div>
            <div className="text-xs text-rose-600 font-bold mt-1 flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Closing: {tender.closingDate}</span>
            </div>
          </div>
        </div>

        {/* Scope Overview */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs space-y-2">
          <div className="font-extrabold text-blue-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>AI Procurement Scope Analysis</span>
          </div>
          <p className="text-blue-900 leading-relaxed font-medium">{tender.description}</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'rules'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Compliance Rules Matrix ({tender.complianceRules.length})
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'boq'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bill of Quantities / BOQ ({tender.boqItems.length} Items)
        </button>
        <button
          onClick={() => setActiveTab('eligibility')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'eligibility'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Eligibility & Authority Details
        </button>
      </div>

      {/* Tab 1: Rules Breakdown */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">
                Mandatory & Evaluative Verification Criteria (SIH 26100)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated deterministically by the GeM BidVerif AI engine
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white border px-3 py-1 rounded-full shadow-xs">
              24 Total Clauses
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tender.complianceRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {rule.ruleId}
                    </span>
                    <span className="font-bold text-slate-900">{rule.title}</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      • {rule.clauseReference}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {rule.tenderRequirement}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      rule.isMandatory
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rule.isMandatory ? 'Mandatory' : 'Optional'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded border">
                    {rule.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: BOQ Items */}
      {activeTab === 'boq' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-200 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="p-4">Item #</th>
                <th className="p-4">Item Description</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">UOM</th>
                <th className="p-4 text-right">Est. Unit Rate (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tender.boqItems.map((boq) => (
                <tr key={boq.itemNo} className="hover:bg-slate-50/70">
                  <td className="p-4 font-mono font-bold text-primary">{boq.itemNo}</td>
                  <td className="p-4 font-bold text-slate-900">{boq.itemDescription}</td>
                  <td className="p-4 font-bold font-mono">{boq.quantity}</td>
                  <td className="p-4 font-mono text-slate-500">{boq.uom}</td>
                  <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                    ₹ {formatIndianNumber(boq.estimatedRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Eligibility & Authority */}
      {activeTab === 'eligibility' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              Tender Eligibility Directives
            </h3>
            <ul className="space-y-2.5 text-slate-700">
              {tender.eligibilityCriteria.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{crit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              Procurement Officer & Bureau
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <div className="font-bold text-slate-900 text-sm">
                {tender.officerInCharge.name}
              </div>
              <div className="text-slate-600">{tender.officerInCharge.designation}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                {tender.officerInCharge.department}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              All communications and post-bid clarifications are cryptographically routed through the platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
