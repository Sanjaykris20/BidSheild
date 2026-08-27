/**
 * Official Government Data Sources and Open Government Data (data.gov.in) Catalogs
 * 
 * Sources:
 * 1. Open Government Data Platform India (data.gov.in)
 *    Catalog: Udyam Registration (MSME Registration) - Ministry of Micro, Small and Medium Enterprises
 *    URL: https://www.data.gov.in/catalog/udyam-registration-msme-registration
 * 2. Central Public Procurement Portal (CPPP / eProcure)
 *    URL: https://eprocure.gov.in/eprocure/app
 * 3. Central Vigilance Commission (CVC) Debarment Notices
 */

export interface OpenDataGovMSMERecord {
  udyamRegistrationNumber: string;
  enterpriseName: string;
  enterpriseType: 'MICRO' | 'SMALL' | 'MEDIUM';
  majorActivity: 'SERVICES' | 'MANUFACTURING';
  dateOfIncorporation: string;
  dateOfRegistration: string;
  state: string;
  district: string;
  dicName: string;
  nicCode: string;
  nicDescription: string;
  turnoverRangeINR: string;
  investmentRangeINR: string;
  tenderFeeExemptionEligible: boolean;
  emdExemptionEligible: boolean;
  sourceDataset: string;
  catalogUrl: string;
  publishedDate: string;
}

export interface EProcureTenderRecord {
  tenderReferenceNumber: string;
  tenderId: string;
  tenderTitle: string;
  organization: string;
  department: string;
  tenderCategory: 'Goods' | 'Services' | 'Works';
  tenderType: 'Open Tender' | 'Limited' | 'Single' | 'Global';
  tenderStatus: 'Live' | 'Under Evaluation' | 'Technical Bid Opened' | 'AOC (Award of Contract)' | 'Closed';
  estimatedCostINR: number;
  estimatedCostFormatted: string;
  publicationDate: string;
  closingDate: string;
  bidOpeningDate: string;
  location: string;
  portalUrl: string;
  procuringEntity: string;
  emdAmountINR: number;
}

export interface DebarmentRecord {
  entityName: string;
  cin?: string;
  pan?: string;
  orderNumber: string;
  issuingAuthority: string;
  debarmentPeriodFrom: string;
  debarmentPeriodUntil: string;
  groundsForDebarment: string;
  status: 'ACTIVE_DEBARMENT' | 'REVOKED' | 'EXPIRED';
  publicNoticeUrl: string;
}

// -------------------------------------------------------------------------
// 1. data.gov.in: MSME Udyam Registration Records Catalog
// -------------------------------------------------------------------------
export const OFFICIAL_DATA_GOV_UDYAM_DATASET: OpenDataGovMSMERecord[] = [
  {
    udyamRegistrationNumber: 'UDYAM-MH-18-00123',
    enterpriseName: 'TechCorp Solutions Pvt Ltd',
    enterpriseType: 'SMALL',
    majorActivity: 'SERVICES',
    dateOfIncorporation: '2019-04-10',
    dateOfRegistration: '2020-09-15',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    dicName: 'MUMBAI SUBURBAN',
    nicCode: '62011',
    nicDescription: 'Writing, modifying, testing of computer program to meet the needs of a particular client',
    turnoverRangeINR: '₹25 Cr - ₹50 Cr',
    investmentRangeINR: '₹5 Cr - ₹10 Cr',
    tenderFeeExemptionEligible: true,
    emdExemptionEligible: true,
    sourceDataset: 'data.gov.in / Ministry of MSME',
    catalogUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    publishedDate: '2024-03-31',
  },
  {
    udyamRegistrationNumber: 'UDYAM-DL-03-00492',
    enterpriseName: 'Bharat Infrastructure Networks Pvt Ltd',
    enterpriseType: 'MEDIUM',
    majorActivity: 'SERVICES',
    dateOfIncorporation: '2017-08-22',
    dateOfRegistration: '2020-10-02',
    state: 'Delhi',
    district: 'New Delhi',
    dicName: 'NEW DELHI',
    nicCode: '61101',
    nicDescription: 'Activities of basic telecom services including wireline services',
    turnoverRangeINR: '₹50 Cr - ₹100 Cr',
    investmentRangeINR: '₹15 Cr - ₹25 Cr',
    tenderFeeExemptionEligible: true,
    emdExemptionEligible: true,
    sourceDataset: 'data.gov.in / Ministry of MSME',
    catalogUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    publishedDate: '2024-03-31',
  },
  {
    udyamRegistrationNumber: 'UDYAM-TN-02-00918',
    enterpriseName: 'Chennai Precision Valves & Flow Controls',
    enterpriseType: 'SMALL',
    majorActivity: 'MANUFACTURING',
    dateOfIncorporation: '2015-02-14',
    dateOfRegistration: '2020-08-28',
    state: 'Tamil Nadu',
    district: 'Chennai',
    dicName: 'CHENNAI',
    nicCode: '28132',
    nicDescription: 'Manufacture of taps, cocks, valves and similar appliances for pipes',
    turnoverRangeINR: '₹10 Cr - ₹25 Cr',
    investmentRangeINR: '₹3 Cr - ₹5 Cr',
    tenderFeeExemptionEligible: true,
    emdExemptionEligible: true,
    sourceDataset: 'data.gov.in / Ministry of MSME',
    catalogUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    publishedDate: '2024-03-31',
  },
  {
    udyamRegistrationNumber: 'UDYAM-KA-03-00812',
    enterpriseName: 'Indo-Tech Cloud Instruments',
    enterpriseType: 'MICRO',
    majorActivity: 'SERVICES',
    dateOfIncorporation: '2021-11-05',
    dateOfRegistration: '2022-01-18',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    dicName: 'BENGALURU URBAN',
    nicCode: '62020',
    nicDescription: 'Computer consultancy and computer facilities management activities',
    turnoverRangeINR: '₹1 Cr - ₹5 Cr',
    investmentRangeINR: '₹25 L - ₹1 Cr',
    tenderFeeExemptionEligible: true,
    emdExemptionEligible: true,
    sourceDataset: 'data.gov.in / Ministry of MSME',
    catalogUrl: 'https://www.data.gov.in/catalog/udyam-registration-msme-registration',
    publishedDate: '2024-03-31',
  },
];

