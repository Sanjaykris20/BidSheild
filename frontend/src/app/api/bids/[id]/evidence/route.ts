import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bid = platformStore.getBidById(params.id);
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  return NextResponse.json({
    bid_id: bid.id,
    bidder_name: bid.bidderName,
    tender_number: bid.tenderNumber,
    evidence_count: bid.evidenceList.length,
    evidence_items: bid.evidenceList,
  });
}
