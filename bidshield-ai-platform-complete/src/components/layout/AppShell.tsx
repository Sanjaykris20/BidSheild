'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, PERSONA_PROFILES, UserPersona } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { GlobalSearchModal } from '@/components/shared/GlobalSearchModal';
import { NotificationCenter } from '@/components/shared/NotificationCenter';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentPersona, profile, loginAs, logout } = useAuth();
  const { showToast } = useToast();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Determine current active persona based on route if not explicitly set
  let activePersona: UserPersona = currentPersona || 'CLIENT';
  if (pathname.startsWith('/bidder')) activePersona = 'BIDDER';
  else if (pathname.startsWith('/client')) activePersona = 'CLIENT';
  else if (pathname.startsWith('/admin')) activePersona = 'ADMIN';

  const currentProfile = PERSONA_PROFILES[activePersona];

  // Role check: Global search is restricted to ADMIN and CLIENT (Procurement Officer)
  const isSearchAuthorized = activePersona === 'ADMIN' || activePersona === 'CLIENT';

  // Global ⌘K / Ctrl+K keyboard shortcut listener for authorized roles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && isSearchAuthorized) {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchAuthorized]);

  // Navigation Links tailored to each Persona
  const navItems = {
    BIDDER: [
      { path: '/bidder/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/bidder/vault', icon: 'folder_open', label: 'Document Vault' },
      { path: '/bidder/marketplace', icon: 'search', label: 'Tender Marketplace' },
      { path: '/bidder/bids', icon: 'description', label: 'My Submissions' },
      { path: '/bidder/clarifications', icon: 'chat', label: 'Clarifications' },
      { path: '/bidder/profile', icon: 'badge', label: 'Company Profile' },
    ],
    CLIENT: [
      { path: '/client/dashboard', icon: 'dashboard', label: 'Procurement Desk' },
      { path: '/client/bids', icon: 'fact_check', label: 'Bid Evaluations' },
      { path: '/client/tenders', icon: 'assignment', label: 'Tenders & Blueprints' },
      { path: '/client/comparison', icon: 'compare_arrows', label: 'Comparison Matrix' },
      { path: '/client/clarifications', icon: 'forum', label: 'Clarification Hub' },
      { path: '/client/decisions', icon: 'gavel', label: 'Final Decisions' },
      { path: '/client/reports', icon: 'bar_chart', label: 'BI Analytics' },
      { path: '/client/audit', icon: 'history_edu', label: 'Audit Trail' },
    ],
    ADMIN: [
      { path: '/admin/dashboard', icon: 'admin_panel_settings', label: 'System Overview' },
      { path: '/admin/users', icon: 'group', label: 'User Governance' },
      { path: '/admin/clients', icon: 'corporate_fare', label: 'PSU & Ministry Buyers' },
      { path: '/admin/organizations', icon: 'apartment', label: 'Organizations' },
      { path: '/admin/tenders', icon: 'folder_managed', label: 'Tender Oversight' },
      { path: '/admin/bids', icon: 'rule', label: 'Bid Governance' },
      { path: '/admin/connectors', icon: 'cable', label: 'Govt. Gateways (12)' },
      { path: '/admin/rules', icon: 'tune', label: 'Compliance Rules' },
      { path: '/admin/document-types', icon: 'article', label: 'Document Types' },
      { path: '/admin/ai', icon: 'neurology', label: 'AI Services Core' },
      { path: '/admin/risk', icon: 'speed', label: 'Risk Configuration' },
      { path: '/admin/security', icon: 'shield', label: 'Security Command' },
      { path: '/admin/audit', icon: 'history', label: 'Master Audit Trail' },
      { path: '/admin/reports', icon: 'analytics', label: 'Platform Reports' },
      { path: '/admin/settings', icon: 'settings', label: 'System Settings' },
    ],
  }[activePersona];

  const handlePrimaryAction = () => {
    if (activePersona === 'BIDDER') {
      router.push('/bidder/vault');
      showToast('Opening Document Vault for upload...', 'info');
    } else if (activePersona === 'CLIENT') {
      router.push('/client/tenders/create');
      showToast('Launching 7-Step Tender Creation Wizard...', 'info');
    } else {
      router.push('/admin/connectors');
      showToast('Opening Gateways Diagnostic Test Bench...', 'info');
    }
  };

  const primaryActionLabels = {
    BIDDER: { text: 'Upload Doc', icon: 'upload_file' },
    CLIENT: { text: 'Create Tender', icon: 'add_circle' },
    ADMIN: { text: 'Diagnostics', icon: 'speed' },
  }[activePersona];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-alt font-sans text-on-surface">
      {/* SIDEBAR matching NEW UI */}
      <aside className="w-sidebar shrink-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Brand Area */}
        <div
          onClick={() => router.push('/')}
          className="h-topbar flex items-center px-6 border-b border-outline-variant/50 gap-3 shrink-0 cursor-pointer hover:bg-surface transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-lg icon-fill">shield</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-display font-black text-primary leading-tight truncate">BidShield AI</span>
            <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-wider truncate">
              {currentProfile.badge}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={handlePrimaryAction}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">
              {primaryActionLabels.icon}
            </span>
            <span>{primaryActionLabels.text}</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path) && item.path.split('/').length > 2);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-left font-medium transition-colors ${
                  isActive
                    ? 'active bg-surface-container font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-fill text-primary' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Settings / Logout */}
        <div className="p-3 border-t border-outline-variant/50 flex flex-col gap-1 shrink-0 bg-surface-alt/30">
          <button
            onClick={() => router.push(activePersona === 'ADMIN' ? '/admin/settings' : activePersona === 'BIDDER' ? '/bidder/profile' : '/client/reports')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-sm font-medium w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings & Preferences</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 transition-colors text-sm font-medium w-full text-left mt-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Switch Role / Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-alt relative overflow-hidden">
        {/* Top Header matching NEW UI */}
        <header className="h-topbar bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/50 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-display font-bold text-xl text-primary hidden sm:block truncate">
              {currentProfile.title}
            </h2>

            {/* Global Search Bar (ROLE RESTRICTED: Admin & Procurement Officer only) */}
            {isSearchAuthorized && (
              <div
                onClick={() => setIsSearchModalOpen(true)}
                className="relative w-full max-w-md ml-4 hidden lg:flex items-center bg-surface border border-outline-variant rounded-full px-3.5 py-1.5 cursor-pointer hover:border-primary transition-all group shadow-sm"
              >
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] mr-2">
                  search
                </span>
                <span className="text-xs text-neutral-muted flex-1 select-none">
                  Search tenders, bids, documents, rules...
                </span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono text-neutral-muted bg-surface-variant border border-outline-variant rounded shadow-inner">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Right Actions: Notifications & Role Switcher */}
          <div className="flex items-center gap-3 relative">
            {/* Search icon button for mobile / smaller screens */}
            {isSearchAuthorized && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="lg:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
                title="Global Search"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Functional Notification Center Dropdown */}
              <NotificationCenter
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            <div className="h-6 w-px bg-outline-variant mx-1 hidden sm:block"></div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-surface-container transition-colors border border-outline-variant/60 bg-white shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-black flex items-center justify-center text-sm border border-primary-fixed-dim">
                  {currentProfile.initials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-primary leading-none">
                    {currentProfile.name}
                  </span>
                  <span className="text-[10px] text-neutral-muted font-medium mt-0.5">
                    {currentProfile.badge}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  unfold_more
                </span>
              </button>

              {isPersonaMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-outline-variant py-2 z-50 animate-slide-in">
                  <div className="px-3 py-1.5 border-b border-outline-variant text-[11px] font-bold text-neutral-muted uppercase tracking-wider">
                    Switch Operational Persona
                  </div>

                  <button
                    onClick={() => {
                      loginAs('BIDDER');
                      setIsPersonaMenuOpen(false);
                      showToast('Switched to Vendor / Bidder Portal', 'info');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${activePersona === 'BIDDER' ? 'bg-blue-50 text-info font-bold' : 'hover:bg-surface-alt'}`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-info">storefront</span>
                    <div>
                      <div className="font-semibold text-primary">Vendor / Bidder</div>
                      <div className="text-[10px] text-neutral-muted">TechCorp Solutions Pvt Ltd</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAs('CLIENT');
                      setIsPersonaMenuOpen(false);
                      showToast('Switched to Procurement Desk', 'info');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${activePersona === 'CLIENT' ? 'bg-amber-50 text-warning font-bold' : 'hover:bg-surface-alt'}`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-warning">gavel</span>
                    <div>
                      <div className="font-semibold text-primary">Procurement Officer</div>
                      <div className="text-[10px] text-neutral-muted">P. Sharma (CPCL Desk)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loginAs('ADMIN');
                      setIsPersonaMenuOpen(false);
                      showToast('Switched to Admin Control Center', 'info');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${activePersona === 'ADMIN' ? 'bg-purple-50 text-purple-600 font-bold' : 'hover:bg-surface-alt'}`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-purple-600">admin_panel_settings</span>
                    <div>
                      <div className="font-semibold text-primary">System Administrator</div>
                      <div className="text-[10px] text-neutral-muted">Central Governance</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          {children}
        </main>
      </div>

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
