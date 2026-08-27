import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bidId, action, remarks, officerName } = body;

    if (!bidId || !action || !remarks) {
      return NextResponse.json({ error: 'Missing required parameters (bidId, action, remarks)' }, { status: 400 });
    }

    const bid = platformStore.getBidById(bidId);
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    let decisionStatus = 'Qualified';
    let newBidStatus = bid.status;

    if (action === 'approve') {
      decisionStatus = 'Qualified / Approved for Financial Evaluation';
      newBidStatus = 'QUALIFIED';
    } else if (action === 'clarify') {
      decisionStatus = 'Under Clarification';
      newBidStatus = 'CLARIFICATION_REQUIRED';
      // Create clarification item
      platformStore.createClarification({
        bidId: bid.id,
        bidderName: bid.bidderName,
        tenderNumber: bid.tenderNumber,
        tenderTitle: bid.tenderTitle,
        subject: 'Mandatory Technical & Compliance Clarification',
        message: remarks,
        requestedBy: officerName || 'P. Sharma (Officer)',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 18:00 IST',
      });
    } else if (action === 'reject') {
      decisionStatus = 'Disqualified / Non-Compliant';
      newBidStatus = 'DISQUALIFIED';
    }

    const officerDecision = {
      action,
      decisionStatus,
      remarks,
      decidedBy: officerName || 'P. Sharma (CPCL Senior Procurement Officer)',
      decidedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
    };

    platformStore.updateBid(bid.id, {
      status: newBidStatus as any,
      officerDecision,
      auditTimeline: [
        ...bid.auditTimeline.filter(s => s.stageNumber !== 5),
        {
          stageNumber: 5,
          title: `Officer Determination: ${action.toUpperCase()}`,
          status: action === 'reject' ? 'FLAGGED' : 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
          description: `Decision: ${decisionStatus}. Remarks: "${remarks}"`,
          completedBy: officerName || 'P. Sharma (Officer)',
        },
      ],
    });

    platformStore.logAudit({
      actor: officerName || 'P. Sharma (Officer)',
      role: 'PROCUREMENT_OFFICER',
      action: `OFFICER_DECISION_${action.toUpperCase()}`,
      resource: `${bid.id} (${bid.bidderName})`,
      result: action === 'reject' ? 'FAILED' : (action === 'clarify' ? 'WARNING' : 'SUCCESS'),
      details: `Official decision committed: ${decisionStatus}. Justification: "${remarks}"`,
      payloadJson: JSON.stringify({ bidId: bid.id, action, remarks, timestamp: officerDecision.decidedAt }),
    });

    return NextResponse.json({
      success: true,
      decision: officerDecision,
      new_status: newBidStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to commit decision' }, { status: 500 });
  }
}
