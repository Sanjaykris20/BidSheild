import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bid = platformStore.getBidById(params.id);
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  return NextResponse.json(bid);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = platformStore.updateBid(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bid: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 });
  }
}
