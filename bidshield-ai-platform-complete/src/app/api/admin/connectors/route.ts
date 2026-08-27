import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET() {
  const connectors = platformStore.getConnectors();
  return NextResponse.json({ count: connectors.length, connectors });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const updated = platformStore.updateConnector(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, connector: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update connector' }, { status: 500 });
  }
}
