'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderProfilePage() {
  const { showToast } = useToast();

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
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center font-display font-black text-2xl mx-auto mb-3 shadow-inner">
            TC
          </div>
          <h3 className="font-bold text-base text-primary">TechCorp Solutions Pvt Ltd</h3>
          <p className="text-xs text-neutral-muted mt-0.5">Incorporated: 14 Aug 2018</p>
          <div className="mt-4 pt-4 border-t border-outline-variant/60 flex justify-center gap-2">
            <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded border border-success/20">
              MSME Small
            </span>
            <span className="px-2.5 py-1 bg-info/10 text-info text-[10px] font-bold uppercase rounded border border-info/20">
              Class-II Local
            </span>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-primary">Statutory Registrations</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">GSTIN Number</span>
              <span className="font-mono font-bold text-primary">27ABCDE1234F1Z5</span>
              <span className="text-[10px] text-success block font-semibold mt-1">✓ Active on GSTN</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">Permanent Account Number (PAN)</span>
              <span className="font-mono font-bold text-primary">ABCDE1234F</span>
              <span className="text-[10px] text-success block font-semibold mt-1">✓ Verified NSDL</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">Udyam Registration</span>
              <span className="font-mono font-bold text-primary">UDYAM-MH-18-00123</span>
              <span className="text-[10px] text-success block font-semibold mt-1">✓ MSME Verified</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-neutral-muted block mb-1">CVC Debarment Screening</span>
              <span className="font-mono font-bold text-success">CLEARED (0 Flags)</span>
              <span className="text-[10px] text-success block font-semibold mt-1">✓ CVC Registry</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => showToast('Re-synchronizing KYC data with GeM Central Gateway...', 'info')}
              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container"
            >
              Sync Gateway KYC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
