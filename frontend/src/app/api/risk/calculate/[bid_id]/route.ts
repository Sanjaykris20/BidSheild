import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';
import { riskEngine } from '@/lib/compliance/riskEngine';

export async function POST(
  req: NextRequest,
  { params }: { params: { bid_id: string } }
) {
  const bid = platformStore.getBidById(params.bid_id);
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  const riskResult = riskEngine.calculateRisk(bid.complianceScore, bid.requirements);
  platformStore.updateBid(bid.id, { riskLevel: riskResult.riskLevel, riskResult });

  return NextResponse.json({
    success: true,
    bid_id: bid.id,
    compliance_score: bid.complianceScore,
    risk_level: riskResult.riskLevel,
    risk_result: riskResult,
  });
}
