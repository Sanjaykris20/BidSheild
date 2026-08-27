import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  RefreshCw,
  ArrowRight,
  UploadCloud,
  Sparkles,
  ChevronRight,
  X,
  Search
} from 'lucide-react';

// --- INITIAL SEED DATA ---
const INITIAL_BIDDERS = [
  {
    id: 'BID-8819',
    name: 'Alpha Defense Logistics Pvt Ltd',
    gstin: '33ABCDE1234F1Z5',
    bidRef: 'CPCL/2026/899120-B1',
    submittedDate: '2026-08-24',
    score: 78.5,
    riskBucket: 'MEDIUM',
    status: 'Under Review',
    passedCount: 3,
    warningCount: 1,
    failCount: 0,
    primaryGap: 'Local Content declaration (45.0%) is 5.0% below Class-I threshold (50.0%).',
    rules: [
      {
        id: 'RULE-MII',
        title: 'Make-In-India (MII) Local Content %',
        category: 'Statutory',
        expected: '≥ 50.0% (Class-I Local Supplier)',
        extracted: '45.0% (Class-II Status)',
        status: 'WARNING',
        sourceDoc: 'Doc_MII_SelfDeclaration.pdf (p. 2)',
        confidence: 96.2,
        snippetHtml: 'Pursuant to Public Procurement Order 2017, we declare that <mark class="bg-amber-200 text-slate-900 font-bold px-1 rounded">local content added in manufacturing is 45.0%</mark> at our Chennai plant.',
        aiExplanation: 'Tender criteria mandates minimum 50% for Class-I Local Supplier preference. The bidder meets Class-II Local Supplier status (45%). Require clarification on Class-II evaluation allowance.'
      },
      {
        id: 'RULE-GST',
        title: 'GSTIN Portal Registration & Filings',
        category: 'Statutory',
        expected: 'Active GSTIN & Regular GSTR-3B',
        extracted: '33ABCDE1234F1Z5 (ACTIVE)',
        status: 'PASS',
        sourceDoc: 'GSTN Portal Direct API Query',
        confidence: 100.0,
        snippetHtml: '<mark class="bg-emerald-200 text-slate-900 font-bold px-1 rounded">Status: ACTIVE | Taxpayer Type: Regular | GSTR-3B: Up-to-date through July 2026.</mark>',
        aiExplanation: 'Direct API cross-reference confirms active taxpayer status with no default flags on the GSTN registry.'
      },
      {
        id: 'RULE-UDYAM',
        title: 'Udyam MSME Qualification',
        category: 'Statutory',
        expected: 'Valid Small Enterprise Certificate',
        extracted: 'UDYAM-TN-02-0012345 (Small)',
        status: 'PASS',
        sourceDoc: 'Udyam_Registration_Cert.pdf (p. 1)',
        confidence: 99.1,
        snippetHtml: '<mark class="bg-emerald-200 text-slate-900 font-bold px-1 rounded">Udyam Registration: UDYAM-TN-02-0012345 | Enterprise Type: SMALL | Activity: MANUFACTURING</mark>',
        aiExplanation: 'Udyam portal lookup verifies valid Small Enterprise status. Bidder is eligible for tender fee waiver.'
      }
    ]
  },
  {
    id: 'BID-8820',
    name: 'Bravo Heavy Engineering Corp',
    gstin: '27AAACB9876G1Z2',
    bidRef: 'CPCL/2026/899120-B2',
    submittedDate: '2026-08-23',
    score: 94.0,
    riskBucket: 'LOW',
    status: 'Qualified',
    passedCount: 3,
    warningCount: 0,
    failCount: 0,
    primaryGap: 'None. All statutory and technical checks passed.',
    rules: [
      {
        id: 'RULE-MII',
        title: 'Make-In-India (MII) Local Content %',
        category: 'Statutory',
        expected: '≥ 50.0% (Class-I Local Supplier)',
        extracted: '68.5% (Class-I Qualified)',
        status: 'PASS',
        sourceDoc: 'Annexure_MII_Bravo.pdf (p. 1)',
        confidence: 98.5,
        snippetHtml: '<mark class="bg-emerald-200 text-slate-900 font-bold px-1 rounded">Local value addition is certified as 68.5% based on indigenous raw material sourcing.</mark>',
        aiExplanation: 'Exceeds minimum Class-I local content threshold by +18.5%.'
      }
    ]
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-1001',
    timestamp: '2026-08-24 20:18:02 IST',
    action: 'GSTN_PORTAL_API_FETCH',
    bidderName: 'Alpha Defense Logistics Pvt Ltd',
    officer: 'SYSTEM_AUTOMATION',
    details: 'GSTN API queried for 33ABCDE1234F1Z5. Verification returned ACTIVE status.',
    statusTag: 'SUCCESS'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-08-24 20:18:05 IST',
    action: 'RULE_DISCREPANCY_FLAGGED',
    bidderName: 'Alpha Defense Logistics Pvt Ltd',
    officer: 'COMPLIANCE_ENGINE_V2',
    details: 'MII Local Content (45%) flagged below 50% Class-I requirement. Overall score weighted at 78.50.',
    statusTag: 'WARNING'
  }
];

