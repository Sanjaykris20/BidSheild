'use client';
import React, { useState } from 'react';
import {
  Radio,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  SlidersHorizontal,
  FileText,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  KeyRound,
  X,
  Code2,
  Send
} from 'lucide-react';
import { mockConnectors, mockConnectorLogs } from '@/lib/adminData';
import { ConnectorConfig, ConnectorEnvironment, ConnectorLog } from '@/types';

export const ConnectorsView: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>(mockConnectors);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorConfig | null>(null);
  
  // Config modal state
  const [configModalConnector, setConfigModalConnector] = useState<ConnectorConfig | null>(null);
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [configRateLimit, setConfigRateLimit] = useState(600);

  // Logs drawer state
  const [showLogsDrawer, setShowLogsDrawer] = useState<ConnectorConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleEnable = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        showToast(`${c.name} is now ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleOpenConfigModal = (c: ConnectorConfig) => {
    setConfigModalConnector(c);
    setConfigEndpoint(c.endpointUrl);
    setConfigKey(c.apiKeyMasked);
    setConfigRateLimit(c.rateLimitPerMin);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalConnector) return;
    setConnectors(prev => prev.map(c => c.id === configModalConnector.id ? {
      ...c,
      endpointUrl: configEndpoint,
      apiKeyMasked: configKey,
      rateLimitPerMin: Number(configRateLimit)
    } : c));
    setConfigModalConnector(null);
    showToast(`Configuration updated for ${configModalConnector.name}`);
  };

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || c.environment === envFilter;
    return matchesSearch && matchesEnv;
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
            <h1 className="text-2xl font-black text-slate-900">Government & Master Connectors</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              11 Managed Gateways
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time API integrations with GSTN, Udyam, NSDL PAN, Income Tax, EPFO, ESIC, DPIIT, NSIC, DigiLocker & Debarment Registries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Dispatched global health check ping across all 11 connectors...')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test All Gateways</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search connector name, gateway, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Environment:</span>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Environments</option>
            <option value="LIVE">LIVE</option>
            <option value="SANDBOX">SANDBOX</option>
            <option value="MOCK">MOCK</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
        </div>
      </div>

      {/* Connectors Grid (11 Connectors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnectors.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              
              {/* Top status bar */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    GATEWAY TYPE: {c.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{c.name}</h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    c.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    c.status === 'DEGRADED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    ● {c.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                {c.description}
              </p>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Latency</div>
                  <div className="font-mono font-bold text-slate-800">{c.responseTime}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Success</div>
                  <div className="font-bold text-emerald-700">{c.successRate}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Error Rate</div>
                  <div className="font-mono font-bold text-slate-700">{c.errorRate}</div>
                </div>
              </div>

              {/* Endpoint Preview */}
              <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg truncate border border-slate-100">
                {c.endpointUrl}
              </div>

            </div>

            {/* Action Buttons: Enable, Disable, Configure, View Logs */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs">

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleEnable(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                    c.status === 'ONLINE' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  title={c.status === 'ONLINE' ? 'Disable Connector' : 'Enable Connector'}
                >
                  {c.status === 'ONLINE' ? 'Disable' : 'Enable'}
                </button>

                <button
                  onClick={() => handleOpenConfigModal(c)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Configure Connector Parameters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowLogsDrawer(c)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="View Request/Response Logs"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* CONFIGURE MODAL */}
      {configModalConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Configure {configModalConnector.name}</h2>
              <button onClick={() => setConfigModalConnector(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Endpoint URL *</label>
                <input
                  type="text"
                  required
                  value={configEndpoint}
                  onChange={(e) => setConfigEndpoint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">API Key / Secret Token *</label>
                <input
                  type="text"
                  required
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rate Limit (req/min)</label>
                  <input
                    type="number"
                    value={configRateLimit}
                    onChange={(e) => setConfigRateLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setConfigModalConnector(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGS DRAWER */}
      {showLogsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full h-[90vh] p-6 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Request Logs: {showLogsDrawer.name}</h2>
                  <p className="text-xs text-slate-500">Recent API execution calls and HTTP responses</p>
                </div>
                <button onClick={() => setShowLogsDrawer(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                {mockConnectorLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        HTTP {log.httpCode} • {log.latencyMs}ms
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">REQUEST:</div>
                      <pre className="p-2 bg-slate-900 text-slate-300 rounded font-mono text-[10px] overflow-x-auto">
                        {log.requestPayload}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">RESPONSE:</div>
                      <pre className="p-2 bg-slate-900 text-emerald-400 rounded font-mono text-[10px] overflow-x-auto">
                        {log.responsePayload}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowLogsDrawer(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
