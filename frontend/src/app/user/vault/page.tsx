'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/context/UserStoreContext';
import { DocStatusBadge } from '@/components/common/Badge';
import {
  UploadCloud,
  Search,
  FileText,
  ShieldCheck,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { DocumentItem } from '@/types/user';

export default function DocumentVaultPage() {
  const {
    documents,
    openUploadModal,
    openDocumentViewer,
    deleteDocument,
    addToast,
  } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Statutory / Tax',
    'Statutory / MSME',
    'Financial / Audit',
    'Technical / OEM',
    'Compliance / MII',
    'Security / ISO',
    'Technical / Experience',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const reviewCount = documents.filter((d) => d.status === 'REVIEW_REQUIRED').length;
  const expiredCount = documents.filter((d) => d.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      {/* Header & Upload CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 leading-tight">
            Pre-Verified Document Vault
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Centralized repository of AI-verified statutory credentials, CA certificates, and OEM declarations.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="px-5 py-2.5 bg-primary hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 active:scale-95 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Artifacts</span>
          <span className="font-display font-black text-2xl text-slate-900 mt-1">
            0{documents.length} Docs
          </span>
          <span className="text-[10px] text-slate-400 mt-1">Encrypted Vault Blob</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Verified & Active</span>
          <span className="font-display font-black text-2xl text-emerald-600 mt-1">
            0{verifiedCount} Docs
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Direct Gateway Verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-700">Review Required</span>
          <span className="font-display font-black text-2xl text-amber-600 mt-1">
            0{reviewCount} Docs
          </span>
          <span className="text-[10px] text-amber-700 font-semibold mt-1">Threshold / Expiring soon</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-700">Expired Validity</span>
          <span className="font-display font-black text-2xl text-rose-600 mt-1">
            0{expiredCount} Doc
          </span>
          <span className="text-[10px] text-rose-700 font-semibold mt-1">⚠️ OEM Auth FY25</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name, extracted ID, category..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Files' : cat.split('/')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="p-4">Document Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Extracted ID / Key Fields</th>
                <th className="p-4">Status & Source</th>
                <th className="p-4">Validity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      doc.status === 'EXPIRED'
                        ? 'bg-rose-50/30'
                        : doc.status === 'REVIEW_REQUIRED'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    {/* Document Details */}
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            doc.status === 'EXPIRED'
                              ? 'bg-rose-100 text-rose-700'
                              : doc.status === 'REVIEW_REQUIRED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-primary'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => openDocumentViewer(doc)}>
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Uploaded: {doc.uploadedAt}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700 border border-slate-200/60">
                        {doc.category}
                      </span>
                    </td>

                    {/* Extracted ID / Key Fields */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-primary bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{doc.docNumber}</span>
                        </div>
                        {doc.extractedFields && doc.extractedFields[0] && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            {doc.extractedFields[0].label}: {doc.extractedFields[0].value}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status & Source */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <DocStatusBadge status={doc.status} />
                        <div className="text-[10px] text-slate-500 font-medium">
                          {doc.source} ({doc.confidence}%)
                        </div>
                      </div>
                    </td>

                    {/* Validity */}
                    <td className="p-4 font-semibold font-mono text-[11px]">
                      <span
                        className={
                          doc.status === 'EXPIRED'
                            ? 'text-rose-700 font-bold'
                            : doc.status === 'REVIEW_REQUIRED'
                            ? 'text-amber-800 font-bold'
                            : 'text-slate-700'
                        }
                      >
                        {doc.expiryDate}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDocumentViewer(doc)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-200/80 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                          title="Inspect Document & OCR Fields"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                          title="Delete from Vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No documents matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
