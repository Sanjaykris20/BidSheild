'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle2, ChevronLeft, Send, FileCheck } from 'lucide-react';
import { useUserStore } from '@/context/UserStoreContext';

export default function PreSubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bidId = params.id as string;
  const { addToast } = useUserStore();

  const handleSubmit = () => {
    addToast('success', 'Bid Submitted', 'Your bid has been successfully submitted to GeM.');
    router.push('/user/bids');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={`/user/bids/${bidId}`} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Bid
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/20 mb-3">
                <FileCheck className="w-3 h-3 text-emerald-400" /> Pre-Submission AI Review
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-black">Final Verification Check</h1>
              <p className="text-sm text-slate-300 mt-1">Bid Reference: {bidId}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
              <div className="text-3xl font-black text-emerald-400 font-display">15/18</div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Passed Rules</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-8 flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900">Ready for Submission</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your bid package meets the minimum mandatory requirements for this tender. However, 1 warning and 2 manual review flags were detected.
              </p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-2">AI Audit Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
               <div className="text-2xl font-black text-slate-800">18</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Total Checks</div>
             </div>
             <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
               <div className="text-2xl font-black text-emerald-600">15</div>
               <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Passed</div>
             </div>
             <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
               <div className="text-2xl font-black text-amber-600">2</div>
               <div className="text-[10px] font-bold text-amber-600 uppercase mt-1">Review</div>
             </div>
             <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
               <div className="text-2xl font-black text-red-600">1</div>
               <div className="text-[10px] font-bold text-red-600 uppercase mt-1">Failed</div>
             </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Confirm Submission</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                By submitting this bid, you declare that all information is true and complies with the GeM procurement guidelines.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link href={`/user/bids/${bidId}`} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </Link>
              <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2 transition-colors">
                <Send className="w-4 h-4" /> Confirm & Submit Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
