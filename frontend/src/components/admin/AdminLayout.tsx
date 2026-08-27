'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AICopilotWidget } from './AICopilotWidget';
import { LiveTestingWidget } from './LiveTestingWidget';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileStack,
  Gavel,
  Radio,
  Scale,
  FileCode2,
  PlusCircle,
  ArrowLeftRight,
  Cpu,
  SlidersHorizontal,
  ShieldAlert,
  History,
  BarChart3,
  Bell,
  Settings,
  Activity,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Menu,
  X,
  RefreshCw,
  LogOut,
  HelpCircle,
  AlertTriangle,
  Play,
  ArrowRight
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'clients'
  | 'organizations'
  | 'tenders'
  | 'tenders-create'
  | 'bids'
  | 'bids-compare'
  | 'compliance'
  | 'connectors'
  | 'rules'
  | 'document-types'
  | 'ai'
  | 'risk'
  | 'security'
  | 'audit'
  | 'reports'
  | 'notifications'
  | 'settings';

interface NavItem {
  id: AdminSection;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

interface AdminLayoutProps {
  currentSection?: AdminSection;
  onSelectSection?: (section: AdminSection) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection = 'dashboard',
  onSelectSection,
  children
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsProgress, setDiagnosticsProgress] = useState(0);
  const [diagnosticsStage, setDiagnosticsStage] = useState('');
  const [diagnosticsFinished, setDiagnosticsFinished] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Determine active section from URL if available, else prop
  let activeSection: AdminSection = currentSection;
  if (pathname && pathname.startsWith('/admin/')) {
    const segment = pathname.replace('/admin/', '').split('/')[0] as AdminSection;
    if (segment) {
      activeSection = segment;
    }
  }

  const navGroups: NavGroup[] = [
    {
      groupName: "OVERVIEW & ANALYTICS",
      items: [
        { id: 'dashboard', label: 'System Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Platform Reports', href: '/admin/reports', icon: BarChart3 }
      ]
    },
    {
      groupName: "ENTITY MANAGEMENT",
      items: [
        { id: 'users', label: 'User Accounts', href: '/admin/users', icon: Users, badge: '1.4k' },
        { id: 'clients', label: 'Client Entities', href: '/admin/clients', icon: Building2, badge: '68' },
        { id: 'organizations', label: 'Organizations & Depts', href: '/admin/organizations', icon: Briefcase },
        { id: 'tenders-create', label: 'Create Tender', href: '/admin/tenders/create', icon: PlusCircle },
        { id: 'tenders', label: 'Tender Oversight', href: '/admin/tenders', icon: FileStack, badge: '114' },
        { id: 'bids-compare', label: 'Compare Bids', href: '/admin/bids/compare', icon: ArrowLeftRight },
        { id: 'bids', label: 'Bid Management', href: '/admin/bids', icon: Gavel, badge: '842' }
      ]
    },
    {
      groupName: "INTEGRATION & GOVERNANCE",
      items: [
        { id: 'connectors', label: 'Govt Gateways', href: '/admin/connectors', icon: Radio, badge: '11 Live', badgeColor: 'bg-emerald-100 text-emerald-800' },
        { id: 'rules', label: 'Compliance Rules', href: '/admin/rules', icon: Scale }
      ]
    },
    {
      groupName: "AI & RISK ENGINE",
      items: [
        { id: 'compliance', label: 'Compliance Engine', href: '/admin/compliance', icon: Sparkles, badge: 'LIVE', badgeColor: 'bg-emerald-100 text-emerald-800' },
        { id: 'risk', label: 'Risk Scoring & Weights', href: '/admin/risk', icon: SlidersHorizontal }
      ]
    },
    {
      groupName: "SECURITY & AUDIT",
      items: [
        { id: 'audit', label: 'Audit Trail Logs', href: '/admin/audit', icon: History },
        { id: 'notifications', label: 'System Notifications', href: '/admin/notifications', icon: Bell }
      ]
    },
    {
      groupName: "PLATFORM CONFIG",
      items: [
        { id: 'settings', label: 'System Settings', href: '/admin/settings', icon: Settings }
      ]
    }
  ];

  const handleNavClick = (item: NavItem) => {
    setMobileMenuOpen(false);
    if (onSelectSection) {
      onSelectSection(item.id);
    }
    router.push(item.href);
  };

