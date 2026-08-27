import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET() {
  const tenders = platformStore.getTenders();
  return NextResponse.json({ count: tenders.length, tenders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTender = platformStore.createTender(body);
    return NextResponse.json({ success: true, tender: newTender }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create tender' }, { status: 500 });
  }
}
