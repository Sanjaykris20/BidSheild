import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clarificationId, response, attachedDocuments, bidderName } = body;

    if (!clarificationId || !response) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const clarification = platformStore.respondToClarification(clarificationId, response, attachedDocuments);
    if (!clarification) {
      return NextResponse.json({ error: 'Clarification not found' }, { status: 404 });
    }

    const bid = platformStore.getBidById(clarification.bidId);
    if (bid) {
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

      platformStore.logAudit({
        actor: bidderName || bid.bidderName,
        role: 'BIDDER',
        action: 'CLARIFICATION_RESPONSE_SUBMITTED',
        resource: `${clarification.id} -> ${bid.id}`,
        result: 'SUCCESS',
        details: `Bidder responded to clarification request.`,
      });
    }

    return NextResponse.json({
      success: true,
      clarification,
      message: 'Clarification response submitted. Officer has been notified.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
