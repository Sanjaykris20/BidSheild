'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function AdminSecurityPage() {
  const { showToast } = useToast();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Central Cyber Security & CVC Compliance
            </span>
            <MockBadge label="SECURITY SHIELD ACTIVE" size="sm" variant="blue" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Security & Integrity Command
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Cryptographic ledger integrity, CVC debarment sync status, and tamper-detection telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Ledger Hash Integrity
          </span>
          <div className="text-3xl font-display font-black text-success flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill">verified_user</span> 100% Intact
          </div>
          <p className="text-xs text-neutral-muted mt-2">Zero hash collisions or payload tampering detected.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            CVC Debarment Gateway
          </span>
          <div className="text-3xl font-display font-black text-primary flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse"></span> Synchronized
          </div>
          <p className="text-xs text-neutral-muted mt-2">Last sync: Today at 04:00 AM IST (1,492 entries).</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider block mb-2">
            Encryption Standard
          </span>
          <div className="text-2xl font-display font-black text-primary font-mono">
            AES-256-GCM + SHA-256
          </div>
          <p className="text-xs text-neutral-muted mt-2">All uploaded artifacts and evidence bound.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-primary">Cryptographic Verification Integrity Run</h3>
        <p className="text-xs text-neutral-muted">
          Execute full ledger hash verification against all stored bids and officer determinations.
        </p>
        <button
          onClick={() => showToast('Full cryptographic ledger verified. 14,290 audit blocks intact.', 'success')}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">lock_reset</span> Run Integrity Audit
        </button>
      </div>
    </div>
  );
}
