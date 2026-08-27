'use client';
import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import { mockAdminUsers } from '@/lib/adminData';
import { AdminUser, UserAccountStatus } from '@/types';
import { UserDetailModal } from './UserDetailModal';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleStatusChange = (userId: string, newStatus: UserAccountStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`User ${userId} status updated to ${newStatus}`);
  };

  const handleResetAccess = (userId: string) => {
    showToast(`Credentials reset link and OTP sent to user ${userId}`);
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verifiedAt: 'Just now', status: 'ACTIVE' } : u));
    showToast(`User ${userId} KYC & Statutory status verified.`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedbackToast}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              {users.length} Registered Accounts
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage procurement officers, bidders, auditors, and super administrators across GeM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Exporting active users directory as CSV...')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, org, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PROCUREMENT_OFFICER">PROCUREMENT OFFICER</option>
              <option value="BIDDER">BIDDER</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>
        </div>

      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Organization */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{user.organization}</div>
                    {user.department && <div className="text-[11px] text-slate-500">{user.department}</div>}
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      user.role === 'PROCUREMENT_OFFICER' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      user.role === 'AUDITOR' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      user.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      user.status === 'PENDING_VERIFICATION' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                      'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      ● {user.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{user.createdAt}</td>

                  {/* Last Active */}
                  <td className="p-4 font-semibold text-slate-900">{user.lastActive}</td>

                  {/* Action Buttons: View, Edit, Verify, Suspend, Activate, Reset Access, Deactivate */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        title="View User Profile"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {user.status === 'PENDING_VERIFICATION' && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          title="Verify Identity"
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors"
                        >
                          Verify
                        </button>
                      )}

                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                          title="Suspend User"
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          title="Activate User"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleResetAccess(user.id)}
                        title="Reset Access Credentials"
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {user.status !== 'DEACTIVATED' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'DEACTIVATED')}
                          title="Deactivate Account"
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusChange}
          onResetAccess={handleResetAccess}
          onVerifyUser={handleVerifyUser}
        />
      )}

    </div>
  );
};
