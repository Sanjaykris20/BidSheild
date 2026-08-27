'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function ClientClarificationsPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [clarifications, setClarifications] = useState([
    {
      id: 'CLR-2026-001',
      bidId: 'BID-2026-1024',
      bidder: 'TechCorp Solutions Pvt Ltd',
      tenderNumber: 'GEM/2026/B/1024',
      subject: 'Local Content Breakdown & Sub-Contracting Clarification',
      message: 'The Make-in-India declaration extracted 42% local content, which is below the Class-I threshold (50%). Please provide itemized CA-certified cost breakdown.',
      dueDate: '2026-08-30 18:00 IST',
      status: 'PENDING_VENDOR_REPLY',
      requestedBy: 'P. Sharma (CPCL Senior Procurement Officer)',
      sentAt: '2026-08-24 16:45 IST',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleIssueClarification = () => {
    if (!newSubject.trim() || !newMessage.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setClarifications(prev => [
      {
        id: `CLR-${Date.now()}`,
        bidId: 'BID-2026-1024',
        bidder: 'TechCorp Solutions Pvt Ltd',
        tenderNumber: 'GEM/2026/B/1024',
        subject: newSubject,
        message: newMessage,
        dueDate: '2026-09-02 18:00 IST',
        status: 'PENDING_VENDOR_REPLY',
        requestedBy: 'P. Sharma (CPCL Senior Procurement Officer)',
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      },
      ...prev,
    ]);

    setIsModalOpen(false);
    setNewSubject('');
    setNewMessage('');
    showToast('Clarification request dispatched and recorded to audit trail.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Clarification Hub
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Issue official queries to bidders and review verified supporting evidence submissions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_comment</span>
          Issue New Clarification
        </button>
      </div>

      <div className="space-y-4">
        {clarifications.map(c => (
          <div key={c.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-neutral-muted">{c.tenderNumber}</span>
                  <span className="font-mono text-xs text-outline">{c.bidId}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-warning/30 bg-warning/10 text-warning">
                    Pending Vendor Response
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-primary">{c.subject}</h3>
                <p className="text-xs text-neutral-muted mt-0.5">Bidder: <strong>{c.bidder}</strong> • Sent: {c.sentAt} • Due: <strong className="text-danger">{c.dueDate}</strong></p>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary block mb-1">Official Clarification Inquiry:</span>
              {c.message}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="modal-backdrop absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant relative z-10 p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-bold text-base text-primary">Issue Official Clarification</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Target Bidder</label>
              <input type="text" disabled value="TechCorp Solutions (BID-2026-1024)" className="w-full p-2.5 bg-surface border border-outline-variant rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Subject</label>
              <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Discrepancy in Local Content Declaration" className="w-full p-2.5 border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Detailed Inquiry & Document Request</label>
              <textarea rows={4} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Specify exactly what proof or breakdown is requested..." className="w-full p-2.5 border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleIssueClarification} className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-container">Dispatch Inquiry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
