from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import time
import os
import json
import tempfile
import hashlib
import base64
import fitz  # PyMuPDF
import openai
from dotenv import load_dotenv

# Initialize PaddleOCR (downloads models on first run)
from paddleocr import PaddleOCR
ocr_model = PaddleOCR(use_angle_cls=True, lang='en')

load_dotenv()

app = FastAPI(title="BidShield AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Client pointing to OpenRouter/Omniroute
client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="sk-38c68db3cc8795ff-e8e2cc-69bf96a7",
)


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            # If the page has very little text (e.g. < 100 chars), it's likely a scanned image
            # that only has a printed header/filename, so we should fallback to OCR.
            if len(page_text.strip()) > 100:
                text += page_text + "\n"
            else:
                # Scanned page - fallback to OCR
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_path = f"{file_path}_page.png"
                pix.save(img_path)
                text += extract_text_from_image(img_path)
                try:
                    os.remove(img_path)
                except Exception:
                    pass
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text


def extract_text_from_image(file_path: str) -> str:
    try:
        result = ocr_model.ocr(file_path, cls=True)
        text = ""
        if not result or not result[0]:
            return ""
        for idx in range(len(result)):
            res = result[idx]
            if res:
                for line in res:
                    text += line[1][0] + "\n"
        return text
    except Exception as e:
        print(f"OCR Error on image {file_path}: {e}")
        return ""


def detect_document_type(text: str) -> str:
    text_lower = text.lower()
    if "gstin" in text_lower or "gst" in text_lower:
        return "GST"
    elif "udyam" in text_lower or "msme" in text_lower:
        return "UDYAM"
    elif "pan" in text_lower and ("income" in text_lower or "permanent" in text_lower):
        return "PAN"
    elif "income tax" in text_lower or "itr" in text_lower or "return filed" in text_lower:
        return "INCOME_TAX"
    elif "local content" in text_lower or "make in india" in text_lower:
        return "MAKE_IN_INDIA"
    elif "oem" in text_lower or "authorization" in text_lower:
        return "OEM"
    elif "epfo" in text_lower or "provident fund" in text_lower:
        return "EPFO"
    elif "esic" in text_lower or "state insurance" in text_lower:
        return "ESIC"
    elif "startup" in text_lower or "dipp" in text_lower:
        return "STARTUP"
    elif "nsic" in text_lower:
        return "NSIC"
    return "OTHER"


@app.get("/")
def read_root():
    return {
        "status": "AI Engine Online",
        "llm_connected": client is not None,
        "model": "openrouter/free" if client else "mock"
    }


@app.get("/api/ai/health")
def ai_health():
    return {
        "status": "healthy",
        "groq_connected": False,
        "omniroute_connected": client is not None,
        "model": "openrouter/free",
        "version": "1.0.0"
    }


@app.post("/api/ai/document-extract")
async def extract_document(file: UploadFile = File(...), document_type: str = Form("auto")):
    start_time = time.time()

    # Validate file
    allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx')
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG, DOC, DOCX files are supported")

    # Read the file
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Calculate file hash
    file_hash = hashlib.sha256(content).hexdigest()

    # Save to temp file
    suffix = os.path.splitext(file.filename)[1] or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(tmp_path)
        else:
            text = extract_text_from_image(tmp_path)
    finally:
        os.unlink(tmp_path)

    # Detect document type if auto
    if document_type == "auto":
        document_type = detect_document_type(text)

    # If no client, use mock
    if not client:
        time.sleep(1.5)
        return _get_mock_extraction(document_type, file.filename, file_hash, len(content), time.time() - start_time)

    # VISION AI FALLBACK: If no text could be extracted, use Vision Model
    if not text.strip():
        base64_img = ""
        try:
            if file.filename.lower().endswith('.pdf'):
                doc = fitz.open(tmp_path)
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                base64_img = base64.b64encode(pix.tobytes("jpeg")).decode('utf-8')
            else:
                with open(tmp_path, "rb") as image_file:
                    base64_img = base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print("Failed to convert document for Vision AI:", e)
            
        if base64_img:
            prompt = _build_extraction_prompt("ALL", "Extract data visually from this image.")
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt + "\nAlso confidently detect the document_type (e.g., GST, PAN, UDYAM, INCOME_TAX, OEM) based on the image."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_img}",
                                    },
                                },
                            ],
                        }
                    ],
                    model="openrouter/auto", # For Vision fallback if needed, or free-stack
                    temperature=0.0,
                )
                
                raw_content = chat_completion.choices[0].message.content
                if "```json" in raw_content:
                    raw_content = raw_content.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_content:
                    raw_content = raw_content.split("```")[1].strip()
                    
                response_json = json.loads(raw_content)
                
                if "document_type" in response_json:
                    document_type = response_json["document_type"]
                    
                response_json["file_name"] = file.filename
                response_json["file_size"] = len(content)
                response_json["file_hash"] = file_hash
                response_json["processing_time_ms"] = int((time.time() - start_time) * 1000)
                response_json["document_type"] = document_type
                response_json["vision_mode"] = True
                
                return response_json
            except Exception as e:
                print(f"Groq Vision API Error: {e}")
                return _get_mock_extraction(document_type, file.filename, file_hash, len(content), time.time() - start_time)

    # STANDARD TEXT EXTRACTION FLOW
    prompt = _build_extraction_prompt(document_type, text[:4000])

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openrouter/free", # Free-stack
            temperature=0.0
        )
        
        raw_content = chat_completion.choices[0].message.content
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].strip()
            
        response_json = json.loads(raw_content)

        # Add metadata
        response_json["file_name"] = file.filename
        response_json["file_size"] = len(content)
        response_json["file_hash"] = file_hash
        response_json["processing_time_ms"] = int((time.time() - start_time) * 1000)
        response_json["document_type"] = document_type

        return response_json

    except Exception as e:
        print(f"Groq API Error: {e}")
        # Fallback to mock on error
        return _get_mock_extraction(document_type, file.filename, file_hash, len(content), time.time() - start_time)


