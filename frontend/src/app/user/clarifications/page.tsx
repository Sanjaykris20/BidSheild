'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/context/UserStoreContext';
import {
  HelpCircle,
  Clock,
  Send,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function ClarificationHubPage() {
  const { clarifications, submitClarificationResponse, addToast } = useUserStore();

  const [activeClarificationId, setActiveClarificationId] = useState<string>(
    clarifications[0]?.id || 'clar-cpcl-01'
  );

  const selectedClarification =
    clarifications.find((c) => c.id === activeClarificationId) || clarifications[0];

  const [responseRemarks, setResponseRemarks] = useState<string>(
    'Attached please find the re-issued OEM Authorization Certificate from Emerson Process Management Asia (Cert Ref: AUTH-EMR-2026-9921) valid through March 31, 2027, covering the complete 36-month AMC execution and warranty scope for CPCL Refinery operations.'
  );
  const [attachedDoc, setAttachedDoc] = useState<string>(
    'OEM_Authorization_Renewed_FY26_27.pdf'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseRemarks.trim()) {
      addToast({
        title: 'Remarks Required',
        message: 'Please provide official clarification remarks for the Procurement Officer.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      submitClarificationResponse(
        selectedClarification.id,
        responseRemarks,
        attachedDoc,
        '2.4 MB'
      );
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 leading-tight">
          Procurement Clarification & Grievance Hub
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Respond to official technical queries raised by CPSE Procurement Evaluation Committees.
        </p>
      </div>

      {selectedClarification ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top Clarification List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block px-1">
              Officer Inquiries ({clarifications.length})
            </span>

            {clarifications.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveClarificationId(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  item.id === activeClarificationId
                    ? 'bg-white border-primary shadow-sm ring-2 ring-primary/10'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-primary bg-slate-100 px-2 py-0.5 rounded">
                    {item.bidId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs line-clamp-2">
                  {item.queryTitle}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{item.organization.split('(')[0]}</span>
                  <span className="text-[10px] text-rose-600 font-bold">
                    {item.deadlineDate.split('(')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Main Inquiry & Response Console (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 text-xs">
            {/* Header & Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-primary">
                  {selectedClarification.tenderNumber} • {selectedClarification.bidId}
                </span>
                <h3 className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                  {selectedClarification.queryTitle}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                  selectedClarification.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {selectedClarification.status === 'PENDING'
                  ? 'Response Required'
                  : 'Response Transmitted'}
              </span>
            </div>

            {/* Official Inquiry Card */}
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Officer Inquiry from {selectedClarification.officerName}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Raised: {selectedClarification.queryRaisedAt}
                </span>
              </div>

              <p className="text-amber-900 text-xs leading-relaxed font-serif font-medium bg-white/70 p-4 rounded-xl border border-amber-200/60">
                "{selectedClarification.queryDetails}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-amber-900 pt-1">
                <span>Flagged Rule: {selectedClarification.flaggedRuleId}</span>
                <span className="text-rose-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deadline: {selectedClarification.deadlineDate}</span>
                </span>
              </div>
            </div>

            {/* Response Form or Transmitted Record */}
            {selectedClarification.status === 'PENDING' ? (
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="font-extrabold text-slate-900 block mb-1.5">
                    Official Bidder Response Remarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={responseRemarks}
                    onChange={(e) => setResponseRemarks(e.target.value)}
                    required
                    placeholder="Enter formal justification and technical clarifications..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none transition-all leading-relaxed font-medium"
                  />
                </div>

                {/* Supporting Document Attachment */}
                <div>
                  <label className="font-extrabold text-slate-900 block mb-1.5">
                    Supporting Verified Artifact Attachment
                  </label>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{attachedDoc}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          2.4 MB • Re-issued Validity: 31 Mar 2027 • Verified OCR
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                      Attached ✓
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Link
                    href={`/user/bids/${selectedClarification.bidId}`}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs"
                  >
                    Review Bid Timeline
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-75 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                        <span>Transmitting Clarification...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Official Clarification Response</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Already Responded State */
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-emerald-950 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Response Transmitted to Procurement Officer</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800">
                    {selectedClarification.bidderResponse?.respondedAt}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-slate-800 text-xs leading-relaxed font-serif">
                  "{selectedClarification.bidderResponse?.remarks}"
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-900 font-medium pt-1">
                  <span>
                    Attached Doc:{' '}
                    <strong>
                      {selectedClarification.bidderResponse?.attachedDocName} (
                      {selectedClarification.bidderResponse?.attachedDocSize})
                    </strong>
                  </span>
                  <span className="font-bold">Awaiting Officer Determination</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-display font-bold text-slate-900 text-base">
            No Pending Clarifications
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            All submitted bids have clean compliance profiles without active officer inquiries.
          </p>
        </div>
      )}
    </div>
  );
}
