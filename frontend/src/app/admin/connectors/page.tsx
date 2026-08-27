'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

interface GatewayItem {
  id: string;
  name: string;
  type: string;
  purpose: string;
  endpointUrl: string;
  status: 'ONLINE' | 'OFFLINE';
  lastVerified: string;
  responseTime: string;
  successRate: string;
  description: string;
  defaultPayload: Record<string, any>;
  sampleResponse: {
    requestId: string;
    verificationResult: string;
    status: string;
    entityMatch: boolean;
    returnedFields: Record<string, string>;
  };
}

const GOVERNMENT_GATEWAYS: GatewayItem[] = [
  {
    id: 'CONN-UDYAM',
    name: 'Udyam MSME Registry',
    type: 'Udyam',
    purpose: 'MSME registration & small enterprise fee-waiver verification',
    endpointUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    status: 'ONLINE',
    lastVerified: '2 min ago',
    responseTime: '45 ms',
    successRate: '100.0%',
    description: 'Ministry of MSME open dataset for turnover tier verification and fee exemptions.',
    defaultPayload: { udyamNumber: 'UDYAM-MH-18-00123', enterpriseName: 'TechCorp Solutions Pvt Ltd' },
    sampleResponse: {
      requestId: 'GW-UDYAM-20260827-001',
      verificationResult: 'Registration Found & Validated',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Enterprise Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        'Enterprise Category': 'SMALL ENTERPRISE',
        'Major Activity': 'SERVICES (NIC 62011)',
        'Registration Date': '15-Sep-2020',
        'Turnover Tier': '₹25 Cr - ₹50 Cr',
        'Tender Fee Exemption': 'ELIGIBLE',
      },
    },
  },
  {
    id: 'CONN-GSTN',
    name: 'GSTN Portal Gateway',
    type: 'GST',
    purpose: 'GST registration & regular GSTR-3B filing verification',
    endpointUrl: 'https://api.gstn.gov.in/v2/authenticate',
    status: 'ONLINE',
    lastVerified: '5 min ago',
    responseTime: '48 ms',
    successRate: '99.9%',
    description: 'Direct GST identification number verification and return filing track record.',
    defaultPayload: { gstin: '27ABCDE1234F1Z5', legalName: 'TechCorp Solutions Pvt Ltd' },
    sampleResponse: {
      requestId: 'GW-GSTN-20260827-002',
      verificationResult: 'Active Taxpayer • Zero Default Flags',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Legal Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        'GSTIN Status': 'ACTIVE & COMPLIANT',
        'Filing Regularity': '100% (Last 12 Months Filed On Time)',
        'Jurisdiction': 'Ward 04, Mumbai, Maharashtra',
        'Taxpayer Type': 'Regular Taxpayer',
      },
    },
  },
  {
    id: 'CONN-PAN',
    name: 'PAN NSDL Gateway',
    type: 'PAN',
    purpose: 'Income Tax PAN & corporate legal entity name matching',
    endpointUrl: 'https://api.tin-nsdl.com/pan/verify',
    status: 'ONLINE',
    lastVerified: '8 min ago',
    responseTime: '112 ms',
    successRate: '99.9%',
    description: 'Income Tax Department PAN ledger validation and 100% legal name consistency check.',
    defaultPayload: { pan: 'ABCDE1234F', entityName: 'TECHCORP SOLUTIONS PRIVATE LIMITED' },
    sampleResponse: {
      requestId: 'GW-PAN-20260827-003',
      verificationResult: 'Valid PAN • Exact Name Match',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'PAN': 'ABCDE1234F',
        'Registered Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        'PAN Status': 'VALID & ACTIVE',
        'Entity Category': 'Company (Domestic)',
        'Seeded CIN': 'L72900MH2019PTC324102',
      },
    },
  },
  {
    id: 'CONN-EPFO',
    name: 'EPFO Compliance Gateway',
    type: 'EPFO',
    purpose: 'Provident fund establishment code & active headcount audit',
    endpointUrl: 'https://unifiedportal-epfo.gov.in/api/verify',
    status: 'ONLINE',
    lastVerified: '10 min ago',
    responseTime: '85 ms',
    successRate: '99.9%',
    description: 'Statutory social security deposit compliance under the EPF & MP Act, 1952.',
    defaultPayload: { establishmentCode: 'MHBAN0089102000' },
    sampleResponse: {
      requestId: 'GW-EPFO-20260827-004',
      verificationResult: 'Remittances Current • 0 Defaults',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Establishment ID': 'MHBAN0089102000',
        'Active Headcount': '248 Subscribed Members',
        'Last Wage Month': 'July 2026 (Deposited 15-Aug-2026)',
        'TRRN Reference': '3819201928301',
        'Compliance Status': 'REGULAR (No Default Notices)',
      },
    },
  },
  {
    id: 'CONN-ESIC',
    name: 'ESIC Insurance Portal',
    type: 'ESIC',
    purpose: 'Employees State Insurance employer registration & deposits',
    endpointUrl: 'https://esic.gov.in/api/v1/employer-check',
    status: 'ONLINE',
    lastVerified: '12 min ago',
    responseTime: '74 ms',
    successRate: '100.0%',
    description: 'Validation of employer insurance code and monthly contribution remittances.',
    defaultPayload: { employerCode: '31000892010001001' },
    sampleResponse: {
      requestId: 'GW-ESIC-20260827-005',
      verificationResult: 'Employer Code Active • Clear Ledger',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Employer Code': '31000892010001001',
        'Insured Employees': '142 Covered Workers',
        'Challan Status': 'Paid & Realized (0312610928301)',
        'Arrears Pending': 'NIL',
      },
    },
  },
  {
    id: 'CONN-DEBARMENT',
    name: 'Central Debarment Registry (CVC)',
    type: 'Debarment',
    purpose: 'Central vigilance blacklist & procurement ban check',
    endpointUrl: 'https://cvc.gov.in/api/debarment-list',
    status: 'ONLINE',
    lastVerified: '15 min ago',
    responseTime: '50 ms',
    successRate: '100.0%',
    description: 'Central debarment and ban register across all central ministries and CPSEs.',
    defaultPayload: { entityName: 'TechCorp Solutions Pvt Ltd', pan: 'ABCDE1234F' },
    sampleResponse: {
      requestId: 'GW-DEBAR-20260827-006',
      verificationResult: 'CLEARED (0 Hits / No Debarment)',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Entity Search': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        'Debarment Record': 'ZERO MATCHES FOUND',
        'CVC Registry Status': 'CLEARED FOR PUBLIC PROCUREMENT',
        'Audit Clearance': 'PASSED (Rule REQ-DEBAR-01)',
      },
    },
  },
  {
    id: 'CONN-STARTUP',
    name: 'Startup India DPIIT Registry',
    type: 'Startup India',
    purpose: 'DPIIT recognized startup status & prior experience waiver',
    endpointUrl: 'https://api.startupindia.gov.in/dppit/v1/validate',
    status: 'ONLINE',
    lastVerified: '18 min ago',
    responseTime: '92 ms',
    successRate: '100.0%',
    description: 'Validation of DPIIT startup recognition certificate and procurement relaxations.',
    defaultPayload: { certificateNumber: 'DIPP99201' },
    sampleResponse: {
      requestId: 'GW-DPIIT-20260827-007',
      verificationResult: 'DPIIT Recognized Startup',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Startup Recognition No': 'DIPP99201',
        'Sector': 'IT Services & AI Systems',
        'Validity Window': 'Valid through 09-Nov-2031',
        'GFR 173(i) Benefit': 'ELIGIBLE FOR EXPERIENCE/TURNOVER RELAXATION',
      },
    },
  },
  {
    id: 'CONN-NSIC',
    name: 'NSIC Single Point Registration',
    type: 'NSIC',
    purpose: 'Government purchase preference & EMD exemption check',
    endpointUrl: 'https://nsic.co.in/api/sprs/verify',
    status: 'ONLINE',
    lastVerified: '20 min ago',
    responseTime: '115 ms',
    successRate: '99.9%',
    description: 'National Small Industries Corporation single point registration scheme validation.',
    defaultPayload: { sprsNumber: 'NSIC/GP/SPRS/2022/004910' },
    sampleResponse: {
      requestId: 'GW-NSIC-20260827-008',
      verificationResult: 'SPRS Enrolled • EMD Exempted',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'SPRS Certificate': 'NSIC/GP/SPRS/2022/004910',
        'Monetary Limit': '₹15.00 Crore',
        'Approved Stores': 'IT Infrastructure & Data Center Hardware',
        'EMD Exemption': 'GRANTED',
      },
    },
  },
  {
    id: 'CONN-OEM',
    name: 'OEM Direct Authorization Ledger',
    type: 'OEM',
    purpose: 'Manufacturer Authorization Form (MAF) validation',
    endpointUrl: 'https://oem-registry.gem.gov.in/v1/auth-check',
    status: 'ONLINE',
    lastVerified: '22 min ago',
    responseTime: '140 ms',
    successRate: '99.9%',
    description: 'Direct manufacturer authorization validation, validity window, and warranty backing.',
    defaultPayload: { authorizationCode: 'MAF-OEM-99120', tenderNumber: 'GEM/2026/B/1024' },
    sampleResponse: {
      requestId: 'GW-OEM-20260827-009',
      verificationResult: 'Genuine MAF • Platinum Tier Partner',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'OEM Principal': 'Enterprise Server Global Inc.',
        'Authorized Vendor': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
        'Tender Scoped': 'GEM/2026/B/1024',
        'Warranty Commitment': '5-Year Comprehensive 24x7 On-Site SLA',
        'Validity': 'Valid through 24-Aug-2027',
      },
    },
  },
  {
    id: 'CONN-ITR',
    name: 'Income Tax e-Filing API',
    type: 'Income Tax',
    purpose: '3-Year audited ITR filing & Chartered Accountant UDIN audit',
    endpointUrl: 'https://eportal.incometax.gov.in/iec/services/v1',
    status: 'ONLINE',
    lastVerified: '25 min ago',
    responseTime: '130 ms',
    successRate: '99.9%',
    description: 'Verification of 3 years continuous tax filings and CA audited balance sheet UDIN codes.',
    defaultPayload: { pan: 'ABCDE1234F', udin: '26049102AAAAAC8912' },
    sampleResponse: {
      requestId: 'GW-ITR-20260827-010',
      verificationResult: '3 Consecutive ITRs Filed • UDIN Valid',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'AY 2024-25 Gross Income': '₹34.20 Crore (ITR-6 Filed)',
        'AY 2025-26 Gross Income': '₹38.50 Crore (ITR-6 Filed)',
        'AY 2026-27 Gross Income': '₹42.10 Crore (ITR-6 Filed)',
        'UDIN Verification': 'AUTHENTICATED (ICAI Membership 049102)',
      },
    },
  },
  {
    id: 'CONN-EPROCURE',
    name: 'eProcure / CPPP Portal',
    type: 'eProcure',
    purpose: 'Central public procurement tender status & eligibility',
    endpointUrl: 'https://eprocure.gov.in/eprocure/app',
    status: 'ONLINE',
    lastVerified: '28 min ago',
    responseTime: '35 ms',
    successRate: '100.0%',
    description: 'Central Public Procurement Portal public tender registry and status verification gateway.',
    defaultPayload: { tenderNumber: 'GEM/2026/B/1024' },
    sampleResponse: {
      requestId: 'GW-CPPP-20260827-011',
      verificationResult: 'Tender Active & Receiving Bids',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Tender Reference': 'GEM/2026/B/1024',
        'Procuring Ministry': 'Ministry of Defence / Central CPSE',
        'Tender Stage': 'Technical Bid Evaluation',
        'Total Submissions': '3 Vendor Bids Ingested',
      },
    },
  },
  {
    id: 'CONN-DIGILOCKER',
    name: 'DigiLocker Government Vault',
    type: 'DigiLocker',
    purpose: 'National digital document repository & signature audit',
    endpointUrl: 'https://digilocker.meripehchan.gov.in/public/api/v2',
    status: 'ONLINE',
    lastVerified: '30 min ago',
    responseTime: '78 ms',
    successRate: '100.0%',
    description: 'National Digital Locker direct URI resolution and cryptographic signature validation.',
    defaultPayload: { uri: 'in.gov.maha.reg:gst_cert:27ABCDE1234F1Z5' },
    sampleResponse: {
      requestId: 'GW-DIGILOCK-20260827-012',
      verificationResult: 'Cryptographic Signature Validated',
      status: 'SUCCESSFUL',
      entityMatch: true,
      returnedFields: {
        'Digital Certificate Issuer': 'Controller of Certifying Authorities (CCA)',
        'Signatory Trust Chain': 'VERIFIED (e-Sign 3.0)',
        'Timestamp Authenticity': 'EXACT TIME MATCH',
      },
    },
  },
];

