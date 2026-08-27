'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function BidderClarificationsPage() {
  const { showToast } = useToast();

  const [clarifications, setClarifications] = useState([
    {
      id: 'CLR-2026-001',
      bidId: 'BID-2026-1024',
      tenderNumber: 'GEM/2026/B/1024',
      tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
      subject: 'Local Content Breakdown & Sub-Contracting Clarification',
      message:
        'The Make-in-India declaration extracted 42% local content, which is below the Class-I threshold (50%). Please provide an itemized cost certificate signed by a Statutory Auditor detailing local value addition in server chassis assembly.',
      requestedBy: 'P. Sharma (CPCL Senior Procurement Officer)',
      dueDate: '2026-08-30 18:00 IST',
      status: 'PENDING',
      response: '',
      respondedAt: '',
    },
  ]);

  const [activeReplyId, setActiveReplyId] = useState<string | null>('CLR-2026-001');
  const [replyText, setReplyText] = useState<string>(
    'Attached please find the revised CA-certified Make-in-India Cost Breakdown (Certificate UDIN: 26044912AAAAAA9912). As detailed in Annexure A, local value addition across motherboard integration and chassis fabrication constitutes 54.2%, thereby satisfying Class-I Local Supplier eligibility.'
  );
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleSendResponse = (id: string) => {
    if (!replyText.trim()) {
      showToast('Please enter a response.', 'error');
      return;
    }

    setIsSubmittingReply(true);
    setTimeout(() => {
      setClarifications(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: 'RESPONDED',
                response: replyText,
                respondedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
              }
            : c
        )
      );
      setIsSubmittingReply(false);
      setActiveReplyId(null);
      showToast('Clarification response submitted and logged to audit trail.', 'success');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Clarification Hub
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Respond to officer queries and provide verified supporting documentation.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {clarifications.map(c => {
          const isPending = c.status === 'PENDING';

          return (
            <div
              key={c.id}
              className={`bg-surface-container-lowest rounded-2xl border ${isPending ? 'border-warning shadow-md' : 'border-outline-variant'} p-6 transition-all`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-muted">{c.tenderNumber}</span>
                    <span className="font-mono text-xs text-outline">Ref: {c.bidId}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isPending
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : 'bg-success/10 text-success border-success/30'
                      }`}
                    >
                      {isPending ? 'Action Required' : 'Response Submitted'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary">{c.subject}</h3>
                  <p className="text-xs text-neutral-muted mt-0.5">
                    Requested by <strong>{c.requestedBy}</strong> • Due: <strong className="text-danger">{c.dueDate}</strong>
                  </p>
                </div>
              </div>

              {/* Officer Message Box */}
              <div className="bg-surface p-4 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant leading-relaxed mb-4">
                <span className="font-bold text-primary block mb-1">Officer Inquiry:</span>
                {c.message}
              </div>

              {/* Response Section */}
              {c.status === 'RESPONDED' ? (
                <div className="bg-success/5 p-4 rounded-xl border border-success/20 text-xs text-on-surface leading-relaxed">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-success flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] icon-fill">check_circle</span>
                      Submitted Response:
                    </span>
                    <span className="font-mono text-[10px] text-neutral-muted">{c.respondedAt}</span>
                  </div>
                  <p>{c.response}</p>
                </div>
              ) : activeReplyId === c.id ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-primary">
                    Your Response & Evidence Reference:
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary outline-none resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => showToast('Attached CA_Cost_Audit_Annexure.pdf from Vault.', 'info')}
                      className="text-xs font-semibold text-primary bg-surface hover:bg-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">attach_file</span> Attach CA Audit (Vault)
                    </button>
                    <button
                      onClick={() => handleSendResponse(c.id)}
                      disabled={isSubmittingReply}
                      className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-container shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSubmittingReply ? 'sync' : 'send'}
                      </span>
                      {isSubmittingReply ? 'Submitting...' : 'Submit Clarification'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveReplyId(c.id)}
                  className="bg-warning text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-warning/90 shadow-sm"
                >
                  Compose Response
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
