import sqlite3
import pandas as pd
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'bidcompliance.db')
DATAS_DIR = os.path.join(os.path.dirname(__file__), '..', 'datas')

def create_and_populate():
    conn = sqlite3.connect(DB_PATH)
    print(f"Connected to {DB_PATH}")

    # 1. EPFO / ESIC
    epfo_path = os.path.join(DATAS_DIR, 'EPFO_ESIC_mock.csv')
    if os.path.exists(epfo_path):
        df_epfo = pd.read_csv(epfo_path, on_bad_lines='skip', engine='python')
        # Normalize columns: remove trailing spaces, replace spaces with underscores, lowercase
        df_epfo.columns = [c.strip().replace(' ', '_').lower() for c in df_epfo.columns]
        df_epfo.to_sql('mock_epfo', conn, if_exists='replace', index=False)
        print("Populated mock_epfo table")

    # 2. GST
    gst_path = os.path.join(DATAS_DIR, 'gst_mock.csv')
    if os.path.exists(gst_path):
        df_gst = pd.read_csv(gst_path, on_bad_lines='skip', engine='python')
        df_gst.columns = [c.strip().replace(' ', '_').lower() for c in df_gst.columns]
        df_gst.to_sql('mock_gst', conn, if_exists='replace', index=False)
        print("Populated mock_gst table")

    # 3. Make in India
    mii_path = os.path.join(DATAS_DIR, 'makeindia_mock.csv')
    if os.path.exists(mii_path):
        df_mii = pd.read_csv(mii_path, on_bad_lines='skip', engine='python')
        df_mii.columns = [c.strip().replace(' ', '_').lower().replace('/', '') for c in df_mii.columns]
        df_mii.to_sql('mock_mii', conn, if_exists='replace', index=False)
        print("Populated mock_mii table")

    # 4. Udyam
    udyam_path = os.path.join(DATAS_DIR, 'udyam_mock_data.csv')
    if os.path.exists(udyam_path):
        df_udyam = pd.read_csv(udyam_path, on_bad_lines='skip', engine='python')
        df_udyam.columns = [c.strip().replace(' ', '_').lower().replace('&', 'and').replace('(', '').replace(')', '') for c in df_udyam.columns]
        df_udyam.to_sql('mock_udyam', conn, if_exists='replace', index=False)
        print("Populated mock_udyam table")

    # 5. PAN and Income Tax
    pan_path = os.path.join(DATAS_DIR, 'PAN_and_Income_Tax_Mock_Datasets_20_Companies_v2.xlsx')
    if os.path.exists(pan_path):
        # Read PAN sheet
        try:
            df_pan = pd.read_excel(pan_path, sheet_name='PAN Details', skiprows=1)
            df_pan.columns = [c.strip().replace(' ', '_').lower() for c in df_pan.columns]
            df_pan.to_sql('mock_pan', conn, if_exists='replace', index=False)
            print("Populated mock_pan table")
        except Exception as e:
            print("Error reading PAN sheet:", e)
            
        # Read ITR sheet
        try:
            df_itr = pd.read_excel(pan_path, sheet_name='Income Tax Details', skiprows=1)
            df_itr.columns = [c.strip().replace(' ', '_').lower() for c in df_itr.columns]
            df_itr.to_sql('mock_itr', conn, if_exists='replace', index=False)
            print("Populated mock_itr table")
        except Exception as e:
            print("Error reading ITR sheet:", e)

    conn.close()
    print("Database population complete.")

if __name__ == "__main__":
    create_and_populate()
