import requests
import json

url = "http://127.0.0.1:8001/api/ai/document-extract-path"
file_path = "C:\\Users\\sanja\\Desktop\\Projects\\BidSheild\\demo_documents\\EPFO_Compliance_Statement.pdf"

data = {
    "file_path": file_path,
    "document_type": "PAN"
}

try:
    response = requests.post(url, data=data)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
