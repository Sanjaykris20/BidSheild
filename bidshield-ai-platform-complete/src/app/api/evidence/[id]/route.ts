import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const allBids = platformStore.getBids();
  let foundEvidence = null;

  for (const b of allBids) {
    const ev = b.evidenceList.find(e => e.id === params.id || e.requirementId === params.id);
    if (ev) {
      foundEvidence = { ...ev, bidId: b.id, bidderName: b.bidderName };
      break;
    }
  }

  if (!foundEvidence) {
    return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 });
  }

  return NextResponse.json(foundEvidence);
}
