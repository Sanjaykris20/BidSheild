'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Building2, CheckCircle2, AlertTriangle, XCircle, 
  Download, ArrowLeftRight
} from 'lucide-react';

const COMPARE_DATA = [
  {
    id: 'BID-8819',
    name: 'Alpha Defense Logistics',
    score: 78.5,
    risk: 'MEDIUM',
    turnover: '₹4.2 Cr',
    localContent: '45.0% (Class-II)',
    gst: 'ACTIVE',
    udyam: 'SMALL',
    status: 'WARNING'
  },
  {
    id: 'BID-8820',
    name: 'Bravo Heavy Engineering',
    score: 94.0,
    risk: 'LOW',
    turnover: '₹12.8 Cr',
    localContent: '68.5% (Class-I)',
    gst: 'ACTIVE',
    udyam: 'MEDIUM',
    status: 'PASS'
  },
  {
    id: 'BID-8821',
    name: 'Delta Corp Supplies',
    score: 42.0,
    risk: 'HIGH',
    turnover: '₹1.1 Cr',
    localContent: '20.0%',
    gst: 'INACTIVE',
    udyam: 'MICRO',
    status: 'FAIL'
  }
];

export default function BidderComparisonPage() {
  return (
    // @ts-ignore
    <AdminLayout currentSection="bids">
      <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Bidder Comparison Matrix</h1>
            </div>
            <p className="text-slate-500 ml-13">Tender: Supply of Heavy Engineering Equipment (GEM/2026/B/882190)</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-6 font-bold text-slate-700 w-1/4">Evaluation Criteria</th>
                  {COMPARE_DATA.map(bid => (
                    <th key={bid.id} className="p-6 w-1/4 border-l border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 mb-1">{bid.id}</span>
                        <span className="font-bold text-primary text-lg">{bid.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {/* AI Score */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">AI Compliance Score</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100 font-display font-bold text-2xl text-slate-800">
                      {bid.score}/100
                    </td>
                  ))}
                </tr>

                {/* Risk */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">Risk Assessment</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        bid.risk === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                        bid.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {bid.risk} RISK
                      </span>
                    </td>
                  ))}
                </tr>

                {/* MII */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">Make-In-India (MII)</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100 font-semibold text-slate-700">
                      {bid.localContent}
                    </td>
                  ))}
                </tr>

                {/* Turnover */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">Annual Turnover</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100 font-semibold text-slate-700">
                      {bid.turnover}
                    </td>
                  ))}
                </tr>

                {/* GST */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">GSTIN Status</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100">
                      <div className="flex items-center gap-2 font-semibold">
                        {bid.gst === 'ACTIVE' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        <span className={bid.gst === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-700'}>{bid.gst}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* UDYAM */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-semibold text-slate-600 bg-slate-50/50">Udyam Registration</td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100 font-semibold text-slate-700">
                      {bid.udyam}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-6 bg-slate-50/50"></td>
                  {COMPARE_DATA.map(bid => (
                    <td key={bid.id} className="p-6 border-l border-slate-100">
                      <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm">
                        View Full Bid
                      </button>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
