'use client';

import React from 'react';

export default function AdminDocumentTypesPage() {
  const docTypes = [
    { code: 'GST_CERT', name: 'GST Registration Certificate', category: 'Statutory / Tax', extractor: 'GST Spatial Extractor', verifiedVia: 'GSTN Gateway API' },
    { code: 'PAN_CARD', name: 'Permanent Account Number Card', category: 'Statutory / Identity', extractor: 'PAN OCR Model', verifiedVia: 'NSDL Gateway' },
    { code: 'UDYAM_MSME', name: 'Udyam Registration Certificate', category: 'Statutory / MSME', extractor: 'MSME OCR Parser', verifiedVia: 'Udyam Sandbox' },
    { code: 'MII_DECLARATION', name: 'Make in India Local Content Declaration', category: 'Compliance / MII', extractor: 'Local Content OCR Engine', verifiedVia: 'Deterministic Rule Matcher' },
    { code: 'OEM_MAF', name: 'OEM Authorization Form', category: 'Technical / Auth', extractor: 'MAF Code Verifier', verifiedVia: 'OEM Registry' },
    { code: 'AUDITED_ITR', name: 'Audited Financial Statements (3-Yr)', category: 'Financial / Tax', extractor: 'CA UDIN Financial Extractor', verifiedVia: 'Income Tax Gateway' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Document Types & AI Extractors
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Registered compliance artifact schemas, OCR extraction parsers, and verification bindings.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
              <th className="p-4">Schema Code & Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">AI OCR Extractor</th>
              <th className="p-4">Verification Binding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {docTypes.map(d => (
              <tr key={d.code} className="hover:bg-surface-alt/40">
                <td className="p-4">
                  <p className="font-bold text-primary text-sm">{d.name}</p>
                  <p className="font-mono text-neutral-muted text-[10px]">Code: {d.code}</p>
                </td>
                <td className="p-4 font-semibold text-on-surface-variant">{d.category}</td>
                <td className="p-4 font-mono text-primary font-bold">{d.extractor}</td>
                <td className="p-4 font-mono text-info font-bold">{d.verifiedVia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
