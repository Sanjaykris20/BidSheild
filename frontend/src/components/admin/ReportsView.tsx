'use client';
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  PieChart,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Platform Analytics & Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              CVC & GeM Governance BI
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive compliance trend reporting, vendor risk matrices, cycle time acceleration & API reliability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Generating comprehensive PDF compliance intelligence brief...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Compliance Rate</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">84.6%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +6.2% vs previous quarter
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Procurement Cycle Time</div>
          <div className="text-3xl font-black text-blue-600 mt-1">4.2 Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Reduced from 21 days (AI Auto-Verification)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bids Evaluated</div>
          <div className="text-3xl font-black text-slate-900 mt-1">842</div>
          <div className="text-[11px] text-slate-500 mt-1">₹ 2,450 Cr Procurement Value</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Statutory Pass Rate</div>
          <div className="text-3xl font-black text-teal-600 mt-1">98.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero undetected blacklisting</div>
        </div>

      </div>

      {/* TWO COLUMN CHARTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Vendor Risk Distribution */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bidder Risk Distribution Matrix</h2>
              <p className="text-xs text-slate-500">Breakdown of 842 bidders across statutory risk bands</p>
            </div>
            <span className="text-xs font-bold text-blue-600">842 Total</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            
            {/* Low Risk */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-700">Low Risk (90-100 Score)</span>
                <span className="font-bold">582 Bids (69.1%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '69.1%' }}></div>
              </div>
            </div>

            {/* Medium Risk */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">Medium Risk (70-89 Score - Clarifications)</span>
                <span className="font-bold">184 Bids (21.8%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '21.8%' }}></div>
              </div>
            </div>

            {/* High Risk */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-orange-700">High Risk (50-69 Score - Heavy Scrutiny)</span>
                <span className="font-bold">54 Bids (6.4%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '6.4%' }}></div>
              </div>
            </div>

            {/* Critical */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-700">Critical (0-49 Score - Hard Gating Failure)</span>
                <span className="font-bold">22 Bids (2.6%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '2.6%' }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Connector Uptime & Reliability SLA */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Government Gateway Uptime SLA</h2>
              <p className="text-xs text-slate-500">Monthly availability & throughput across statutory endpoints</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">99.85% Platform SLA</span>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            {[
              { name: "GSTN Statutory API", uptime: "99.96%", latency: "142ms", status: "HEALTHY" },
              { name: "NSDL / PAN Verification", uptime: "99.99%", latency: "165ms", status: "HEALTHY" },
              { name: "CVC Debarment Registry", uptime: "100.0%", latency: "115ms", status: "HEALTHY" },
              { name: "Udyam MSE Portal", uptime: "99.88%", latency: "210ms", status: "HEALTHY" },
              { name: "NSIC Single Point Gateway", uptime: "95.80%", latency: "620ms", status: "DEGRADED" }
            ].map((gw, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${gw.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="font-bold text-slate-800">{gw.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-500">{gw.latency}</span>
                  <span className="font-bold text-emerald-700">{gw.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
