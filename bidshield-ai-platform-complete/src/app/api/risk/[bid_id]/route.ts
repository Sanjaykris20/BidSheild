import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { bid_id: string } }
) {
  const bid = platformStore.getBidById(params.bid_id);
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  return NextResponse.json({
    bid_id: bid.id,
    risk_level: bid.riskLevel,
    risk_result: bid.riskResult,
  });
}
