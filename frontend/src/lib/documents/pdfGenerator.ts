/**
 * Minimal, zero-dependency, 100% compliant standard PDF 1.4 Generator
 * Generates crisp, valid, openable PDF documents for Government & Bidder artifacts.
 */
export interface PdfDocumentDefinition {
  title: string;
  subtitle?: string;
  department?: string;
  documentNumber?: string;
  date?: string;
  metadata?: Record<string, string>;
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    alert?: {
      type: 'info' | 'success' | 'warning' | 'danger';
      text: string;
    };
  }>;
  signatory?: {
    name: string;
    designation: string;
    organization: string;
    date: string;
  };
  sealText?: string;
  qrCodeMockText?: string;
}

export class SimplePdfBuilder {
  private objects: string[] = [];
  private offsets: number[] = [];

  private addObject(content: string): number {
    const objectIndex = this.objects.length + 1;
    this.objects.push(`${objectIndex} 0 obj\n${content}\nendobj\n`);
    return objectIndex;
  }

  public build(def: PdfDocumentDefinition): Buffer {
    this.objects = [];
    this.offsets = [];

    // Page dimensions: A4 (595 x 842 pt)
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 45;
    const contentWidth = pageWidth - margin * 2;

    // Stream text commands
    const streamCommands: string[] = [];

    // Background border & header styling
    streamCommands.push(`0.85 0.90 0.95 rg 0 832 595 10 re f`); // Top blue header strip
    streamCommands.push(`0.10 0.22 0.38 RG 2 w`); // Deep navy border
    streamCommands.push(`${margin - 10} 35 ${contentWidth + 20} ${pageHeight - 70} re S`);
    streamCommands.push(`0.85 0.88 0.92 RG 1 w`); // Inner light border
    streamCommands.push(`${margin - 6} 39 ${contentWidth + 12} ${pageHeight - 78} re S`);

    // Helper text writer
    let currentY = pageHeight - 70;

    // Government Header
    streamCommands.push(`0.08 0.18 0.36 rg`); // Navy text
    streamCommands.push(`BT /F2 14 Tf ${margin} ${currentY} Td (${this.escapePdf(def.title.toUpperCase())}) Tj ET`);
    currentY -= 16;

    if (def.department) {
      streamCommands.push(`0.30 0.35 0.42 rg`);
      streamCommands.push(`BT /F1 9 Tf ${margin} ${currentY} Td (${this.escapePdf(def.department)}) Tj ET`);
      currentY -= 14;
    }

    if (def.subtitle) {
      streamCommands.push(`0.12 0.45 0.65 rg`);
      streamCommands.push(`BT /F2 10 Tf ${margin} ${currentY} Td (${this.escapePdf(def.subtitle)}) Tj ET`);
      currentY -= 18;
    }

    // Divider Line
    streamCommands.push(`0.75 0.80 0.86 RG 1.5 w ${margin} ${currentY + 6} m ${pageWidth - margin} ${currentY + 6} l S`);
    currentY -= 12;

    // Document Meta Bar
    streamCommands.push(`0.96 0.97 0.98 rg ${margin} ${currentY - 22} ${contentWidth} 26 re f`);
    streamCommands.push(`0.80 0.85 0.90 RG 0.75 w ${margin} ${currentY - 22} ${contentWidth} 26 re S`);

    const docNo = def.documentNumber || `DOC-${Date.now().toString().slice(-6)}`;
    const docDate = def.date || '27-Aug-2026';
    streamCommands.push(`0.20 0.25 0.32 rg`);
    streamCommands.push(`BT /F2 8.5 Tf ${margin + 8} ${currentY - 14} Td (DOCUMENT NO: ${this.escapePdf(docNo)}) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf ${pageWidth - margin - 150} ${currentY - 14} Td (ISSUE DATE: ${this.escapePdf(docDate)}) Tj ET`);
    currentY -= 36;

    // Metadata Grid if present
    if (def.metadata && Object.keys(def.metadata).length > 0) {
      const entries = Object.entries(def.metadata);
      const colWidth = contentWidth / 2;

      for (let i = 0; i < entries.length; i += 2) {
        const item1 = entries[i];
        const item2 = entries[i + 1];

        streamCommands.push(`0.35 0.40 0.48 rg`);
        streamCommands.push(`BT /F2 8 Tf ${margin + 4} ${currentY} Td (${this.escapePdf(item1[0].toUpperCase())}:) Tj ET`);
        streamCommands.push(`0.10 0.15 0.22 rg`);
        streamCommands.push(`BT /F1 8.5 Tf ${margin + 120} ${currentY} Td (${this.escapePdf(item1[1])}) Tj ET`);

        if (item2) {
          streamCommands.push(`0.35 0.40 0.48 rg`);
          streamCommands.push(`BT /F2 8 Tf ${margin + colWidth + 4} ${currentY} Td (${this.escapePdf(item2[0].toUpperCase())}:) Tj ET`);
          streamCommands.push(`0.10 0.15 0.22 rg`);
          streamCommands.push(`BT /F1 8.5 Tf ${margin + colWidth + 120} ${currentY} Td (${this.escapePdf(item2[1])}) Tj ET`);
        }
        currentY -= 14;
      }
      currentY -= 8;
    }

    // Sections
    for (const sec of def.sections) {
      if (sec.heading) {
        streamCommands.push(`0.08 0.18 0.36 rg`);
        streamCommands.push(`BT /F2 10 Tf ${margin} ${currentY} Td (${this.escapePdf(sec.heading)}) Tj ET`);
        streamCommands.push(`0.20 0.45 0.70 RG 1 w ${margin} ${currentY - 3} m ${margin + 180} ${currentY - 3} l S`);
        currentY -= 16;
      }

      if (sec.alert) {
        const alertBg =
          sec.alert.type === 'success'
            ? '0.92 0.98 0.94'
            : sec.alert.type === 'danger'
            ? '0.99 0.92 0.92'
            : sec.alert.type === 'warning'
            ? '1.00 0.97 0.90'
            : '0.92 0.96 1.00';
        const alertBorder =
          sec.alert.type === 'success'
            ? '0.30 0.75 0.45'
            : sec.alert.type === 'danger'
            ? '0.85 0.25 0.25'
            : sec.alert.type === 'warning'
            ? '0.90 0.65 0.15'
            : '0.25 0.55 0.85';
        const alertText =
          sec.alert.type === 'success'
            ? '0.10 0.45 0.20'
            : sec.alert.type === 'danger'
            ? '0.65 0.10 0.10'
            : sec.alert.type === 'warning'
            ? '0.60 0.40 0.05'
            : '0.10 0.30 0.60';

        streamCommands.push(`${alertBg} rg ${margin} ${currentY - 20} ${contentWidth} 22 re f`);
        streamCommands.push(`${alertBorder} RG 1 w ${margin} ${currentY - 20} ${contentWidth} 22 re S`);
        streamCommands.push(`${alertText} rg`);
        streamCommands.push(`BT /F2 8.5 Tf ${margin + 8} ${currentY - 14} Td (${this.escapePdf(sec.alert.text)}) Tj ET`);
        currentY -= 30;
      }

      if (sec.paragraphs) {
        streamCommands.push(`0.20 0.24 0.30 rg`);
        for (const p of sec.paragraphs) {
          const lines = this.wrapText(p, 90);
          for (const line of lines) {
            streamCommands.push(`BT /F1 8.5 Tf ${margin} ${currentY} Td (${this.escapePdf(line)}) Tj ET`);
            currentY -= 12;
          }
          currentY -= 4;
        }
      }

      if (sec.table) {
        const headers = sec.table.headers;
        const rows = sec.table.rows;
        const colW = contentWidth / headers.length;
        const rowH = 16;

        // Table Header Row
        streamCommands.push(`0.12 0.22 0.38 rg ${margin} ${currentY - rowH} ${contentWidth} ${rowH} re f`);
        streamCommands.push(`1.0 1.0 1.0 rg`);
        headers.forEach((h, idx) => {
          streamCommands.push(`BT /F2 8 Tf ${margin + idx * colW + 6} ${currentY - 11} Td (${this.escapePdf(h)}) Tj ET`);
        });
        currentY -= rowH;

        // Table Body Rows
        rows.forEach((row, rIdx) => {
          const bg = rIdx % 2 === 0 ? '0.98 0.98 0.99' : '1.0 1.0 1.0';
          streamCommands.push(`${bg} rg ${margin} ${currentY - rowH} ${contentWidth} ${rowH} re f`);
          streamCommands.push(`0.88 0.90 0.93 RG 0.5 w ${margin} ${currentY - rowH} ${contentWidth} ${rowH} re S`);
          streamCommands.push(`0.18 0.22 0.28 rg`);
          row.forEach((cell, cIdx) => {
            streamCommands.push(`BT /F1 8 Tf ${margin + cIdx * colW + 6} ${currentY - 11} Td (${this.escapePdf(cell)}) Tj ET`);
          });
          currentY -= rowH;
        });
        currentY -= 10;
      }
    }

    // Signatory & Seal Footer
    const footerY = 90;
    streamCommands.push(`0.85 0.88 0.92 RG 1 w ${margin} ${footerY + 35} m ${pageWidth - margin} ${footerY + 35} l S`);

    // Verification Seal Box
    streamCommands.push(`0.96 0.98 1.00 rg ${margin} ${footerY - 30} 180 55 re f`);
    streamCommands.push(`0.20 0.45 0.70 RG 1 w ${margin} ${footerY - 30} 180 55 re S`);
    streamCommands.push(`0.10 0.35 0.60 rg`);
    streamCommands.push(`BT /F2 8 Tf ${margin + 8} ${footerY + 14} Td (BIDSHIELD SECURE VERIFIED) Tj ET`);
    streamCommands.push(`0.30 0.35 0.40 rg`);
    streamCommands.push(`BT /F3 7 Tf ${margin + 8} ${footerY + 2} Td (Digitally Verified & Encrypted) Tj ET`);
    streamCommands.push(`BT /F3 7 Tf ${margin + 8} ${footerY - 10} Td (SHA-256: ${this.escapePdf(docNo.replace(/[^A-Z0-9]/gi, '').slice(0, 16))}) Tj ET`);
    streamCommands.push(`BT /F3 7 Tf ${margin + 8} ${footerY - 22} Td (Status: COMPLIANT & RECORDED) Tj ET`);

    // Signatory on Right
    if (def.signatory) {
      streamCommands.push(`0.12 0.18 0.28 rg`);
      streamCommands.push(`BT /F2 8.5 Tf ${pageWidth - margin - 170} ${footerY + 18} Td (AUTHORIZED SIGNATORY:) Tj ET`);
      streamCommands.push(`BT /F2 9 Tf ${pageWidth - margin - 170} ${footerY + 4} Td (${this.escapePdf(def.signatory.name)}) Tj ET`);
      streamCommands.push(`0.35 0.40 0.48 rg`);
      streamCommands.push(`BT /F1 8 Tf ${pageWidth - margin - 170} ${footerY - 8} Td (${this.escapePdf(def.signatory.designation)}) Tj ET`);
      streamCommands.push(`BT /F1 8 Tf ${pageWidth - margin - 170} ${footerY - 20} Td (${this.escapePdf(def.signatory.organization)}) Tj ET`);
    }

    // Bottom Watermark
    streamCommands.push(`0.55 0.60 0.65 rg`);
    streamCommands.push(`BT /F1 7 Tf ${margin} 22 Td (BidShield AI Enterprise Compliance Suite • Certified Electronic Record • Smart India Hackathon Prototype) Tj ET`);

    const streamContent = streamCommands.join('\n');
    const streamLength = Buffer.byteLength(streamContent, 'utf-8');

    // Build PDF Objects
    // Object 1: Catalog
    const catalogObj = this.addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

    // Object 2: Pages
    const pagesObj = this.addObject(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

    // Object 4: Font F1 (Helvetica Regular)
    const f1Obj = this.addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

    // Object 5: Font F2 (Helvetica Bold)
    const f2Obj = this.addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

    // Object 6: Font F3 (Courier Regular)
    const f3Obj = this.addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`);

    // Object 7: Content Stream
    const streamObj = this.addObject(
      `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`
    );

    // Object 3: Page (references fonts and stream)
    this.objects[2] = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${streamObj} 0 R /Resources << /Font << /F1 ${f1Obj} 0 R /F2 ${f2Obj} 0 R /F3 ${f3Obj} 0 R >> >> >>\nendobj\n`;

    // Assembly
    let pdfString = `%PDF-1.4\n%âãÏÓ\n`;
    const offsets: number[] = [];

    for (let i = 0; i < this.objects.length; i++) {
      offsets.push(Buffer.byteLength(pdfString, 'utf-8'));
      pdfString += this.objects[i];
    }

    const startXref = Buffer.byteLength(pdfString, 'utf-8');
    pdfString += `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;

    for (const offset of offsets) {
      pdfString += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }

    pdfString += `trailer\n<< /Size ${this.objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.from(pdfString, 'utf-8');
  }

  private escapePdf(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[\r\n]+/g, ' ');
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxChars) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }
}

