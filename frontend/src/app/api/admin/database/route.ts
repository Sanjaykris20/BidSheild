import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table') || 'mock_gst';

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/verification/registry-db/${table}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned error: ${res.statusText}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to connect to SQLite backend' }, { status: 500 });
  }
}
