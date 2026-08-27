import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/aiProvider';
import { platformStore } from '@/lib/data/platformDataStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const bidId = body.bid_id || 'BID-1024';
    const bid = platformStore.getBidById(bidId);

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    const result = await aiProvider.generateRecommendation({
      score: bid.complianceScore,
      risk: bid.riskResult || { score: bid.complianceScore, riskLevel: bid.riskLevel, drivers: [], categoryBreakdown: { identityConsistency: 100, statutoryCompliance: 100, financialEligibility: 100, technicalEligibility: 100, documentationCompleteness: 100, tenderCompliance: 100 }, summary: '' },
      evaluations: bid.requirements,
      evidence: bid.evidenceList,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Recommendation failed' }, { status: 500 });
  }
}
