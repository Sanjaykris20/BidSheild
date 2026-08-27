import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/documentService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = documentService.getDocumentBuffer(params.id);
  if (!result) {
    return NextResponse.json({ error: 'Document not found or file missing' }, { status: 404 });
  }

  const { buffer, mimeType, fileName } = result;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
