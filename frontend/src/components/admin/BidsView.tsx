'use client';
import React, { useState } from 'react';
import {
  Gavel,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  SlidersHorizontal,
  FileCheck2,
  Download,
  ShieldCheck,
  History,
  X,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Lock,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { mockBidders } from '@/lib/mockData';
import { Bidder, BidStatus, RiskLevel } from '@/types';
import { exportBidsLedgerPdf } from '@/lib/export/exportUtils';

export const BidsView: React.FC = () => {
  const [bidders, setBidders] = useState<Bidder[]>(mockBidders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  
  // Dual-pane Evidence Viewer Modal
  const [evidenceModalBid, setEvidenceModalBid] = useState<Bidder | null>(null);
  
  // Clarification Modal
  const [clarificationModal, setClarificationModal] = useState(false);
  const [clarificationMsg, setClarificationMsg] = useState('Please clarify local value addition calculation in Make in India declaration (Page 1, Paragraph 2) within 48 hours.');

  // Administrative Override Modal
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [newOverrideStatus, setNewOverrideStatus] = useState<BidStatus>('COMPLIANCE_PASSED');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalBid || !overrideReason) return;

    setBidders(prev => prev.map(b => b.id === evidenceModalBid.id ? { ...b, status: newOverrideStatus } : b));
    setOverrideModal(false);
    showToast(`Audit Logged: Bid ${evidenceModalBid.bidId} status manually updated to ${newOverrideStatus}. Reason: "${overrideReason}"`);
    setOverrideReason('');
  };

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalBid) return;
    setBidders(prev => prev.map(b => b.id === evidenceModalBid.id ? { ...b, status: 'CLARIFICATION_REQUIRED' } : b));
    setClarificationModal(false);
    showToast(`Clarification request dispatched to ${evidenceModalBid.name} via GeM Portal.`);
  };

  const filteredBids = bidders.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bidId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tenderNumber && b.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || b.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Bid Evaluation Oversight</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {bidders.length} Submitted Bid Packages
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform-wide bid compliance status, risk scores, verification results & immutable audit logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try {
                exportBidsLedgerPdf(filteredBids);
                showToast('Exporting universal bids compliance ledger as PDF...');
              } catch (err) {
                showToast('Failed to export Bids Ledger.', 'error');
              }
            }}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bids Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bidder name, Bid ID, tender #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All Risk Bands</option>
              <option value="LOW">LOW Risk (90-100)</option>
              <option value="MEDIUM">MEDIUM Risk (70-89)</option>
              <option value="HIGH">HIGH Risk (50-69)</option>
              <option value="CRITICAL">CRITICAL Risk (0-49)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Evaluation Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANCE_PASSED">Compliance Passed</option>
              <option value="UNDER_EVALUATION">Under Evaluation</option>
              <option value="CLARIFICATION_REQUIRED">Clarification Required</option>
              <option value="COMPLIANCE_FAILED">Compliance Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Bidder Details</th>
                <th className="p-4">Tender Reference</th>
                <th className="p-4">Compliance Score</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Quoted Value</th>
                <th className="p-4">Evaluation Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBids.map((bid) => (
                <tr key={bid.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Bidder */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-extrabold text-slate-700 shrink-0">
                        {bid.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#0F172A]">{bid.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{bid.bidId}</span>
                          <span>•</span>
                          <span>GST: {bid.gstin}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tender */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{bid.tenderNumber || 'GEM/2026/B/1024'}</div>
                    <div className="text-[11px] text-slate-500">{bid.organization || 'CPCL Procurement'}</div>
                  </td>

                  {/* Compliance Score */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bid.complianceScore >= 90 ? 'bg-emerald-500' :
                            bid.complianceScore >= 70 ? 'bg-amber-500' :
                            bid.complianceScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${bid.complianceScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800">{bid.complianceScore}%</span>
                    </div>
                  </td>

                  {/* Risk Level */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border ${
                      bid.riskLevel === 'LOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      bid.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      bid.riskLevel === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {bid.riskLevel === 'LOW' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {bid.riskLevel === 'MEDIUM' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {bid.riskLevel === 'HIGH' && <AlertTriangle className="w-3 h-3 text-orange-600" />}
                      {bid.riskLevel === 'CRITICAL' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {bid.riskLevel} RISK
                    </span>
                  </td>

                  {/* Quoted Value */}
                  <td className="p-4 font-mono font-bold text-slate-800">
                    {bid.financialBid}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      bid.status === 'COMPLIANCE_PASSED' ? 'bg-emerald-100 text-emerald-800' :
                      bid.status === 'UNDER_EVALUATION' ? 'bg-blue-100 text-blue-800' :
                      bid.status === 'CLARIFICATION_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {bid.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEvidenceModalBid(bid)}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                        title="View Verification Evidence Matrix"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Evidence Viewer</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          DUAL-PANEL VERIFICATION EVIDENCE VIEWER (From Reference UI)
          ========================================================= */}
      {evidenceModalBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    {evidenceModalBid.bidId}
                  </span>
                  <h2 className="text-lg font-bold text-[#0F172A]">{evidenceModalBid.name}</h2>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    evidenceModalBid.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                    evidenceModalBid.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {evidenceModalBid.riskLevel} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tender: {evidenceModalBid.tenderNumber || 'GEM/2026/B/1024'} • Submitted {evidenceModalBid.submittedAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOverrideModal(true)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Administrative Override</span>
                </button>
                <button 
                  onClick={() => setEvidenceModalBid(null)} 
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split 50/50 View */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
              
              {/* LEFT PANEL: Original Document Artifact */}
              <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-r border-slate-200 flex flex-col custom-scrollbar">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Make_In_India_Declaration.pdf (Page 1)
                  </span>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">
                    Extracted Doc Artifact
                  </span>
                </div>

                {/* Simulated Real Government Document Page */}
                <div className="flex-1 bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-md font-serif text-xs leading-relaxed text-slate-800 space-y-4 relative">
                  <div className="text-center border-b border-slate-200 pb-4">
                    <h3 className="font-bold text-sm text-black tracking-wide uppercase">Local Content Declaration (Class-I / Class-II)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">As per Public Procurement (Preference to Make in India) Order 2017</p>
                  </div>

                  <p>
                    We hereby certify that the goods/services offered under Bid ID: <span className="font-mono font-bold">{evidenceModalBid.bidId}</span> meet the minimum local content requirements as defined in the tender specifications.
                  </p>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 my-2">
                    <p className="font-sans font-semibold">
                      1. Percentage of Local Content: <span className="underline font-bold bg-amber-200 px-1 py-0.5 rounded animate-pulse">{evidenceModalBid.localContentPercent || 42}%</span>
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1 font-sans">
                      (Deterministically Extracted by OCR Pipeline • Page 1, Paragraph 2)
                    </p>
                  </div>

                  <p>
                    2. Location where local value addition is made: Plot 44, Electronic City, Phase II, Bengaluru, Karnataka, PIN 560100.
                  </p>

                  {/* Signatures & Seal */}
                  <div className="pt-8 mt-6 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <p className="font-bold text-black font-sans">Authorized Signatory</p>
                      <div className="w-28 h-10 bg-blue-50/50 border border-blue-200/50 mt-1 flex items-center justify-center font-sans italic text-blue-900/60 rotate-[-5deg] text-[11px]">
                        TechCorp Auth
                      </div>
                      <p className="mt-1 font-sans text-slate-600">Director, Procurement</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-black font-sans">Date</p>
                      <p className="font-mono text-slate-600 mt-0.5">14 Oct 2026</p>
                      <div className="w-16 h-16 border-2 border-rose-500 rounded-full mt-2 flex items-center justify-center text-rose-500 font-bold text-[9px] uppercase rotate-[15deg] opacity-70 ml-auto">
                        Company<br/>Seal
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: AI Compliance Findings */}
              <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto flex flex-col space-y-4 bg-slate-50 custom-scrollbar">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Verification Engine Findings</span>
                  </h3>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    24 Rules Evaluated
                  </span>
                </div>

                {/* Finding 1: PASS */}
                <div className="border border-emerald-300 bg-white rounded-xl p-3.5 flex gap-3 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">GST Validity Check</h4>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                        Govt API • 45ms
                      </span>
                    </div>
                    <p className="text-emerald-700 font-medium mt-1">
                      Status ACTIVE verified directly against GSTN database checksum.
                    </p>
                  </div>
                </div>

                {/* Finding 2: FAIL (Local Content Threshold) */}
                <div className="border-2 border-rose-500 bg-white rounded-xl p-4 flex gap-3.5 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

                  <div className="flex-1 text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Local Content Threshold</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Rule ID: REQ-LC-01</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs">
                        Critical Failure
                      </span>
                    </div>

                    {/* Data Comparison */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block mb-0.5 uppercase font-bold">Tender Requirement</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">≥ 50%</span>
                      </div>
                      <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                        <span className="text-[10px] text-rose-600 block mb-0.5 uppercase font-bold">AI Extracted Value</span>
                        <span className="font-mono font-bold text-rose-700 text-sm">{evidenceModalBid.localContentPercent || 42}%</span>
                      </div>
                    </div>

                    {/* AI Trace */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                      <strong className="text-[#0F172A] flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Trace:
                      </strong>
                      Value deterministically extracted from attached document <i>&apos;Make_In_India_Declaration.pdf&apos;</i> (Page 1, Paragraph 2). The extracted numerical value ({evidenceModalBid.localContentPercent || 42}) falls below the mandatory Class-I local supplier threshold (50) required by Rule ID: REQ-LC-01. Confidence: 98.4%.
                    </div>

                    {/* Contextual Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => setClarificationModal(true)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Request Clarification</span>
                      </button>
                      <button
                        onClick={() => setOverrideModal(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs border border-slate-200 transition-colors"
                      >
                        <span>Override Finding</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Copilot Recommendation */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Procurement Copilot Recommendation</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Based on the deterministic failure of the mandatory Local Content rule (REQ-LC-01), this bid is technically non-compliant. However, as the entity holds a valid Class-II certification, I recommend requesting clarification if an arithmetic error in declaration is suspected, otherwise proceed with technical disqualification.
                  </p>
                  <button
                    onClick={() => setClarificationModal(true)}
                    className="text-blue-700 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1"
                  >
                    <span>Proceed with clarification trigger</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* CLARIFICATION MODAL */}
      {clarificationModal && evidenceModalBid && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Request Statutory Clarification</h3>
                <p className="text-xs text-slate-500">Bidder: {evidenceModalBid.name} • {evidenceModalBid.bidId}</p>
              </div>
              <button onClick={() => setClarificationModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendClarification} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clarification Notice Text *</label>
                <textarea
                  required
                  rows={4}
                  value={clarificationMsg}
                  onChange={(e) => setClarificationMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                A formal notice will be dispatched through the GeM portal and recorded in the audit trail. The bidder has 48 hours to reply.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClarificationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Clarification Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMINISTRATIVE OVERRIDE MODAL */}
      {overrideModal && evidenceModalBid && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Administrative Override & Audit Action</h3>
                <p className="text-xs text-slate-500">Bid ID: {evidenceModalBid.bidId} • {evidenceModalBid.name}</p>
              </div>
              <button onClick={() => setOverrideModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Statutory Audit Requirement Notice:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All administrative status overrides are cryptographically recorded in the platform immutable audit ledger with your Actor ID, timestamp, and justification reason.
              </p>
            </div>

            <form onSubmit={handleAdminOverride} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Evaluation Status *</label>
                <select
                  value={newOverrideStatus}
                  onChange={(e) => setNewOverrideStatus(e.target.value as BidStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                >
                  <option value="COMPLIANCE_PASSED">COMPLIANCE PASSED (Force Qualification)</option>
                  <option value="CLARIFICATION_REQUIRED">CLARIFICATION REQUIRED (Trigger Letter)</option>
                  <option value="UNDER_EVALUATION">UNDER EVALUATION (Re-open Scrutiny)</option>
                  <option value="COMPLIANCE_FAILED">COMPLIANCE FAILED (Force Disqualification)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory Justification / Audit Remarks *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the official reference, statutory order, or committee approval enabling this override..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-purple-600/20"
                >
                  <History className="w-4 h-4" />
                  <span>Commit Audit Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