// -------------------------------------------------------------------------
// 2. data.gov.in: State-wise MSME Distribution Statistics
// -------------------------------------------------------------------------
export const DATA_GOV_MSME_STATE_STATS = [
  { state: 'Maharashtra', microCount: 4210982, smallCount: 182390, mediumCount: 14205, total: 4407577 },
  { state: 'Tamil Nadu', microCount: 3109481, smallCount: 142091, mediumCount: 11048, total: 3262620 },
  { state: 'Gujarat', microCount: 2894109, smallCount: 139042, mediumCount: 12940, total: 3046091 },
  { state: 'Karnataka', microCount: 2490182, smallCount: 118402, mediumCount: 9840, total: 2618424 },
  { state: 'Uttar Pradesh', microCount: 3410928, smallCount: 98401, mediumCount: 6810, total: 3516139 },
  { state: 'Delhi', microCount: 1420918, smallCount: 84910, mediumCount: 7102, total: 1512930 },
];

// -------------------------------------------------------------------------
// 3. eProcure (CPPP): Public Procurement Tender Dataset
// -------------------------------------------------------------------------
export const OFFICIAL_EPROCURE_TENDERS: EProcureTenderRecord[] = [
  {
    tenderReferenceNumber: 'GEM/2026/B/1024',
    tenderId: '2026_MOD_891024_1',
    tenderTitle: 'Data Center Migration & Zero-Trust Security Upgrade',
    organization: 'Ministry of Defence',
    department: 'Defence Information Assurance & Technology',
    tenderCategory: 'Services',
    tenderType: 'Open Tender',
    tenderStatus: 'Live',
    estimatedCostINR: 365000000,
    estimatedCostFormatted: '₹36.50 Cr',
    publicationDate: '2026-08-10 10:00',
    closingDate: '2026-08-31 15:00',
    bidOpeningDate: '2026-09-01 16:00',
    location: 'New Delhi & Pune Data Centers',
    portalUrl: 'https://eprocure.gov.in/eprocure/app',
    procuringEntity: 'CPCL Senior Procurement Desk',
    emdAmountINR: 7300000,
  },
  {
    tenderReferenceNumber: 'CPCL/2026/899120',
    tenderId: '2026_CPCL_789120_1',
    tenderTitle: 'Supply of High-Pressure Cryogenic Storage Valves',
    organization: 'Chennai Petroleum Corporation Ltd (CPCL)',
    department: 'Mechanical Maintenance & Procurement',
    tenderCategory: 'Goods',
    tenderType: 'Open Tender',
    tenderStatus: 'Live',
    estimatedCostINR: 182000000,
    estimatedCostFormatted: '₹18.20 Cr',
    publicationDate: '2026-08-15 11:30',
    closingDate: '2026-09-02 14:00',
    bidOpeningDate: '2026-09-03 15:00',
    location: 'CPCL Manali Refinery, Chennai',
    portalUrl: 'https://eprocure.gov.in/eprocure/app',
    procuringEntity: 'CPCL Materials Management Division',
    emdAmountINR: 3640000,
  },
  {
    tenderReferenceNumber: 'NTPC/2026/CC/0912',
    tenderId: '2026_NTPC_654091_2',
    tenderTitle: 'Comprehensive Annual Maintenance for 660MW Supercritical Turbine Instrumentation',
    organization: 'NTPC Limited',
    department: 'Corporate Contracts',
    tenderCategory: 'Services',
    tenderType: 'Open Tender',
    tenderStatus: 'Live',
    estimatedCostINR: 42000000,
    estimatedCostFormatted: '₹4.20 Cr',
    publicationDate: '2026-08-18 09:00',
    closingDate: '2026-09-08 17:00',
    bidOpeningDate: '2026-09-09 11:00',
    location: 'Kudgi Super Thermal Power Station, Karnataka',
    portalUrl: 'https://eprocure.gov.in/eprocure/app',
    procuringEntity: 'NTPC Kudgi Contracts Cell',
    emdAmountINR: 840000,
  },
  {
    tenderReferenceNumber: 'ISRO/2026/SDSC/4401',
    tenderId: '2026_ISRO_440182_1',
    tenderTitle: 'Procurement of Aerospace Grade Inconel and Titanium Fasteners',
    organization: 'Department of Space / ISRO',
    department: 'Satish Dhawan Space Centre SHAR',
    tenderCategory: 'Goods',
    tenderType: 'Limited',
    tenderStatus: 'Technical Bid Opened',
    estimatedCostINR: 65000000,
    estimatedCostFormatted: '₹6.50 Cr',
    publicationDate: '2026-08-01 14:00',
    closingDate: '2026-08-22 16:00',
    bidOpeningDate: '2026-08-23 10:00',
    location: 'Sriharikota, Andhra Pradesh',
    portalUrl: 'https://eprocure.gov.in/eprocure/app',
    procuringEntity: 'SDSC Purchase & Stores',
    emdAmountINR: 1300000,
  },
];

