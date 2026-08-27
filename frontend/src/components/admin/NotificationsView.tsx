'use client';
import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  X,
  Archive,
  Eye,
  CheckCheck,
  Filter,
  Trash2
} from 'lucide-react';
import { mockNotifications } from '@/lib/adminData';
import { SystemNotification } from '@/types';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<(SystemNotification & { isRead?: boolean; isArchived?: boolean })[]>(
    mockNotifications.map((n, idx) => ({ ...n, isRead: idx > 1, isArchived: false }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<(SystemNotification & { isRead?: boolean }) | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<SystemNotification['type']>('SYSTEM');
  const [newPriority, setNewPriority] = useState<SystemNotification['priority']>('NORMAL');
  const [newAudience, setNewAudience] = useState<SystemNotification['targetAudience']>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;
    const notif: SystemNotification & { isRead?: boolean; isArchived?: boolean } = {
      id: `NOTIF-${Date.now().toString().slice(-3)}`,
      title: newTitle,
      message: newMessage,
      type: newType,
      priority: newPriority,
      targetAudience: newAudience,
      createdAt: 'Just now',
      expiresAt: 'In 7 days',
      status: 'ACTIVE',
      channels: ['IN_APP', 'EMAIL'],
      isRead: false,
      isArchived: false
    };
    setNotifications(prev => [notif, ...prev]);
    setShowComposeModal(false);
    setNewTitle('');
    setNewMessage('');
    showToast(`System notification broadcasted to ${newAudience}`);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    showToast(`Notification status updated.`);
  };

  const handleArchive = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
    showToast(`Notification archived.`);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast(`All notifications marked as read.`);
  };

  const filteredNotifications = notifications.filter(n => {
    if (n.isArchived) return false;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'UNREAD' && !n.isRead) || 
      (statusFilter === 'READ' && n.isRead);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">System Notifications & Broadcasts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {notifications.filter(n => !n.isRead && !n.isArchived).length} Unread Alerts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch urgent maintenance bulletins, statutory directives & procurement policy changes across GeM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="SECURITY">SECURITY</option>
              <option value="COMPLIANCE">COMPLIANCE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Read State:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All States</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Broadcast Feed */}
      <div className="space-y-4">
        {filteredNotifications.map((n) => (
          <div 
            key={n.id} 
            className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 text-xs transition-all ${
              !n.isRead ? 'border-blue-400/80 bg-blue-50/20 shadow-md' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${
                  n.priority === 'HIGH' || n.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  n.priority === 'NORMAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {n.priority} PRIORITY
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-600">
                  {n.type}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{n.createdAt}</span>
                <span className="font-bold text-slate-500">• Recipient: {n.targetAudience}</span>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNotification(n)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                  title="View Full Bulletin"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleRead(n.id)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg"
                  title={n.isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(n.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                  title="Archive Notification"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">{n.title}</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Dispatched via: {n.channels.join(', ')}</span>
              <span>Expires: {n.expiresAt}</span>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-xs">No notifications match the active filter criteria.</p>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {selectedNotification.type} • {selectedNotification.priority}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-1">{selectedNotification.title}</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Dispatched: {selectedNotification.createdAt}</p>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed space-y-3">
              <p>{selectedNotification.message}</p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                Target Audience: <strong className="text-slate-800">{selectedNotification.targetAudience}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  handleToggleRead(selectedNotification.id);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-xl font-bold"
              >
                Close & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Compose System Broadcast</h2>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Maintenance Notice for GSTN API"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="COMPLIANCE">COMPLIANCE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="ALL">All Users</option>
                    <option value="CLIENTS">Buyers</option>
                    <option value="BIDDERS">Bidders</option>
                    <option value="ADMINS">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Broadcast Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the directive, advisory clause, maintenance schedule, or policy update..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
