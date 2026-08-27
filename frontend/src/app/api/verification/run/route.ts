import { NextResponse } from 'next/server';
import { GSTProvider } from '@/lib/verification/providers/GSTProvider';
import { PANProvider } from '@/lib/verification/providers/PANProvider';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bidId = formData.get('bid_id') || "BID-8819";

    if (!file) {
      return NextResponse.json({ error: "No document provided for verification." }, { status: 400 });
    }

    // Level 1: Document Verification (AI Engine)
    let aiExtractedData = null;
    try {
      const aiFormData = new FormData();
      aiFormData.append('file', file);
      
      const aiResponse = await fetch('http://localhost:8000/api/ai/document-extract', {
        method: 'POST',
        body: aiFormData,
      });
      
      if (aiResponse.ok) {
        aiExtractedData = await aiResponse.json();
      } else {
        throw new Error("FastAPI returned an error");
      }
    } catch (e) {
      console.warn("Python AI Engine failed to extract", e);
      return NextResponse.json({ error: "AI Engine Extraction Failed" }, { status: 500 });
    }

    // Extract identifiers found by AI
    const extractedGst = aiExtractedData?.extracted_fields?.gstin || "NOT_FOUND";
    const extractedPan = aiExtractedData?.extracted_fields?.pan || "NOT_FOUND";

    // Level 2: Source Verification (Mock Government Gateways)
    const gstProvider = new GSTProvider();
    const panProvider = new PANProvider();
    
    // Set to SANDBOX for Live Demo
    gstProvider.setMode('SANDBOX');
    panProvider.setMode('SANDBOX');

    const [gstVerification, panVerification] = await Promise.all([
      gstProvider.verify(extractedGst),
      panProvider.verify(extractedPan)
    ]);


    // Level 3: Compliance Engine (Deterministic Rules)
    let score = 100;
    const failedRules = [];
    
    // Rule 1: GST Must be Active
    if (gstVerification.status !== 'VERIFIED' || gstVerification.data?.status !== 'ACTIVE') {
      score -= 20;
      failedRules.push({
        rule: "GST Active Status",
        expected: "ACTIVE",
        actual: gstVerification.data?.status || "NOT_FOUND",
        result: "FAIL",
        severity: "CRITICAL",
        evidence: {
          source: gstVerification.source,
          mode: gstVerification.mode
        }
      });
    }

    // Rule 2: Cross-verify AI data vs Govt Data
    if (gstVerification.status === 'VERIFIED' && aiExtractedData?.extracted_fields?.legal_name !== gstVerification.data.legal_name) {
      score -= 10;
      failedRules.push({
        rule: "Entity Name Match",
        reason: `Name on document (${aiExtractedData?.extracted_fields?.legal_name}) does not match GST Network (${gstVerification.data.legal_name})`
      });
    }

    // Rule 3: MII Local Content Check
    const localContent = aiExtractedData?.extracted_fields?.local_content_percentage;
    const requiredLocalContent = 50.0;
    
    if (localContent !== undefined && localContent !== null) {
        if (localContent < requiredLocalContent) {
          score -= 21.5; 
          failedRules.push({
            rule: "Make-In-India (MII) Local Content",
            expected: "≥ 50%",
            actual: `${localContent}%`,
            result: "FAIL",
            severity: "HIGH",
            evidence: {
              document: "Uploaded_Document.pdf",
              extracted_by: "Llama 3.1",
              confidence: aiExtractedData?.confidence
            }
          });
        }
    } else {
        score -= 15;
        failedRules.push({
            rule: "Make-In-India (MII) Local Content",
            expected: "≥ 50%",
            actual: "Not Declared / Not Found in Document",
            result: "FAIL",
            severity: "HIGH",
            evidence: {
              document: "Uploaded_Document.pdf",
              extracted_by: "Llama 3.1"
            }
        });
    }

    // Risk Engine
    let risk = "LOW";
    if (score < 50) risk = "CRITICAL";
    else if (score < 70) risk = "HIGH";
    else if (score < 90) risk = "MEDIUM";

    return NextResponse.json({
      bid_id: bidId,
      status: "COMPLETED",
      score: score,
      risk_level: risk,
      ai_extraction: aiExtractedData,
      verification_sources_used: [
        { name: gstVerification.source, mode: gstVerification.mode, status: gstVerification.status },
        { name: panVerification.source, mode: panVerification.mode, status: panVerification.status }
      ],
      failed_rules: failedRules,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Verification failed to run" }, { status: 500 });
  }
}
