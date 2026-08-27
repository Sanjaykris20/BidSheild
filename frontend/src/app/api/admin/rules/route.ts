import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET() {
  const rules = platformStore.getRules();
  return NextResponse.json({ count: rules.length, rules });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const updated = platformStore.updateRule(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, rule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update rule' }, { status: 500 });
  }
}
