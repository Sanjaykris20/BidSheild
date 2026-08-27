'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  FileStack,
  Gavel,
  ShieldCheck,
  Cpu,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Server,
  Zap,
  Clock,
  Database,
  Radio,
  FileText,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Play,
  Pause,
  Download,
  Trash2,
  Lock,
  Search,
  Sparkles
} from 'lucide-react';
import { mockAdminKPIs, mockConnectors, mockAuditLogs, mockSecurityAlerts } from '@/lib/adminData';
import { AdminSection } from './AdminLayout';

interface DashboardViewProps {
  onNavigate?: (section: AdminSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isTailingPaused, setIsTailingPaused] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Live telemetry feeds synchronized with all 11 Gateways.');
    }, 600);
  };

  // Live Audit Log Stream State
  const initialLogs = [
    { time: "11:02:01Z", tag: "[SYS-AI]", tagColor: "text-blue-400", msg: "Inference complete: BID-1024. Payload written to immutable evidence store." },
    { time: "11:02:05Z", tag: "[API-GW]", tagColor: "text-emerald-400", msg: "GSTN Connector: 200 OK. Hash verified for 27ABCDE1234F1Z5." },
    { time: "11:03:12Z", tag: "[RULE-E]", tagColor: "text-amber-400", msg: "Engine EVAL: REQ-LC-01 returned FALSE. Confidence 0.98. Evidence mapped to blob/pg1." },
    { time: "11:05:00Z", tag: "[USR-AC]", tagColor: "text-purple-400", msg: "Officer (ID: OFF-04) accessed Evidence Viewer matrix for BID-1024.", isHighlighted: true },
    { time: "11:06:14Z", tag: "[API-GW]", tagColor: "text-emerald-400", msg: "PAN NSDL Gateway: 200 OK. Active verification for AAACA1234F." },
    { time: "11:07:30Z", tag: "[SYS-AI]", tagColor: "text-blue-400", msg: "OCR Pipeline processed 4 pages of Make_In_India_Declaration.pdf (240ms)." },
    { time: "11:08:45Z", tag: "[SEC-ALT]", tagColor: "text-rose-400", msg: "Suspicious session detected from IP 192.168.1.104 (5 failed attempts)." }
  ];

  const [liveLogs, setLiveLogs] = useState(initialLogs);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs unless paused
  useEffect(() => {
    if (!isTailingPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLogs, isTailingPaused]);

  // Simulate incoming live telemetry stream every 8 seconds
  useEffect(() => {
    if (isTailingPaused) return;

    const streamTemplates = [
      { tag: "[API-GW]", tagColor: "text-emerald-400", msg: "EPFO Gateway: 200 OK. ECR verification matched 142 employees." },
      { tag: "[SYS-AI]", tagColor: "text-blue-400", msg: "Entity Resolver: Bidder PAN & GSTIN resolved to verified MSME profile." },
      { tag: "[RULE-E]", tagColor: "text-amber-400", msg: "Turnover check evaluated: 3-Year Audited ITR meets ₹10.00 Cr criterion." },
      { tag: "[USR-AC]", tagColor: "text-purple-400", msg: "Admin committed rule weight update to Risk Scoring Engine." },
      { tag: "[API-GW]", tagColor: "text-emerald-400", msg: "DigiLocker Vault: Retrieved verified ISO 27001 certificate hash." }
    ];

    const interval = setInterval(() => {
      const randomItem = streamTemplates[Math.floor(Math.random() * streamTemplates.length)];
      const now = new Date();
      const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')}Z`;

      setLiveLogs(prev => [
        ...prev.slice(-25), // keep last 25
        { time: timeStr, tag: randomItem.tag, tagColor: randomItem.tagColor, msg: randomItem.msg }
      ]);
    }, 7000);

    return () => clearInterval(interval);
  }, [isTailingPaused]);

  const systemHealthServices = [
    { name: "Database (PostgreSQL Cluster)", category: "Storage & State", status: "ONLINE", latency: "12ms", uptime: "99.99%", load: "24%" },
    { name: "AI Core (Gemini 1.5 Pro / Flash)", category: "Inference Engine", status: "ONLINE", latency: "380ms", uptime: "99.95%", load: "62%" },
    { name: "OCR & Document Vision", category: "Extraction", status: "ONLINE", latency: "240ms", uptime: "99.89%", load: "48%" },
    { name: "GSTN Statutory API", category: "Gov Connector", status: "ONLINE", latency: "142ms", uptime: "99.96%", load: "31%" },
    { name: "Udyam MSE Registry", category: "Gov Connector", status: "ONLINE", latency: "210ms", uptime: "99.88%", load: "19%" },
    { name: "DigiLocker / Storage Vault", category: "Document Storage", status: "ONLINE", latency: "175ms", uptime: "100.0%", load: "15%" },
    { name: "Realtime WebSocket Hub", category: "Live Telemetry", status: "ONLINE", latency: "8ms", uptime: "99.99%", load: "11%" },
    { name: "NSIC Single Point Gateway", category: "External API", status: "DEGRADED", latency: "620ms", uptime: "95.80%", load: "84%" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedbackToast}
        </div>
      )}

      {/* TOP HEADER: SYSTEM COMMAND CENTER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">System Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global telemetry, API connector status, and live audit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            className={`px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 shadow-xs ${
              refreshing ? 'opacity-80' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('connectors')}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manage Gateways</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          8 CORE PLATFORM KPIS GRID
          ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Core Platform Metrics</h2>
          <span className="text-[11px] text-slate-400 font-mono">Live Telemetry • SIH 26100</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Users */}
          <div 
            onClick={() => onNavigate && onNavigate('users')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.users.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {mockAdminKPIs.usersActiveToday} active today
            </div>
          </div>

          {/* KPI 2: Clients */}
          <div 
            onClick={() => onNavigate && onNavigate('clients')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Client Entities</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.clients}</div>
            <div className="text-[11px] text-slate-500 mt-1">PSUs & Ministries</div>
          </div>

          {/* KPI 3: Organizations */}
          <div 
            onClick={() => onNavigate && onNavigate('organizations')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Organizations</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.organizations}</div>
            <div className="text-[11px] text-slate-500 mt-1">Departments / Units</div>
          </div>

          {/* KPI 4: Tenders */}
          <div 
            onClick={() => onNavigate && onNavigate('tenders')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Live Tenders</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <FileStack className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.tenders}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">₹ 2,450 Cr Active Value</div>
          </div>

          {/* KPI 5: Bids */}
          <div 
            onClick={() => onNavigate && onNavigate('bids')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Bids Evaluated</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <Gavel className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.bids}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">84.6% avg pass rate</div>
          </div>

          {/* KPI 6: Verifications */}
          <div 
            onClick={() => onNavigate && onNavigate('connectors')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">API Verifications</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.verifications.toLocaleString()}</div>
            <div className="text-[11px] text-teal-600 font-semibold mt-1">11/11 Active APIs</div>
          </div>

          {/* KPI 7: AI Requests */}
          <div 
            onClick={() => onNavigate && onNavigate('ai')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">AI Inferences (24h)</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.aiRequests24h.toLocaleString()}</div>
            <div className="text-[11px] text-sky-600 font-semibold mt-1">99.4% Extraction Acc</div>
          </div>

          {/* KPI 8: System Alerts */}
          <div 
            onClick={() => onNavigate && onNavigate('security')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">System Alerts</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">{mockAdminKPIs.systemAlerts}</div>
            <div className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> 2 flagged sessions
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          MIDDLE SECTION: GOVT GATEWAYS + AI TELEMETRY
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: GOVT VERIFICATION GATEWAYS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
              <Radio className="w-4 h-4 text-slate-500" />
              <span>Govt. Verification Gateways</span>
            </h3>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              All Systems Nominal
            </span>
          </div>

          <div className="p-5 flex-1 bg-slate-50/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* GSTN Connector */}
              <div 
                onClick={() => onNavigate && onNavigate('connectors')}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">GSTN Portal API</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Live Env • Latency: 45ms</div>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </div>

              {/* PAN Gateway */}
              <div 
                onClick={() => onNavigate && onNavigate('connectors')}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">PAN NSDL Gateway</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Live Env • Latency: 112ms</div>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </div>

              {/* Udyam Connector (Sandbox Mock Demo) */}
              <div 
                onClick={() => onNavigate && onNavigate('connectors')}
                className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A] group-hover:text-amber-800 transition-colors">Udyam Registration</div>
                    <div className="text-xs font-mono font-bold text-amber-700 mt-0.5">MOCK / Sandbox Mode</div>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </div>

              {/* EPFO Connector */}
              <div 
                onClick={() => onNavigate && onNavigate('connectors')}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">EPFO Database</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Live Env • Latency: 205ms</div>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </div>

            </div>

            {/* Architectural Note */}
            <p className="text-xs text-slate-500 text-center px-4 pt-2 leading-relaxed">
              <span className="font-bold text-slate-700">Architectural Note (SIH):</span> Unavailable live production APIs automatically degrade to deterministic MOCK responses to maintain end-to-end verification pipeline integrity during demonstration.
            </p>
          </div>
        </div>

        {/* RIGHT 1 COL: AI INFERENCE ENGINE TELEMETRY */}
        <div className="bg-[#0F172A] text-white rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 z-0 pointer-events-none"></div>
          {/* Abstract Tech SVG */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>

          <div className="relative z-10 flex justify-between items-start mb-6">
            <h3 className="font-bold flex items-center gap-2 text-base text-white">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>AI Inference Engine</span>
            </h3>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/30 uppercase font-bold backdrop-blur-xs animate-pulse">
              Online
            </span>
          </div>

          <div className="relative z-10 space-y-5">
            <div>
              <div className="text-[11px] text-slate-300 uppercase tracking-wider mb-1 font-bold">Docs Extracted (24h)</div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl font-black font-display tracking-tight">14,291</div>
                <span className="text-emerald-400 text-xs font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> 12%
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-300 uppercase tracking-wider mb-2 font-bold flex justify-between">
                <span>Average Extraction Confidence</span>
                <span className="font-mono text-blue-400">96.4%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '96.4%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">8/8 Microservices Active</span>
              <button
                onClick={() => onNavigate && onNavigate('ai')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <span>AI Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          BOTTOM SECTION: MASTER AUDIT TRAIL (LIVE TAILING)
          ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">Master Audit Trail (Live Tailing)</h3>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono ml-2">
              <span className={`w-2 h-2 rounded-full ${isTailingPaused ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></span>
              {isTailingPaused ? 'Paused' : 'Recording...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTailingPaused(!isTailingPaused)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1 transition-colors"
            >
              {isTailingPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3 text-amber-600" />}
              <span>{isTailingPaused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>
            <button
              onClick={() => {
                setLiveLogs([]);
                showToast('Audit tailing console buffer cleared.');
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3 text-slate-400" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('audit')}
              className="px-2.5 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Full Audit Logs</span>
            </button>
          </div>
        </div>

        {/* Dark Terminal Console Output */}
        <div 
          ref={logContainerRef}
          className="p-4 sm:p-5 bg-[#0f172a] font-mono text-xs text-gray-300 h-64 overflow-y-auto space-y-2.5 custom-scrollbar"
        >
          {liveLogs.map((log, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 transition-colors ${
                log.isHighlighted ? 'bg-white/10 p-1.5 -mx-1.5 px-1.5 rounded-lg text-white font-semibold' : ''
              }`}
            >
              <span className="text-gray-500 shrink-0 select-none font-medium">{log.time}</span>
              <span className={`${log.tagColor} shrink-0 font-bold`}>{log.tag}</span>
              <span className="leading-relaxed">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