def _build_extraction_prompt(doc_type: str, text: str) -> str:
    base_prompt = f"""
Extract the following information from the document text provided below.
Respond ONLY with valid JSON. Do not include markdown formatting or extra text.

Document Type: {doc_type}
"""

    schemas = {
        "ALL": {
            "document_type": "string (e.g. GST, PAN, UDYAM, INCOME_TAX)",
            "key_information": "extract all key value pairs found in the document",
            "issuer": "string",
            "date": "string"
        },
        "GST": {
            "legal_name": "string or null",
            "gstin": "string or null",
            "registration_date": "string or null",
            "status": "string or null",
            "state": "string or null",
            "taxpayer_type": "string or null"
        },
        "PAN": {
            "name": "string or null",
            "pan": "string or null",
            "category": "string or null",
            "status": "string or null"
        },
        "INCOME_TAX": {
            "pan": "string or null",
            "return_filed": "boolean or null",
            "years_filed": "integer or null",
            "tax_compliance": "string or null"
        },
        "EPFO": {
            "establishment_code": "string or null",
            "name": "string or null",
            "status": "string or null",
            "member_count": "integer or null"
        },
        "ESIC": {
            "esi_code": "string or null",
            "name": "string or null",
            "status": "string or null",
            "employees_covered": "integer or null"
        },
        "STARTUP": {
            "dipp_number": "string or null",
            "name": "string or null",
            "recognition_date": "string or null",
            "status": "string or null"
        },
        "NSIC": {
            "nsic_number": "string or null",
            "name": "string or null",
            "registration_date": "string or null",
            "status": "string or null"
        },
        "UDYAM": {
            "enterprise_name": "string or null",
            "udyam_number": "string or null",
            "classification": "string or null",
            "registration_date": "string or null",
            "status": "string or null"
        },
        "MAKE_IN_INDIA": {
            "local_content_percentage": "float or null",
            "company_name": "string or null",
            "declaration_date": "string or null",
            "products": "array or null",
            "location": "string or null"
        },
        "OEM": {
            "certificate_number": "string or null",
            "oem_name": "string or null",
            "authorized_products": "array or null",
            "valid_from": "string or null",
            "valid_to": "string or null",
            "status": "string or null"
        }
    }

    schema = schemas.get(doc_type, {
        "extracted_text": "string",
        "key_fields": "object"
    })

    base_prompt += f"""
Required JSON structure:
{{
    "confidence": float (0.0 to 1.0),
    "extracted_fields": {json.dumps(schema, indent=2)}
}}

Document Text:
{text}
"""
    return base_prompt


