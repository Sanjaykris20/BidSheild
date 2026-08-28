import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_pdf(filename, title, lines):
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, title)
    
    # Body
    c.setFont("Helvetica", 12)
    y = 700
    for line in lines:
        if line == "":
            y -= 10
            continue
        c.drawString(50, y, line)
        y -= 20
        
    c.save()
    print(f"Successfully generated: {filename}")

docs = [
    {
        "filename": "GST_Certificate_Maharashtra.pdf",
        "title": "Government of India - Form GST REG-06",
        "lines": [
            "Registration Certificate",
            "",
            "Registration Number : 27ABCDE1234F1Z5",
            "Legal Name : TechCorp Solutions Pvt Ltd",
            "Trade Name : TechCorp Solutions",
            "Constitution of Business : Private Limited Company",
            "Address of Principal Place of Business : 123 Tech Park, Mumbai, Maharashtra",
            "Date of Liability : 01/04/2023",
            "Type of Registration : Regular",
            "Date of Issue : 14/08/2023",
            "",
            "Designation : Superintendent",
            "Jurisdiction : Mumbai"
        ]
    },
    {
        "filename": "PAN_Card_Verification.pdf",
        "title": "INCOME TAX DEPARTMENT - GOVT. OF INDIA",
        "lines": [
            "Name : TechCorp Solutions Pvt Ltd",
            "Father's Name : N/A (Corporate entity)",
            "Date of Birth/Incorporation : 14/08/2018",
            "",
            "Permanent Account Number : ABCDE1234F",
            "",
            "Signature : [Digital Signature]",
            "Valid across India"
        ]
    },
    {
        "filename": "Udyam_MSME_Registration.pdf",
        "title": "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES",
        "lines": [
            "UDYAM REGISTRATION CERTIFICATE",
            "",
            "Udyam Registration Number : UDYAM-MH-18-00123",
            "Name of Enterprise : TechCorp Solutions Pvt Ltd",
            "Type of Enterprise : SMALL",
            "Major Activity : SERVICES",
            "Social Category : General",
            "Date of Incorporation : 14/08/2018",
            "Date of Commencement of Production/Business : 14/08/2018",
            "",
            "Disclaimer : This is computer generated statement, no signature required."
        ]
    },
    {
        "filename": "Make_In_India_Declaration_96PCT.pdf",
        "title": "SELF-DECLARATION FOR LOCAL CONTENT",
        "lines": [
            "Make in India (MII) Order 2017 Declaration",
            "",
            "We, TechCorp Solutions Pvt Ltd, having our registered office at 123 Tech Park, Mumbai,",
            "hereby declare that the goods/services offered by us for Tender GEM/2026/B/1024",
            "meet the Minimum Local Content criteria.",
            "",
            "Declared Local Content Percentage : 96%",
            "Category: Class-I Local Supplier",
            "",
            "This declaration is issued under our letterhead and signed by authorized signatory.",
            "",
            "Date: 28/08/2026",
            "Authorized Signatory: Sanjay K"
        ]
    },
    {
        "filename": "EPFO_Compliance_Statement.pdf",
        "title": "EMPLOYEES PROVIDENT FUND ORGANISATION (EPFO)",
        "lines": [
            "REMITTANCE & COMPLIANCE CERTIFICATE",
            "",
            "Establishment Code : MHBAN0089102000",
            "Name : TechCorp Solutions Pvt Ltd",
            "TRRN NUMBER : 3819201928301",
            "Active Subscribed Employees : 288 Members",
            "Compliance Classification : REGULAR",
            "",
            "CONFIRMED: All monthly electronic challan returns (ECRs) deposited on time."
        ]
    },
    {
        "filename": "ESIC_Compliance_Statement.pdf",
        "title": "EMPLOYEES STATE INSURANCE CORPORATION (ESIC)",
        "lines": [
            "COMPLIANCE STATUS REPORT",
            "",
            "Employer Code : 31000123450001001",
            "Name : TechCorp Solutions Pvt Ltd",
            "Status : Compliant",
            "Valid Until : March 2027",
            "",
            "This is a system generated certificate."
        ]
    },
    {
        "filename": "ISO_9001_Certificate.pdf",
        "title": "ISO 9001:2015 QUALITY MANAGEMENT SYSTEM",
        "lines": [
            "CERTIFICATE OF REGISTRATION",
            "",
            "This is to certify that the Quality Management System of",
            "TechCorp Solutions Pvt Ltd",
            "",
            "has been assessed and found to conform to the requirements of ISO 9001:2015.",
            "",
            "Certificate No : CERT-ISO-991A",
            "Valid Until : 2026-11-15",
            "Status : Active"
        ]
    },
    {
        "filename": "Turnover_Certificate.pdf",
        "title": "CHARTERED ACCOUNTANT TURNOVER CERTIFICATE",
        "lines": [
            "TO WHOMSOEVER IT MAY CONCERN",
            "",
            "This is to certify the financial turnover of TechCorp Solutions Pvt Ltd.",
            "",
            "Financial Year 2023-24 : Rs. 45,00,000",
            "Financial Year 2022-23 : Rs. 38,50,000",
            "Financial Year 2021-22 : Rs. 41,75,000",
            "",
            "Average Turnover : Rs. 41,75,000",
            "",
            "Certified by CA. Ramesh Kumar",
            "Membership No: 123456"
        ]
    }
]

# Create a demo directory
os.makedirs("demo_documents", exist_ok=True)

for doc in docs:
    filepath = os.path.join("demo_documents", doc["filename"])
    create_pdf(filepath, doc["title"], doc["lines"])
