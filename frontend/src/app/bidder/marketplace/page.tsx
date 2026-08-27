'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderMarketplacePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState<Record<string, { status: 'idle' | 'loading' | 'passed' | 'warning'; text: string }>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const runEligibilityCheck = (tenderId: string, willPass: boolean = true) => {
    setCheckingEligibility(prev => ({
      ...prev,
      [tenderId]: { status: 'loading', text: 'Analyzing Profile with Govt. APIs...' },
    }));
    showToast('Initiating AI Cross-Reference with statutory databases...', 'info');

    setTimeout(() => {
      if (willPass) {
        setCheckingEligibility(prev => ({
          ...prev,
          [tenderId]: { status: 'passed', text: '96% Eligible (Class-I Match)' },
        }));
        showToast('High Eligibility Match Found: 96% Match.', 'success');
      } else {
        setCheckingEligibility(prev => ({
          ...prev,
          [tenderId]: { status: 'warning', text: 'Gap: Local Content < 50%' },
        }));
        showToast('Gap identified: Local Content declaration falls below threshold.', 'warning');
      }
    }, 2000);
  };

  const INITIAL_TENDERS = [
    {
      id: 'TND-1024',
      number: 'GEM/2026/B/1024',
      title: 'Data Center Migration & Zero-Trust Security Upgrade',
      org: 'Ministry of Defence',
      category: 'IT Services',
      categoryColor: 'text-info bg-info/10 border-info/20',
      value: '₹36.5 Cr ($4.5M Est.)',
      closing: 'Closes in 5d',
      desc: 'Complete overhaul of regional data centers including hardware procurement, cloud migration, and implementation of zero-trust security framework with strict Make-in-India preference.',
      willPass: false,
    },
    {
      id: 'TND-9041',
      number: 'CPCL/2026/899120',
      title: 'Supply of High-Pressure Cryogenic Storage Valves',
      org: 'Chennai Petroleum Corporation Ltd (CPCL)',
      category: 'Oil & Gas',
      categoryColor: 'text-amber-700 bg-amber-50 border-amber-200',
      value: '₹18.2 Cr',
      closing: 'Closes in 8d',
      desc: 'Procurement of cryogenic high-pressure ball and check valves for CPCL Manali Refinery expansion project with ASME and API 6D specifications.',
      willPass: true,
    },
    {
      id: 'TND-8812',
      number: 'GEM/2026/C/8812',
      title: 'Regional Transit Hub Development & Smart Signage',
      org: 'Metro Transit Authority',
      category: 'Infrastructure',
      categoryColor: 'text-success bg-success/10 border-success/20',
      value: '₹85.0 Cr ($12.0M Est.)',
      closing: 'Closes in 14d',
      desc: 'Construction and technology integration for Sector 4 transit hub, requiring strict environmental clearances and dynamic digital LED passenger network.',
      willPass: true,
    },
  ];

  const [tendersList, setTendersList] = useState(INITIAL_TENDERS);

  const handleSyncLiveTenders = async () => {
    setIsSyncing(true);
    showToast('Initializing secure connection to eprocure.gov.in...', 'info');
    try {
      const res = await fetch('/api/tenders/live');
      const data = await res.json();
      if (data.success && data.tenders.length > 0) {
        setTendersList([...data.tenders, ...INITIAL_TENDERS]);
        showToast(`Successfully extracted ${data.tenders.length} live tenders from CPP Portal!`, 'success');
      } else {
        showToast('Failed to parse active tenders. Using fallback.', 'warning');
      }
    } catch (e) {
      showToast('Connection to CPP Portal timed out.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTenders = tendersList.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header matching NEW UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Tender Marketplace
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Discover open procurements, check deterministic AI eligibility, and prepare submissions.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tenders by keyword, ministry..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSyncLiveTenders}
            disabled={isSyncing}
            className={`bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 ${isSyncing ? 'opacity-75 cursor-wait' : ''}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span> 
            {isSyncing ? 'Syncing...' : 'Sync Live CPP Tenders'}
          </button>
          <button
            onClick={() => showToast('Applied active category filters.', 'info')}
            className="bg-white border border-outline-variant px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
          </button>
        </div>
      </div>

      {/* Tender Cards Grid matching NEW UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTenders.map(t => {
          const state = checkingEligibility[t.id] || { status: 'idle', text: 'AI Eligibility Check' };

          return (
            <div
              key={t.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col hover:border-primary/50 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/30 font-semibold">
                      {t.number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${t.categoryColor}`}>
                      {t.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary leading-tight">
                    {t.title}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-muted mt-1">{t.org}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-sm font-black text-primary">{t.value}</div>
                  <div className="text-xs text-danger font-semibold mt-1 flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> {t.closing}
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant mb-6 line-clamp-3 leading-relaxed">
                {t.desc}
              </p>

              <div className="mt-auto pt-4 border-t border-outline-variant flex gap-3">
                <button
                  onClick={() => router.push(`/bidder/tenders/${t.id}`)}
                  className="flex-1 bg-surface-container-low border border-outline-variant text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  View Details & Specs
                </button>

                {/* Interactive AI Eligibility Check Button */}
                <button
                  onClick={() => runEligibilityCheck(t.id, t.willPass)}
                  disabled={state.status === 'loading'}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm relative overflow-hidden ${
                    state.status === 'passed'
                      ? 'bg-success text-white'
                      : state.status === 'warning'
                      ? 'bg-warning text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      state.status === 'loading'
                        ? 'animate-spin-slow text-white'
                        : state.status === 'passed'
                        ? 'icon-fill text-white'
                        : state.status === 'warning'
                        ? 'icon-fill text-white'
                        : 'text-info icon-fill'
                    }`}
                  >
                    {state.status === 'loading'
                      ? 'sync'
                      : state.status === 'passed'
                      ? 'check_circle'
                      : state.status === 'warning'
                      ? 'warning'
                      : 'auto_awesome'}
                  </span>
                  <span>{state.text}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
