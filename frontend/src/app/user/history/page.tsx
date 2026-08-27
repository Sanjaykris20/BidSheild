'use client';

import React from 'react';
import { Clock, History, FileText, UploadCloud, Gavel, CheckCircle2 } from 'lucide-react';

export default function HistoryPage() {
  const events = [
    {
      id: 1,
      date: 'Today',
      time: '10:45 AM',
      title: 'Clarification Responded',
      desc: 'You submitted a response and attached OEM Authorization for BID-2026-1024.',
      icon: <History className="w-4 h-4 text-primary" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      id: 2,
      date: 'Yesterday',
      time: '02:30 PM',
      title: 'Document Uploaded',
      desc: 'Updated ISO 9001 Certificate was uploaded to your Vault.',
      icon: <UploadCloud className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      id: 3,
      date: 'Aug 22, 2026',
      time: '11:15 AM',
      title: 'Bid Pre-Check Completed',
      desc: 'AI Eligibility Engine executed 24 compliance rules for Tender GEM/2026/B/001.',
      icon: <CheckCircle2 className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    {
      id: 4,
      date: 'Aug 20, 2026',
      time: '09:00 AM',
      title: 'Tender Saved to Watchlist',
      desc: 'Tender "Supply of Enterprise Servers" was saved to your watched list.',
      icon: <FileText className="w-4 h-4 text-slate-600" />,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900">Audit History</h1>
        <p className="text-sm text-slate-500 mt-1">A complete trail of your account activities and bid lifecycle events.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 md:p-8">
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
          {events.map((event) => (
            <div key={event.id} className="relative pl-8">
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${event.color}`}>
                {event.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">{event.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.time}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">{event.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
