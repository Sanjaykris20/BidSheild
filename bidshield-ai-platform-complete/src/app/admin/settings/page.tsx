'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function AdminSettingsPage() {
  const { showToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            System Settings & Preferences
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Global environment parameters, AI Provider configuration, and maintenance controls.
          </p>
        </div>
        <MockBadge label="ENTERPRISE v2.4" size="sm" variant="purple" />
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6 text-xs">
        <div>
          <h3 className="font-bold text-sm text-primary mb-3">AI Engine Provider Configuration</h3>
          <div className="p-4 bg-surface rounded-xl border border-outline-variant space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">Active Provider:</span>
              <MockBadge label="MOCK AI PROVIDER (Default)" size="sm" variant="blue" />
            </div>
            <p className="text-neutral-muted leading-relaxed">
              The platform is operating with zero required API keys using the high-fidelity deterministic MockAIProvider. When a server-side <code className="font-mono text-primary font-bold">GROQ_API_KEY</code> environment variable is detected, Groq AI inference is automatically engaged.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm text-primary mb-3">Gateway Integration Sandbox</h3>
          <div className="p-4 bg-surface rounded-xl border border-outline-variant space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">All 11 Connectors:</span>
              <MockBadge label="MOCK / SANDBOX MODE" size="sm" variant="amber" />
            </div>
            <p className="text-neutral-muted leading-relaxed">
              Statutory verification calls return realistic, deterministic responses with cryptographically verified checksums without invoking billable external government gateway endpoints.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm text-primary mb-3">Database & Storage Diagnostics</h3>
          <div className="flex gap-3">
            <button
              onClick={() => showToast('Platform store synchronized with memory snapshot.', 'success')}
              className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-container shadow-sm"
            >
              Re-index Data Store
            </button>
            <button
              onClick={() => showToast('Cache cleared successfully.', 'info')}
              className="bg-surface border border-outline-variant text-primary px-4 py-2 rounded-xl font-semibold hover:bg-surface-variant"
            >
              Clear Temporary Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
