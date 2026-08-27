import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

/**
 * POST /api/clarifications/respond
 * Bidder responds to a clarification request
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clarificationId, response, attachedDocuments, bidderName } = body;

    if (!clarificationId || !response) {
      return NextResponse.json(
        { error: 'Missing required parameters (clarificationId, response)' },
        { status: 400 }
      );
    }

    // Update clarification with bidder response
    const clarification = platformStore.respondToClarification(
      clarificationId,
      response,
      attachedDocuments
    );

    if (!clarification) {
      return NextResponse.json({ error: 'Clarification not found' }, { status: 404 });
    }

    // Get the associated bid
    const bid = platformStore.getBidById(clarification.bidId);
    if (!bid) {
      return NextResponse.json({ error: 'Associated bid not found' }, { status: 404 });
    }

    // Update bid status to indicate clarification response received
    platformStore.updateBid(bid.id, {
      status: 'UNDER_EVALUATION',
      auditTimeline: [
        ...bid.auditTimeline,
        {
          stageNumber: bid.auditTimeline.length + 1,
          title: 'Clarification Response Received',
          status: 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
          description: `Bidder provided clarification response. ${attachedDocuments?.length || 0} new documents attached.`,
          completedBy: bidderName || bid.bidderName,
        },
      ],
    });

    // If new documents were attached, re-run AI verification
    if (attachedDocuments && attachedDocuments.length > 0) {
      // Trigger AI verification re-run (simulated)
      platformStore.updateBid(bid.id, {
        auditTimeline: [
          ...bid.auditTimeline,
          {
            stageNumber: bid.auditTimeline.length + 2,
            title: 'AI Re-Verification Triggered',
            status: 'IN_PROGRESS',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
            description: 'Running AI extraction and compliance checks on newly submitted documents.',
            completedBy: 'AI_SERVICE',
          },
        ],
      });
    }

    // Log audit event
    platformStore.logAudit({
      actor: bidderName || bid.bidderName,
      role: 'BIDDER',
      action: 'CLARIFICATION_RESPONSE_SUBMITTED',
      resource: `${clarification.id} -> ${bid.id}`,
      result: 'SUCCESS',
      details: `Bidder responded to clarification request. Response: "${response.slice(0, 100)}..."`,
      payloadJson: JSON.stringify({
        clarificationId,
        bidId: bid.id,
        documentsCount: attachedDocuments?.length || 0,
      }),
    });

    // Notify procurement officer (create notification)
    platformStore.logAudit({
      actor: 'SYSTEM_NOTIFICATION',
      role: 'SYSTEM',
      action: 'OFFICER_NOTIFICATION_SENT',
      resource: clarification.requestedBy,
      result: 'SUCCESS',
      details: `Procurement Officer notified: Bidder ${bid.bidderName} has responded to clarification request for ${bid.tenderNumber}`,
    });

    return NextResponse.json({
      success: true,
      clarification,
      bidStatus: 'UNDER_EVALUATION',
      message: 'Clarification response submitted successfully. Procurement Officer has been notified.',
    });
  } catch (error: any) {
    console.error('Clarification response error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit clarification response' },
      { status: 500 }
    );
  }
}