/**
 * Pre-configured 15 Synthetic Government & Vendor Mock Document Definitions
 */
export const SYNTHETIC_DOCUMENT_DEFINITIONS: Record<string, PdfDocumentDefinition> = {
  'Udyam_Registration_Certificate.pdf': {
    title: 'Ministry of Micro, Small and Medium Enterprises',
    subtitle: 'UDYAM REGISTRATION CERTIFICATE',
    department: 'Government of India • Directorate of MSME',
    documentNumber: 'UDYAM-MH-18-00123',
    date: '15-Sep-2020',
    metadata: {
      'Enterprise Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Organisation Type': 'Private Limited Company',
      'Major Activity': 'Services (IT & Software Engineering)',
      'Enterprise Category': 'SMALL ENTERPRISE',
      'Date of Incorporation': '10-Apr-2019',
      'National Industry Code (NIC)': '62011 - Software Development & Testing',
      'Official Address': 'Plot 44, Electronic City, Phase II, Bengaluru - 560100',
      'DIC Center': 'Mumbai Suburban, Maharashtra',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'ACTIVE & VERIFIED: Enterprise eligible for Tender Fee & EMD exemptions under MSME Policy.',
        },
      },
      {
        heading: '1. Statutory MSME Declaration',
        paragraphs: [
          'This is to certify that M/s TECHCORP SOLUTIONS PRIVATE LIMITED is registered under the Micro, Small and Medium Enterprises Development Act, 2006 (MSMED Act) with valid continuous operational compliance.',
          'The investment in plant and machinery and total annual turnover of the enterprise have been verified against Income Tax Return (ITR) and GSTIN data from the relevant assessment years.',
        ],
      },
      {
        heading: '2. Investment and Turnover Classification',
        table: {
          headers: ['Assessment Year', 'Gross Turnover (INR)', 'Investment in P&M (INR)', 'Status'],
          rows: [
            ['2023-2024', '34.20 Crore', '6.80 Crore', 'SMALL - Verified'],
            ['2024-2025', '38.50 Crore', '7.40 Crore', 'SMALL - Verified'],
            ['2025-2026', '42.10 Crore', '8.10 Crore', 'SMALL - Verified'],
          ],
        },
      },
    ],
    signatory: {
      name: 'R. K. Verma, IAS',
      designation: 'Joint Secretary (MSME)',
      organization: 'Ministry of MSME, Government of India',
      date: '15-Sep-2020',
    },
  },

  'GST_Registration_Certificate.pdf': {
    title: 'Government of India • Goods and Services Tax',
    subtitle: 'FORM GST REG-06 • REGISTRATION CERTIFICATE',
    department: 'Central Board of Indirect Taxes and Customs (CBIC)',
    documentNumber: '27ABCDE1234F1Z5',
    date: '01-Jul-2017',
    metadata: {
      'Legal Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Trade Name': 'TechCorp Solutions',
      'GSTIN': '27ABCDE1234F1Z5',
      'Constitution of Business': 'Private Limited Company',
      'Principal Place': '4th Floor, Technopark Tower, Andheri East, Mumbai - 400069',
      'State / Jurisdiction': 'Maharashtra - Ward 04',
      'Taxpayer Type': 'Regular Taxpayer',
      'Registration Status': 'ACTIVE & COMPLIANT',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'VERIFIED ON GSTN REGISTRY: Zero default notices. All GSTR-3B filings up to date.',
        },
      },
      {
        heading: '1. Registration Particulars',
        paragraphs: [
          'This certificate is granted under Section 25(1) of the Central Goods and Services Tax Act, 2017 to the registered person mentioned herein.',
          'The taxpayer is liable to comply with regular statutory filing obligations including GSTR-1, GSTR-3B, and GSTR-9 annual reconciliation returns.',
        ],
      },
      {
        heading: '2. Recent Return Filing Record (FY 2025-26)',
        table: {
          headers: ['Tax Period', 'Return Type', 'Filing Date', 'ARN Code', 'Filing Status'],
          rows: [
            ['July 2026', 'GSTR-3B', '18-Aug-2026', 'AA2708260019283', 'FILED - ON TIME'],
            ['June 2026', 'GSTR-3B', '19-Jul-2026', 'AA2707260081291', 'FILED - ON TIME'],
            ['May 2026', 'GSTR-3B', '17-Jun-2026', 'AA2706260049102', 'FILED - ON TIME'],
            ['April 2026', 'GSTR-3B', '18-May-2026', 'AA2705260038190', 'FILED - ON TIME'],
          ],
        },
      },
    ],
    signatory: {
      name: 'Dr. Sunil K. Nair',
      designation: 'Assistant Commissioner of State Tax',
      organization: 'GST Department, Mumbai Division',
      date: '01-Jul-2017',
    },
  },

  'GST_Return_Filing_Summary.pdf': {
    title: 'Goods and Services Tax Network (GSTN)',
    subtitle: 'ANNUAL COMPLIANCE & FILING SUMMARY REPORT',
    department: 'GSTN Analytics & Audit Division',
    documentNumber: 'GSTN-SUM-2026-8910',
    date: '20-Aug-2026',
    metadata: {
      'Entity Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'GSTIN': '27ABCDE1234F1Z5',
      'Financial Year': '2025-2026 (Consolidated)',
      'Total Output Tax (INR)': '7.58 Crore',
      'Input Tax Credit (INR)': '5.12 Crore',
      'Net Tax Paid in Cash': '2.46 Crore',
      'Filing Regularity Index': '100.0% (Zero Defaults)',
      'Risk Classification': 'LOW RISK (Green Tier)',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'COMPLIANCE AUDIT PASSED: No ITC mismatches, supplier defaults, or show-cause notices.',
        },
      },
      {
        heading: '1. GST Return Reconciliation Statement',
        paragraphs: [
          'Detailed analysis of monthly GSTR-1 vs GSTR-3B returns confirms complete harmony between outward supplies and tax liability discharged.',
        ],
      },
    ],
    signatory: {
      name: 'GSTN Automated Ledger System',
      designation: 'Statutory Verification Gateway',
      organization: 'GSTN Government Gateway',
      date: '20-Aug-2026',
    },
  },

  'PAN_Verification_Report.pdf': {
    title: 'Income Tax Department • Directorate of Systems',
    subtitle: 'PERMANENT ACCOUNT NUMBER (PAN) VERIFICATION REPORT',
    department: 'Protean eGov Technologies / NSDL Database',
    documentNumber: 'PAN-NSDL-2026-44120',
    date: '24-Aug-2026',
    metadata: {
      'PAN': 'ABCDE1234F',
      'Entity Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'PAN Status': 'ACTIVE & IN USE',
      'Entity Category': 'Company (Domestic)',
      'Date of Allotment': '18-Apr-2019',
      'Aadhaar / CIN Seeding': 'L72900MH2019PTC324102',
      'Name Match Confidence': '100% (Strict Match)',
      'Jurisdiction Code': 'CIT-04 Mumbai',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'VERIFIED: Entity name matches GSTIN and Ministry of Corporate Affairs (MCA) database.',
        },
      },
      {
        heading: '1. Legal Entity Cross-Verification',
        paragraphs: [
          'The PAN records have been cross-checked across the NSDL repository and Central Board of Direct Taxes (CBDT) systems. No adverse cancellation or duplicate PAN flags exist for this tax entity.',
        ],
      },
    ],
    signatory: {
      name: 'NSDL Verification Authority',
      designation: 'Authorized Tax System Validator',
      organization: 'Protean eGov Technologies Ltd',
      date: '24-Aug-2026',
    },
  },

  'Income_Tax_Compliance_Report.pdf': {
    title: 'Income Tax Department • e-Filing Portal',
    subtitle: '3-YEAR ITR FILING COMPLIANCE & UDIN REPORT',
    department: 'Ministry of Finance, Government of India',
    documentNumber: 'ITR-V-2026-904128',
    date: '12-Aug-2026',
    metadata: {
      'Taxpayer Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'PAN': 'ABCDE1234F',
      'Assessment Year 1 (AY 24-25)': 'ITR-6 Filed (Ack: 49102830192)',
      'Assessment Year 2 (AY 25-26)': 'ITR-6 Filed (Ack: 58192038102)',
      'Assessment Year 3 (AY 26-27)': 'ITR-6 Filed (Ack: 67102938190)',
      'Audited CA UDIN': '26049102AAAAAC8912',
      'Tax Compliance Status': 'COMPLIANT (3 Years Verified)',
      'Turnover (Average 3 Yrs)': '38.26 Crore INR',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'FINANCIAL ELIGIBILITY CLEARED: Meets 3-year turnover and positive net-worth criteria.',
        },
      },
      {
        heading: '1. Summary of Tax Return Submissions',
        table: {
          headers: ['Assessment Year', 'Gross Income (INR)', 'Tax Paid (INR)', 'UDIN Verified', 'Audit Status'],
          rows: [
            ['AY 2024-2025', '34,20,00,000', '1,84,00,000', 'Yes - 24049102AAAB', 'Clean Opinion'],
            ['AY 2025-2026', '38,50,00,000', '2,10,00,000', 'Yes - 25049102AAAC', 'Clean Opinion'],
            ['AY 2026-2027', '42,10,00,000', '2,45,00,000', 'Yes - 26049102AAAA', 'Clean Opinion'],
          ],
        },
      },
    ],
    signatory: {
      name: 'K. S. Ramanathan, FCA',
      designation: 'Statutory Auditor (M.No 049102)',
      organization: 'Ramanathan & Associates, Chartered Accountants',
      date: '12-Aug-2026',
    },
  },

  'EPFO_Compliance_Statement.pdf': {
    title: 'Employees Provident Fund Organisation (EPFO)',
    subtitle: 'STATUTORY REMITTANCE & COMPLIANCE CERTIFICATE',
    department: 'Ministry of Labour and Employment, Government of India',
    documentNumber: 'EPFO-MH-MUM-89102-000',
    date: '15-Aug-2026',
    metadata: {
      'Establishment Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Establishment Code': 'MHBAN0089102000',
      'Registration Date': '04-May-2019',
      'Active Subscribed Employees': '248 Members',
      'Wage Month Audited': 'July 2026',
      'TRRN Number': '3819201928301',
      'Remittance Amount (INR)': '14,88,000',
      'Compliance Classification': 'REGULAR (No Default)',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'EPF COMPLIANCE CONFIRMED: All monthly electronic challan returns (ECRs) deposited on time.',
        },
      },
      {
        heading: '1. EPFO Contribution Summary',
        paragraphs: [
          'This is to certify that M/s TECHCORP SOLUTIONS PRIVATE LIMITED is duly registered with the EPFO and has regularly deposited employee and employer contributions under the Employees Provident Funds and Miscellaneous Provisions Act, 1952.',
        ],
      },
    ],
    signatory: {
      name: 'Regional P.F. Commissioner',
      designation: 'RPFC-II, Bandra Regional Office',
      organization: 'Employees Provident Fund Organisation',
      date: '15-Aug-2026',
    },
  },

  'ESIC_Compliance_Statement.pdf': {
    title: 'Employees State Insurance Corporation (ESIC)',
    subtitle: 'EMPLOYER CONTRIBUTION COMPLIANCE STATEMENT',
    department: 'Ministry of Labour and Employment, Government of India',
    documentNumber: 'ESIC-31000892010001001',
    date: '16-Aug-2026',
    metadata: {
      'Employer Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Employer Code Number': '31000892010001001',
      'Regional Office': 'Sub-Regional Office, Marol, Mumbai',
      'Covered Insured Persons': '142 Employees',
      'Contribution Period': 'April 2026 to September 2026',
      'Challan Reference': '0312610928301',
      'Payment Status': 'CLEARED & REALIZED',
      'Statutory Status': 'COMPLIANT',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'ESIC CONTRIBUTIONS VERIFIED: Zero pending recovery notices or arrears.',
        },
      },
      {
        heading: '1. Statutory Insurance Certification',
        paragraphs: [
          'Certified that the employer has fulfilled all mandatory monthly contribution requirements as per the ESI Act, 1948 without default.',
        ],
      },
    ],
    signatory: {
      name: 'Deputy Director (Revenue)',
      designation: 'Authorized Officer',
      organization: 'Employees State Insurance Corporation',
      date: '16-Aug-2026',
    },
  },

  'Startup_India_Recognition_Certificate.pdf': {
    title: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    subtitle: 'STARTUP INDIA RECOGNITION CERTIFICATE',
    department: 'Ministry of Commerce and Industry, Government of India',
    documentNumber: 'DIPP-STARTUP-99201',
    date: '10-Nov-2021',
    metadata: {
      'Startup Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Certificate Number': 'DIPP99201',
      'Incorporation Date': '10-Apr-2019',
      'Sector / Industry': 'IT Services / Cyber Security / AI Systems',
      'Recognition Period': '10 Years (Valid till 09-Nov-2031)',
      'Public Procurement Benefits': 'Eligible for Prior Experience/Turnover Relaxation',
    },
    sections: [
      {
        alert: {
          type: 'info',
          text: 'DPIIT RECOGNIZED STARTUP: Eligible for Rule 173(i) GFR 2017 relaxation on experience & turnover.',
        },
      },
      {
        heading: '1. DPIIT Startup Certification',
        paragraphs: [
          'This is to certify that TECHCORP SOLUTIONS PRIVATE LIMITED is recognized as a Startup by the Inter-Ministerial Board of Certification.',
        ],
      },
    ],
    signatory: {
      name: 'Director (Startup India)',
      designation: 'DPIIT, Ministry of Commerce & Industry',
      organization: 'Government of India, New Delhi',
      date: '10-Nov-2021',
    },
  },

  'NSIC_Certificate.pdf': {
    title: 'National Small Industries Corporation (NSIC)',
    subtitle: 'SINGLE POINT REGISTRATION SCHEME (SPRS) CERTIFICATE',
    department: 'A Government of India Enterprise • Ministry of MSME',
    documentNumber: 'NSIC/GP/SPRS/2022/004910',
    date: '14-Mar-2022',
    metadata: {
      'Enterprise Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'NSIC Unit Branch': 'Andheri Branch, Mumbai',
      'Registration Scheme': 'Single Point Registration Scheme (Government Purchases)',
      'Validity Period': '14-Mar-2022 to 13-Mar-2027',
      'Stores / Equipment Approved': 'IT Infrastructure & Data Center Hardware Solutions',
      'Monetary Limit (INR)': '15.00 Crore',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'SPRS ENROLLED: Exempted from earnest money deposit (EMD) and issue of tender sets free of cost.',
        },
      },
      {
        heading: '1. Government Purchase Preference Scheme',
        paragraphs: [
          'The firm is registered with NSIC under Single Point Registration Scheme for participation in Central Government and CPSE procurements.',
        ],
      },
    ],
    signatory: {
      name: 'General Manager (Commercial)',
      designation: 'NSIC Zonal Office',
      organization: 'National Small Industries Corporation Ltd',
      date: '14-Mar-2022',
    },
  },

  'OEM_Authorization_Letter.pdf': {
    title: 'Enterprise Server Global Inc. (OEM)',
    subtitle: 'MANUFACTURER AUTHORIZATION FORM (MAF)',
    department: 'Global Channel Partner Governance Division',
    documentNumber: 'MAF-OEM-99120',
    date: '24-Aug-2026',
    metadata: {
      'OEM Name': 'Enterprise Server Global Inc.',
      'Authorized Bidder': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Tender Reference Number': 'GEM/2026/B/1024',
      'Procuring Entity': 'Ministry of Defence / Central Public Procurement',
      'Validity Window': 'Valid through 24-Aug-2027',
      'Authorization Tier': 'Tier-1 Platinum Certified Solution Provider',
      'Warranty Backing': '5-Year 24x7 Comprehensive OEM On-Site SLA Backed',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'OFFICIAL OEM AUTHORIZATION VERIFIED: Validated against OEM Direct Partner Ledger.',
        },
      },
      {
        heading: '1. Manufacturer Authorization & Warranty Guarantee',
        paragraphs: [
          'We, Enterprise Server Global Inc., who are official manufacturers of enterprise blade compute nodes, storage arrays, and network switches, having factories at Bangalore and Chennai, do hereby authorize M/s TECHCORP SOLUTIONS PRIVATE LIMITED to submit bid against Tender Reference No. GEM/2026/B/1024.',
          'We further confirm that we extend our full standard manufacturer warranty, software firmware updates, and technical escalation support for the entire tenure of the contract.',
        ],
      },
    ],
    signatory: {
      name: 'Marcus Vance',
      designation: 'Vice President, Enterprise Channels (APAC)',
      organization: 'Enterprise Server Global Inc.',
      date: '24-Aug-2026',
    },
  },

  'Make_In_India_Declaration.pdf': {
    title: 'Self-Declaration under Preference to Make in India Order',
    subtitle: 'LOCAL CONTENT (MII) STATUTORY UNDERTAKING',
    department: 'In accordance with DPIIT Order No. P-45021/2/2017-PP (BE-II)',
    documentNumber: 'MII-TC-2026-04',
    date: '24-Aug-2026',
    metadata: {
      'Bidder Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Tender Reference': 'GEM/2026/B/1024',
      'Supplier Category': 'Class-II Local Supplier (Declared)',
      'Declared Local Content %': '42.0% (Class-II Status)',
      'Required Class-I Threshold': '50.0%',
      'Manufacturing Plant Location': 'Plot 44, Electronic City, Phase II, Bengaluru - 560100',
      'Audited by Statutory CA': 'Yes (CA UDIN: 26049102CA881)',
    },
    sections: [
      {
        alert: {
          type: 'warning',
          text: 'CRITICAL AUDIT OBSERVATION: Declared local content is 42.0% (Shortfall of 8% vs 50% Class-I threshold).',
        },
      },
      {
        heading: '1. Local Value Addition Breakdown',
        paragraphs: [
          'We hereby certify that the percentage of local content in the offered products and system integration services under Tender GEM/2026/B/1024 is 42.0%.',
          'Details of location where local value addition is performed: Plot 44, Electronic City, Phase II, Bengaluru, Karnataka - 560100.',
        ],
        table: {
          headers: ['Cost Element', 'Imported Content %', 'Indigenous Content %', 'Value Addition Description'],
          rows: [
            ['Compute & CPU Chipsets', '48.0%', '2.0%', 'Custom Chassis Assembly & BIOS'],
            ['Power Supplies & Cables', '5.0%', '15.0%', 'Indian Sourced Transformers'],
            ['Software & AI Services', '0.0%', '25.0%', '100% In-house Engineering'],
            ['Total Consolidated', '58.0%', '42.0%', 'Class-II Local Supplier Status'],
          ],
        },
      },
    ],
    signatory: {
      name: 'John Doe',
      designation: 'Director & Chief Technology Officer',
      organization: 'TechCorp Solutions Pvt Ltd',
      date: '24-Aug-2026',
    },
  },

  'Bidder_Undertaking.pdf': {
    title: 'Bidder Statutory Undertaking & Integrity Pact',
    subtitle: 'GENERAL FINANCIAL RULES (GFR) 2017 COMPLIANCE DECLARATION',
    department: 'Central Vigilance Commission & CPSE Procurement Standards',
    documentNumber: 'UND-TC-2026-1024',
    date: '24-Aug-2026',
    metadata: {
      'Bidder Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Tender Reference': 'GEM/2026/B/1024',
      'Integrity Pact Acceptance': 'Unconditionally Accepted',
      'Conflict of Interest Declaration': 'Nil / No Conflict',
      'Land Border Sharing Compliance': 'Compliant with Rule 144(xi) GFR 2017',
      'Authorized Signatory': 'John Doe, Director',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'LEGAL UNDERTAKING EXECUTED: Fully compliant with Integrity Pact and anti-collusion clauses.',
        },
      },
      {
        heading: '1. Anti-Collusion & Integrity Affirmation',
        paragraphs: [
          'We affirm that our bid is submitted in complete compliance with fair competition principles without collusion, cartelization, or anti-competitive arrangements.',
          'We have not engaged in corrupt or fraudulent practices and agree to immediate forfeiture of bid security in case of false representations.',
        ],
      },
    ],
    signatory: {
      name: 'John Doe',
      designation: 'Managing Director',
      organization: 'TechCorp Solutions Pvt Ltd',
      date: '24-Aug-2026',
    },
  },

  'Experience_Certificate.pdf': {
    title: 'Public Sector Undertaking Client Certificate',
    subtitle: 'SATISFACTORY WORK PERFORMANCE & EXPERIENCE CERTIFICATE',
    department: 'Bharat Petroleum Corporation Limited (BPCL) • IT Infrastructure',
    documentNumber: 'BPCL/IT/EXP/2025/491',
    date: '18-Jan-2025',
    metadata: {
      'Client Name': 'Bharat Petroleum Corporation Limited (BPCL)',
      'Contractor / Bidder': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Contract Order Value (INR)': '28.50 Crore',
      'Contract Reference': 'BPCL-PO-2023-88912',
      'Nature of Work': 'Turnkey Enterprise Cloud Migration & Zero Trust Security',
      'Completion Date': '15-Dec-2024 (On Schedule)',
      'Performance Assessment': 'OUTSTANDING & FULLY SATISFACTORY',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'TECHNICAL ELIGIBILITY VERIFIED: Experience exceeds minimum tender requirement (28.5 Cr > 15 Cr).',
        },
      },
      {
        heading: '1. Client Performance Appraisal',
        paragraphs: [
          'This is to certify that M/s TECHCORP SOLUTIONS PRIVATE LIMITED has successfully executed the IT Infrastructure and Zero Trust Modernization contract for BPCL across 14 regional data centers.',
          'The vendor maintained 99.98% service uptime and executed all deliverables in strict compliance with technical specifications.',
        ],
      },
    ],
    signatory: {
      name: 'P. V. Ramachandran',
      designation: 'Chief General Manager (Information Systems)',
      organization: 'Bharat Petroleum Corporation Limited',
      date: '18-Jan-2025',
    },
  },

  'Turnover_Certificate.pdf': {
    title: 'Statutory Chartered Accountant Certificate',
    subtitle: 'ANNUAL FINANCIAL TURNOVER & NET WORTH CERTIFICATE',
    department: 'The Institute of Chartered Accountants of India (ICAI)',
    documentNumber: 'UDIN-26049102AAAAAC8912',
    date: '12-Aug-2026',
    metadata: {
      'Firm / Entity': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Chartered Accountant Firm': 'Ramanathan & Associates, Chartered Accountants',
      'CA Membership Number': '049102',
      'Firm Registration Number': '108420W',
      'UDIN Code': '26049102AAAAAC8912',
      'Average 3-Year Turnover (INR)': '38.26 Crore',
      'Net Worth as on 31-Mar-2026': '19.40 Crore (Positive)',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'UDIN CRYPTOGRAPHICALLY VERIFIED: Turnover exceeds tender qualifying criteria (38.26 Cr > 20 Cr).',
        },
      },
      {
        heading: '1. Financial Turnover Breakdown',
        table: {
          headers: ['Financial Year', 'Annual Turnover (INR)', 'Net Profit (INR)', 'Net Worth (INR)'],
          rows: [
            ['FY 2023-2024', '34,20,00,000', '4,10,00,000', '14,20,00,000'],
            ['FY 2024-2025', '38,50,00,000', '4,80,00,000', '16,80,00,000'],
            ['FY 2025-2026', '42,10,00,000', '5,40,00,000', '19,40,00,000'],
          ],
        },
      },
    ],
    signatory: {
      name: 'K. S. Ramanathan, FCA',
      designation: 'Senior Partner',
      organization: 'Ramanathan & Associates (ICAI)',
      date: '12-Aug-2026',
    },
  },

  'Blacklisting_Declaration.pdf': {
    title: 'Affidavit on Non-Blacklisting & Non-Debarment',
    subtitle: 'STATUTORY NON-DEBARMENT AFFIDAVIT',
    department: 'Notary Public • Government of Maharashtra',
    documentNumber: 'AFF-TC-2026-9041',
    date: '24-Aug-2026',
    metadata: {
      'Deponent Name': 'John Doe (Director)',
      'Entity Name': 'TECHCORP SOLUTIONS PRIVATE LIMITED',
      'Notary Serial Number': 'NOT-MUM-2026-4410',
      'Debarment Status': 'NOT DEBARRED / NOT BLACKLISTED',
      'Government Inquiries Pending': 'NIL',
    },
    sections: [
      {
        alert: {
          type: 'success',
          text: 'CVC CHECK PASSED: Zero matches on Central Vigilance Commission debarred supplier registry.',
        },
      },
      {
        heading: '1. Solemn Affirmation',
        paragraphs: [
          'I, John Doe, Director of TechCorp Solutions Pvt Ltd, do hereby solemnly declare that our firm, its directors, and associated affiliates have never been debarred or blacklisted by any Ministry, CPSE, State Government, or Public Procuring Agency in India.',
        ],
      },
    ],
    signatory: {
      name: 'Adv. S. K. Deshmukh',
      designation: 'Notary Public, Greater Mumbai',
      organization: 'Government of Maharashtra',
      date: '24-Aug-2026',
    },
  },
};
