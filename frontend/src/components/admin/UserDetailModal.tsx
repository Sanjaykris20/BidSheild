'use client';
import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Building2,
  Calendar,
  Clock,
  Phone,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileStack,
  Gavel,
  History,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  RefreshCw,
  BadgeCheck
} from 'lucide-react';
import { AdminUser } from '@/types';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onStatusChange: (userId: string, newStatus: AdminUser['status']) => void;
  onResetAccess: (userId: string) => void;
  onVerifyUser: (userId: string) => void;
  isModal?: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onStatusChange,
  onResetAccess,
  onVerifyUser,
  isModal = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'security'>('overview');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const content = (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  user.status === 'SUSPENDED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  user.status === 'PENDING_VERIFICATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>{user.organization}</span>
                {user.department && <span>• {user.department}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if Action Triggered */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccessMessage}
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          {[
            { id: 'overview', label: 'User 360 Overview' },
            { id: 'permissions', label: 'Role & Permissions' },
            { id: 'activity', label: 'Tenders & Bids History' },
            { id: 'security', label: 'Security & 2FA Status' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 font-bold transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Identity & Contact</div>
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">User ID</span>
                      <span className="font-mono font-bold text-slate-800">{user.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Official Mobile</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {user.phone || '+91 98000 00000'}
                      </span>
                    </div>
                    {user.pan && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">PAN Card</span>
                        <span className="font-mono font-bold text-slate-800">{user.pan}</span>
                      </div>
                    )}
                    {user.gstin && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">GSTIN</span>
                        <span className="font-mono font-bold text-slate-800">{user.gstin}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Account Metrics</div>
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Platform Role</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">{user.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Account Created</span>
                      <span className="font-bold text-slate-800">{user.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Last Active Session</span>
                      <span className="font-bold text-slate-800">{user.lastActive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">KYC Verification</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified on {user.verifiedAt || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Action Bar */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="font-bold text-xs">Administrative Operations for this User:</div>
                <div className="flex flex-wrap gap-2">
                  {user.status !== 'ACTIVE' && (
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'ACTIVE');
                        showFeedback(`User ${user.name} has been ACTIVATED.`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Activate User
                    </button>
                  )}
                  {user.status === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'SUSPENDED');
                        showFeedback(`User ${user.name} has been SUSPENDED.`);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Suspend Account
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onVerifyUser(user.id);
                      showFeedback(`Statutory credentials re-verified for ${user.name}.`);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Verify Identity
                  </button>
                  <button
                    onClick={() => {
                      onResetAccess(user.id);
                      showFeedback(`Password reset and 2FA re-enrollment link dispatched to ${user.email}.`);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Access Credentials
                  </button>
                  {user.status !== 'DEACTIVATED' && (
                    <button
                      onClick={() => {
                        onStatusChange(user.id, 'DEACTIVATED');
                        showFeedback(`User ${user.name} has been DEACTIVATED.`);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <UserX className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-xs">Role Permission Matrix: {user.role}</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Module Permission</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3 text-right">Access Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold">Tender Creation & Publishing</td>
                      <td className="p-3 text-slate-500">Organization Level ({user.organization})</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GRANTED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Bid Evaluation & Verification Matrix</td>
                      <td className="p-3 text-slate-500">Assigned Tenders Only</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GRANTED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">AI Copilot & Clause Insight Access</td>
                      <td className="p-3 text-slate-500">All Scrutiny Documents</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GRANTED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Administrative Platform Configuration</td>
                      <td className="p-3 text-slate-500">Global GeM Parameters</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {user.role === 'ADMIN' ? 'GRANTED' : 'DENIED'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-xs">Recent Operations & Assigned Entities</div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileStack className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900">Assigned Tender #CPCL/2026/1024</div>
                      <div className="text-[11px] text-slate-500">High-Pressure Pipeline Instrumentation • 5 Bids Evaluated</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">LIVE</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gavel className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold text-slate-900">Clarification Letter Dispatched</div>
                      <div className="text-[11px] text-slate-500">Bidder: ABC Technologies & Engineering Ltd • Re-upload OEM Authorization</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">24 Aug 2026</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Two-Factor Authentication</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Enforced via Govt TOTP / SMS
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Password Health</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    Updated 24 days ago (Complies with 90-day policy)
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">GeM SIH 26100 Security Audited Record</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs"
          >
            Close Profile
          </button>
        </div>

      </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      {content}
    </div>
  );
};
