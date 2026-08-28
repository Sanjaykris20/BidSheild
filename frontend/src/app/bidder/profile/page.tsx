'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderProfilePage() {
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [kycData, setKycData] = useState({
    gstin: 'Pending Verification',
    pan: 'Pending Verification',
    udyam: 'Pending Verification',
    msmeStatus: 'Unverified',
    localClass: 'Unverified',
  });

  const fetchKycData = async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    try {
      const res = await fetch('/api/documents?bidder_id=VEN-TECHCORP-01');
      const data = await res.json();
      
      if (data.documents) {
        let gstin = 'Pending Verification';
        let pan = 'Pending Verification';
        let udyam = 'Pending Verification';
        let msmeStatus = 'Unverified';
        let localClass = 'Unverified';

        data.documents.forEach((doc: any) => {
          if (doc.extractedData) {
            if (doc.extractedData.gstin) gstin = doc.extractedData.gstin;
            if (doc.extractedData.pan) pan = doc.extractedData.pan;
            if (doc.extractedData.udyamNumber) {
              udyam = doc.extractedData.udyamNumber;
              msmeStatus = doc.extractedData.enterpriseType ? `MSME ${doc.extractedData.enterpriseType}` : 'MSME Verified';
            }
            if (doc.extractedData.localContentPercent) {
              const lc = doc.extractedData.localContentPercent;
              if (lc >= 50) localClass = 'Class-I Local';
              else if (lc >= 20) localClass = 'Class-II Local';
              else localClass = 'Non-Local';
            }
          }
        });

        setKycData({ gstin, pan, udyam, msmeStatus, localClass });
        if (isManualSync) showToast('KYC data successfully synchronized with vault.', 'success');
      }
    } catch (e) {
      if (isManualSync) showToast('Failed to sync KYC data.', 'error');
    } finally {
      if (isManualSync) setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchKycData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Company Profile & KYC
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Verified corporate identity details synchronized with Government Registries.
          </p>
        </div>
        <MockBadge label="GOVT KYC ACTIVE" size="sm" variant="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="w-20 h-20 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center font-display font-black text-2xl mb-3 shadow-inner">
            TC
          </div>
          <h3 className="font-bold text-base text-primary">TechCorp Solutions Pvt Ltd</h3>
          <p className="text-xs text-neutral-muted mt-0.5">Incorporated: 14 Aug 2018</p>
          <div className="mt-4 pt-4 border-t w-full border-outline-variant/60 flex flex-wrap justify-center gap-2">
            <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded border border-success/20">
              {kycData.msmeStatus}
            </span>
            <span className="px-2.5 py-1 bg-info/10 text-info text-[10px] font-bold uppercase rounded border border-info/20">
              {kycData.localClass}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-primary">Statutory Registrations</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">GSTIN Number</span>
              <span className="font-mono font-bold text-primary">{kycData.gstin}</span>
              <span className={`text-[10px] block font-semibold mt-1 ${kycData.gstin !== 'Pending Verification' ? 'text-success' : 'text-warning'}`}>
                {kycData.gstin !== 'Pending Verification' ? '✓ Active on GSTN' : '⚠ Pending'}
              </span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">Permanent Account Number (PAN)</span>
              <span className="font-mono font-bold text-primary">{kycData.pan}</span>
              <span className={`text-[10px] block font-semibold mt-1 ${kycData.pan !== 'Pending Verification' ? 'text-success' : 'text-warning'}`}>
                {kycData.pan !== 'Pending Verification' ? '✓ Verified NSDL' : '⚠ Pending'}
              </span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">Udyam Registration</span>
              <span className="font-mono font-bold text-primary">{kycData.udyam}</span>
              <span className={`text-[10px] block font-semibold mt-1 ${kycData.udyam !== 'Pending Verification' ? 'text-success' : 'text-warning'}`}>
                {kycData.udyam !== 'Pending Verification' ? '✓ MSME Verified' : '⚠ Pending'}
              </span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">CVC Debarment Screening</span>
              <span className="font-mono font-bold text-success">CLEARED (0 Flags)</span>
              <span className="text-[10px] text-success block font-semibold mt-1">✓ CVC Registry</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => fetchKycData(true)}
              disabled={isSyncing}
              className={`bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container flex items-center gap-2 transition-all ${isSyncing ? 'opacity-75 cursor-wait' : ''}`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
              {isSyncing ? 'Syncing...' : 'Sync Gateway KYC'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
