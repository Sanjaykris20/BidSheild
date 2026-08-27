import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenderId = searchParams.get('tender_id');
  const bidderId = searchParams.get('bidder_id');

  let bids = platformStore.getBids();
  if (tenderId) {
    bids = bids.filter(b => b.tenderId === tenderId || b.tenderNumber === tenderId);
  }
  if (bidderId) {
    bids = bids.filter(b => b.bidderId === bidderId);
  }

  return NextResponse.json({ count: bids.length, bids });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newBid = platformStore.createBid(body);
    return NextResponse.json({ success: true, bid: newBid }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit bid' }, { status: 500 });
  }
}
