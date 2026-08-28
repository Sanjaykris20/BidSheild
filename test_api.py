import requests
import json

url = "http://127.0.0.1:8001/api/ai/document-extract"
file_path = "c:/Users/sanja/Desktop/Projects/BidSheild/demo_documents/PAN_Card_Verification.pdf"

with open(file_path, "rb") as f:
    files = {"file": ("PAN_Card_Verification.pdf", f, "application/pdf")}
    data = {"document_type": "PAN"}
    
    try:
        response = requests.post(url, files=files, data=data)
        print("Status Code:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Error:", e)
