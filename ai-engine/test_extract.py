from main import extract_deterministic_fields
import json

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
Amount (in Rs.) : ₹ 10,140
Amount (in words) : Rupees Ten Thousand One Hundred Forty Only
CIN : 23042900000842HDFC
Mode of Payment : Net Banking
Bank Name : HDFC Bank
Bank Reference Number : K2311901046616
Date of Deposit : 29-Apr-2023
BSR code : 0510349 Challan No : 00209 Tender Date : 29/04/2023
"""

fields = extract_deterministic_fields(text, "challan.pdf")
print(json.dumps(fields, indent=2))
