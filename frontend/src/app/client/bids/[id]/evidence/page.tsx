'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EvidenceViewer } from '@/components/shared/EvidenceViewer';
import { Bid } from '@/types';

export default function ClientEvidenceViewerPage() {
  const params = useParams();
  const bidId = (params.id as string) || 'BID-1024';

  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBid = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bids/${bidId}`);
      if (res.ok) {
        const data = await res.json();
        setBid(data);
      } else {
        // Fallback to BID-1024
        const fallbackRes = await fetch('/api/bids/BID-1024');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setBid(fallbackData);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBid();
  }, [bidId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center space-x-3 text-neutral-muted">
        <span className="material-symbols-outlined animate-spin-slow text-[28px] text-info">sync</span>
        <span className="font-semibold text-sm">Loading Evidenced Bid Packet...</span>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
        <h3 className="font-bold text-lg text-primary">Bid Record Not Found</h3>
        <p className="text-xs text-neutral-muted mt-1">Please select an active evaluation from the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <EvidenceViewer bid={bid} onRefresh={fetchBid} />
    </div>
  );
}
