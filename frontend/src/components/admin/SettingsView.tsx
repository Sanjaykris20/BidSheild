'use client';
import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Scale,
  Bell,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { mockSystemSettings } from '@/lib/adminData';
import { SystemSettingsConfig } from '@/types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsConfig>(mockSystemSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'ai' | 'compliance' | 'notifications' | 'storage'>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    showToast('Platform master configurations successfully saved & committed to cache.');
  };

  const handleReset = () => {
    setSettings(mockSystemSettings);
    showToast('Settings reset to default factory configurations.');
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
            <h1 className="text-2xl font-black text-slate-900">System Platform Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Central Master Config
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure system parameters across General, Security, AI Inference, Compliance Rules, Alerts & Storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Settings Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'general', label: 'General System', icon: Settings },
            { id: 'security', label: 'Security & 2FA', icon: Shield },
            { id: 'ai', label: 'AI Inference', icon: Cpu },
            { id: 'compliance', label: 'Compliance Engine', icon: Scale },
            { id: 'notifications', label: 'Alert Gateways', icon: Bell },
            { id: 'storage', label: 'Storage & Digilocker', icon: HardDrive }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-5 font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 text-xs space-y-5">
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Platform Brand Name</label>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, platformName: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Technical Support Contact Email</label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Session Inactivity Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.general.sessionTimeoutMinutes}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, sessionTimeoutMinutes: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Audit Trail Statutory Retention (Days)</label>
                <input
                  type="number"
                  value={settings.general.auditRetentionDays}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, auditRetentionDays: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Enforce Mandatory 2-Factor Authentication (2FA)</div>
                  <div className="text-slate-500 text-[11px]">Require OTP / TOTP for all Procurement Officers and Platform Admins</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.enforce2FA}
                  onChange={(e) => setSettings({ ...settings, security: { ...settings.security, enforce2FA: e.target.checked } })}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Failed Logins Before Lockout</label>
                  <input
                    type="number"
                    value={settings.security.maxFailedLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, security: { ...settings.security, maxFailedLoginAttempts: Number(e.target.value) } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">IP Whitelist Subnets (Comma-separated)</label>
                  <input
                    type="text"
                    value={settings.security.ipWhitelist}
                    onChange={(e) => setSettings({ ...settings, security: { ...settings.security, ipWhitelist: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI */}
          {activeTab === 'ai' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Primary Core LLM Model</label>
                <input
                  type="text"
                  value={settings.ai.primaryModel}
                  onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, primaryModel: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Fallback Resilience Model</label>
                <input
                  type="text"
                  value={settings.ai.fallbackModel}
                  onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, fallbackModel: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Minimum AI Confidence Score Required (%)</label>
                <input
                  type="number"
                  value={settings.ai.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, confidenceThreshold: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 mt-5">
                <span className="font-bold text-slate-800">Auto-Flag Document Contradictions</span>
                <input
                  type="checkbox"
                  checked={settings.ai.autoFlagContradictions}
                  onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, autoFlagContradictions: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
            </div>
          )}

          {/* COMPLIANCE */}
          {activeTab === 'compliance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Strict Statutory Gating Verification</div>
                  <div className="text-[11px] text-slate-500">Automatically fail bids if GSTN, PAN, or Debarment checks fail</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compliance.strictStatutoryVerification}
                  onChange={(e) => setSettings({ ...settings, compliance: { ...settings.compliance, strictStatutoryVerification: e.target.checked } })}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Mandate CA UDIN Verification for Turnover</div>
                  <div className="text-[11px] text-slate-500">Require 18-digit UDIN validation against ICAI portal</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compliance.requireCAUDINVerification}
                  onChange={(e) => setSettings({ ...settings, compliance: { ...settings.compliance, requireCAUDINVerification: e.target.checked } })}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Clarification Window (Hours)</label>
                <input
                  type="number"
                  value={settings.compliance.defaultClarificationWindowHours}
                  onChange={(e) => setSettings({ ...settings, compliance: { ...settings.compliance, defaultClarificationWindowHours: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slack / Teams Emergency Webhook URL</label>
                <input
                  type="text"
                  value={settings.notifications.slackWebhookUrl}
                  onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, slackWebhookUrl: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Email Alerts Gateway</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableEmailNotifications}
                    onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, enableEmailNotifications: e.target.checked } })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">SMS Gateway (CDAC)</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableSmsAlerts}
                    onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, enableSmsAlerts: e.target.checked } })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STORAGE */}
          {activeTab === 'storage' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Primary Document Storage Provider</label>
                <select
                  value={settings.storage.primaryProvider}
                  onChange={(e) => setSettings({ ...settings, storage: { ...settings.storage, primaryProvider: e.target.value as any } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                >
                  <option value="DIGILOCKER_NIC">DigiLocker NIC Govt Repository</option>
                  <option value="S3_SECURE_GOV">AWS GovCloud S3 (Encrypted)</option>
                  <option value="MINIO_ONPREMISE">On-Premise MinIO Secure Cluster</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Max Bid Upload File Size (MB)</label>
                <input
                  type="number"
                  value={settings.storage.maxUploadSizeMB}
                  onChange={(e) => setSettings({ ...settings, storage: { ...settings.storage, maxUploadSizeMB: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400">Settings changes will be immediately propagated across cluster nodes.</span>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
          >
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
};
