'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function AdminBidDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const bidId = params.id as string;

  const [bid, setBid] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBidData = async () => {
      try {
        const bidRes = await fetch(`/api/bids`);
        const bidData = await bidRes.json();
        const foundBid = bidData.bids?.find((b: any) => b.id === bidId);
        if (foundBid) {
          setBid(foundBid);
        }

        const docRes = await fetch(`/api/documents?bidId=${bidId}`);
        const docData = await docRes.json();
        if (docData.documents) {
          setDocuments(docData.documents);
        }
      } catch (err) {
        console.error('Failed to load bid details', err);
      } finally {
        setLoading(false);
      }
    };
    if (bidId) {
      fetchBidData();
    }
  }, [bidId]);

  const handleAction = async (action: 'ACCEPT' | 'REJECT') => {
    showToast(`Bid ${action}ED successfully.`, 'success');
    setBid({ ...bid, status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' });
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-neutral-muted">Loading Evaluation Data...</div>;
  }

  if (!bid) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-danger">Bid not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/bids')}
            className="p-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-neutral-muted">Tender: {bid.tenderNumber || bid.tenderId}</span>
              <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                {bid.id}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-primary">Bidder: {bid.bidderName || bid.bidderId}</h2>
            <p className="text-xs text-neutral-muted mt-0.5">
              Submitted: {bid.submittedAt || 'N/A'} • 
              Quoted Amount: <strong className="text-primary">{bid.quotedValueINR ? `₹${bid.quotedValueINR.toLocaleString()}` : bid.quotedAmount ? `₹${bid.quotedAmount.toLocaleString()}` : 'N/A'}</strong>
              {bid.scstConcessionApplied && (
                <span className="ml-2 px-2 py-0.5 bg-success/10 text-success text-[10px] rounded border border-success/20 font-bold inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">diversity_1</span>
                  Evaluation Price (15% SC/ST Concession): ₹{bid.evaluationValueINR?.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-alt px-4 py-2 rounded-xl border border-outline-variant shadow-inner">
            <span className="text-xs font-semibold text-neutral-muted uppercase">Score</span>
            <span className="font-display font-black text-warning text-xl">{bid.complianceScore || 0}<span className="text-xs font-normal text-outline">/100</span></span>
          </div>
          
          <button
            onClick={() => handleAction('ACCEPT')}
            className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-success/90 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            disabled={bid.status === 'ACCEPTED'}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Accept Bid
          </button>
          <button
            onClick={() => handleAction('REJECT')}
            className="bg-danger text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-danger/90 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            disabled={bid.status === 'REJECTED'}
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Reject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Document Evidence Grid */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 className="font-bold text-base text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">fact_check</span>
            AI Verified Documents ({documents.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <p className="text-sm text-neutral-muted col-span-2">No documents attached.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {doc.mimeType?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-primary text-sm truncate">{doc.documentType}</p>
                        <p className="text-[10px] text-neutral-muted font-mono truncate">{doc.originalFilename}</p>
                      </div>
                    </div>
                    {doc.status === 'VERIFIED' ? (
                      <MockBadge label="DB VERIFIED" variant="green" size="sm" />
                    ) : (
                      <MockBadge label="FAILED" variant="amber" size="sm" />
                    )}
                  </div>
                  
                  {doc.extractedFields && doc.extractedFields.length > 0 && (
                    <div className="bg-surface-alt rounded p-3 mb-3 text-xs space-y-1.5 border border-outline-variant/50 max-h-32 overflow-y-auto">
                      {doc.extractedFields.slice(0, 5).map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center gap-2">
                          <span className="text-neutral-muted truncate max-w-[45%]">{f.label}:</span>
                          <span className="font-semibold text-primary truncate max-w-[55%]">{f.value}</span>
                        </div>
                      ))}
                      {doc.extractedFields.length > 5 && (
                        <div className="text-center text-[10px] text-neutral-muted pt-1 border-t border-outline-variant/50 mt-2">
                          +{doc.extractedFields.length - 5} more fields
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => window.open(doc.storageReference.replace('local://.uploads', '/.uploads'), '_blank')}
                    className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 py-2 border border-outline-variant rounded-lg bg-white mt-auto"
                  >
                    View Source Document
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
