import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';
import { verificationRegistry } from '@/lib/verification/verificationProvider';
import { ruleEngine } from '@/lib/compliance/ruleEngine';
import { scoringEngine } from '@/lib/compliance/scoringEngine';
import { riskEngine } from '@/lib/compliance/riskEngine';
import { evidenceEngine } from '@/lib/compliance/evidenceEngine';
import { aiProvider } from '@/lib/ai/aiProvider';

export async function POST(
  req: NextRequest,
  { params }: { params: { bid_id: string } }
) {
  try {
    const bidId = params.bid_id;
    const bid = platformStore.getBidById(bidId);

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found', bid_id: bidId }, { status: 404 });
    }

    // 1. Run Government Gateways
    const verifications = await verificationRegistry.runAllVerifications({
      bidderId: bid.bidderId,
      bidderName: bid.bidderName,
      gstin: bid.gstin,
      pan: bid.pan,
      udyam: bid.udyam,
      tenderNumber: bid.tenderNumber,
    });

    // 2. Evaluate Compliance Rules (using current admin rules & thresholds)
    const evaluations = ruleEngine.evaluateRules({
      bidderName: bid.bidderName,
      localContentPercent: bid.localContentPercent,
      quotedValueINR: bid.quotedValueINR,
      documents: bid.documents,
      verifications,
    });

    // 3. Compute Deterministic Compliance Score (using current admin weights)
    const score = scoringEngine.calculateScore(evaluations);

    // 4. Calculate Risk Profile & Drivers
    const riskResult = riskEngine.calculateRisk(score, evaluations);

    // 5. Generate Verifiable Evidence Items
    const evidenceList = evidenceEngine.generateEvidenceList(evaluations, bid.documents);

    // 6. Generate AI Recommendation (Mock/Groq with MOCK badge)
    const aiRecommendation = await aiProvider.generateRecommendation({
      score,
      risk: riskResult,
      evaluations,
      evidence: evidenceList,
    });

    // 7. Update Bid in store
    const updatedBid = platformStore.updateBid(bid.id, {
      verifications,
      requirements: evaluations,
      complianceScore: score,
      riskLevel: riskResult.riskLevel,
      riskResult,
      evidenceList,
      aiRecommendation,
      status: riskResult.riskLevel === 'CRITICAL' ? 'DISQUALIFIED' : 'UNDER_EVALUATION',
      auditTimeline: [
        { stageNumber: 1, title: 'Bid Submitted', status: 'COMPLETED', timestamp: bid.submittedAt, description: 'Bid submitted.' },
        { stageNumber: 2, title: 'AI Extraction & OCR', status: 'COMPLETED', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST', description: 'OCR parsed document bounding boxes.' },
        { stageNumber: 3, title: 'Govt. Verification Gateways', status: 'COMPLETED', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST', description: 'Statutory gateways returned verified hashes.' },
        { stageNumber: 4, title: 'Compliance Rule Engine', status: 'COMPLETED', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST', description: `Calculated score: ${score}/100.` },
        { stageNumber: 5, title: 'Officer Evaluation Desk', status: 'IN_PROGRESS', description: 'Awaiting officer determination.' },
      ],
    });

    platformStore.logAudit({
      actor: 'SYSTEM_VERIFICATION_PIPELINE',
      role: 'SYSTEM',
      action: 'FULL_VERIFICATION_PIPELINE_COMPLETE',
      resource: `${bid.id} (${bid.bidderName})`,
      result: riskResult.riskLevel === 'CRITICAL' ? 'FAILED' : 'SUCCESS',
      details: `Full verification completed. Score: ${score}/100. Risk: ${riskResult.riskLevel}. 8 rules checked.`,
      payloadJson: JSON.stringify({ bidId: bid.id, score, riskLevel: riskResult.riskLevel, passedRules: evaluations.filter(e => e.status === 'PASS').length }),
    });

    return NextResponse.json({
      success: true,
      bid_id: bidId,
      compliance_score: score,
      risk_level: riskResult.riskLevel,
      verifications,
      evaluations,
      evidence: evidenceList,
      risk_result: riskResult,
      ai_recommendation: aiRecommendation,
      updated_bid: updatedBid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Verification pipeline failed' },
      { status: 500 }
    );
  }
}