def _get_mock_extraction(doc_type: str, filename: str, file_hash: str, file_size: int, processing_time: float):
    mocks = {
        "GST": {
            "confidence": 0.98,
            "extracted_fields": {
                "legal_name": "TechCorp Solutions Pvt Ltd",
                "gstin": "27ABCDE1234F1Z5",
                "registration_date": "2023-05-14",
                "status": "ACTIVE",
                "state": "Maharashtra",
                "taxpayer_type": "Regular"
            }
        },
        "PAN": {
            "confidence": 0.99,
            "extracted_fields": {
                "name": "TechCorp Solutions Pvt Ltd",
                "pan": "AAACT1234F",
                "category": "Company",
                "status": "ACTIVE"
            }
        },
        "UDYAM": {
            "confidence": 0.97,
            "extracted_fields": {
                "enterprise_name": "TechCorp Solutions Pvt Ltd",
                "udyam_number": "UDYAM-MH-18-00123",
                "classification": "Micro",
                "registration_date": "2024-01-15",
                "status": "ACTIVE"
            }
        },
        "MAKE_IN_INDIA": {
            "confidence": 0.98,
            "extracted_fields": {
                "local_content_percentage": 42.0,
                "company_name": "TechCorp Solutions Pvt Ltd",
                "declaration_date": "2026-10-14",
                "products": ["Data Center Equipment", "Security Software"],
                "location": "Plot 44, Electronic City, Phase II, Bangalore"
            }
        },
        "OEM": {
            "confidence": 0.93,
            "extracted_fields": {
                "certificate_number": "OEM-CERT-2024-001",
                "oem_certificate": "OEM-CERT-2024-001",
                "oem_name": "Dell Technologies",
                "authorized_products": ["Servers", "Storage", "Networking"],
                "valid_from": "2024-01-01",
                "valid_to": "2026-12-31",
                "status": "VALID"
            }
        },
        "INCOME_TAX": {
            "confidence": 0.95,
            "extracted_fields": {
                "pan": "AAACT1234F",
                "return_filed": True,
                "years_filed": 3,
                "tax_compliance": "COMPLIANT",
                "outstanding_demand": 0
            }
        },
        "EPFO": {
            "confidence": 0.90,
            "extracted_fields": {
                "establishment_code": "EPFO-MH-44881",
                "name": "TechCorp Solutions Pvt Ltd",
                "status": "ACTIVE",
                "member_count": 45
            }
        },
        "ESIC": {
            "confidence": 0.90,
            "extracted_fields": {
                "esi_code": "ESIC-MH-77120",
                "name": "TechCorp Solutions Pvt Ltd",
                "status": "ACTIVE",
                "employees_covered": 42
            }
        },
        "STARTUP": {
            "confidence": 0.96,
            "extracted_fields": {
                "dipp_number": "DIPP20123",
                "name": "TechCorp Solutions Pvt Ltd",
                "recognition_date": "2023-06-20",
                "status": "ACTIVE"
            }
        },
        "NSIC": {
            "confidence": 0.94,
            "extracted_fields": {
                "nsic_number": "NSIC-DEL-5589",
                "name": "TechCorp Solutions Pvt Ltd",
                "registration_date": "2023-08-10",
                "status": "ACTIVE"
            }
        }
    }

    mock = mocks.get(doc_type, {
        "confidence": 0.85,
        "extracted_fields": {"raw_text_preview": filename[:100]}
    })

    return {
        "document_type": doc_type,
        "file_name": filename,
        "file_size": file_size,
        "file_hash": file_hash,
        "processing_time_ms": int(processing_time * 1000),
        **mock
    }


class TenderAnalyzeRequest(BaseModel):
    tender_text: str


@app.post("/api/ai/tender-analyze")
async def analyze_tender(request: TenderAnalyzeRequest):
    if not request.tender_text or len(request.tender_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Tender text too short")

    if client:
        try:
            prompt = f"""
Analyze the following tender document and extract key compliance requirements.
Return ONLY valid JSON.

Tender Text:
{request.tender_text[:4000]}

JSON structure:
{{
    "requirements": [
        {{"type": "GST", "required": true, "category": "Statutory"}},
        {{"type": "LOCAL_CONTENT", "minimum": 50.0, "category": "Statutory"}},
        {{"type": "TURNOVER", "minimum_cr": 2.0, "category": "Financial"}},
        {{"type": "UDYAM", "required": true, "category": "Statutory"}}
    ]
}}
"""
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Groq API Error: {e}")

    # Mock fallback
    time.sleep(2)
    return {
        "requirements": [
            {"type": "GST", "required": True, "category": "Statutory"},
            {"type": "LOCAL_CONTENT", "minimum": 50.0, "category": "Statutory"},
            {"type": "TURNOVER", "minimum_cr": 2.0, "category": "Financial"},
            {"type": "UDYAM", "required": True, "category": "Statutory"}
        ]
    }


class CopilotRequest(BaseModel):
    query: str
    context: Dict = {}


@app.post("/api/ai/copilot")
async def copilot_chat(request: CopilotRequest):
    if client:
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI Procurement Copilot for the Indian Government e-Marketplace (GeM). Keep answers concise (2-3 sentences). Be precise and cite evidence when possible."},
                    {"role": "user", "content": f"Context: {json.dumps(request.context)}. Question: {request.query}"}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.3
            )
            return {"answer": chat_completion.choices[0].message.content}
        except Exception as e:
            print(f"Groq API Error: {e}")

    # Mock fallback
    time.sleep(1)
    query = request.query.lower()
    if "high risk" in query or "alpha" in query:
        return {"answer": "Alpha Defense is marked as HIGH RISK because their Make-In-India Local Content declaration (45%) is below the Class-I threshold (50%) required by the tender. Evidence is found on page 2 of 'Doc_MII_SelfDeclaration.pdf'."}
    elif "requirements failed" in query:
        return {"answer": "Across all current bids, the most common failed requirement is the 'Minimum Average Annual Turnover: ₹2 Cr'. 3 bidders failed to meet this criteria."}
    elif "local content" in query or "mii" in query:
        return {"answer": "The tender requires minimum 50% local content for Class-I suppliers. The bidder declared 42% which fails the threshold. Request clarification on sub-contracting breakdown."}
    elif "gst" in query:
        return {"answer": "GST verification is complete. The GSTIN is ACTIVE and registered in Maharashtra since 2023-05-14. No compliance issues found."}

    return {"answer": "Based on my analysis of the documents, the compliance check is in progress. Would you like me to run a specific verification or explain a particular rule result?"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_ENGINE_PORT", "8001"))
    host = os.getenv("AI_ENGINE_HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)