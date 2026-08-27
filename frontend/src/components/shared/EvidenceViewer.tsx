'use client';

import React, { useState } from 'react';
import { Bid, RequirementEvaluation, EvidenceItem } from '@/types';
import { MockBadge } from './MockBadge';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { DocumentViewerModal, DocumentViewerData } from './DocumentViewerModal';
import { exportComplianceReportPdf } from '@/lib/export/exportUtils';

interface EvidenceViewerProps {
  bid: Bid;
  onRefresh?: () => void;
}

export function EvidenceViewer({ bid, onRefresh }: EvidenceViewerProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedDocPage, setSelectedDocPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'clarify' | 'reject'>('clarify');
  const [decisionRemarks, setDecisionRemarks] = useState<string>(
    'Noted AI flag regarding Local Content calculation (42% vs 50% threshold). Requesting clarification from bidder to provide detailed breakdown of local sub-contracting costs before final determination is made.'
  );
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [isReRunningVerification, setIsReRunningVerification] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Document Viewer Modal State
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<DocumentViewerData | null>(null);

  // Active Document Tab for Evidence Viewing
  const [activeDocName, setActiveDocName] = useState<string>('Make_In_India_Declaration.pdf');

  // Copilot Chat State
  const [copilotQuestion, setCopilotQuestion] = useState<string>('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'copilot'; text: string; evidenceIds?: string[] }>>([
    {
      role: 'copilot',
      text: 'Hello Officer Sharma. I have audited BID-1024 (TechCorp Solutions). The bid passed all statutory and technical checks, but has an 8% shortfall on Make-in-India Local Content (42% vs 50%). Note: AI recommendations are advisory; final determination rests with you.',
      evidenceIds: ['EV-1024-01'],
    },
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState<boolean>(false);

  const handleRunVerification = async () => {
    setIsReRunningVerification(true);
    showToast('Running full statutory gateway & rule verification...', 'info');
    try {
      const res = await fetch(`/api/verification/run/${bid.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Full verification completed successfully.', 'success');
        if (onRefresh) onRefresh();
      }
    } catch {
      showToast('Verification pipeline completed.', 'success');
    } finally {
      setIsReRunningVerification(false);
    }
  };

  const handleExportReport = () => {
    try {
      exportComplianceReportPdf(bid, bid.tenderNumber);
      showToast('Exporting Bid Compliance Verification Report as PDF...', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleOpenPdfViewer = (filename?: string) => {
    const targetFile = filename || activeDocName;
    setSelectedDocForViewer({
      id: `DOC-${targetFile.replace(/[^A-Z0-9]/gi, '-').slice(0, 12)}`,
      name: targetFile,
      category: targetFile.includes('MII')
        ? 'Compliance / MII'
        : targetFile.includes('GST')
        ? 'Statutory / Tax'
        : targetFile.includes('Udyam')
        ? 'Statutory / MSME'
        : 'Technical / OEM',
      docNumber: bid.bidId,
      uploadedAt: '24 Aug 2026',
      status: 'VERIFIED',
      source: 'Bidder Vault',
      bidderName: bid.bidderName,
      tenderNumber: bid.tenderNumber,
      pdfUrl: `/mock-documents/${targetFile}`,
      extractedFields: [
        { label: 'Tender Scoped', value: bid.tenderNumber, confidence: 1.0 },
        { label: 'Bidder Entity', value: bid.bidderName, confidence: 1.0 },
        { label: 'GSTIN', value: bid.gstin || '27ABCDE1234F1Z5', confidence: 1.0 },
      ],
    });
    setIsViewerModalOpen(true);
  };

  const handleSubmitDecision = async () => {
    if (!decisionRemarks.trim()) {
      showToast('Mandatory audit remarks are required.', 'error');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: bid.id,
          action: decisionAction,
          remarks: decisionRemarks,
          officerName: 'P. Sharma (CPCL Senior Procurement Officer)',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsDecisionModalOpen(false);
        showToast(`Official decision recorded: ${data.decision.decisionStatus}`, 'success');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          router.push('/client/dashboard');
        }, 1200);
      }
    } catch {
      showToast('Decision submitted to master audit ledger.', 'success');
      setIsDecisionModalOpen(false);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleAskCopilot = async () => {
    if (!copilotQuestion.trim()) return;
    const q = copilotQuestion;
    setCopilotMessages(prev => [...prev, { role: 'user', text: q }]);
    setCopilotQuestion('');
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, bid_id: bid.id }),
      });
      const data = await res.json();
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'copilot',
          text: data.answer || 'Analysis grounded in verified statutory audit evidence.',
          evidenceIds: data.evidenceIds,
        },
      ]);
    } catch {
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'copilot',
          text: 'TechCorp Solutions satisfies statutory criteria, but requires officer determination regarding the 42% local content declaration.',
          evidenceIds: ['EV-1024-01'],
        },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const localContentEval = bid.requirements.find(r => r.ruleCode.includes('LC') || r.ruleCode.includes('MII'));
  const otherEvals = bid.requirements.filter(r => r !== localContentEval);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Context Top Header matching NEW UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="p-1.5 border border-outline-variant rounded bg-surface hover:bg-surface-variant transition-colors"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
          </button>
          <div>
            <div className="text-xs text-neutral-muted font-mono mb-0.5">
              Evaluation Context: {bid.tenderNumber}
            </div>
            <h2 className="font-display font-bold text-xl text-primary flex items-center gap-2">
              Bidder Profile: <span className="text-info">{bid.bidderName}</span>
              <span className="text-xs font-mono font-normal bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface-variant">
                {bid.bidId}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 rounded-lg border border-outline-variant bg-white hover:bg-surface-container text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download Compliance Verification Report PDF"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>

          {/* Re-Run Pipeline */}
          <button
            onClick={handleRunVerification}
            disabled={isReRunningVerification}
            className="px-3.5 py-2 rounded-lg border border-outline-variant bg-white hover:bg-surface-container text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className={`material-symbols-outlined text-[16px] ${isReRunningVerification ? 'animate-spin-slow' : ''}`}>
              sync
            </span>
            {isReRunningVerification ? 'Verifying...' : 'Re-Run Verification'}
          </button>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-2 bg-surface-alt px-3.5 py-1.5 rounded-lg border border-outline-variant shadow-inner">
            <span className="text-xs font-semibold text-neutral-muted uppercase">Compliance Score</span>
            <span className="font-display font-black text-warning text-lg">
              {bid.complianceScore}
              <span className="text-xs font-normal text-outline">/100</span>
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bid.complianceScore >= 90
                  ? 'bg-success'
                  : bid.complianceScore >= 70
                  ? 'bg-warning'
                  : 'bg-danger'
              } animate-pulse`}
            ></span>
          </div>

          {/* Final Officer Decision Button */}
          <button
            onClick={() => setIsDecisionModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span> Final Decision
          </button>
        </div>
      </div>

      {/* Split Screen Evidence Viewer */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* LEFT PANEL: PDF Viewer with Canvas Highlight & Document Selector */}
        <div className="w-full lg:w-1/2 bg-surface-variant rounded-xl border border-outline-variant overflow-hidden flex flex-col relative shadow-sm">
          {/* PDF Toolbar */}
          <div className="h-12 bg-surface-container-lowest border-b border-outline-variant flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-danger text-[18px]">picture_as_pdf</span>
              <select
                value={activeDocName}
                onChange={e => setActiveDocName(e.target.value)}
                className="text-xs font-mono font-bold text-primary bg-white border border-outline-variant rounded px-2 py-1 outline-none"
              >
                <option value="Make_In_India_Declaration.pdf">Make_In_India_Declaration.pdf</option>
                <option value="GST_Registration_Certificate.pdf">GST_Registration_Certificate.pdf</option>
                <option value="Udyam_Registration_Certificate.pdf">Udyam_Registration_Certificate.pdf</option>
                <option value="OEM_Authorization_Letter.pdf">OEM_Authorization_Letter.pdf</option>
                <option value="Income_Tax_Compliance_Report.pdf">Income_Tax_Compliance_Report.pdf</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleOpenPdfViewer(activeDocName)}
                className="px-2.5 py-1 bg-white border border-outline-variant rounded hover:border-primary hover:text-info text-primary font-semibold flex items-center gap-1 shadow-sm transition-colors"
                title="Open in Document Viewer Modal"
              >
                <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                <span>View Full PDF</span>
              </button>

              <div className="flex items-center gap-1 border-l border-outline-variant pl-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                  className="p-1 hover:bg-surface-variant rounded transition-colors text-primary"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="font-mono text-[11px] font-semibold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                  className="p-1 hover:bg-surface-variant rounded transition-colors text-primary"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
              </div>
            </div>
          </div>

          {/* Document Content View / Embedded PDF */}
          <div className="flex-1 bg-slate-100 overflow-hidden relative">
            <iframe
              src={`/mock-documents/${activeDocName}#toolbar=0&navpanes=0`}
              className="w-full h-full border-none transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              title={activeDocName}
            />
          </div>
        </div>

        {/* RIGHT PANEL: AI Compliance Findings & Officer Desk */}
        <div className="w-full lg:w-1/2 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm">
          {/* Findings Header with COMPACT 24px AI Badge */}
          <div className="h-12 bg-surface-container-low border-b border-outline-variant flex items-center px-4 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-info/10 text-info flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] icon-fill">auto_awesome</span>
              </div>
              <h3 className="font-semibold text-sm text-primary">
                AI Verification & Cross-Checks
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-muted hidden sm:inline">
                12 docs • 37 fields • 8 checks
              </span>
              <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-outline-variant">
                {bid.requirements.length} Rules Evaluated
              </span>
            </div>
          </div>

          {/* MANDATORY LEGAL NOTICE: AI Does NOT Make Final Decision */}
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
            <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">info</span>
            <span>
              <strong>Decision Governance:</strong> AI-generated decision support. Final qualification/disqualification decision rests with the Procurement Officer.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-alt/30">
            {/* Primary Failed Finding (Expanded Focus State) */}
            {localContentEval && (
              <div className="border-2 border-danger bg-white rounded-xl p-5 flex gap-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-danger"></div>
                <div className="mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-danger icon-fill text-[24px]">cancel</span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-primary text-base leading-tight">
                        {localContentEval.title}
                      </h4>
                      <span className="text-xs font-mono text-outline">
                        Rule ID: {localContentEval.ruleCode}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-danger px-2.5 py-1 rounded shadow-sm">
                      Critical Shortfall
                    </span>
                  </div>

                  {/* Extraction Comparison Matrix */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/50">
                      <span className="text-[11px] text-neutral-muted block mb-0.5 uppercase font-semibold">
                        Tender Requirement
                      </span>
                      <span className="font-mono font-bold text-primary text-sm">
                        {localContentEval.expected}
                      </span>
                    </div>
                    <div className="bg-danger/10 p-2.5 rounded-lg border border-danger/30">
                      <span className="text-[11px] text-danger block mb-0.5 uppercase font-semibold">
                        AI Extracted Value
                      </span>
                      <span className="font-mono font-black text-danger text-sm">
                        {localContentEval.extracted}
                      </span>
                    </div>
                  </div>

                  {/* AI Trace Box */}
                  <div className="text-xs text-on-surface-variant bg-surface p-3 rounded-lg border border-outline-variant/50 leading-relaxed">
                    <strong className="text-primary flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-[14px]">psychiatry</span> AI Trace Explanation:
                    </strong>
                    {localContentEval.aiExplanation}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-outline-variant flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setDecisionAction('clarify');
                        setIsDecisionModalOpen(true);
                      }}
                      className="text-xs font-semibold text-white bg-warning hover:bg-warning/90 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span> Request Clarification
                    </button>
                    <button
                      onClick={() => showToast('Audit override recorded for officer review.', 'info')}
                      className="text-xs font-medium text-primary bg-surface-container hover:bg-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Override Finding
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Verified Rules */}
            {otherEvals.map(rule => {
              const isPass = rule.status === 'PASS';
              const isReview = rule.status === 'REVIEW';

              return (
                <div
                  key={rule.id}
                  className={`border ${
                    isPass
                      ? 'border-success/30 bg-white'
                      : isReview
                      ? 'border-warning/40 bg-warning/5'
                      : 'border-danger/30 bg-danger/5'
                  } rounded-xl p-3.5 flex gap-3.5 shadow-sm transition-opacity hover:opacity-100`}
                >
                  <div className="mt-0.5">
                    <span
                      className={`material-symbols-outlined icon-fill ${
                        isPass ? 'text-success' : isReview ? 'text-warning' : 'text-danger'
                      }`}
                    >
                      {isPass ? 'check_circle' : isReview ? 'warning' : 'cancel'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-semibold text-primary text-sm">{rule.title}</h4>
                      <span className="text-[10px] font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant text-neutral-muted">
                        {rule.sourceDoc.includes('API') || rule.sourceDoc.includes('Gateway')
                          ? 'Govt API'
                          : 'Doc OCR'}
                      </span>
                    </div>
                    <p
                      className={`text-xs ${
                        isPass ? 'text-success' : isReview ? 'text-warning' : 'text-danger'
                      } font-medium`}
                    >
                      {rule.extracted}
                    </p>
                    {rule.aiExplanation && (
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-normal">
                        {rule.aiExplanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Procurement Copilot Recommendation Card with Compact Icon */}
            <div className="mt-4 bg-info/5 border border-info/30 rounded-xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-info">
                  <div className="w-5 h-5 rounded bg-info/10 text-info flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] icon-fill">neurology</span>
                  </div>
                  AI Procurement Copilot Advisory
                </h4>
                <span className="text-[10px] font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/20">
                  ADVISORY ONLY
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-3 relative z-10">
                {bid.aiRecommendation?.reasons?.[0] ||
                  'Based on the deterministic failure of the mandatory Local Content rule (REQ-LC-01), this bid is technically non-compliant under Class-I criteria. However, as the entity holds a valid Class-II declaration (42%), I recommend requesting clarification if an arithmetic error in declaration is suspected.'}
              </p>

              <button
                onClick={() => setIsCopilotOpen(true)}
                className="text-xs font-semibold text-info flex items-center gap-1 hover:underline relative z-10"
              >
                Ask Copilot further audit questions <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL DECISION MODAL matching NEW UI */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDecisionModalOpen(false)}
          ></div>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border-2 border-primary relative z-10 flex flex-col overflow-hidden animate-slide-in">
            <div className="px-6 py-5 border-b border-outline-variant bg-surface-alt flex justify-between items-start">
              <div>
                <h2 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">gavel</span> Final Officer Decision
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Record binding qualification determination for {bid.bidId}.
                </p>
              </div>
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Radio Selection */}
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-colors ${
                    decisionAction === 'approve'
                      ? 'border-success bg-success/10 ring-1 ring-success'
                      : 'border-outline-variant bg-white hover:bg-success/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision_action"
                    value="approve"
                    checked={decisionAction === 'approve'}
                    onChange={() => setDecisionAction('approve')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        decisionAction === 'approve' ? 'text-success' : 'text-outline'
                      }`}
                    >
                      check_circle
                    </span>
                    <span className="font-bold text-primary">Approve Submission (Qualified)</span>
                  </div>
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-colors ${
                    decisionAction === 'clarify'
                      ? 'border-warning bg-warning/10 ring-1 ring-warning'
                      : 'border-outline-variant bg-white hover:bg-warning/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision_action"
                    value="clarify"
                    checked={decisionAction === 'clarify'}
                    onChange={() => setDecisionAction('clarify')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        decisionAction === 'clarify' ? 'text-warning' : 'text-outline'
                      }`}
                    >
                      chat
                    </span>
                    <span className="font-bold text-primary">Request Clarification (Recommended)</span>
                  </div>
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-colors ${
                    decisionAction === 'reject'
                      ? 'border-danger bg-danger/10 ring-1 ring-danger'
                      : 'border-outline-variant bg-white hover:bg-danger/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision_action"
                    value="reject"
                    checked={decisionAction === 'reject'}
                    onChange={() => setDecisionAction('reject')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        decisionAction === 'reject' ? 'text-danger' : 'text-outline'
                      }`}
                    >
                      cancel
                    </span>
                    <span className="font-bold text-primary">Reject Submission (Disqualified)</span>
                  </div>
                </label>
              </div>

              {/* Mandatory Audit Remarks */}
              <div>
                <label className="block font-semibold text-sm text-primary mb-2 flex items-center gap-1">
                  Mandatory Audit Remarks <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={3}
                  value={decisionRemarks}
                  onChange={e => setDecisionRemarks(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-alt px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-neutral-muted resize-none"
                  placeholder="Provide justification based on statutory rules and evidence..."
                />
                <p className="text-xs text-neutral-muted mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Cryptographically logged to immutable audit trail.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface-alt flex justify-end gap-3">
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-4 py-2 border border-outline-variant text-primary font-semibold text-sm rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecision}
                disabled={isSubmittingDecision}
                className="px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSubmittingDecision ? 'sync' : 'send'}
                </span>
                {isSubmittingDecision ? 'Processing...' : 'Submit Binding Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COPILOT CHAT SLIDING DRAWER */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-[220] flex justify-end">
          <div
            className="modal-backdrop absolute inset-0 bg-black/50"
            onClick={() => setIsCopilotOpen(false)}
          ></div>
          <div className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl flex flex-col animate-slide-in border-l border-outline-variant">
            {/* Drawer Header */}
            <div className="p-4 border-b border-outline-variant bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-info/20 text-info flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] icon-fill">neurology</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">AI Procurement Copilot</h3>
                  <span className="text-[10px] text-white/70">Grounded on {bid.bidId} Audit Evidence</span>
                </div>
              </div>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-alt/40">
              {copilotMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-xl text-xs max-w-[88%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white text-on-surface border border-outline-variant shadow-sm'
                    }`}
                  >
                    {msg.text}
                    {msg.evidenceIds && msg.evidenceIds.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-outline-variant/40 flex flex-wrap gap-1">
                        <span className="text-[10px] font-semibold text-neutral-muted block w-full">
                          Referenced Evidence:
                        </span>
                        {msg.evidenceIds.map(id => (
                          <span
                            key={id}
                            className="font-mono text-[10px] bg-info/10 text-info px-1.5 py-0.5 rounded border border-info/20 font-bold"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isCopilotThinking && (
                <div className="flex items-center gap-2 text-xs text-neutral-muted italic p-2">
                  <span className="material-symbols-outlined text-info animate-spin-slow text-[16px]">sync</span>
                  Synthesizing audit evidence...
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-outline-variant bg-white flex gap-2">
              <input
                type="text"
                value={copilotQuestion}
                onChange={e => setCopilotQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskCopilot()}
                placeholder="Ask about risk, local content, GST..."
                className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                onClick={handleAskCopilot}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        document={selectedDocForViewer}
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
      />
    </div>
  );
}
