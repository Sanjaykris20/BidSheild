import { NextRequest, NextResponse } from 'next/server';
import { verificationRegistry } from '@/lib/verification/verificationProvider';
import { StatutoryVerification } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const rawType = params.type.toUpperCase();
    let providerType: StatutoryVerification['type'] = 'GST';

    if (rawType === 'GST' || rawType === 'GSTN') providerType = 'GST';
    else if (rawType === 'PAN') providerType = 'PAN';
    else if (rawType === 'UDYAM' || rawType === 'MSME') providerType = 'Udyam';
    else if (rawType === 'OEM') providerType = 'OEM';
    else if (rawType === 'DEBARMENT' || rawType === 'CVC') providerType = 'Debarment';
    else if (rawType === 'ITR' || rawType === 'TAX' || rawType === 'INCOMETAX') providerType = 'Income Tax';
    else if (rawType === 'EPFO') providerType = 'EPFO';
    else if (rawType === 'ESIC') providerType = 'ESIC';
    else if (rawType === 'STARTUP') providerType = 'Startup India';
    else if (rawType === 'NSIC') providerType = 'NSIC';
    else if (rawType === 'DIGILOCKER') providerType = 'DigiLocker';

    const provider = verificationRegistry.getProvider(providerType);
    if (!provider) {
      return NextResponse.json({ error: `Unsupported verification provider: ${rawType}` }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await provider.verify(body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
