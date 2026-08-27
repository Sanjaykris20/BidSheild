/**
 * PDF Export Utility for BidShield AI
 * Generates downloadable PDF reports for various sections
 */

export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
}

export interface ReportSection {
  title: string;
  content: Record<string, any>;
}

/**
 * Generate and download a PDF report
 * Uses browser's print functionality for consistent PDF generation
 */
export async function exportToPDF(
  sections: ReportSection[],
  options: PDFExportOptions
): Promise<void> {
  const { filename, title, subtitle, timestamp } = options;

  // Create a new window with the report content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Pop-up blocked. Please allow pop-ups for PDF export.');
  }

  // Generate HTML content for the report
  const htmlContent = generateReportHTML(sections, { title, subtitle, timestamp });

  // Write content to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // Trigger print dialog (which allows "Save as PDF")
  printWindow.print();

  // Close the window after a delay
  setTimeout(() => {
    printWindow.close();
  }, 1000);
}

/**
 * Generate HTML content for PDF export
 */
function generateReportHTML(
  sections: ReportSection[],
  metadata: { title: string; subtitle?: string; timestamp?: string }
): string {
  const { title, subtitle, timestamp } = metadata;
  const currentDate = timestamp || new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const sectionsHTML = sections.map(section => {
    const contentHTML = Object.entries(section.content)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `
            <div class="field">
              <div class="field-label">${formatLabel(key)}:</div>
              <div class="field-value">
                <ul class="list">
                  ${value.map(item => `<li>${formatValue(item)}</li>`).join('')}
                </ul>
              </div>
            </div>
          `;
        } else if (typeof value === 'object' && value !== null) {
          return `
            <div class="field">
              <div class="field-label">${formatLabel(key)}:</div>
              <div class="field-value nested">
                ${Object.entries(value)
                  .map(
                    ([k, v]) => `
                  <div class="nested-field">
                    <span class="nested-label">${formatLabel(k)}:</span>
                    <span class="nested-value">${formatValue(v)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `;
        } else {
          return `
            <div class="field">
              <div class="field-label">${formatLabel(key)}:</div>
              <div class="field-value">${formatValue(value)}</div>
            </div>
          `;
        }
      })
      .join('');

    return `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-content">
          ${contentHTML}
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #4338ca;
      padding-bottom: 20px;
    }

    .logo {
      font-size: 24px;
      font-weight: 900;
      color: #4338ca;
      margin-bottom: 10px;
    }

    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .timestamp {
      font-size: 12px;
      color: #999;
      font-style: italic;
    }

    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #4338ca;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-content {
      padding-left: 8px;
    }

    .field {
      margin-bottom: 12px;
      display: flex;
      gap: 12px;
    }

    .field-label {
      font-weight: 600;
      color: #4b5563;
      min-width: 200px;
      flex-shrink: 0;
    }

    .field-value {
      color: #1a1a1a;
      flex: 1;
    }

    .field-value.nested {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nested-field {
      display: flex;
      gap: 8px;
      padding-left: 16px;
    }

    .nested-label {
      font-weight: 500;
      color: #6b7280;
      min-width: 150px;
    }

    .nested-value {
      color: #374151;
    }

    .list {
      list-style-position: inside;
      padding-left: 0;
    }

    .list li {
      margin-bottom: 4px;
      color: #374151;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-success {
      background: #dcfce7;
      color: #166534;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #999;
    }

    @media print {
      body {
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️ BidShield AI</div>
    <div class="title">${title}</div>
    ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
    <div class="timestamp">Generated: ${currentDate}</div>
  </div>

  ${sectionsHTML}

  <div class="footer">
    <p>BidShield AI Enterprise Platform • Deterministic Verification • Evidence-Based Decisions</p>
    <p>This document is automatically generated and cryptographically auditable.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Format label for display
 */
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format value for display
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

/**
 * Apply badge styling based on status
 */
export function getStatusBadge(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('pass') || statusLower.includes('verified') || statusLower.includes('approve')) {
    return `<span class="badge badge-success">${status}</span>`;
  }

  if (statusLower.includes('review') || statusLower.includes('pending') || statusLower.includes('clarification')) {
    return `<span class="badge badge-warning">${status}</span>`;
  }

  if (statusLower.includes('fail') || statusLower.includes('reject') || statusLower.includes('critical')) {
    return `<span class="badge badge-danger">${status}</span>`;
  }

  return `<span class="badge badge-info">${status}</span>`;
}
