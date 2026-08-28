import requests
import json

url = "http://localhost:3000/api/documents/upload"
file_path = "c:/Users/sanja/Desktop/Projects/BidSheild/demo_documents/EPFO_Compliance_Statement.pdf"

with open(file_path, "rb") as f:
    files = {"file": ("EPFO_Compliance_Statement.pdf", f, "application/pdf")}
    data = {"bidderId": "VEN-TECHCORP-01"}
    
    try:
        response = requests.post(url, files=files, data=data)
        print("Status Code:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Error:", e)
