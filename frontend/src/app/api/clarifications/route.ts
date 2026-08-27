import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET() {
  const clarifications = platformStore.getClarifications();
  return NextResponse.json({ count: clarifications.length, clarifications });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'respond') {
      const updated = platformStore.respondToClarification(body.id, body.response, body.attachedDocNames);
      return NextResponse.json({ success: true, clarification: updated });
    } else {
      const created = platformStore.createClarification(body);
      return NextResponse.json({ success: true, clarification: created }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Clarification action failed' }, { status: 500 });
  }
}
