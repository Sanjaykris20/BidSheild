import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const finding = body.finding || 'Local Content Rule Finding';

  return NextResponse.json({
    finding,
    explanation: `Value deterministically extracted from Make_In_India_Declaration.pdf (Page 1, Paragraph 2). The extracted numerical value (42%) falls below the mandatory Class-I local supplier threshold (≥ 50%) required by Rule ID: REQ-LC-01. Confidence: 98.4%.`,
    confidence: 0.984,
    source: 'AI Spatial Parser + OCR Engine',
    isMock: true,
  });
}
