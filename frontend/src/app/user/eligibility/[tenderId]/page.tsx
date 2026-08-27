'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

export default function EligibilityCheckerPage() {
  const params = useParams();
  const tenderId = params.tenderId as string;

  const requirements = [
    { name: 'GST Registration', status: 'PASS', desc: 'Valid active GSTIN matched.' },
    { name: 'PAN / Tax Filing', status: 'PASS', desc: 'ITR filed for last 3 FYs.' },
    { name: 'Udyam Registration', status: 'PASS', desc: 'MSME registered in matching category.' },
    { name: 'Annual Turnover', status: 'PASS', desc: 'Turnover > ₹5 Cr verified.' },
    { name: 'OEM Authorization', status: 'REVIEW', desc: 'OEM cert found but requires manual date check.' },
    { name: 'Local Content (Make in India)', status: 'FAIL', desc: 'Requires 50%, found 42% in latest audit.' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAIL': return <XCircle className="w-5 h-5 text-danger" />;
      default: return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const score = 86;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">Eligibility Report</span>
            <span className="text-xs font-mono text-slate-500">{tenderId}</span>
          </div>
          <h1 className="font-display text-2xl font-black text-slate-900">AI Eligibility Checker</h1>
          <p className="text-sm text-slate-500 mt-1">We compared your profile and documents against the tender requirements.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-primary font-display">{score}%</span>
            <span className="text-sm font-bold text-slate-400 mb-1">Eligible</span>
          </div>
          <div className="text-[11px] font-bold text-warning flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" /> Some issues found
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Requirement Breakdown
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            {requirements.map((req, i) => (
              <div key={i} className="p-4 flex items-start gap-4">
                <div className="mt-0.5">{getStatusIcon(req.status)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-slate-800">{req.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'PASS' ? 'bg-emerald-50 text-emerald-700' :
                      req.status === 'FAIL' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{req.desc}</p>
                </div>
                {req.status !== 'PASS' && (
                  <button className="text-xs font-bold text-primary hover:text-blue-600 self-center border border-slate-200 rounded-lg px-3 py-1.5">
                    Fix Issue
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Recommendation</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Your profile is largely compliant, but you failed the <strong>Local Content</strong> requirement. You must update your Make in India declaration to reflect >= 50% before submitting, or your bid will likely be rejected.
            </p>
            <Link
              href="/user/bids/create"
              className="w-full py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-soft"
            >
              <span>Continue to Bid Anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
             <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Source Documents
             </h3>
             <ul className="text-xs space-y-2 text-slate-600">
               <li className="flex justify-between items-center py-1 border-b border-slate-100">
                 <span>GST_Certificate_2026.pdf</span>
                 <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Verified</span>
               </li>
               <li className="flex justify-between items-center py-1 border-b border-slate-100">
                 <span>MII_Declaration_v2.pdf</span>
                 <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">Extracted</span>
               </li>
               <li className="flex justify-between items-center py-1">
                 <span>ITR_2025_26.pdf</span>
                 <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Verified</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
