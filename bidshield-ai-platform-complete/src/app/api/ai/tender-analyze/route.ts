import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/aiProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await aiProvider.analyzeTender(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Tender analysis failed' }, { status: 500 });
  }
}
