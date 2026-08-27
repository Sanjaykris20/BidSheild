import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clarificationId, bidId, officerName, remarks } = body;

    if (!bidId) {
      return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
    }

    const bid = platformStore.getBidById(bidId);
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    platformStore.updateBid(bid.id, {
      status: 'QUALIFIED',
      auditTimeline: [
        ...bid.auditTimeline,
        {
          stageNumber: bid.auditTimeline.length + 1,
          title: 'Clarification Approved',
          status: 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
          description: `Officer approved clarification. ${remarks || ''}`,
          completedBy: officerName || 'P. Sharma',
        },
      ],
    });

    if (bid.documents) {
      bid.documents.forEach(doc => {
        if (doc.status === 'ACTION_REQUIRED' || doc.status === 'PENDING') {
          doc.status = 'VERIFIED';
        }
      });
    }

    if (bid.requirements) {
      bid.requirements.forEach(req => {
        if (req.status === 'REVIEW') {
          req.status = 'PASS';
        }
      });
    }

    platformStore.logAudit({
      actor: officerName || 'P. Sharma',
      role: 'PROCUREMENT_OFFICER',
      action: 'CLARIFICATION_APPROVED',
      resource: `${bid.id}`,
      result: 'SUCCESS',
      details: `Clarification approved. Bid status: QUALIFIED`,
    });

    return NextResponse.json({
      success: true,
      bidStatus: 'QUALIFIED',
      message: 'Clarification approved. Bid status updated to QUALIFIED.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
