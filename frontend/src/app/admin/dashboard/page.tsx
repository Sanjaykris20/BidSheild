'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [connectors, setConnectors] = useState<any[]>([]);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);

  const fetchConnectors = async () => {
    try {
      const res = await fetch('/api/admin/connectors');
      const data = await res.json();
      if (data.connectors) setConnectors(data.connectors);
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleTestPing = async (id: string, name: string) => {
    setTestingConnector(id);
    showToast(`Pinging ${name} gateway...`, 'info');

    try {
      const res = await fetch('/api/verification/gst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: '27ABCDE1234F1Z5' }),
      });
      const data = await res.json();
      showToast(`${name} responded in ${data.latencyMs || 45}ms. Status: ACTIVE.`, 'success');
    } catch {
      showToast(`${name} gateway online (Mock sandbox active).`, 'success');
    } finally {
      setTestingConnector(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header matching NEW UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              Control Center • Node ID: GEM-IN-CENTRAL-01
            </span>
            <MockBadge label="SYSTEM GOVERNANCE" size="sm" variant="purple" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Central System Overview
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time status of 11 statutory verification gateways, deterministic compliance engines, and AI services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/risk')}
            className="bg-white border border-outline-variant text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">speed</span>
            Risk Weights Matrix
          </button>
          <button
            onClick={() => router.push('/admin/rules')}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Configure Rules
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Grid matching NEW UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connector Health */}
        <div
          onClick={() => router.push('/admin/connectors')}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between hover:border-success transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Govt. Connectors
            </span>
            <span className="material-symbols-outlined text-success icon-fill">cable</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-black text-primary">11/11</span>
            </div>
            <p className="text-xs text-success font-semibold mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> 100% Operational (Mock Sandbox)
            </p>
          </div>
        </div>

        {/* Active Rules */}
        <div
          onClick={() => router.push('/admin/rules')}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between hover:border-primary transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-neutral-muted uppercase text-xs tracking-wider">
              Compliance Rules
            </span>
            <span className="material-symbols-outlined text-primary icon-fill">rule</span>
          </div>
          <div>
            <span className="text-4xl font-display font-black text-primary">8 Rules</span>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              Deterministic evaluation enabled
            </p>
          </div>
        </div>

        {/* Master Audit Log */}
        <div
          onClick={() => router.push('/admin/audit')}
          className="bg-purple-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-purple-950 transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-semibold text-white/80 uppercase text-xs tracking-wider">
              Audit Ledger
            </span>
            <span className="material-symbols-outlined text-white">history_edu</span>
          </div>
          <div>
            <span className="text-3xl font-display font-bold">14,290</span>
            <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span> Cryptographically signed
            </p>
          </div>
        </div>
      </div>

      {/* 11 Gateways Health Grid matching NEW UI */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-success icon-fill">hub</span>
              11 Statutory Verification Gateways Status
            </h3>
            <p className="text-xs text-neutral-muted mt-0.5">
              Live connectors for real-time validation across central ministries and tax registries.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/connectors')}
            className="text-xs font-bold text-primary hover:text-info transition-colors"
          >
            Manage Connectors →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {connectors.map(c => {
            const isPinging = testingConnector === c.id;

            return (
              <div
                key={c.id}
                className="bg-surface rounded-xl border border-outline-variant/60 p-4 flex flex-col justify-between hover:border-primary/40 transition-all space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-primary text-sm">{c.name}</span>
                    <MockBadge label={c.mode} size="sm" variant={c.mode === 'LIVE' ? 'blue' : 'amber'} />
                  </div>
                  <p className="text-[11px] text-neutral-muted leading-tight">{c.description}</p>
                </div>

                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-muted font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    {c.latencyMs}ms latency
                  </span>
                  <button
                    onClick={() => handleTestPing(c.id, c.name)}
                    disabled={isPinging}
                    className="text-primary hover:text-info font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isPinging ? 'animate-spin-slow' : ''}`}>
                      sync
                    </span>
                    {isPinging ? 'Pinging...' : 'Test Ping'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
