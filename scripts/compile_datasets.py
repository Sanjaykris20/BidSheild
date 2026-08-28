import os
import json
import csv
import pandas as pd

def clean_key(k):
    return k.strip().lower()

def parse_csv(filepath, primary_key_col_index=0):
    db = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            headers = [h.strip() for h in headers]
            for row in reader:
                if len(row) > primary_key_col_index:
                    primary_key = row[primary_key_col_index].strip()
                    if not primary_key:
                        continue
                    
                    record = {}
                    for i in range(min(len(headers), len(row))):
                        record[headers[i]] = row[i].strip()
                    
                    db[primary_key] = record
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return db

def parse_excel(filepath, primary_key_col='PAN'):
    db = {}
    try:
        df = pd.read_excel(filepath, skiprows=2)
        for _, row in df.iterrows():
            if primary_key_col in row and not pd.isna(row[primary_key_col]):
                pk = str(row[primary_key_col]).strip()
                record = {}
                for col in df.columns:
                    val = row[col]
                    if pd.isna(val):
                        record[str(col).strip()] = ""
                    else:
                        record[str(col).strip()] = str(val).strip()
                db[pk] = record
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return db

def main():
    datas_dir = r"c:\Users\sanja\Desktop\Projects\BidSheild\datas"
    
    gst_db = parse_csv(os.path.join(datas_dir, "gst_mock.csv"), primary_key_col_index=0) # GSTIN
    udyam_db = parse_csv(os.path.join(datas_dir, "udyam_mock_data.csv"), primary_key_col_index=0) # Udyam Registration Number
    epfo_db = parse_csv(os.path.join(datas_dir, "EPFO_ESIC_mock.csv"), primary_key_col_index=2) # EPFO Establishment ID
    mii_db = parse_csv(os.path.join(datas_dir, "makeindia_mock.csv"), primary_key_col_index=0) # Company Name
    pan_it_db = parse_excel(os.path.join(datas_dir, "PAN_and_Income_Tax_Mock_Datasets_20_Companies_v2.xlsx"), primary_key_col='PAN')
    
    compiled_data = {
        "GST_DB": gst_db,
        "UDYAM_DB": udyam_db,
        "EPFO_DB": epfo_db,
        "MII_DB": mii_db,
        "PAN_DB": pan_it_db
    }
    
    out_dir = r"c:\Users\sanja\Desktop\Projects\BidSheild\frontend\src\lib\verification\sandbox"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "dataset.json")
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(compiled_data, f, indent=2)
        
    print(f"Successfully compiled {len(gst_db)} GST, {len(udyam_db)} UDYAM, {len(epfo_db)} EPFO, {len(mii_db)} MII, {len(pan_it_db)} PAN records.")
    print(f"Saved to {out_path}")

if __name__ == "__main__":
    main()
