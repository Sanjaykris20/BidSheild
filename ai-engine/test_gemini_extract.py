import fitz, urllib.request, json, os

text = """
INCOME TAX DEPARTMENT
Challan Receipt
ITNS No. : 281
TAN : BLRS95182D
Name : SHUBHAM SHUDHANSHU
Assessment Year : 2024-25
Financial Year : 2023-24
Major Head : Income Tax (Other than Companies) (0021)
Minor Head : TDS/TCS Payable by Taxpayer (200)
Nature of Payment : 195
Amount (in Rs.) : Rupees Ten Thousand One Hundred Forty Only
CIN : 23042900000842HDFC
Mode of Payment : Net Banking
Bank Name : HDFC Bank
Bank Reference Number : K2311901046616
Date of Deposit : 29-Apr-2023
"""

pdf_path = "test_challan.pdf"
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), text)
doc.save(pdf_path)
doc.close()

with open(pdf_path, "rb") as f:
    data = f.read()

boundary = "----gemtestboundary"
body = b""
body += f"--{boundary}\r\n".encode()
body += b'Content-Disposition: form-data; name="file"; filename="test_challan.pdf"\r\n'
body += b"Content-Type: application/pdf\r\n\r\n"
body += data
body += b"\r\n"
body += f"--{boundary}--\r\n".encode()

req = urllib.request.Request(
    "http://localhost:8001/api/ai/document-extract",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        out = json.loads(resp.read().decode("utf-8"))
    print("document_type:", out.get("document_type"))
    print("confidence:", out.get("confidence"))
    print("extracted_fields:", json.dumps(out.get("extracted_fields"), indent=2))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode("utf-8", "ignore")[:500])
finally:
    try:
        os.remove(pdf_path)
    except Exception:
        pass
