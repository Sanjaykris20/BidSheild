'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { platformStore } from '@/lib/data/platformDataStore';

const CLIENT_SEARCH_DOCUMENTS = [
  { id: 'DOC-UDYAM-01', originalFilename: 'Udyam_Registration_Certificate.pdf', documentType: 'Udyam Certificate', fileSizeFormatted: '5.5 KB', status: 'VERIFIED' },
  { id: 'DOC-GST-01', originalFilename: 'GST_Registration_Certificate.pdf', documentType: 'GST Certificate', fileSizeFormatted: '5.7 KB', status: 'VERIFIED' },
  { id: 'DOC-GSTR-01', originalFilename: 'GST_Return_Filing_Summary.pdf', documentType: 'GSTR Filing Summary', fileSizeFormatted: '3.8 KB', status: 'VERIFIED' },
  { id: 'DOC-PAN-01', originalFilename: 'PAN_Verification_Report.pdf', documentType: 'PAN Card', fileSizeFormatted: '3.9 KB', status: 'VERIFIED' },
  { id: 'DOC-ITR-01', originalFilename: 'Income_Tax_Compliance_Report.pdf', documentType: 'ITR 3-Year Record', fileSizeFormatted: '4.9 KB', status: 'VERIFIED' },
  { id: 'DOC-EPFO-01', originalFilename: 'EPFO_Compliance_Statement.pdf', documentType: 'EPFO Statement', fileSizeFormatted: '4.0 KB', status: 'VERIFIED' },
  { id: 'DOC-ESIC-01', originalFilename: 'ESIC_Compliance_Statement.pdf', documentType: 'ESIC Statement', fileSizeFormatted: '3.8 KB', status: 'VERIFIED' },
  { id: 'DOC-STARTUP-01', originalFilename: 'Startup_India_Recognition_Certificate.pdf', documentType: 'Startup India Certificate', fileSizeFormatted: '3.7 KB', status: 'VERIFIED' },
  { id: 'DOC-NSIC-01', originalFilename: 'NSIC_Certificate.pdf', documentType: 'NSIC Certificate', fileSizeFormatted: '3.7 KB', status: 'VERIFIED' },
  { id: 'DOC-OEM-01', originalFilename: 'OEM_Authorization_Letter.pdf', documentType: 'OEM MAF Letter', fileSizeFormatted: '4.2 KB', status: 'VERIFIED' },
  { id: 'DOC-MII-01', originalFilename: 'Make_In_India_Declaration.pdf', documentType: 'Make in India Declaration', fileSizeFormatted: '5.4 KB', status: 'VERIFIED' },
  { id: 'DOC-UNDERTAKING-01', originalFilename: 'Bidder_Undertaking.pdf', documentType: 'Bidder Undertaking', fileSizeFormatted: '3.8 KB', status: 'VERIFIED' },
  { id: 'DOC-EXP-01', originalFilename: 'Experience_Certificate.pdf', documentType: 'Experience Certificate', fileSizeFormatted: '4.1 KB', status: 'VERIFIED' },
  { id: 'DOC-TURNOVER-01', originalFilename: 'Turnover_Certificate.pdf', documentType: 'Turnover Certificate', fileSizeFormatted: '4.6 KB', status: 'VERIFIED' },
  { id: 'DOC-DEBAR-01', originalFilename: 'Blacklisting_Declaration.pdf', documentType: 'Blacklisting Declaration', fileSizeFormatted: '3.5 KB', status: 'VERIFIED' },
];

interface SearchResultItem {
  id: string;
  category: 'Tenders' | 'Bids' | 'Bidders' | 'Documents' | 'Compliance' | 'Audit';
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
  icon: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { currentPersona } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('ALL');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Gather platform data
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // Role safety check: Bidders cannot search internal procurement records
    if (currentPersona === 'BIDDER') {
      return [];
    }

    const isAdmin = currentPersona === 'ADMIN';
    const isClient = currentPersona === 'CLIENT';

