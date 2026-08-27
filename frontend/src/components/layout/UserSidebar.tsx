'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/context/UserStoreContext';
import { cn } from '@/lib/utils';

export const UserSidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile, openUploadModal, addToast, clarifications } = useUserStore();

  const pendingClarificationsCount = clarifications.filter(
    (c) => c.status === 'PENDING'
  ).length;

  const navItems = [
    {
      href: '/user/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      href: '/user/marketplace',
      label: 'Tender Marketplace',
      icon: 'storefront',
    },
    {
      href: '/user/bids/create',
      label: 'Create Bid (5-Step)',
      icon: 'add_circle',
    },
    {
      href: '/user/bids',
      label: 'My Submissions',
      icon: 'fact_check',
    },
    {
      href: '/user/vault',
      label: 'Document Vault',
      icon: 'folder_open',
    },
    {
      href: '/user/clarifications',
      label: 'Clarification Hub',
      icon: 'help_center',
      badge: pendingClarificationsCount > 0 ? String(pendingClarificationsCount) : undefined,
    },
    {
      href: '/user/profile',
      label: 'Company Profile',
      icon: 'domain',
    },
  ];

  return (
    <aside className="w-sidebar shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-soft h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-topbar flex items-center px-6 border-b border-slate-200 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-white text-[20px] icon-fill">
            assured_workload
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-display font-black text-slate-900 leading-tight truncate text-base">
            GeM BidVerif AI
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
              Module 1 • Vendor Portal
            </span>
          </div>
        </div>
      </div>

      {/* Primary Dynamic Action Button */}
      <div className="p-4 shrink-0">
        <button
          onClick={openUploadModal}
          className="w-full bg-primary hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
            upload_file
          </span>
          <span>Upload to Vault</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === '/user/dashboard'
              ? pathname === '/user/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'active bg-slate-100 text-primary font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'material-symbols-outlined text-[20px] transition-colors',
                    isActive ? 'text-primary icon-fill' : 'text-slate-400'
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Widget & Utility */}
      <div className="p-3 border-t border-slate-200 flex flex-col gap-2 shrink-0 bg-slate-50/60">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary font-black text-xs flex items-center justify-center shrink-0 border border-primary-fixed-dim">
            AT
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {profile.tradeName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">
              {profile.gstin}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <Link
            href="/user/profile"
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Settings</span>
          </Link>
          <button
            onClick={() =>
              addToast({
                title: 'Session Notice',
                message: 'You are signed in to SIH 26100 Prototype Session as Vendor Admin.',
                type: 'info',
              })
            }
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
