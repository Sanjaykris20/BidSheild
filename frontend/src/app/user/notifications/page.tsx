'use client';

import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Document Expiring Soon',
      message: 'Your ISO 9001 Certificate will expire in 12 days. Please upload a renewed copy.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Clarification Requested',
      message: 'The Procurement Officer has requested a clarification regarding your OEM Authorization for BID-2026-1024.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Bid Submitted Successfully',
      message: 'Your bid for Tender GEM/2026/B/001 has been submitted and is under technical evaluation.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'info',
      title: 'New Tender Match',
      message: 'A new tender matching your category "IT Services" has been published.',
      time: '2 days ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning-text" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-success-text" />;
      default: return <Info className="w-5 h-5 text-info-text" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-warning-container';
      case 'success': return 'bg-success-container';
      default: return 'bg-info-container';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated on your bids, documents, and system alerts.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.map((note) => (
            <div key={note.id} className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors ${!note.read ? 'bg-blue-50/20' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(note.type)}`}>
                {getIcon(note.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-bold ${!note.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {note.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">{note.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{note.message}</p>
              </div>
              {!note.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
