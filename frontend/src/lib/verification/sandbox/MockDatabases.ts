// Simulated Government Databases for Sandbox Verification

export const MOCK_GST_DB: Record<string, any> = {
  "33ABCDE1234F1Z5": {
    legal_name: "Alpha Defense Logistics Pvt Ltd",
    registration_date: "2023-05-14",
    status: "ACTIVE"
  },
  "22XYZAB9876G1Z2": {
    legal_name: "Bravo Heavy Engineering",
    registration_date: "2018-02-11",
    status: "ACTIVE"
  },
  "11QWERT4567H1Z9": {
    legal_name: "Delta Corp Supplies",
    registration_date: "2021-09-01",
    status: "INACTIVE"
  }
};

export const MOCK_PAN_DB: Record<string, any> = {
  "ABCDE1234F": {
    name: "Alpha Defense Logistics Pvt Ltd",
    category: "Company",
    status: "ACTIVE"
  },
  "XYZAB9876G": {
    name: "Bravo Heavy Engineering",
    category: "Company",
    status: "ACTIVE"
  },
  "QWERT4567H": {
    name: "Delta Corp Supplies",
    category: "Company",
    status: "ACTIVE"
  }
};

export const MOCK_DEBARMENT_DB: Record<string, any> = {
  "ABCDE1234F": { is_debarred: false },
  "XYZAB9876G": { is_debarred: false },
  "QWERT4567H": { is_debarred: true, reason: "Fraudulent Documentation 2025" }
};
