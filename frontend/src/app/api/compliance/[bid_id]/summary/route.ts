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

  const passed = bid.requirements.filter(r => r.status === 'PASS').length;
  const failed = bid.requirements.filter(r => r.status === 'FAIL').length;
  const review = bid.requirements.filter(r => r.status === 'REVIEW').length;
  const notApplicable = bid.requirements.filter(r => r.status === 'NOT_APPLICABLE').length;

  return NextResponse.json({
    bid_id: bid.id,
    bidder_name: bid.bidderName,
    tender_number: bid.tenderNumber,
    compliance_score: bid.complianceScore,
    risk_level: bid.riskLevel,
    total_rules: bid.requirements.length,
    passed_count: passed,
    failed_count: failed,
    review_count: review,
    not_applicable_count: notApplicable,
    verifications_count: bid.verifications.length,
    evidence_count: bid.evidenceList.length,
    status: bid.status,
  });
}