    // 1. TENDERS
    const tenders = platformStore.getTenders();
    for (const t of tenders) {
      if (
        t.tenderNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.organization.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.id,
          category: 'Tenders',
          title: t.title,
          subtitle: `${t.tenderNumber} • ${t.organization} • ${t.estimatedValue}`,
          badge: t.status,
          route: isAdmin ? '/admin/tenders' : '/client/tenders',
          icon: 'assignment',
        });
      }
    }

    // 2. BIDS
    const bids = platformStore.getBids();
    for (const b of bids) {
      if (
        b.bidId.toLowerCase().includes(q) ||
        b.bidderName.toLowerCase().includes(q) ||
        b.tenderNumber.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        (b.riskLevel && b.riskLevel.toLowerCase().includes(q))
      ) {
        results.push({
          id: b.id,
          category: 'Bids',
          title: `${b.bidderName} (${b.bidId})`,
          subtitle: `Tender: ${b.tenderNumber} • Score: ${b.complianceScore}/100 • Risk: ${b.riskLevel}`,
          badge: b.status.replace('_', ' '),
          route: isClient ? `/client/bids/${b.id}/evidence` : '/admin/bids',
          icon: 'fact_check',
        });
      }
    }

    // 3. BIDDERS / VENDORS
    const bidders = [
      { id: 'VEN-TECHCORP-01', name: 'TechCorp Solutions Pvt Ltd', pan: 'ABCDE1234F', gstin: '27ABCDE1234F1Z5', udyam: 'UDYAM-MH-18-00123' },
      { id: 'VEN-ALPHA-02', name: 'Alpha Defense Logistics Pvt Ltd', pan: 'ABCDE1234F', gstin: '33ABCDE1234F1Z5', udyam: 'UDYAM-TN-02-0012345' },
      { id: 'VEN-BRAVO-03', name: 'Bravo Heavy Engineering Corp', pan: 'AAACB9876G', gstin: '27AAACB9876G1Z2', udyam: 'UDYAM-MH-12-0099881' },
      { id: 'VEN-NATINFRA-04', name: 'National Infrastructure Solutions Pvt Ltd', pan: 'AAACN4410H', gstin: '29AAACN4410H1Z8', udyam: 'UDYAM-KR-03-0091823' },
      { id: 'VEN-VERTEX-05', name: 'Vertex Industrial Systems', pan: 'AAACV1290K', gstin: '07AAACV1290K1Z4', udyam: 'UDYAM-DL-01-0048192' },
      { id: 'VEN-BHARAT-06', name: 'Bharat Heavy Electric Infrastructure Ltd', pan: 'AAACB1102P', gstin: '23AAACB1102P1Z0', udyam: 'UDYAM-MP-08-0021901' },
    ];
    for (const v of bidders) {
      if (
        v.name.toLowerCase().includes(q) ||
        v.pan.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q) ||
        v.udyam.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      ) {
        results.push({
          id: v.id,
          category: 'Bidders',
          title: v.name,
          subtitle: `GSTIN: ${v.gstin} • PAN: ${v.pan} • Udyam: ${v.udyam}`,
          badge: v.id,
          route: isAdmin ? '/admin/bids' : '/client/bids',
          icon: 'apartment',
        });
      }
    }

    // 4. DOCUMENTS
    const docs = CLIENT_SEARCH_DOCUMENTS;
    for (const d of docs) {
      if (
        d.originalFilename.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      ) {
        results.push({
          id: d.id,
          category: 'Documents',
          title: d.originalFilename,
          subtitle: `${d.documentType} • ${d.fileSizeFormatted} • ${d.status}`,
          badge: d.status,
          route: isClient ? '/client/bids/BID-1024/evidence' : '/admin/document-types',
          icon: 'picture_as_pdf',
        });
      }
    }

    // 5. COMPLIANCE RULES
    const rules = platformStore.getRules();
    for (const r of rules) {
      if (
        r.ruleCode.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.severity.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.id,
          category: 'Compliance',
          title: `${r.ruleCode}: ${r.title}`,
          subtitle: `${r.category} • Weight: ${r.weightPercent}% • Severity: ${r.severity}`,
          badge: r.severity,
          route: isAdmin ? '/admin/rules' : '/client/bids/BID-1024/evidence',
          icon: 'gavel',
        });
      }
    }

    // 6. AUDIT RECORDS
    const auditLogs = platformStore.getAuditLogs();
    for (const a of auditLogs.slice(0, 50)) {
      if (
        a.id.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.resource.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q)
      ) {
        results.push({
          id: a.id,
          category: 'Audit',
          title: `${a.action} - ${a.resource}`,
          subtitle: `Actor: ${a.actor} (${a.role}) • ${a.timestamp}`,
          badge: a.result,
          route: isAdmin ? '/admin/audit' : '/client/audit',
          icon: 'history',
        });
      }
    }

    return results;
  }, [query, currentPersona]);

  const categories = useMemo(() => {
    const cats = ['ALL'];
    const seen = new Set<string>();
    searchResults.forEach(r => {
      if (!seen.has(r.category)) {
        seen.add(r.category);
        cats.push(r.category);
      }
    });
    return cats;
  }, [searchResults]);

  const filteredResults = useMemo(() => {
    if (selectedCategory === 'ALL') return searchResults;
    return searchResults.filter(r => r.category === selectedCategory);
  }, [searchResults, selectedCategory]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    router.push(item.route);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 px-4">
      <div
        className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant relative z-10 flex flex-col overflow-hidden animate-slide-in">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-outline-variant flex items-center gap-3 bg-surface">
          <span className="material-symbols-outlined text-primary text-[24px]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tenders, bids, bidders, documents, rules, audit events..."
            className="flex-1 bg-transparent border-none outline-none text-base text-primary placeholder:text-neutral-muted font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-muted hover:text-primary p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-neutral-muted bg-surface-variant border border-outline-variant rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        {query.trim() && searchResults.length > 0 && (
          <div className="px-4 py-2 bg-surface-alt/50 border-b border-outline-variant flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-neutral-muted font-semibold mr-1">Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat} {cat !== 'ALL' && `(${searchResults.filter(r => r.category === cat).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-outline-variant/40">
          {!query.trim() ? (
            <div className="p-8 text-center text-neutral-muted text-sm space-y-2">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                travel_explore
              </span>
              <p className="font-semibold text-primary">Global Procurement Compliance Search</p>
              <p className="text-xs">
                Type keywords like <span className="font-mono font-bold text-info">GEM/2026</span>,{' '}
                <span className="font-mono font-bold text-info">TechCorp</span>,{' '}
                <span className="font-mono font-bold text-info">GST</span>,{' '}
                <span className="font-mono font-bold text-info">Local Content</span>, or{' '}
                <span className="font-mono font-bold text-info">Udyam</span>.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-neutral-muted text-sm space-y-2">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <p className="font-semibold text-primary">No results found for &quot;{query}&quot;</p>
              <p className="text-xs">Try searching by tender reference number, company name, GSTIN, PAN, or rule ID.</p>
            </div>
          ) : (
            filteredResults.map(item => (
              <div
                key={`${item.category}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="p-3 rounded-xl hover:bg-surface-container/70 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-variant text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted bg-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/60">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-primary truncate group-hover:text-info transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-outline-variant bg-surface shrink-0 text-on-surface-variant">
                    {item.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-alt border-t border-outline-variant text-[11px] text-neutral-muted flex justify-between items-center px-4">
          <span>
            Showing <strong>{filteredResults.length}</strong> matching records
          </span>
          <span className="font-mono text-[10px]">BidShield AI Global Search Engine</span>
        </div>
      </div>
    </div>
  );
}
