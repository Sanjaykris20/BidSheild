import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/documents/documentService';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data (Real OS File Picker upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided in form-data payload (key: "file")' },
          { status: 400 }
        );
      }

      const bidId = (formData.get('bidId') as string) || (formData.get('bid_id') as string) || undefined;
      const tenderId = (formData.get('tenderId') as string) || (formData.get('tender_id') as string) || undefined;
      const bidderId = (formData.get('bidderId') as string) || (formData.get('bidder_id') as string) || 'VEN-TECHCORP-01';
      const documentType = (formData.get('documentType') as string) || (formData.get('document_type') as string) || undefined;
      const isMandatory = formData.get('isMandatory') === 'false' ? false : true;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const record = await documentService.uploadDocument({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        buffer,
        bidId,
        tenderId,
        bidderId,
        documentType,
        isMandatory,
      });

      return NextResponse.json({
        success: true,
        message: 'Document uploaded and registered successfully.',
        document: record,
        document_id: record.id,
        storage_reference: record.storageReference,
        hash_sha256: record.hashSha256,
        status: record.status,
      });
    }

    // Handle JSON payload with base64 (useful for programmatic API calls)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { fileName, mimeType, base64Content, bidId, tenderId, bidderId, documentType, isMandatory } = body;

      if (!fileName || !base64Content) {
        return NextResponse.json(
          { success: false, error: 'Missing required JSON fields: "fileName" and "base64Content"' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(base64Content, 'base64');
      const record = await documentService.uploadDocument({
        fileName,
        mimeType: mimeType || 'application/pdf',
        buffer,
        bidId,
        tenderId,
        bidderId,
        documentType,
        isMandatory,
      });

      return NextResponse.json({
        success: true,
        message: 'Document uploaded and registered successfully.',
        document: record,
        document_id: record.id,
        storage_reference: record.storageReference,
        hash_sha256: record.hashSha256,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type. Please use multipart/form-data or application/json.' },
      { status: 415 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Document upload failed' },
      { status: 500 }
    );
  }
}