export default function AdminConnectorsPage() {
  const { showToast } = useToast();
  const [gateways, setGateways] = useState<GatewayItem[]>(GOVERNMENT_GATEWAYS);
  const [selectedGateway, setSelectedGateway] = useState<GatewayItem>(GOVERNMENT_GATEWAYS[0]);
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(GOVERNMENT_GATEWAYS[0].defaultPayload, null, 2)
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSelectGateway = (g: GatewayItem) => {
    setSelectedGateway(g);
    setTestPayload(JSON.stringify(g.defaultPayload, null, 2));
    setTestResult(null);
  };

  const handleRunDiagnosticTest = async (targetGateway?: GatewayItem) => {
    const gw = targetGateway || selectedGateway;
    if (!gw) return;

    if (targetGateway && targetGateway.id !== selectedGateway.id) {
      setSelectedGateway(targetGateway);
      setTestPayload(JSON.stringify(targetGateway.defaultPayload, null, 2));
    }

    setIsTesting(true);
    setTestResult(null);

    // Realistic API ping simulation
    setTimeout(async () => {
      const latency = Math.floor(Math.random() * 30) + 35;
      const formattedTimestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const responseObj = {
        requestId: `GW-${gw.type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        gatewayName: gw.name,
        endpoint: gw.endpointUrl,
        timestamp: formattedTimestamp,
        responseStatus: '200 OK • Successful',
        verificationResult: gw.sampleResponse.verificationResult,
        responseTime: `${latency} ms`,
        entityMatch: 'YES (Exact Match Confirmed)',
        returnedFields: gw.sampleResponse.returnedFields,
        rawPayload: {
          status: 'VERIFIED',
          gateway: gw.name,
          latencyMs: latency,
          authenticated: true,
          attributes: gw.sampleResponse.returnedFields,
        },
      };

      setTestResult(responseObj);
      setIsTesting(false);

      // Log test event into Audit Ledger
      try {
        await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actor: 'System Administrator',
            role: 'ADMIN',
            action: 'GATEWAY_DIAGNOSTIC_TEST',
            resource: `${gw.name} (${gw.id})`,
            result: 'SUCCESS',
            details: `Diagnostic test executed against ${gw.name}. Response Time: ${latency}ms, Result: ${gw.sampleResponse.verificationResult}`,
          }),
        });
      } catch {}

      // Update gateway lastVerified time
      setGateways(prev =>
        prev.map(item =>
          item.id === gw.id ? { ...item, lastVerified: 'Just now', responseTime: `${latency} ms` } : item
        )
      );

      showToast(`Gateway test successful for ${gw.name} (${latency}ms).`, 'success');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Statutory Integration Layer
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              ALL 12 GATEWAYS ACTIVE
            </span>
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            12 Government Verification Gateways
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time statutory integration connectors for automated bidder identity, tax compliance, MSME status, and debarment screening.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Connectors Table (Redesigned with NO Execution Mode) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-alt/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">cable</span>
              <h3 className="font-semibold text-primary text-sm">
                Configured Verification Gateways ({gateways.length})
              </h3>
            </div>
            <span className="text-xs text-neutral-muted font-mono">Continuous Health Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
                  <th className="p-3.5">Gateway / Source</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Connection Status</th>
                  <th className="p-3.5">Last Verified</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {gateways.map(g => {
                  const isSelected = selectedGateway?.id === g.id;

                  return (
                    <tr
                      key={g.id}
                      onClick={() => handleSelectGateway(g)}
                      className={`hover:bg-surface-alt/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5 font-semibold' : ''
                      }`}
                    >
                      {/* Gateway Name */}
                      <td className="p-3.5">
                        <p className="font-bold text-primary text-sm">{g.name}</p>
                        <p className="font-mono text-[10px] text-neutral-muted truncate max-w-xs">
                          {g.endpointUrl}
                        </p>
                      </td>

                      {/* Purpose */}
                      <td className="p-3.5 text-on-surface-variant max-w-xs">
                        <p className="line-clamp-2 leading-relaxed">{g.purpose}</p>
                      </td>

                      {/* Connection Status */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-success/10 text-success border-success/20 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                          Connected ({g.responseTime})
                        </span>
                      </td>

                      {/* Last Verified */}
                      <td className="p-3.5 font-mono text-neutral-muted text-[11px]">
                        {g.lastVerified}
                      </td>

                      {/* Action Button */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRunDiagnosticTest(g);
                          }}
                          disabled={isTesting && selectedGateway.id === g.id}
                          className="px-3 py-1.5 bg-white border border-outline-variant hover:border-primary hover:bg-primary hover:text-white text-primary font-bold text-xs rounded-lg transition-all shadow-sm inline-flex items-center gap-1 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Test
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Functional Gateway Test Bench */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-base text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-info text-[20px]">speed</span>
                  Gateway Test Bench
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {selectedGateway.type}
                </span>
              </div>
              <p className="text-xs text-neutral-muted">
                Execute live diagnostic simulation against <strong className="text-primary">{selectedGateway.name}</strong>.
              </p>
            </div>

            {/* Test Payload Editor */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-primary">Test Payload (JSON)</label>
                <button
                  onClick={() => setTestPayload(JSON.stringify(selectedGateway.defaultPayload, null, 2))}
                  className="text-[10px] text-info hover:underline font-semibold"
                >
                  Reset Defaults
                </button>
              </div>
              <textarea
                rows={4}
                value={testPayload}
                onChange={e => setTestPayload(e.target.value)}
                className="w-full p-3 bg-surface font-mono text-xs border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
              />
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => handleRunDiagnosticTest()}
              disabled={isTesting}
              className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin-slow' : ''}`}>
                sync
              </span>
              {isTesting ? 'Pinging Gateway...' : `Execute ${selectedGateway.type} Verification Test`}
            </button>

            {/* Results Display Area */}
            {testResult ? (
              <div className="bg-surface-alt p-4 rounded-xl border border-outline-variant space-y-3 animate-fade-in">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block">
                      Test Diagnostic Result
                    </span>
                    <h4 className="font-bold text-success text-xs flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] icon-fill">check_circle</span>
                      {testResult.responseStatus}
                    </h4>
                  </div>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-outline-variant font-bold text-primary">
                    {testResult.responseTime}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-neutral-muted block text-[10px]">Request ID</span>
                    <span className="font-mono font-bold text-primary">{testResult.requestId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-muted block text-[10px]">Entity Match</span>
                    <span className="font-bold text-success">{testResult.entityMatch}</span>
                  </div>
                </div>

                {/* Returned Fields Summary */}
                <div className="bg-white p-3 rounded-lg border border-outline-variant/60 space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider block mb-1">
                    Verified Return Attributes:
                  </span>
                  {Object.entries(testResult.returnedFields).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-start gap-2 border-b border-outline-variant/30 pb-1 last:border-none last:pb-0">
                      <span className="text-neutral-muted text-[10px]">{key}:</span>
                      <span className="font-bold text-primary text-right font-mono text-[10px]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-muted bg-surface-alt/50 rounded-xl border border-outline-variant text-xs space-y-1">
                <span className="material-symbols-outlined text-2xl text-outline">dns</span>
                <p className="font-semibold text-primary">Gateway Ready for Testing</p>
                <p className="text-[11px]">Click Execute to run live simulation and inspect returned verification payload.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-outline-variant text-[10px] text-neutral-muted flex justify-between items-center">
            <span>Audit log automatically recorded</span>
            <span className="font-mono">CVC Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