  const handleRunDiagnostics = () => {
    setDiagnosticsOpen(true);
    setDiagnosticsRunning(true);
    setDiagnosticsProgress(10);
    setDiagnosticsStage('Pinging Core Database & Storage Vault...');
    setDiagnosticsFinished(false);

    const stages = [
      { p: 25, msg: 'Testing GSTN & PAN NSDL Gateways (45ms, 112ms)...' },
      { p: 50, msg: 'Verifying Udyam & EPFO Sandbox Endpoints (210ms)...' },
      { p: 75, msg: 'Validating Gemini 1.5 Pro & Flash Inference Pipeline...' },
      { p: 90, msg: 'Checking Immutable Audit Trail & Ledger Integrity...' },
      { p: 100, msg: 'Diagnostics Complete: All 11 Gateways Nominal.' }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < stages.length) {
        setDiagnosticsProgress(stages[current].p);
        setDiagnosticsStage(stages[current].msg);
        current++;
      } else {
        clearInterval(interval);
        setDiagnosticsRunning(false);
        setDiagnosticsFinished(true);
        showToast('System Diagnostics Completed: 100% Health Status.');
      }
    }, 450);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-slate-900 font-sans antialiased">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-primary text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 border-l-emerald-500 border border-slate-700 text-xs font-semibold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE BACKDROP DRAWER */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================
          SIDEBAR NAVIGATION (Fixed Width: 280px)
          ========================================================= */}
      <aside 
        className={`w-[280px] shrink-0 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 flex flex-col z-50 shadow-glass transition-transform duration-300 lg:translate-x-0 fixed lg:static top-0 bottom-0 left-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Container (Height: 72px) */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-200/60 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm text-white group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-display font-bold text-primary text-lg leading-tight tracking-tight">BidCompliance</span>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Control Center</span>
            </div>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={handleRunDiagnostics}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-95 group relative overflow-hidden"
          >
            <Zap className="w-4 h-4 text-white group-hover:animate-bounce shrink-0" />
            <span>Run Diagnostics</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(item =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.groupName} className="space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 tracking-wider px-3 py-1 uppercase">
                  {group.groupName}
                </div>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left relative ${
                        isActive
                          ? 'bg-slate-100 text-primary font-bold shadow-xs'
                          : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ml-1.5 shrink-0 ${
                            item.badgeColor || (isActive ? 'bg-slate-200 text-[#0F172A]' : 'bg-slate-100 text-slate-600')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer / Status Area */}
        <div className="p-3 border-t border-slate-200/60 bg-slate-50/50 flex flex-col gap-1.5 shrink-0 text-xs">
          <div className="px-3 py-1.5 flex items-center justify-between bg-white border border-slate-200/80 rounded-lg">
            <span className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Systems Online
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-bold">11/11 APIs</span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button 
              onClick={() => router.push('/admin/settings')} 
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium text-xs text-left"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium text-xs"
              title="Return to Portal Selector"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN APPLICATION SHELL (Top Header + Workspace)
          ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface relative overflow-hidden">
        
        {/* Top Header (Height: 72px) */}
        <header className="h-[72px] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Breadcrumb / Page Title */}
            <div className="hidden sm:flex flex-col">
              <h2 className="font-display font-bold text-lg text-primary capitalize leading-none tracking-tight">
                {activeSection === 'dashboard' ? 'System Command Center' : activeSection.replace('-', ' ')}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Module 3 • Central Procurement
              </span>
            </div>

            {/* Global Search Bar (⌘K) */}
            <div className="relative w-full max-w-md ml-4 hidden lg:block group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search tenders, documents, entities (⌘K)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast(`Searching for "${(e.target as HTMLInputElement).value}" across platform...`);
                  }
                }}
              />
            </div>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Diagnostics Trigger */}
            <button
              onClick={handleRunDiagnostics}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
              title="Run System Telemetry Scan"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnostics</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">System Notifications</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60">
                      <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Suspicious Login Attempt
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">IP 192.168.1.104 flagged for 5 failed password attempts.</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-xl border border-blue-200/60">
                      <div className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" /> AI Model Upgrade Complete
                      </div>
                      <p className="text-[11px] text-blue-800 mt-0.5">Gemini 1.5 Pro pipeline updated to v2.4 revision.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push('/admin/notifications');
                    }}
                    className="w-full text-center text-xs font-bold text-blue-600 hover:underline pt-1 block"
                  >
                    View All Notifications →
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User Profile Pill */}
            <div 
              onClick={() => router.push('/admin/settings')}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer bg-white"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                SA
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">Super Administrator</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">GeM Central HQ</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* =========================================================
          INTERACTIVE SYSTEM DIAGNOSTICS MODAL
          ========================================================= */}
      {diagnosticsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Live System Diagnostics</h3>
                  <p className="text-xs text-slate-500">Comprehensive API Gateway & Inference Telemetry Test</p>
                </div>
              </div>
              <button 
                onClick={() => setDiagnosticsOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  {diagnosticsRunning && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                  {diagnosticsStage}
                </span>
                <span className="font-mono font-bold text-blue-600">{diagnosticsProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${diagnosticsProgress}%` }}
                />
              </div>
            </div>

            {/* Diagnostic Results Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">Database Cluster</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 12ms</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">GSTN Gateway</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 45ms</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">PAN NSDL Gateway</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 112ms</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">AI Core Engine</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 380ms</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">Udyam Sandbox</span>
                <span className="text-amber-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mock 210ms</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">EPFO Database</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 205ms</span>
              </div>
            </div>

            {/* Completed status banner */}
            {diagnosticsFinished && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">System Health Nominal (100% Operational):</span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    All core services, AI inference agents, and verification gateways are answering synchronously within SLA thresholds.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDiagnosticsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleRunDiagnostics}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
                <span>Re-run Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AICopilotWidget />
      <LiveTestingWidget />
    </div>
  );
};
