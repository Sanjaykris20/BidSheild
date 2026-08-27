'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Upload, User, Menu } from 'lucide-react';
import { useUserStore } from '@/context/UserStoreContext';
import { cn } from '@/lib/utils';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const { openUploadModal } = useUserStore();

  const links = [
    { href: '/user/dashboard', label: 'Dashboard' },
    { href: '/user/marketplace', label: 'Tenders' },
    { href: '/user/bids', label: 'Bids' },
    { href: '/user/vault', label: 'Vault' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/user/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-primary tracking-tight">BidShield</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive 
                      ? 'bg-slate-100 text-primary font-semibold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openUploadModal}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          
          <button className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <User className="w-4 h-4" />
          </button>
          
          <button className="md:hidden w-9 h-9 flex items-center justify-center text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
