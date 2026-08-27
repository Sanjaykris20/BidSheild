import { NextRequest, NextResponse } from 'next/server';
import { verificationRegistry } from '@/lib/verification/verificationProvider';

export async function POST(req: NextRequest) {
  try {
    const provider = verificationRegistry.getProvider('Debarment');
    if (!provider) {
      return NextResponse.json({ error: 'Debarment verification provider not registered' }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const result = await provider.verify(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Debarment verification failed' }, { status: 500 });
  }
}
