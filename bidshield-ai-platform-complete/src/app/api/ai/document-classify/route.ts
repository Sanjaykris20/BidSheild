import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/aiProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await aiProvider.classifyDocument(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Document classification failed' }, { status: 500 });
  }
}
