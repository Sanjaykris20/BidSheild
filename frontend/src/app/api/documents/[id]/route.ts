import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/documentService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const doc = documentService.getDocumentById(params.id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found', document_id: params.id }, { status: 404 });
  }
  return NextResponse.json({ success: true, document: doc });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = documentService.deleteDocument(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Document not found or already deleted' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: `Document ${params.id} deleted successfully.` });
}
