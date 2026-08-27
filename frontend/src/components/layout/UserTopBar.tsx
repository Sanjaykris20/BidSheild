'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/context/UserStoreContext';
import { Bell, HelpCircle, Search, ChevronDown, CheckCircle2, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const UserTopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, addToast, tenders } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes('/user/dashboard')) return 'Bidder Overview & Health Index';
    if (pathname.includes('/user/marketplace')) return 'GeM Tender Marketplace';
    if (pathname.includes('/user/tenders/')) return 'Tender Specification & Requirements';
    if (pathname.includes('/user/bids/create')) return '5-Step Bid Submission Wizard';
    if (pathname.includes('/user/bids/')) return 'Bid Lifecycle & Compliance Audit';
    if (pathname.includes('/user/bids')) return 'My Bid Submissions';
    if (pathname.includes('/user/vault')) return 'Document Vault & OCR Repository';
    if (pathname.includes('/user/clarifications')) return 'Officer Clarification Desk';
    if (pathname.includes('/user/profile')) return 'Statutory Business Profile';
    return 'Vendor Compliance Portal';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches a tender
    const matchedTender = tenders.find(
      (t) =>
        t.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedTender) {
      router.push(`/user/tenders/${matchedTender.id}`);
      addToast({
        title: 'Tender Found',
        message: `Navigating to ${matchedTender.tenderNumber}`,
        type: 'success',
      });
    } else {
      router.push(`/user/marketplace?q=${encodeURIComponent(searchQuery)}`);
      addToast({
        title: 'Searching Marketplace',
        message: `Filtered tenders for "${searchQuery}"`,
        type: 'info',
      });
    }
    setIsSearchOpen(false);
  };

  return (
    <header className="h-topbar bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
      {/* Title & Gateway Pill */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <h1 className="font-display font-black text-lg text-slate-900 leading-tight truncate">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            SIH 26100 • AI-Powered Bid Compliance Verification Engine
          </p>
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Gateways Live: GSTN (45ms) • NSDL (112ms) • UDIN</span>
        </div>
      </div>

      {/* Center/Right Global Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search tenders, rules, documents (⌘K)"
            className="w-72 lg:w-80 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
          />

          {isSearchOpen && searchQuery.length > 1 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-elevated border border-slate-200 p-2 z-50 animate-slide-in">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 px-3 py-1">
                Tender Quick Matches
              </div>
              {tenders
                .filter((t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 3)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      router.push(`/user/tenders/${t.id}`);
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{t.tenderNumber}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {t.title}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-slate-100 px-2 py-0.5 rounded">
                      {t.estimatedValueFormatted}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </form>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200 p-3 z-50 animate-slide-in">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  1 Urgent Action
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/user/clarifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="block p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 transition-colors"
                >
                  <div className="font-bold text-amber-900 text-xs">
                    Officer Clarification Raised
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    CPCL Procurement requested renewed OEM authorization letter for BID-2026-1024.
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">
                    27 Aug 2026 Deadline
                  </div>
                </Link>

                <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="font-bold text-slate-900 text-xs">
                    GSTN Sync Confirmed
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    GSTR-3B filings matched successfully via live sandbox gateway.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Center */}
        <button
          onClick={() =>
            addToast({
              title: 'GeM Knowledge Base',
              message: 'Accessing SIH 26100 Procurement Rule Book and Guidelines.',
              type: 'info',
            })
          }
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile Pill */}
        <Link
          href="/user/profile"
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shadow-xs">
            AT
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {profile.authorizedSignatory.name}
            </span>
            <span className="text-[10px] text-slate-500 leading-none">
              Managing Director
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </Link>
      </div>
    </header>
  );
};
