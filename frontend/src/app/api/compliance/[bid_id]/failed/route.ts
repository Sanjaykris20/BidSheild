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

  const failedRules = bid.requirements.filter(r => r.status === 'FAIL');
  const reviewRules = bid.requirements.filter(r => r.status === 'REVIEW');

  return NextResponse.json({
    bid_id: bid.id,
    bidder_name: bid.bidderName,
    failed_count: failedRules.length,
    review_count: reviewRules.length,
    failed_rules: failedRules,
    review_rules: reviewRules,
  });
}
