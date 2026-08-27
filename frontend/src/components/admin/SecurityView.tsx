'use client';
import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Globe,
  Laptop,
  Ban,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { mockSecuritySessions, mockSecurityAlerts } from '@/lib/adminData';
import { SecuritySession, SecurityAlert } from '@/types';

export const SecurityView: React.FC = () => {
  const [sessions, setSessions] = useState<SecuritySession[]>(mockSecuritySessions);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast(`Session ${sessionId} terminated immediately. Auth tokens revoked.`);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED', resolvedBy: 'Super Admin' } : a));
    setSelectedAlert(null);
    showToast(`Security alert ${alertId} marked as RESOLVED.`);
  };

  const handleBlockIp = (ip: string) => {
    showToast(`IP Subnet ${ip} added to Central Firewall Blacklist.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Security Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {alerts.filter(a => a.status !== 'RESOLVED').length} Active Security Incidents
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time active sessions, suspicious connection tracking, 2FA enforcement & threat incident management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Dispatched 2FA re-verification challenge to all procurement officers...')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
          >
            Enforce Global 2FA
          </button>
        </div>
      </div>

      {/* 4 SECURITY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Failed Logins (24h)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">14</div>
          <div className="text-[11px] text-slate-500 mt-1">3 flagged automated IPs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suspicious Sessions</div>
          <div className="text-2xl font-black text-amber-600 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-1">Unrecognized VPN Proxy</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Live Sessions</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{sessions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% TLS 1.3 encrypted</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">2FA Compliance</div>
          <div className="text-2xl font-black text-blue-600 mt-1">96.8%</div>
          <div className="text-[11px] text-slate-500 mt-1">Gov TOTP / SMS Gate</div>
        </div>

      </div>

      {/* SECURITY INCIDENT ALERTS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Security Incidents & Vigilance Alerts
            </h2>
            <p className="text-xs text-slate-500">Immediate threat detection and anomalous activity triage</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs ${
                a.status === 'RESOLVED' ? 'bg-slate-50 border-slate-200 opacity-60' :
                a.severity === 'CRITICAL' ? 'bg-rose-50/70 border-rose-200' :
                'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase border ${
                    a.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {a.severity}
                  </span>
                  <span className="font-bold text-slate-900">{a.title}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{a.timestamp}</span>
                </div>
                <p className="text-slate-700 text-xs">{a.description}</p>
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Actor: <strong>{a.actor}</strong></span>
                  <span>Origin IP: <strong className="font-mono">{a.ipAddress}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedAlert(a)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold border border-slate-200 shadow-2xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Event</span>
                </button>

                {a.status !== 'RESOLVED' && (
                  <>
                    <button
                      onClick={() => handleBlockIp(a.ipAddress)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-2xs flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block IP</span>
                    </button>
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE SESSIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              Active User Sessions & Connection Registry
            </h2>
            <p className="text-xs text-slate-500">Live authenticated browser sessions across GeM platform</p>
          </div>
          <span className="text-xs text-slate-400">{sessions.length} Live Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">User & Role</th>
                <th className="p-4">IP & Location</th>
                <th className="p-4">Browser / Client Device</th>
                <th className="p-4">Login Time</th>
                <th className="p-4">2FA Status</th>
                <th className="p-4">Session Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* User */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{s.userName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {s.userId}</div>
                  </td>

                  {/* IP & Location */}
                  <td className="p-4">
                    <div className="font-mono font-bold text-slate-800">{s.ipAddress}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{s.location}</span>
                    </div>
                  </td>

                  {/* Browser */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{s.browser}</div>
                    <div className="text-[11px] text-slate-500">{s.device}</div>
                  </td>

                  {/* Login Time */}
                  <td className="p-4 font-mono text-slate-600 text-[11px]">{s.loginTime}</td>

                  {/* 2FA */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      s.isTwoFactor ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.isTwoFactor ? '2FA Active' : 'No 2FA'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    }`}>
                      ● {s.status}
                    </span>
                  </td>

                  {/* Action: Terminate Session, Suspend Account */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTerminateSession(s.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs"
                      >
                        Terminate Session
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW EVENT DETAIL MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Security Incident Detail: {selectedAlert.id}</h2>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Incident Description</span>
                <p className="font-semibold text-slate-900">{selectedAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Source IP</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedAlert.ipAddress}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Timestamp</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedAlert.timestamp}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
