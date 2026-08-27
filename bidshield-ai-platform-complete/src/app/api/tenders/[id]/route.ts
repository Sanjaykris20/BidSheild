import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tender = platformStore.getTenderById(params.id);
  if (!tender) {
    return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
  }

  const bids = platformStore.getBidsByTenderId(tender.id);
  return NextResponse.json({ tender, bids, bidsCount: bids.length });
}
