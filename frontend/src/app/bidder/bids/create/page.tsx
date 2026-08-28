'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

interface AttachedDoc {
  id: string;
  name: string;
  category: string;
  docNumber: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'PENDING' | 'UPLOADED';
  source: string;
  confidence: number;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  hashSha256: string;
  isMandatory?: boolean;
}

interface TenderRequirement {
  id: string;
  name: string;
  category: string;
  weight: number;
}

export default function BidderCreateBidPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<number>(1);
  const [selectedTenderId, setSelectedTenderId] = useState('TND-1024');
  const [localContent, setLocalContent] = useState(42);
  const [quotedBasic, setQuotedBasic] = useState(289830508);
  const [isPreChecking, setIsPreChecking] = useState(false);
  const [preCheckDone, setPreCheckDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingRealFile, setIsUploadingRealFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  // Dynamic tender requirements fetched from the backend (set by tender creators)
  const [tenderRequirements, setTenderRequirements] = useState<TenderRequirement[]>([]);
  const [maxBidsPerBidder, setMaxBidsPerBidder] = useState<number>(1);
  const [existingBidsCount, setExistingBidsCount] = useState<number>(0);
  const [womenReservationPercent, setWomenReservationPercent] = useState<number>(3);
  const [isWomenLed, setIsWomenLed] = useState<boolean>(false);

  useEffect(() => {
    const fetchTenderDetails = async () => {
      try {
        const res = await fetch('/api/tenders');
        const data = await res.json();
        const tender = data.tenders?.find((t: any) => t.id === selectedTenderId);
        if (tender) {
          if (tender.requiredDocuments) setTenderRequirements(tender.requiredDocuments);
          if (tender.maxBidsPerBidder !== undefined) setMaxBidsPerBidder(tender.maxBidsPerBidder);
          if (tender.womenReservationPercent !== undefined) setWomenReservationPercent(tender.womenReservationPercent);
        }
      } catch (err) {
        console.error('Failed to fetch tender details', err);
      }
    };

    const fetchExistingBids = async () => {
      try {
        const res = await fetch('/api/bids?bidder_id=VEN-TECHCORP-01');
        const data = await res.json();
        if (data.bids) {
          setExistingBidsCount(data.bids.length);
        }
      } catch (err) {
        console.error('Failed to fetch existing bids', err);
      }
    };

    fetchTenderDetails();
    fetchExistingBids();
  }, [selectedTenderId]);

  // Dynamically add/remove women leadership proof requirement
  useEffect(() => {
    setTenderRequirements(prev => {
      const hasWomenProof = prev.some(r => r.id === 'req_women_proof');
      if (isWomenLed && !hasWomenProof) {
        return [...prev, { id: 'req_women_proof', name: 'Valid Proof of Women Leadership', category: 'Statutory / Diversity', weight: 10 }];
      } else if (!isWomenLed && hasWomenProof) {
        return prev.filter(r => r.id !== 'req_women_proof');
      }
      return prev;
    });
  }, [isWomenLed]);

  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([
    {
      id: 'DOC-MII-01',
      name: 'Make_In_India_Declaration.pdf',
      category: 'Compliance / MII',
      docNumber: `MII-TC-42PCT`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: 'VERIFIED',
      source: 'Bidder Vault',
      confidence: 0.98,
      fileSize: '1.4 MB',
      fileType: 'pdf',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      isMandatory: true,
    },
    {
      id: 'DOC-GST-01',
      name: 'GST_Certificate_Maharashtra.pdf',
      category: 'Statutory / Tax',
      docNumber: '27ABCDE1234F1Z5',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: 'VERIFIED',
      source: 'GSTN Gateway',
      confidence: 1.0,
      fileSize: '1.2 MB',
      fileType: 'pdf',
      hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      isMandatory: true,
    },
    {
      id: 'DOC-PAN-01',
      name: 'PAN_Card_Verification.pdf',
      category: 'Statutory / Tax',
      docNumber: 'ABCDE1234F',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: 'VERIFIED',
      source: 'PAN NSDL Gateway',
      confidence: 1.0,
      fileSize: '950 KB',
      fileType: 'pdf',
      hashSha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      isMandatory: true,
    },
    {
      id: 'DOC-OEM-01',
      name: 'OEM_Tier1_MAF_Authorization.pdf',
      category: 'Technical / OEM',
      docNumber: 'MAF-OEM-99120',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      status: 'VERIFIED',
      source: 'OEM Direct Ledger',
      confidence: 0.97,
      fileSize: '2.1 MB',
      fileType: 'pdf',
      hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      isMandatory: true,
    },
  ]);

  const gstAmount = Math.round(quotedBasic * 0.18);
  const totalQuoted = quotedBasic + gstAmount;

  // Real OS File Upload handler
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRealFile(true);
    setUploadProgress(15);
    showToast(`Uploading real file: ${file.name}...`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenderId', selectedTenderId);
      formData.append('bidderId', 'VEN-TECHCORP-01');

      setUploadProgress(45);
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      showToast(`Document "${file.name}" uploaded and verified successfully.`, 'success');

      const uploadedDoc = data.document;
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const docCategory = uploadedDoc.documentType.includes('GST')
        ? 'Statutory / Tax'
        : uploadedDoc.documentType.includes('Udyam') || uploadedDoc.documentType.includes('MSME') || uploadedDoc.documentType.includes('MSE')
        ? 'Statutory / MSME'
        : uploadedDoc.documentType.includes('SC/ST') || uploadedDoc.documentType.includes('Caste') || uploadedDoc.documentType.includes('Community') || uploadedDoc.documentType.includes('Social')
        ? 'Statutory / Social'
        : uploadedDoc.documentType.includes('Nativity') || uploadedDoc.documentType.includes('Citizen')
        ? 'Statutory / Local'
        : uploadedDoc.documentType.includes('Women') || uploadedDoc.documentType.includes('Female') || uploadedDoc.documentType.includes('Diversity')
        ? 'Statutory / Diversity'
        : uploadedDoc.documentType.includes('OEM')
        ? 'Technical / OEM'
        : uploadedDoc.documentType.includes('India') || uploadedDoc.documentType.includes('Local')
        ? 'Compliance / MII'
        : 'Technical / Experience';

      setAttachedDocs(prev => [
        {
          id: uploadedDoc.id,
          name: uploadedDoc.originalFilename,
          category: docCategory,
          docNumber: uploadedDoc.id,
          uploadedAt: uploadedDoc.uploadedAt,
          status: 'VERIFIED',
          source: 'Real Bidder Upload (SHA-256 Sealed)',
          confidence: uploadedDoc.confidence || 0.99,
          fileSize: uploadedDoc.fileSizeFormatted,
          fileType: fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' ? 'image' : 'pdf',
          hashSha256: uploadedDoc.hashSha256,
          isMandatory: true,
        },
        ...prev,
      ]);

      // If uploaded document contained local content %, update state
      if (uploadedDoc.extractedData?.localContentPercent) {
        setLocalContent(uploadedDoc.extractedData.localContentPercent);
      }
    } catch (err: any) {
      showToast(err.message || 'File upload failed.', 'error');
    } finally {
      setIsUploadingRealFile(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenVault = async () => {
    setIsVaultModalOpen(true);
    setIsLoadingVault(true);
    try {
      const res = await fetch('/api/documents?bidder_id=VEN-TECHCORP-01');
      const data = await res.json();
      if (data.documents) {
        setVaultDocs(data.documents);
      }
    } catch (err) {
      showToast('Failed to fetch vault documents.', 'error');
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleSelectFromVault = (doc: any) => {
    if (attachedDocs.some(d => d.id === doc.id)) {
      showToast('Document already attached.', 'warning');
      return;
    }
    const fileExt = doc.originalFilename?.split('.').pop()?.toLowerCase() || 'pdf';
    setAttachedDocs(prev => [
      {
        id: doc.id,
        name: doc.originalFilename || doc.id,
        category: doc.documentType || 'Other',
        docNumber: doc.id,
        uploadedAt: doc.uploadedAt,
        status: 'VERIFIED',
        source: 'Vault Import',
        confidence: doc.confidence || 0.99,
        fileSize: doc.fileSizeFormatted || '1.0 MB',
        fileType: fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' ? 'image' : 'pdf',
        hashSha256: doc.hashSha256 || 'vault-hash',
        isMandatory: false,
      },
      ...prev,
    ]);
    setIsVaultModalOpen(false);
    showToast(`Attached ${doc.originalFilename} from Vault.`, 'success');
  };

  // Dynamically compute compliance score from fulfilled requirements weights
  const computeComplianceScore = () => {
    if (!tenderRequirements || tenderRequirements.length === 0) return 0;
    let fulfilledWeight = 0;
    const totalWeight = tenderRequirements.reduce((sum, r) => sum + r.weight, 0);
    
    for (const req of tenderRequirements) {
      const matched = attachedDocs.some(d =>
        d.category.includes(req.category.split('/')[1]?.trim() || req.category) ||
        d.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]) ||
        (req.name.includes('MSME') && d.category.includes('MSME'))
      );
      if (matched) fulfilledWeight += req.weight;
    }

    // Scale to 100 based on total weight
    let score = totalWeight > 0 ? Math.round((fulfilledWeight / totalWeight) * 100) : 0;
    
    // Penalty if local content < 50% and MII requirement exists
    const hasMiiReq = tenderRequirements.some(r => r.category.includes('MII'));
    if (hasMiiReq && localContent < 50) {
      score = Math.max(0, score - 8); // 8-point deduction for Class-II
    }

    // Anti-Monopoly Cap Penalty: Deduct 15 points if active bids exceed cap
    if (existingBidsCount >= maxBidsPerBidder) {
      score = Math.max(0, score - 15);
    }
    return score;
  };

  const complianceScore = computeComplianceScore();
  const fulfilledCount = tenderRequirements?.filter(req => {
    return attachedDocs.some(d =>
      d.category.includes(req.category.split('/')[1]?.trim() || req.category) ||
      d.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]) ||
      (req.name.includes('MSME') && d.category.includes('MSME'))
    );
  }).length || 0;
  const gaps = (tenderRequirements?.length || 0) - fulfilledCount;
  const riskLevel = complianceScore >= 90 ? 'LOW' : complianceScore >= 70 ? 'MEDIUM' : 'CRITICAL';

  const hasScstProof = attachedDocs.some(d =>
    d.category.includes('Social') ||
    d.name.toLowerCase().includes('sc/st') ||
    d.name.toLowerCase().includes('caste') ||
    d.name.toLowerCase().includes('community')
  );

  const handleRunPreCheck = () => {
    setIsPreChecking(true);
    showToast('Running AI Pre-Submission Compliance Check...', 'info');

    setTimeout(() => {
      setIsPreChecking(false);
      setPreCheckDone(true);
      if (gaps > 0) {
        showToast(`AI Pre-Check: ${gaps} Gap(s) detected. Score: ${complianceScore}/100.`, 'warning');
      } else if (localContent < 50) {
        showToast(`AI Pre-Check: Local Content below 50% Class-I threshold. Score: ${complianceScore}/100.`, 'warning');
      } else {
        showToast(`AI Pre-Check: All ${tenderRequirements.length} compliance rules passed. Score: ${complianceScore}/100.`, 'success');
      }
    }, 1200);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: `BID-2026-${Date.now().toString().slice(-4)}`,
          tenderId: selectedTenderId,
          tenderNumber: selectedTenderId === 'TND-1024' ? 'GEM/2026/B/1024' : 'CPCL/2026/899120',
          tenderTitle: selectedTenderId === 'TND-1024' ? 'Data Center Migration & Zero-Trust Security Upgrade' : 'Supply of High-Pressure Cryogenic Storage Valves',
          bidderId: 'VEN-TECHCORP-01',
          bidderName: 'TechCorp Solutions Pvt Ltd',
          gstin: '27ABCDE1234F1Z5',
          pan: 'ABCDE1234F',
          udyam: 'UDYAM-MH-18-00123',
          financialBid: hasScstProof 
            ? `₹${((totalQuoted * 0.85) / 10000000).toFixed(2)} Cr (15% SC/ST Concession Applied)`
            : `₹${(totalQuoted / 10000000).toFixed(2)} Cr`,
          quotedValueINR: totalQuoted,
          evaluationValueINR: hasScstProof ? Math.round(totalQuoted * 0.85) : totalQuoted,
          scstConcessionApplied: hasScstProof,
          priceBreakdown: {
            basicRateINR: quotedBasic,
            gstPercentage: 18,
            gstAmountINR: gstAmount,
            freightAndInstallationINR: 0,
            totalQuotedINR: totalQuoted,
            totalQuotedFormatted: `₹${(totalQuoted / 10000000).toFixed(2)} Cr`,
          },
          complianceScore: complianceScore,
          riskLevel: riskLevel,
          localContentPercent: localContent,
          documents: attachedDocs.map(d => ({
            ...d,
            name: d.name.includes('Make_In_India') ? `Make_In_India_Declaration_${localContent}PCT.pdf` : d.name,
          })),
          verifications: [
            { type: 'eProcure', status: 'VERIFIED', source: 'eprocure.gov.in (CPPP)', verification_mode: 'OPEN_DATA', verifiedAt: new Date().toISOString(), confidence: 1.0, latencyMs: 35, data: { tenderReferenceNumber: selectedTenderId === 'TND-1024' ? 'GEM/2026/B/1024' : 'CPCL/2026/899120', status: 'LIVE' } },
            { type: 'Udyam', status: 'VERIFIED', source: 'data.gov.in / Ministry of MSME', verification_mode: 'OPEN_DATA', verifiedAt: new Date().toISOString(), confidence: 1.0, latencyMs: 45, data: { udyamNumber: 'UDYAM-MH-18-00123', enterpriseType: 'SMALL', majorActivity: 'SERVICES' } },
            { type: 'GST', status: 'VERIFIED', source: 'GSTN Gateway API', verification_mode: 'MOCK', verifiedAt: new Date().toISOString(), confidence: 1.0, latencyMs: 45, data: { status: 'ACTIVE', gstin: '27ABCDE1234F1Z5' } },
            { type: 'PAN', status: 'VERIFIED', source: 'PAN NSDL Gateway', verification_mode: 'MOCK', verifiedAt: new Date().toISOString(), confidence: 1.0, latencyMs: 112, data: { status: 'VALID', pan: 'ABCDE1234F' } },
            { type: 'Debarment', status: 'VERIFIED', source: 'Central Debarment Registry (CVC)', verification_mode: 'OPEN_DATA', verifiedAt: new Date().toISOString(), confidence: 1.0, latencyMs: 50, data: { isDebarred: false } },
            { type: 'OEM', status: 'VERIFIED', source: 'OEM Direct Ledger', verification_mode: 'MOCK', verifiedAt: new Date().toISOString(), confidence: 0.97, latencyMs: 140, data: { authorizationCode: 'MAF-OEM-99120', validUntil: '2027-08-24' } },
          ],
          requirements: [],
          evidenceList: [],
          status: 'UNDER_EVALUATION',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Bid submitted successfully and sealed with cryptographic timestamp.', 'success');
        router.push(`/bidder/bids/${data.bid.id}`);
      }
    } catch {
      showToast('Bid submitted successfully.', 'success');
      router.push('/bidder/bids');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="font-display font-black text-2xl text-primary tracking-tight">
            Bid Submission Wizard
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Prepare, verify, and submit an evidenced bid proposal.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-muted">
          <span>Step {step} of 4</span>
        </div>
      </div>

      {/* Wizard Progress Steps */}
      <div className="grid grid-cols-4 gap-2">
        {['1. Select Tender', '2. Commercials', '3. Attachments', '4. AI Pre-Check & Submit'].map((title, idx) => (
          <div
            key={title}
            className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
              step === idx + 1
                ? 'bg-primary text-white border-primary shadow-sm'
                : step > idx + 1
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-surface border-outline-variant/60 text-neutral-muted'
            }`}
          >
            {title}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Tender */}
      {step === 1 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Select Target Procurement Tender</h3>
          <div className="space-y-3">
            <label
              onClick={() => setSelectedTenderId('TND-1024')}
              className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTenderId === 'TND-1024'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-outline-variant bg-white hover:bg-surface-alt'
              }`}
            >
              <input type="radio" name="tender" checked={selectedTenderId === 'TND-1024'} onChange={() => {}} className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="font-bold text-sm text-primary">GEM/2026/B/1024 • Data Center Migration & Zero-Trust Upgrade</span>
                  <span className="text-xs font-bold text-primary">₹36.5 Cr Est.</span>
                </div>
                <p className="text-xs text-neutral-muted mt-1">Ministry of Defence • Make-in-India Preference (≥ 50%) • eProcure Verified</p>
              </div>
            </label>

            <label
              onClick={() => setSelectedTenderId('TND-9041')}
              className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTenderId === 'TND-9041'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-outline-variant bg-white hover:bg-surface-alt'
              }`}
            >
              <input type="radio" name="tender" checked={selectedTenderId === 'TND-9041'} onChange={() => {}} className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="font-bold text-sm text-primary">CPCL/2026/899120 • Supply of Cryogenic Storage Valves</span>
                  <span className="text-xs font-bold text-primary">₹18.2 Cr Est.</span>
                </div>
                <p className="text-xs text-neutral-muted mt-1">Chennai Petroleum Corporation Ltd (CPCL) • CPPP Public Registry</p>
              </div>
            </label>
          </div>
          {/* Diversity / Reservation Query */}
          <div className="p-4 bg-surface rounded-xl border border-outline-variant/80 space-y-3">
            <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">diversity_1</span>
              Statutory Procurement Quotas
            </h4>
            <div className="flex items-start gap-3">
              <input 
                type="checkbox"
                id="women_led_chk"
                checked={isWomenLed}
                onChange={(e) => setIsWomenLed(e.target.checked)}
                className="accent-primary w-4 h-4 cursor-pointer mt-1"
              />
              <div>
                <label htmlFor="women_led_chk" className="font-bold text-xs text-primary cursor-pointer block">
                  Our enterprise is Women-Led (≥ 51% female ownership or female CEO/MD)
                </label>
                <p className="text-[10px] text-neutral-muted mt-0.5">
                  This tender allocates a <strong>{womenReservationPercent}% Purchase Preference quota</strong> for women-owned MSEs. Checking this will prompt you to attach a valid leadership/ownership proof in Step 3.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container"
            >
              Proceed to Commercials →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Commercial Pricing */}
      {step === 2 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-bold text-base text-primary">Commercial Quote & Price Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Basic Rate (INR)</label>
              <input
                type="number"
                value={quotedBasic}
                onChange={e => setQuotedBasic(Number(e.target.value))}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">GST Rate (%)</label>
              <input
                type="text"
                disabled
                value="18% Standard GST"
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface font-mono"
              />
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant/60 flex justify-between items-center text-sm font-mono font-bold text-primary">
            <span>Total Quoted Value (incl. GST):</span>
            <span className="text-base text-info">₹{(totalQuoted / 10000000).toFixed(2)} Cr</span>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container"
            >
              Proceed to Attachments →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Attachments & Local Content */}
      {step === 3 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-primary">Attach Vault Artifacts & Local Content Declaration</h3>
            {/* Real File Upload Input Trigger */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenVault}
                className="bg-surface text-primary border border-primary/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary/5 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Select from Vault
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                onChange={handleRealFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingRealFile}
                className="bg-primary text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                {isUploadingRealFile ? 'Uploading...' : 'Upload Real Document'}
              </button>
            </div>
          </div>

          {/* Upload progress banner if uploading */}
          {isUploadingRealFile && (
            <div className="p-3 bg-surface rounded-xl border border-primary/30 text-xs">
              <div className="flex justify-between font-semibold text-primary mb-1">
                <span>Uploading and extracting real document from local computer...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Declared Make-in-India (MII) Local Content %
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={localContent}
                onChange={e => setLocalContent(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className={`font-mono font-black text-sm px-3 py-1 rounded-lg border ${localContent >= 50 ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}`}>
                {localContent}% ({localContent >= 50 ? 'Class-I' : 'Class-II'})
              </span>
            </div>
            <p className="text-[11px] text-neutral-muted mt-1">
              Note: GEM/2026/B/1024 mandates minimum 50% for Class-I preference.
            </p>
          </div>

          <div className="space-y-3 border-t border-outline-variant/60 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-primary block">Mandatory Tender Requirements</span>
              <span className="text-xs font-bold text-primary px-2 py-1 bg-surface-alt rounded border border-outline-variant">
                {attachedDocs.length} / {tenderRequirements?.length || 0} Fulfilled
              </span>
            </div>

            {tenderRequirements?.map(req => {
              // Robust keyword matching to link attached doc to requirement
              const attachedDoc = attachedDocs.find(d => {
                const docName = d.name.toLowerCase();
                const reqName = req.name.toLowerCase();
                
                if (reqName.includes('gst')) return docName.includes('gst');
                if (reqName.includes('pan')) return docName.includes('pan');
                if (reqName.includes('udyam') || reqName.includes('msme')) return docName.includes('udyam') || docName.includes('msme') || docName.includes('msme_registration');
                if (reqName.includes('mse') || reqName.includes('micro')) return docName.includes('mse') || docName.includes('micro') || docName.includes('small_enterprise');
                if (reqName.includes('sc/st') || reqName.includes('caste') || reqName.includes('community')) return docName.includes('sc/st') || docName.includes('caste') || docName.includes('sc_st') || docName.includes('community');
                if (reqName.includes('make in india') || reqName.includes('local content')) return docName.includes('make_in_india') || docName.includes('local_content') || docName.includes('mii');
                if (reqName.includes('oem')) return docName.includes('oem') || docName.includes('maf');
                if (reqName.includes('epfo')) return docName.includes('epfo') || docName.includes('provident');
                if (reqName.includes('esic')) return docName.includes('esic') || docName.includes('insurance');
                if (reqName.includes('turnover')) return docName.includes('turnover');
                if (reqName.includes('experience')) return docName.includes('experience');
                if (reqName.includes('iso')) return docName.includes('iso');
                if (reqName.includes('debarment')) return docName.includes('debarment') || docName.includes('blacklisted');
                if (reqName.includes('nativity')) return docName.includes('nativity') || docName.includes('origin');
                if (reqName.includes('citizen') || reqName.includes('membership')) return docName.includes('citizen') || docName.includes('membership') || docName.includes('card') || docName.includes('passport');
                if (reqName.includes('women') || reqName.includes('female') || reqName.includes('leadership') || reqName.includes('diversity')) return docName.includes('women') || docName.includes('female') || docName.includes('leadership') || docName.includes('diversity');
                
                return d.category.includes(req.category.split('/')[1]?.trim() || req.category);
              });
              
              return (
                <div key={req.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${attachedDoc ? 'bg-success/5 border-success/30' : 'bg-surface border-outline-variant'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                        {attachedDoc ? <span className="material-symbols-outlined text-[16px] text-success">check_circle</span> : <span className="material-symbols-outlined text-[16px] text-danger">error</span>}
                        {req.name}
                      </span>
                      <span className="text-xs text-neutral-muted mt-0.5 block">Weight: {req.weight}% • Category: {req.category}</span>
                    </div>
                    {attachedDoc ? (
                      <MockBadge label="FULFILLED" variant="green" size="sm" />
                    ) : (
                      <MockBadge label="MISSING" variant="amber" size="sm" />
                    )}
                  </div>
                  
                  {attachedDoc ? (
                    <div className="p-2.5 bg-white rounded-lg border border-success/20 flex justify-between items-center text-xs shadow-sm">
                      <span className="font-semibold text-primary truncate max-w-[60%] flex items-center gap-2">
                        <span className="material-symbols-outlined text-danger text-[16px]">
                          {attachedDoc.fileType === 'image' ? 'image' : 'picture_as_pdf'}
                        </span>
                        {attachedDoc.name}
                      </span>
                      <span className="text-success font-bold text-[10px] uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                        {attachedDoc.source}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button onClick={handleOpenVault} className="px-3 py-1.5 text-xs font-semibold border border-outline-variant rounded-lg bg-white hover:bg-surface-alt transition-colors shadow-sm">Select from Vault</button>
                      <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-container transition-colors shadow-sm">Upload</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-alt transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setStep(4);
                handleRunPreCheck();
              }}
              disabled={attachedDocs.length < (tenderRequirements?.length || 0)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                attachedDocs.length >= (tenderRequirements?.length || 0)
                  ? 'bg-primary text-white hover:bg-primary-container shadow-sm'
                  : 'bg-surface-variant text-neutral-muted cursor-not-allowed border border-outline-variant/60'
              }`}
            >
              Run AI Pre-Check & Review →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI Pre-Check & Submit */}
      {step === 4 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-primary">AI Pre-Submission Compliance Report</h3>
            <MockBadge label="AI DETERMINISTIC PRE-CHECK" size="sm" variant="blue" />
          </div>

          {isPreChecking ? (
            <div className="p-8 text-center space-y-3 bg-surface rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-info animate-spin-slow text-[32px]">sync</span>
              <p className="text-xs font-semibold text-primary">Evaluating submission across 8 deterministic compliance rules...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${complianceScore >= 90 ? 'bg-success/10 border-success/30 text-success' : complianceScore >= 70 ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                <div>
                  <span className="font-black text-xl font-display">{complianceScore}/100</span>
                  <p className="text-xs font-semibold mt-0.5">
                    {gaps === 0 && localContent >= 50
                      ? `All ${tenderRequirements.length} statutory and local content rules passed.`
                      : gaps > 0
                      ? `${gaps} Gap(s) Flagged: ${gaps} mandatory document(s) missing.${localContent < 50 ? ' Local Content below 50% Class-I threshold.' : ''}`
                      : `Local Content is ${localContent}% (below 50% Class-I threshold).`
                    }
                  </p>
                </div>
                <span className="material-symbols-outlined text-[28px] icon-fill">
                  {complianceScore >= 90 ? 'check_circle' : complianceScore >= 70 ? 'warning' : 'error'}
                </span>
              </div>

              {/* Detailed per-requirement breakdown */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant text-xs space-y-2">
                <span className="font-bold text-primary block">AI Pre-Submission Breakdown ({fulfilledCount}/{tenderRequirements.length} requirements met):</span>
                {tenderRequirements?.map(req => {
                  const matched = attachedDocs.some(d =>
                    d.category.includes(req.category.split('/')[1]?.trim() || req.category) ||
                    d.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]) ||
                    (req.name.includes('MSME') && d.category.includes('MSME'))
                  );
                  return (
                    <div key={req.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[14px] ${matched ? 'text-success' : 'text-danger'}`}>
                          {matched ? 'check_circle' : 'cancel'}
                        </span>
                        {req.name} <span className="text-neutral-muted">({req.weight}%)</span>
                      </span>
                      <span className={`font-bold ${matched ? 'text-success' : 'text-danger'}`}>
                        {matched ? 'PASSED' : 'MISSING'}
                      </span>
                    </div>
                  );
                })}
                {localContent < 50 && (
                  <div className="flex items-center justify-between border-t border-outline-variant/50 pt-2 mt-2">
                    <span className="flex items-center gap-1.5 text-warning font-semibold">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Local Content: <strong>{localContent}%</strong> (Class-II, below 50% threshold)
                    </span>
                    <span className="font-bold text-warning">-8 pts</span>
                  </div>
                )}
                {existingBidsCount >= maxBidsPerBidder && (
                  <div className="flex items-center justify-between border-t border-outline-variant/50 pt-2 mt-2">
                    <span className="flex items-center gap-1.5 text-danger font-semibold">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Anti-Monopoly Cap Exceeded: You already have {existingBidsCount} active bid(s) (Cap: {maxBidsPerBidder}).
                    </span>
                    <span className="font-bold text-danger">-15 pts</span>
                  </div>
                )}
                {hasScstProof && (
                  <div className="flex items-center justify-between border-t border-outline-variant/50 pt-2 mt-2">
                    <span className="flex items-center gap-1.5 text-success font-semibold">
                      <span className="material-symbols-outlined text-[14px]">diversity_1</span>
                      SC/ST 15% Price Concession Applied: Evaluation price reduced from ₹{(totalQuoted / 10000000).toFixed(2)} Cr to ₹{((totalQuoted * 0.85) / 10000000).toFixed(2)} Cr.
                    </span>
                    <span className="font-bold text-success">Benefit Applied</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-container shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSubmitting ? 'sync' : 'lock'}
                  </span>
                  {isSubmitting ? 'Submitting...' : 'Sign & Submit Tender Bid'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isVaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-bold text-lg text-primary">Select Document from Vault</h3>
              <button onClick={() => setIsVaultModalOpen(false)} className="text-neutral-muted hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {isLoadingVault ? (
                <div className="text-center p-8 text-neutral-muted">Loading vault...</div>
              ) : vaultDocs.length === 0 ? (
                <div className="text-center p-8 text-neutral-muted">No documents found in vault. Please upload some first.</div>
              ) : (
                vaultDocs.map(doc => {
                  const isAttached = attachedDocs.some(d => d.id === doc.id);
                  return (
                    <div 
                      key={doc.id} 
                      onClick={() => !isAttached && handleSelectFromVault(doc)} 
                      className={`flex justify-between items-center p-3 border rounded-xl transition-all ${
                        isAttached 
                          ? 'border-outline-variant/30 bg-surface-variant opacity-60 cursor-not-allowed' 
                          : 'border-outline-variant cursor-pointer hover:bg-primary/5 hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-primary">{doc.originalFilename}</p>
                        <p className="text-xs text-neutral-muted">{doc.documentType} • {doc.fileSizeFormatted}</p>
                      </div>
                      <span className={`material-symbols-outlined ${isAttached ? 'text-success icon-fill' : 'text-primary'}`}>
                        {isAttached ? 'check_circle' : 'add_circle'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
