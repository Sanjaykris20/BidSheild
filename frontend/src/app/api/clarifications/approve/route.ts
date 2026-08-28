import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

/**
 * POST /api/clarifications/approve
 * Officer approves a clarification response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clarificationId, bidId, officerName, remarks } = body;

    if (!clarificationId || !bidId) {
      return NextResponse.json(
        { error: 'Missing required parameters (clarificationId, bidId)' },
        { status: 400 }
      );
    }

    const bid = platformStore.getBidById(bidId);
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Update bid status to VERIFIED after clarification approval
    platformStore.updateBid(bid.id, {
      status: 'QUALIFIED',
      auditTimeline: [
        ...bid.auditTimeline,
        {
          stageNumber: bid.auditTimeline.length + 1,
          title: 'Clarification Approved by Officer',
          status: 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
          description: `Officer reviewed and approved clarification response. ${remarks || 'No additional remarks.'}`,
          completedBy: officerName || 'P. Sharma (Officer)',
        },
      ],
    });

    // Update all related documents to VERIFIED status
    if (bid.documents) {
      bid.documents.forEach(doc => {
        if (doc.status === 'ACTION_REQUIRED' || doc.status === 'PENDING') {
          doc.status = 'VERIFIED';
        }
      });
    }

    // Update all compliance requirements that were under review
    if (bid.requirements) {
      bid.requirements.forEach(req => {
        if (req.status === 'REVIEW') {
          req.status = 'PASS';
        }
      });
    }

    // Log audit event
    platformStore.logAudit({
      actor: officerName || 'P. Sharma (Officer)',
      role: 'PROCUREMENT_OFFICER',
      action: 'CLARIFICATION_APPROVED',
      resource: `${clarificationId} -> ${bid.id} (${bid.bidderName})`,
      result: 'SUCCESS',
      details: `Officer approved clarification response and verified bid. Bid status updated to QUALIFIED.`,
      payloadJson: JSON.stringify({
        clarificationId,
        bidId: bid.id,
        newStatus: 'QUALIFIED',
        remarks,
      }),
    });

    // Notify bidder
    platformStore.logAudit({
      actor: 'SYSTEM_NOTIFICATION',
      role: 'SYSTEM',
      action: 'BIDDER_NOTIFICATION_SENT',
      resource: bid.bidderName,
      result: 'SUCCESS',
      details: `Bidder ${bid.bidderName} notified: Your clarification response for tender ${bid.tenderNumber} has been approved. Bid status: QUALIFIED.`,
    });

    return NextResponse.json({
      success: true,
      bidStatus: 'QUALIFIED',
      message: 'Clarification approved. Bid status updated to QUALIFIED. Bidder has been notified.',
    });
  } catch (error: any) {
    console.error('Clarification approval error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to approve clarification' },
      { status: 500 }
    );
  }
}
