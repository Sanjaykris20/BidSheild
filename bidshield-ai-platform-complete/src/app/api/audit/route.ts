import { NextRequest, NextResponse } from 'next/server';
import { platformStore } from '@/lib/data/platformDataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const role = searchParams.get('role');

  let logs = platformStore.getAuditLogs();
  if (action) {
    logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  }
  if (role) {
    logs = logs.filter(l => l.role.toLowerCase() === role.toLowerCase());
  }

  return NextResponse.json({ count: logs.length, logs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLog = platformStore.logAudit(body);
    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to record audit' }, { status: 500 });
  }
}