// Minimal allowlist sanitizer (no external deps available in this runtime).
// Escapes all HTML, then re-enables only the specific <mark class="..."> ... </mark>
// pattern used by our own seed data for OCR highlight snippets.
function sanitizeOcrSnippet(raw) {
  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const markRegex = /<mark class="([a-zA-Z0-9-_ :/.]*)">([\s\S]*?)<\/mark>/g;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = markRegex.exec(raw)) !== null) {
    result += escapeHtml(raw.slice(lastIndex, match.index));
    const safeClass = escapeHtml(match[1]);
    const innerText = escapeHtml(match[2]);
    result += `<mark class="${safeClass}">${innerText}</mark>`;
    lastIndex = markRegex.lastIndex;
  }
  result += escapeHtml(raw.slice(lastIndex));
  return result;
}

export default function ProcurementOfficerDashboard() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [bidders, setBidders] = useState(INITIAL_BIDDERS);
  const [selectedBidderId, setSelectedBidderId] = useState(INITIAL_BIDDERS[0].id);
  const [selectedRuleIdx, setSelectedRuleIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const [wizardStep, setWizardStep] = useState(1);
  const [tenderRef, setTenderRef] = useState('CPCL/2026/T-9041');
  const [tenderTitle, setTenderTitle] = useState('Supply of High-Pressure Cryogenic Storage Valves');
  const [miiThreshold, setMiiThreshold] = useState(50);
  const [isParsingRfp, setIsParsingRfp] = useState(false);

  const activeBidder = useMemo(() => {
    return bidders.find((b) => b.id === selectedBidderId) || bidders[0];
  }, [bidders, selectedBidderId]);

  const activeRule = useMemo(() => {
    return activeBidder.rules[selectedRuleIdx] || activeBidder.rules[0];
  }, [activeBidder, selectedRuleIdx]);

  const filteredBidders = useMemo(() => {
    if (!searchQuery.trim()) return bidders;
    const query = searchQuery.toLowerCase();
    return bidders.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.gstin.toLowerCase().includes(query) ||
        b.bidRef.toLowerCase().includes(query)
    );
  }, [bidders, searchQuery]);

  const sanitizeSnippet = useCallback((htmlSnippet) => {
    return { __html: sanitizeOcrSnippet(htmlSnippet) };
  }, []);

  const handleReRunVerification = async () => {
    setIsVerifying(true);
    setVerificationSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsVerifying(false);
    setVerificationSuccess(true);
    setTimeout(() => setVerificationSuccess(false), 3500);
  };

  const handleRecordDecision = (statusDecision) => {
    if (!officerRemarks.trim()) {
      alert('Officer justification remarks are required to submit an official decision.');
      return;
    }

    setBidders((prev) =>
      prev.map((b) => (b.id === activeBidder.id ? { ...b, status: statusDecision } : b))
    );

    const newAuditEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
      action: `OFFICER_DECISION_${statusDecision.toUpperCase().replace(/\s+/g, '_')}`,
      bidderName: activeBidder.name,
      officer: 'R. K. Sharma (CPCL-7821)',
      details: `Decision recorded: ${statusDecision}. Justification: "${officerRemarks}"`,
      statusTag:
        statusDecision === 'Qualified'
          ? 'SUCCESS'
          : statusDecision === 'Disqualified'
          ? 'DANGER'
          : 'WARNING'
    };

    setAuditLogs((prev) => [newAuditEntry, ...prev]);
    setIsModalOpen(false);
    setOfficerRemarks('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans text-xs">
      <div className="bg-slate-950 text-slate-300 px-4 py-1.5 flex flex-wrap justify-between items-center border-b border-slate-800 text-[11px]">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-200">Ministry of Petroleum & Natural Gas | CPCL Gateway</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Environment: <strong className="text-emerald-400 font-mono">PRODUCTION</strong></span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[10px]">
          <span>Portal Sync: <strong className="text-slate-200">2026-08-25 18:00 IST</strong></span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">256-BIT ENCRYPTED</span>
        </div>
      </div>

      <header className="bg-blue-950 text-white border-b-2 border-amber-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-amber-600 flex items-center justify-center font-bold text-white shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-base uppercase">GeM Compliance Engine</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                  SIH-26100
                </span>
              </div>
              <p className="text-[11px] text-slate-300">CPCL Procurement Officer Evaluation Module</p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-blue-900/60 p-1 rounded border border-blue-800 font-semibold">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'DASHBOARD' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏢 Matrix Dashboard
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'EVIDENCE' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              🔎 Evidence Viewer
            </button>
            <button
              onClick={() => setActiveTab('BLUEPRINT_WIZARD')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'BLUEPRINT_WIZARD' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              ➕ Tender RFP Wizard
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'AUDIT' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              📜 Audit Trail ({auditLogs.length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-slate-100">R. K. Sharma</div>
              <div className="text-[10px] text-amber-400 font-mono">Senior Procurement Officer</div>
            </div>
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              PO
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-5">
            <div className="bg-white rounded border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 border border-slate-300 text-slate-700 font-bold">
                    TENDER: CPCL/2026/899120
                  </span>
                  <span className="font-semibold text-slate-500">Est. Value: ₹ 14.50 Cr</span>
                </div>
                <h1 className="text-base font-bold text-slate-900 mt-1">
                  High-Pressure Industrial Storage & Valve Assembly Systems
                </h1>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <label className="font-bold text-slate-700 whitespace-nowrap">Active Bidder:</label>
                <select
                  value={selectedBidderId}
                  onChange={(e) => {
                    setSelectedBidderId(e.target.value);
                    setSelectedRuleIdx(0);
                  }}
                  className="bg-slate-50 border border-slate-300 font-bold text-slate-900 rounded p-2 focus:ring-1 focus:ring-blue-900 w-full md:w-64"
                >
                  {bidders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.score}%)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setActiveTab('EVIDENCE')}
                  className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded flex items-center space-x-1 whitespace-nowrap shadow-sm"
                >
                  <span>Inspect Evidence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-slate-300 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compliance Index</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeBidder.score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                  <div className="font-semibold text-amber-700 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Status: {activeBidder.status}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-slate-800 text-sm bg-amber-50 font-mono">
                  {activeBidder.score}%
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-slate-300 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rule Checks Breakdown</div>
                <div className="flex items-center justify-between mt-2.5 text-center">
                  <div className="bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <div className="text-base font-bold text-emerald-700">{activeBidder.passedCount}</div>
                    <div className="text-[9px] font-bold text-emerald-800 uppercase">Passed</div>
                  </div>
                  <div className="bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    <div className="text-base font-bold text-amber-700">{activeBidder.warningCount}</div>
                    <div className="text-[9px] font-bold text-amber-800 uppercase">Warning</div>
                  </div>
                  <div className="bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                    <div className="text-base font-bold text-rose-700">{activeBidder.failCount}</div>
                    <div className="text-[9px] font-bold text-rose-800 uppercase">Failed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-slate-300 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Profile Classification</div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-extrabold rounded border ${
                      activeBidder.riskBucket === 'LOW'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {activeBidder.riskBucket} RISK
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                  Evaluated via automated API cross-validation & OCR regex heuristics.
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-slate-300 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Gap Identified</div>
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 font-semibold leading-snug">
                  {activeBidder.primaryGap}
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
              <div className="p-3 bg-slate-800 text-white font-bold flex justify-between items-center">
                <span className="uppercase tracking-wider">Submitted Bids Comparative Matrix</span>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by bidder, GSTIN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-700 text-white placeholder-slate-400 pl-7 pr-2 py-1 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 w-48"
                    />
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase text-[10px]">
                    <th className="p-3">Bidder Organization</th>
                    <th className="p-3">GSTIN ID</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredBidders.map((b) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50 transition ${
                        b.id === selectedBidderId ? 'bg-blue-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-900">{b.name}</td>
                      <td className="p-3 font-mono text-[11px]">{b.gstin}</td>
                      <td className="p-3 text-slate-600">{b.submittedDate}</td>
                      <td className="p-3 font-mono font-bold">{b.score} / 100</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            b.riskBucket === 'LOW'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.riskBucket}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{b.status}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedBidderId(b.id);
                            setActiveTab('EVIDENCE');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[10px]"
                        >
                          Inspect Document Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'EVIDENCE' && (
          <div className="space-y-5">
            <div className="bg-white rounded border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 border border-slate-300 text-slate-700 font-bold">
                    {activeBidder.bidRef}
                  </span>
                  <span className="font-bold text-slate-600">Bidder: {activeBidder.name}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Evidence Traceability & OCR Extraction Viewport
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReRunVerification}
                  disabled={isVerifying}
                  className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 disabled:bg-slate-400 text-white font-semibold rounded flex items-center space-x-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Re-Running APIs...' : 'Re-Run Verification Engine'}</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded flex items-center space-x-1.5 shadow-sm"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Record Officer Decision</span>
                </button>
              </div>
            </div>

            {verificationSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Automated statutory verification succeeded across GSTN, Udyam, and CPPP portals.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-white rounded border border-slate-300 shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-800 text-white font-bold flex justify-between items-center">
                  <span className="uppercase tracking-wider">Statutory Checklist Matrix</span>
                  <span className="text-[10px] text-slate-300 font-mono">Select item to trace</span>
                </div>

                <div className="divide-y divide-slate-200 overflow-y-auto max-h-[520px]">
                  {activeBidder.rules.map((rule, idx) => (
                    <div
                      key={rule.id}
                      onClick={() => setSelectedRuleIdx(idx)}
                      className={`p-3.5 cursor-pointer transition ${
                        selectedRuleIdx === idx
                          ? 'bg-blue-50 border-l-4 border-blue-900'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{rule.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Target: <span className="font-semibold text-slate-800">{rule.expected}</span>
                          </div>
                          <div
                            className={`text-[11px] font-mono font-bold mt-0.5 ${
                              rule.status === 'PASS' ? 'text-emerald-800' : 'text-amber-800'
                            }`}
                          >
                            Extracted: {rule.extracted}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
                            rule.status === 'PASS'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {rule.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white rounded border border-slate-300 shadow-sm flex flex-col">
                <div className="p-3 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
                  <span className="font-bold text-slate-800 uppercase tracking-wide">OCR Document Evidence Inspector</span>
                  <span className="font-mono text-[11px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Source: {activeRule.sourceDoc}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] uppercase">Rule Target</span>
                      <div className="font-bold text-slate-900 mt-0.5">{activeRule.expected}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] uppercase">Extracted Value</span>
                      <div className="font-bold text-amber-900 mt-0.5">{activeRule.extracted}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] uppercase">Source Document</span>
                      <div className="font-bold text-slate-900 mt-0.5 truncate">{activeRule.sourceDoc.split(' ')[0]}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold text-[10px] uppercase">Confidence</span>
                      <div className="font-mono font-bold text-blue-900 mt-0.5">{activeRule.confidence}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-600 uppercase mb-1 text-[10px]">Extracted Text Context Snippet</div>
                    <div className="bg-amber-50/70 border-2 border-amber-300 p-3.5 rounded font-mono text-slate-900 leading-relaxed shadow-inner">
                      <p dangerouslySetInnerHTML={sanitizeSnippet(activeRule.snippetHtml)} />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-900 p-3.5 text-slate-800 space-y-1">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-700" />
                      <span>Compliance Rule Audit Assessment</span>
                    </div>
                    <p className="text-slate-700 leading-normal text-[11px]">{activeRule.aiExplanation}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono">
                      SHA256: 4f8a92b1001e8c99a22f310...
                    </span>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                    >
                      Record Officer Decision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BLUEPRINT_WIZARD' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-white p-5 rounded border border-slate-300 shadow-sm space-y-3">
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  Tender Compliance Blueprint Wizard (RFP Parser)
                </h1>
                <p className="text-slate-500 mt-0.5">
                  Upload RFP tender documents to extract Make-In-India percentages, turnover thresholds, and statutory criteria into an active evaluation blueprint.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 border-t pt-3 font-bold text-center">
                {[
                  { num: 1, label: '1. Identifier' },
                  { num: 2, label: '2. Upload RFP' },
                  { num: 3, label: '3. Rule Tuning' },
                  { num: 4, label: '4. Deploy' }
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`p-1.5 rounded border ${
                      wizardStep === s.num
                        ? 'bg-blue-950 text-white border-blue-950'
                        : wizardStep > s.num
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {wizardStep === 1 && (
              <div className="bg-white p-5 rounded border border-slate-300 shadow-sm space-y-3">
                <h2 className="font-bold text-slate-900 border-b pb-2">Step 1: Tender Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Tender Reference Number</label>
                    <input
                      type="text"
                      value={tenderRef}
                      onChange={(e) => setTenderRef(e.target.value)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Procurement Category</label>
                    <select className="w-full mt-1 p-2 border border-slate-300 rounded">
                      <option>Goods - Industrial Machinery & Valves</option>
                      <option>Works - Refinery Infrastructure</option>
                      <option>Services - Technical Consultancy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Tender Title</label>
                  <input
                    type="text"
                    value={tenderTitle}
                    onChange={(e) => setTenderTitle(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded font-bold"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-blue-950 text-white font-bold rounded flex items-center space-x-1"
                  >
                    <span>Proceed to Document Upload</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="bg-white p-5 rounded border border-slate-300 shadow-sm space-y-3">
                <h2 className="font-bold text-slate-900 border-b pb-2">Step 2: Upload RFP PDF</h2>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 space-y-2">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">Select or Drag RFP Specification PDF</p>
                  <p className="text-slate-500 text-[10px]">Automatically extracts MII thresholds and statutory clauses.</p>

                  <button
                    onClick={() => {
                      setIsParsingRfp(true);
                      setTimeout(() => {
                        setIsParsingRfp(false);
                        setWizardStep(3);
                      }, 1300);
                    }}
                    disabled={isParsingRfp}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                  >
                    {isParsingRfp ? 'AI Engine Parsing RFP...' : 'Simulate RFP File Upload'}
                  </button>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={() => setWizardStep(1)} className="px-4 py-2 bg-slate-200 font-bold text-slate-700 rounded">
                    Back
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="bg-white p-5 rounded border border-slate-300 shadow-sm space-y-3">
                <h2 className="font-bold text-slate-900 border-b pb-2">Step 3: Verify Extracted Rules</h2>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Make-In-India (MII) Class-I Threshold (%)</label>
                    <input
                      type="number"
                      value={miiThreshold}
                      onChange={(e) => setMiiThreshold(Number(e.target.value))}
                      className="w-full mt-1 p-2 border border-slate-300 rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">MSME Qualification Exemption</label>
                    <select className="w-full mt-1 p-2 border border-slate-300 rounded">
                      <option>Micro & Small Enterprises (MSE Only)</option>
                      <option>Medium Enterprises Allowed</option>
                      <option>No Exemption</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={() => setWizardStep(2)} className="px-4 py-2 bg-slate-200 font-bold text-slate-700 rounded">
                    Back
                  </button>
                  <button onClick={() => setWizardStep(4)} className="px-4 py-2 bg-blue-950 text-white font-bold rounded">
                    Publish Blueprint
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="bg-white p-6 rounded border border-slate-300 shadow-sm text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h2 className="text-base font-bold text-slate-900">Tender Blueprint Successfully Deployed</h2>
                <p className="text-slate-600">
                  Compliance criteria active for <strong>{tenderRef}</strong> ({tenderTitle}).
                </p>
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setActiveTab('DASHBOARD');
                  }}
                  className="px-4 py-2 bg-blue-950 text-white font-bold rounded"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-slate-300 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">System & Procurement Officer Audit Trail</h2>
                <p className="text-slate-500">Immutable ledger logging API verifications and human officer overrides.</p>
              </div>
              <span className="font-mono font-bold bg-slate-100 px-3 py-1 border rounded text-slate-700">
                Log Entries: {auditLogs.length}
              </span>
            </div>

            <div className="bg-white rounded border border-slate-300 shadow-sm divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-500">{log.timestamp}</span>
                      <span className="font-bold text-blue-950 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                        log.statusTag === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-900'
                          : log.statusTag === 'DANGER'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {log.statusTag}
                    </span>
                  </div>
                  <div className="text-slate-800 font-semibold">{log.details}</div>
                  <div className="text-slate-500 text-[10px]">
                    Bidder: <strong>{log.bidderName}</strong> • Recorded By: <strong>{log.officer}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-400 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 uppercase">
                Procurement Officer Formal Decision Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Recording formal decision for <strong>{activeBidder.name}</strong> ({activeBidder.bidRef}). This action appends an immutable entry to the CPPP audit ledger.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mandatory Officer Justification & Remarks <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-900"
                placeholder="Enter justification for approval, rejection, or clarification notice..."
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => handleRecordDecision('Qualified')}
                className="px-2 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded"
              >
                Qualify
              </button>
              <button
                onClick={() => handleRecordDecision('Clarification Sent')}
                className="px-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
              >
                Seek Info
              </button>
              <button
                onClick={() => handleRecordDecision('Disqualified')}
                className="px-2 py-2 bg-rose-800 hover:bg-rose-900 text-white font-bold rounded"
              >
                Disqualify
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-200 border-t border-slate-300 py-2.5 text-center text-[10px] text-slate-600 mt-auto">
        Government e-Marketplace (GeM) • CPCL Procurement Engine • Problem Statement ID: 26100
      </footer>
    </div>
  );
}