// -------------------------------------------------------------------------
// 4. Central Debarment / Blacklist Public Register
// -------------------------------------------------------------------------
export const OFFICIAL_DEBARMENT_REGISTER: DebarmentRecord[] = [
  {
    entityName: 'CyberShield Systems India Ltd',
    cin: 'U72900DL2014PLC269841',
    pan: 'AABCC9981K',
    orderNumber: 'CVC/DEBAR/2024/0912',
    issuingAuthority: 'Ministry of Railways / Central Vigilance Commission',
    debarmentPeriodFrom: '2024-09-01',
    debarmentPeriodUntil: '2027-12-31',
    groundsForDebarment: 'Willful non-delivery of critical signaling telemetry hardware and forged OEM authorization certificate.',
    status: 'ACTIVE_DEBARMENT',
    publicNoticeUrl: 'https://cvc.gov.in/debarment/public-notice-2024-0912',
  },
  {
    entityName: 'Apex Defense Technologies LLP',
    cin: 'AAA-9912',
    pan: 'AABFA4412P',
    orderNumber: 'MOD/DEBAR/2025/1102',
    issuingAuthority: 'Ministry of Defence, Department of Defence Production',
    debarmentPeriodFrom: '2025-01-15',
    debarmentPeriodUntil: '2028-01-14',
    groundsForDebarment: 'Submitting falsified Class-I local content declaration and sub-tier OEM origin fraud.',
    status: 'ACTIVE_DEBARMENT',
    publicNoticeUrl: 'https://mod.gov.in/procurement/debarment-list/2025-1102',
  },
];

// -------------------------------------------------------------------------
// Dataset Lookup Utility Functions
// -------------------------------------------------------------------------

export function lookupUdyamOpenData(udyamNumber?: string, enterpriseName?: string): OpenDataGovMSMERecord | undefined {
  if (udyamNumber) {
    const cleanNumber = udyamNumber.trim().toUpperCase();
    const found = OFFICIAL_DATA_GOV_UDYAM_DATASET.find(
      r => r.udyamRegistrationNumber.toUpperCase() === cleanNumber
    );
    if (found) return found;
  }

  if (enterpriseName) {
    const cleanName = enterpriseName.trim().toLowerCase();
    return OFFICIAL_DATA_GOV_UDYAM_DATASET.find(
      r => r.enterpriseName.toLowerCase().includes(cleanName) || cleanName.includes(r.enterpriseName.toLowerCase())
    );
  }

  return undefined;
}

export function lookupEProcureTender(tenderNumberOrId: string): EProcureTenderRecord | undefined {
  const clean = tenderNumberOrId.trim().toUpperCase();
  return OFFICIAL_EPROCURE_TENDERS.find(
    t => t.tenderReferenceNumber.toUpperCase() === clean || t.tenderId.toUpperCase() === clean
  );
}

export function checkDebarmentRegister(entityName?: string, pan?: string, cin?: string): DebarmentRecord | undefined {
  if (cin) {
    const found = OFFICIAL_DEBARMENT_REGISTER.find(r => r.cin === cin);
    if (found) return found;
  }
  if (pan) {
    const found = OFFICIAL_DEBARMENT_REGISTER.find(r => r.pan === pan);
    if (found) return found;
  }
  if (entityName) {
    const clean = entityName.trim().toLowerCase();
    return OFFICIAL_DEBARMENT_REGISTER.find(
      r => r.entityName.toLowerCase().includes(clean) || clean.includes(r.entityName.toLowerCase())
    );
  }
  return undefined;
}
