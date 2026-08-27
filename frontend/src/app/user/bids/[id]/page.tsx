'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/context/UserStoreContext';
import { BidStatusBadge, ComplianceBadge, RiskBadge } from '@/components/common/Badge';
import {
  ArrowLeft,
  Building,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';

export default function BidDetailPage() {
  const params = useParams();
  const bidIdParam = params?.id as string;
  const { getBidById, documents, openDocumentViewer, addToast } = useUserStore();

  const bid = getBidById(bidIdParam) || getBidById('bid-cpcl-1024') || getBidById('BID-2026-1024');

  if (!bid) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Bid Not Found</h3>
        <Link
          href="/user/bids"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Return to My Submissions
        </Link>
      </div>
    );
  }

  const attachedDocsList = documents.filter((d) => bid.attachedDocIds.includes(d.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/user/bids"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              addToast({
                title: 'Receipt Downloaded',
                message: `Cryptographic submission receipt downloaded for ${bid.bidId}`,
                type: 'info',
              })
            }
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sealed Envelope Receipt</span>
          </button>

          {bid.status === 'CLARIFICATION_REQUIRED' && (
            <Link
              href="/user/clarifications"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Respond to Clarification</span>
            </Link>
          )}
        </div>
      </div>

      {/* Bid Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-primary bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {bid.bidId}
              </span>
              <BidStatusBadge status={bid.status} />
              <RiskBadge risk={bid.riskLevel} />
            </div>

            <h1 className="font-display font-black text-xl md:text-2xl text-slate-900 leading-tight">
              {bid.tenderTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <strong className="text-slate-800">{bid.organization}</strong>
              </span>
              <span>•</span>
              <span className="font-mono font-bold text-slate-700">{bid.tenderNumber}</span>
              <span>•</span>
              <span>Submitted: {bid.submittedAt}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right shrink-0 w-full lg:w-auto space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Quoted Bid Value</div>
            <div className="font-display font-black text-2xl text-slate-900">
              {bid.quotedValueFormatted}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Basic: ₹ {formatIndianNumber(bid.priceBreakdown.basicRateINR)} + 18% GST
            </div>
          </div>
        </div>

        {/* Cryptographic Sealed Envelope Hash */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono text-slate-600 text-[11px] break-all">
              Sealed Envelope SHA-256: <strong>{bid.sealedEnvelopeHash}</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            Tamper-Proof Locked
          </span>
        </div>
      </div>

      {/* 5-Stage Lifecycle Audit Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-display font-black text-slate-900 text-sm">
              5-Stage Evaluation Lifecycle & Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic milestones tracked on tamper-proof procurement ledger
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Compliance Score: {bid.complianceScore} / 100
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {bid.auditTimeline.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isInProgress = stage.status === 'IN_PROGRESS';

            return (
              <div key={stage.stageNumber} className="flex items-start gap-4 text-xs group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.stageNumber}
                </div>

                <div className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <span className="font-extrabold text-slate-900 text-xs">
                      Stage {stage.stageNumber}: {stage.title}
                    </span>
                    {stage.timestamp && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {stage.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {stage.description}
                  </p>
                  {stage.completedBy && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      Audited by: {stage.completedBy}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Rule Verification Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>AI Pre-Submission Compliance Matrix Findings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of deterministic rule evaluations and extracted evidence values
            </p>
          </div>

          <div className="flex gap-2 text-[11px] font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {bid.auditSummary.passedRules} Pass
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {bid.auditSummary.reviewRules} Review
            </span>
            {bid.auditSummary.failedRules > 0 && (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {bid.auditSummary.failedRules} Flagged
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {bid.auditMatrix.map((item) => (
            <div
              key={item.ruleId}
              className={`p-4 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                item.status === 'FAIL'
                  ? 'bg-rose-50/30'
                  : item.status === 'REVIEW'
                  ? 'bg-amber-50/20'
                  : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.ruleId}
                  </span>
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    • {item.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Required: <strong>{item.tenderRequirement}</strong>
                </div>
                <div className="text-[11px] text-slate-800 font-semibold font-mono">
                  Extracted Value: {item.bidderExtractedValue}
                </div>
                {item.notes && (
                  <p className="text-[10px] text-amber-800 italic mt-0.5">
                    Note: {item.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded border">
                  {item.confidence}% Conf.
                </span>
                <ComplianceBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attached Vault Documents */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-display font-black text-slate-900 text-sm">
          Attached Compliance Documents ({attachedDocsList.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {attachedDocsList.map((doc) => (
            <div
              key={doc.id}
              onClick={() => openDocumentViewer(doc)}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate group-hover:text-blue-600">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {doc.docNumber}
                  </div>
                </div>
              </div>
              <Eye className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
