'use client';
import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  X,
  Code2
} from 'lucide-react';
import { mockAuditLogs } from '@/lib/adminData';
import { exportAuditReportPdf } from '@/lib/export/exportUtils';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  result: string;
  ipAddress: string;
  details: string;
  hash: string;
}

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [resourceFilter, setResourceFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportAuditLogs = () => {
    try {
      exportAuditReportPdf(logs);
      showToast('Exporting complete tamper-proof audit trail as cryptographically signed PDF...');
    } catch (err) {
      showToast('Failed to export Audit Report.');
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ipAddress.includes(searchQuery);
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchesResource = resourceFilter === 'ALL' || l.resource === resourceFilter;
    return matchesSearch && matchesAction && matchesResource;
  });

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
            <h1 className="text-2xl font-black text-slate-900">Platform Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              Immutable CVC / CAG Compliant Ledger
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Section 12-13 Contract: Cryptographically verifiable record of all user, officer, AI, and administrative events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditLogs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: User, Client, Tender, Bid, Action, Date */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search actor, resource ID, IP, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="OVERRIDE">OVERRIDE</option>
              <option value="VERIFY">VERIFY</option>
              <option value="SUSPEND">SUSPEND</option>
              <option value="CONFIG_CHANGE">CONFIG CHANGE</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Resource:</span>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Resources</option>
              <option value="USER">USER</option>
              <option value="TENDER">TENDER</option>
              <option value="BID">BID</option>
              <option value="CONNECTOR">CONNECTOR</option>
              <option value="RULE">RULE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table: Columns: Timestamp, Actor, Role, Action, Resource, Result */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor & IP</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource & ID</th>
                <th className="p-4">Result</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="p-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* Actor */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.actor}</div>
                    <div className="font-mono text-[10px] text-slate-400">{log.ipAddress}</div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px] font-mono">
                      {log.role}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'SUSPEND' ? 'bg-rose-100 text-rose-800' :
                      log.action === 'OVERRIDE' ? 'bg-amber-100 text-amber-800' :
                      log.action === 'CONFIG_CHANGE' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Resource */}
                  <td className="p-4 font-mono">
                    <div className="font-bold text-slate-800">{log.resource}</div>
                    <div className="text-[10px] text-blue-600">{log.resourceId}</div>
                  </td>

                  {/* Result */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {log.result}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="p-4 text-slate-600 max-w-sm">
                    <p className="truncate">{log.details}</p>
                  </td>

                  {/* Inspect Button */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 ml-auto"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Audit Log Event Payload: {selectedLog.id}</h2>
                <p className="text-xs text-slate-500">{selectedLog.timestamp}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
