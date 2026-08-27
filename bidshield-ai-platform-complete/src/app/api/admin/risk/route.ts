import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET() {
  const weights = platformStore.getScoringWeights();
  return NextResponse.json({ weights });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = platformStore.updateScoringWeights(body);
    return NextResponse.json({ success: true, weights: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update scoring weights' }, { status: 500 });
  }
}
