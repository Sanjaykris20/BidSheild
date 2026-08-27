'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/context/UserStoreContext';
import { ComplianceBadge } from '@/components/common/Badge';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  Building,
  DollarSign,
  Lock,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { formatIndianNumber, formatINR, generateHash } from '@/lib/utils';

function CreateBidWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenderIdParam = searchParams.get('tenderId') || 'GEM-2026-B-1024';

  const { profile, documents, tenders, createBid, addToast } = useUserStore();
  const tender = tenders.find((t) => t.id === tenderIdParam) || tenders[0];

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 2 state: Technical Proposal
  const [proposalFileName, setProposalFileName] = useState(
    'Technical_Proposal_CPCL_DataCenter_SCADA_FY27.pdf'
  );
  const [proposalHash, setProposalHash] = useState(
    'SHA256:4a9082bc192837461902837461902837'
  );

  // Step 3 state: Document Auto-Mapping
  const [mappedDocs, setMappedDocs] = useState<string[]>([
    'doc-gstn',
    'doc-pan',
    'doc-turnover',
    'doc-oem',
    'doc-mii',
    'doc-iso',
    'doc-udyam',
    'doc-exp',
  ]);

  // Step 4 state: Commercial Price Schedule
  const [basicRate, setBasicRate] = useState<number>(117372881);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [freightRate, setFreightRate] = useState<number>(0);

  const gstAmount = Math.round((basicRate * gstPercent) / 100);
  const totalQuoted = basicRate + gstAmount + freightRate;

  // Step 5 state: AI Pre-Check & Declaration
  const [isPreCheckRunning, setIsPreCheckRunning] = useState<boolean>(false);
  const [isPreCheckDone, setIsPreCheckDone] = useState<boolean>(false);
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRunPreCheck = () => {
    setIsPreCheckRunning(true);
    addToast({
      title: 'Executing AI Pre-Submission Audit',
      message: 'Evaluating 24 tender compliance rules against Vault records...',
      type: 'info',
    });

    setTimeout(() => {
      setIsPreCheckRunning(false);
      setIsPreCheckDone(true);
      addToast({
        title: 'Pre-Submission Audit Completed',
        message: '18 Rules Passed, 2 Warnings (Local Content 42% & OEM Expiry).',
        type: 'warning',
      });
    }, 1800);
  };

  const handleFinalSubmit = () => {
    if (!declarationAccepted) {
      addToast({
        title: 'Declaration Required',
        message: 'Please accept the mandatory tender declaration and integrity pledge.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const created = createBid({
        tenderId: tender.id,
        tenderNumber: tender.tenderNumber,
        tenderTitle: tender.title,
        organization: tender.organization,
        quotedValueINR: totalQuoted,
        priceBreakdown: {
          basicRateINR: basicRate,
          gstPercentage: gstPercent,
          gstAmountINR: gstAmount,
          freightAndInstallationINR: freightRate,
          totalQuotedINR: totalQuoted,
          totalQuotedFormatted: formatINR(totalQuoted),
        },
        attachedDocIds: mappedDocs,
      });

      setIsSubmitting(false);
      router.push(`/user/bids/${created.id}`);
    }, 1500);
  };

  const steps = [
    { num: 1, title: 'Entity Profile', desc: 'Statutory IDs' },
    { num: 2, title: 'Technical Proposal', desc: 'Upload PDF' },
    { num: 3, title: 'Vault Mapping', desc: 'Credentials' },
    { num: 4, title: 'Financial Schedule', desc: 'Commercial Bid' },
    { num: 5, title: 'AI Pre-Audit', desc: '24-Rule Check' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Tender Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href={`/user/tenders/${tender.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tender Specs</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {tender.tenderNumber}
          </span>
          <span className="text-xs font-bold text-slate-500">
            Est: {tender.estimatedValueFormatted}
          </span>
        </div>
      </div>

      {/* 5-Step Stepper Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className={`flex flex-col items-center text-center relative ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-90' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                    isCurrent
                      ? 'bg-primary text-white ring-4 ring-slate-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <div className="text-xs font-extrabold text-slate-900 mt-2 hidden sm:block">
                  {s.title}
                </div>
                <div className="text-[10px] text-slate-400 font-medium hidden md:block">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 text-xs">
        {/* STEP 1: ENTITY PROFILE CONFIRMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                Step 1: Entity Profile & Statutory Identification
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Confirm registered company details and statutory numbers synced with central government databases.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Legal Entity Name
                </span>
                <span className="font-bold text-slate-900 text-xs mt-1 block">
                  {profile.companyName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  CIN: {profile.cin}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  GSTIN (Active Regular)
                </span>
                <span className="font-mono font-extrabold text-emerald-700 text-xs mt-1 block">
                  {profile.gstin}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Direct GSTN Gateway Verified
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Company PAN Number
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs mt-1 block">
                  {profile.pan}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> NSDL Active Verified
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Udyam MSME Registration
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs mt-1 block">
                  {profile.udyam}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
                  Medium Enterprise (EMD Exemption Valid)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Registered Factory / Office Address
                </span>
                <span className="font-medium text-slate-800 text-xs mt-1 block">
                  {profile.registeredAddress.line1}, {profile.registeredAddress.line2},{' '}
                  {profile.registeredAddress.city}, {profile.registeredAddress.state} -{' '}
                  {profile.registeredAddress.pincode}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-950 block">Authorized Signatory Confirmation</span>
                <span className="text-[11px] text-blue-800">
                  {profile.authorizedSignatory.name} ({profile.authorizedSignatory.designation}) •{' '}
                  {profile.authorizedSignatory.dinOrDsc}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                DSC Valid ✓
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: TECHNICAL PROPOSAL UPLOAD */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                Step 2: Technical Proposal Document
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Upload your technical response, architecture diagram, methodology, and bill of materials.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50/70 space-y-3">
              <FileText className="w-12 h-12 text-primary mx-auto" />
              <div>
                <div className="font-extrabold text-slate-900 text-sm">{proposalFileName}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Size: 4.8 MB • 38 Pages • Digitally Signed (Class-3 DSC)
                </div>
              </div>

              <div className="max-w-md mx-auto p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 break-all">
                Envelope Hash: {proposalHash}
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payload Uploaded & Integrity Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VAULT DOCUMENT AUTO-MAPPING */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                Step 3: Document Vault Auto-Mapping
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                The platform automatically maps verified artifacts from your vault against tender requirements.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'GSTIN Registration REG-06', docNo: '33AAACA1234F1ZV', req: 'Section 3.1 (a)', status: 'MAPPED', source: 'GSTN Gateway' },
                { title: 'Company PAN Card', docNo: 'AAACA1234F', req: 'Section 3.1 (b)', status: 'MAPPED', source: 'NSDL Database' },
                { title: 'CA Audited Turnover Certificate (FY25)', docNo: 'UDIN-26034182AAAA9912', req: 'Section 4.1', status: 'MAPPED', source: 'ICAI Registry' },
                { title: 'OEM Authorization Letter', docNo: 'OEM/2024/VALV-89', req: 'Section 5.4', status: 'FLAGGED', source: 'AI OCR Parser (Expired FY25)' },
                { title: 'Make-in-India Self Declaration (42%)', docNo: 'MII-DECL-2026-08', req: 'Local Content Preference', status: 'REVIEW', source: 'AI Regex Engine' },
                { title: 'ISO 27001 Information Security Cert', docNo: 'CERT-ISO-991A', req: 'Section 6.2', status: 'REVIEW', source: 'TUV Database' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{m.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {m.docNo} • Mapped to Clause: {m.req} ({m.source})
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      m.status === 'MAPPED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : m.status === 'FLAGGED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {m.status === 'MAPPED' ? 'MAPPED ✓' : m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: COMMERCIAL PRICE SCHEDULE */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                Step 4: Commercial Price Schedule & Financial Bid
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Input your basic quoted price and applicable statutory GST rate. Total quoted sum is calculated automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Basic Turnkey Cost (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={basicRate}
                  onChange={(e) => setBasicRate(Number(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  Excluding GST: ₹ {formatIndianNumber(basicRate)}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Applicable GST Rate (%)</label>
                <select
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value={18}>18% (Standard EPC Services)</option>
                  <option value={12}>12% (Concessional Goods)</option>
                  <option value={5}>5% (Special Rates)</option>
                </select>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  GST Amount: ₹ {formatIndianNumber(gstAmount)}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Freight & Site Insurance (INR)
                </label>
                <input
                  type="number"
                  value={freightRate}
                  onChange={(e) => setFreightRate(Number(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  Inclusive turnkey delivery
                </span>
              </div>
            </div>

            {/* Total Calculation Highlight Card */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-blue-300">
                  Total Financial Quoted Bid Value
                </span>
                <div className="font-display font-black text-2xl md:text-3xl text-white mt-1">
                  {formatINR(totalQuoted)}
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  ₹ {formatIndianNumber(totalQuoted)} (Inclusive of 18% GST)
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Tender Estimate Comparison
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  -4.48% Below Est. (₹ 14.50 Cr)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: MANDATORY AI PRE-SUBMISSION AUDIT */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                Step 5: Mandatory AI Pre-Submission Audit & Sealed Envelope
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                The integrated rule engine evaluates all 24 tender compliance rules and verifies digital signatures before submission.
              </p>
            </div>

            {!isPreCheckDone ? (
              <div className="p-8 bg-blue-50/60 border border-blue-200 rounded-3xl text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-base">
                    Run Mandatory AI Compliance Pre-Audit
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                    Simulates the exact deterministic checks that CPCL Procurement Officers will see during technical opening.
                  </p>
                </div>

                <button
                  onClick={handleRunPreCheck}
                  disabled={isPreCheckRunning}
                  className="px-6 py-3 bg-primary hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm inline-flex items-center gap-2 disabled:opacity-75"
                >
                  {isPreCheckRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                      <span>Evaluating 24 Verification Rules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-300" />
                      <span>Execute AI Pre-Submission Audit</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Audit Result Banner */}
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-sm font-extrabold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Pre-Submission Audit Findings: 18 Pass, 2 Review Flags, 1 Warning</span>
                    </span>
                    <span className="font-mono text-xs bg-amber-200/80 px-2 py-0.5 rounded font-black">
                      Score: 82/100
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    1. <strong>OEM Authorization (REQ-TECH-03)</strong>: Uploaded letter expired on 31 Mar 2025. You can submit now and upload the renewal via Clarification Hub if prompted.<br />
                    2. <strong>Local Content (REQ-LC-01)</strong>: Declared 42% meets Class-II Local Supplier requirements.
                  </p>
                </div>

                {/* Statutory Integrity Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Mandatory Integrity Pledge & Digital Signature Certification
                    </span>
                    <span className="text-[11px] text-slate-600 mt-0.5 block leading-relaxed">
                      I hereby certify under penalty of debarment that all statutory declarations, financial figures, and technical attachments are authentic and cryptographically signed with Class-3 DSC ({profile.authorizedSignatory.dinOrDsc}).
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={currentStep === 1 || isSubmitting}
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all disabled:opacity-40"
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 5))}
              className="px-5 py-2 bg-primary hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isPreCheckDone || isSubmitting}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating SHA-256 Envelope...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Cryptographically Seal & Submit Bid</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateBidWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Initializing Bid Submission Wizard...</p>
        </div>
      }
    >
      <CreateBidWizardContent />
    </Suspense>
  );
}
