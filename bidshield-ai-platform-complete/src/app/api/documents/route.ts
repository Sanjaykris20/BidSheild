import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/documentService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bidId = searchParams.get('bid_id') || searchParams.get('bidId');
  const tenderId = searchParams.get('tender_id') || searchParams.get('tenderId');
  const bidderId = searchParams.get('bidder_id') || searchParams.get('bidderId');

  let docs = documentService.getAllDocuments();

  if (bidId) {
    docs = docs.filter(d => d.bidId === bidId);
  }
  if (tenderId) {
    docs = docs.filter(d => d.tenderId === tenderId);
  }
  if (bidderId) {
    docs = docs.filter(d => d.bidderId === bidderId);
  }

  return NextResponse.json({
    count: docs.length,
    documents: docs,
  });
}
