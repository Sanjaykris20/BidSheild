import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'bidcompliance.db')

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("INSERT INTO mock_gst (gstin) VALUES ('27ABCDE1234F1Z5')")
cur.execute("INSERT INTO mock_pan (pan) VALUES ('ABCDE1234F')")
cur.execute("INSERT INTO mock_udyam (udyam_registration_number) VALUES ('UDYAM-MH-18-00123')")
cur.execute("INSERT INTO mock_epfo (epfo_establishment_id) VALUES ('MHBAN0089102000')")

conn.commit()
conn.close()
print("Test mock data inserted!")
