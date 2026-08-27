import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';
import { ruleEngine } from '@/lib/compliance/ruleEngine';
import { scoringEngine } from '@/lib/compliance/scoringEngine';

export async function POST(
  req: NextRequest,
  { params }: { params: { bid_id: string } }
) {
  const bidId = params.bid_id;
  const bid = platformStore.getBidById(bidId);

  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  const evaluations = ruleEngine.evaluateRules({
    bidderName: bid.bidderName,
    localContentPercent: bid.localContentPercent,
    quotedValueINR: bid.quotedValueINR,
    documents: bid.documents,
    verifications: bid.verifications,
  });

  const score = scoringEngine.calculateScore(evaluations);
  platformStore.updateBid(bid.id, { requirements: evaluations, complianceScore: score });

  return NextResponse.json({
    bid_id: bid.id,
    compliance_score: score,
    total_rules: evaluations.length,
    passed_rules: evaluations.filter(e => e.status === 'PASS').length,
    failed_rules: evaluations.filter(e => e.status === 'FAIL').length,
    review_rules: evaluations.filter(e => e.status === 'REVIEW').length,
    evaluations,
  });
}
