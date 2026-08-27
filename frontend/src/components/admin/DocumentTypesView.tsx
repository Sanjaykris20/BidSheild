'use client';
import React, { useState } from 'react';
import {
  FileCode2,
  Search,
  Plus,
  Edit,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  FileCheck2,
  Sliders,
  Layers,
  X
} from 'lucide-react';
import { mockDocumentTypes } from '@/lib/adminData';
import { DocumentTypeConfig, DocumentFieldConfig } from '@/types';

export const DocumentTypesView: React.FC = () => {
  const [docTypes, setDocTypes] = useState<DocumentTypeConfig[]>(mockDocumentTypes);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeConfig | null>(null);

  // Configure Fields modal state
  const [fieldConfigDoc, setFieldConfigDoc] = useState<DocumentTypeConfig | null>(null);
  const [fieldsList, setFieldsList] = useState<DocumentFieldConfig[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<DocumentFieldConfig['dataType']>('STRING');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldRegex, setNewFieldRegex] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setDocTypes(prev => prev.map(d => {
      if (d.id === id) {
        const next = d.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        showToast(`${d.name} status updated to ${next}`);
        return { ...d, status: next };
      }
      return d;
    }));
  };

  const handleOpenFieldConfig = (doc: DocumentTypeConfig) => {
    setFieldConfigDoc(doc);
    setFieldsList([...doc.mandatoryFields]);
    setNewFieldName('');
    setNewFieldKey('');
    setNewFieldRegex('');
  };

  const handleAddField = () => {
    if (!newFieldName || !newFieldKey) return;
    const createdField: DocumentFieldConfig = {
      id: `f_${Date.now().toString().slice(-4)}`,
      name: newFieldName,
      key: newFieldKey,
      dataType: newFieldType,
      isRequired: newFieldRequired,
      validationRegex: newFieldRegex || undefined
    };
    setFieldsList(prev => [...prev, createdField]);
    setNewFieldName('');
    setNewFieldKey('');
    setNewFieldRegex('');
    showToast(`Added field definition: ${createdField.name}`);
  };

  const handleRemoveField = (fieldId: string) => {
    setFieldsList(prev => prev.filter(f => f.id !== fieldId));
    showToast(`Field removed from schema.`);
  };

  const handleSaveFieldConfig = () => {
    if (!fieldConfigDoc) return;
    setDocTypes(prev => prev.map(d => d.id === fieldConfigDoc.id ? {
      ...d,
      mandatoryFields: fieldsList,
      updatedAt: 'Just now'
    } : d));
    setFieldConfigDoc(null);
    showToast(`Saved field schema with ${fieldsList.length} fields for ${fieldConfigDoc.code}`);
  };

  const filteredDocTypes = docTypes.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Document Type Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
              12 Recognized Schemas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure OCR field extraction schemas, mandatory regex patterns, UDIN checks & confidence thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Opening new Document Type registration wizard...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Document Type</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document type, code, regex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Statutory">Statutory</option>
            <option value="Financial">Financial</option>
            <option value="Technical">Technical</option>
            <option value="Legal">Legal</option>
          </select>
        </div>
      </div>

      {/* Document Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocTypes.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    CODE: {doc.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{doc.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  doc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  ● {doc.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {doc.description}
              </p>

              {/* Extraction Schema Fields Preview */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mandatory Extraction Fields ({doc.mandatoryFields.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {doc.mandatoryFields.map((f) => (
                    <span key={f.id} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200">
                      {f.name} {f.isRequired && <span className="text-rose-500 font-bold">*</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Threshold & Verification */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">OCR Confidence</div>
                  <div className="font-bold text-slate-800 font-mono">{doc.ocrConfidenceThreshold}% min</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">CA / UDIN Gate</div>
                  <div className={`font-bold ${doc.requiresCAVerification ? 'text-amber-700' : 'text-slate-600'}`}>
                    {doc.requiresCAVerification ? 'Mandatory' : 'Optional'}
                  </div>
                </div>
              </div>

            </div>

            {/* Buttons: Create, Edit, Disable, Configure Fields */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
              
              <button
                onClick={() => handleOpenFieldConfig(doc)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold flex items-center gap-1.5"
                title="Configure Field Extraction Schema"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Configure Fields</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => showToast(`Edit modal opened for ${doc.name}`)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Edit Parameters"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleStatus(doc.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                    doc.status === 'ACTIVE' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {doc.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* CONFIGURE FIELDS SCHEMA MODAL */}
      {fieldConfigDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    {fieldConfigDoc.code} SCHEMA BUILDER
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    Configure Fields: {fieldConfigDoc.name}
                  </h2>
                </div>
                <button onClick={() => setFieldConfigDoc(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Fields List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Active Field Schemas:</div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {fieldsList.map((f) => (
                    <div key={f.id} className="p-3 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{f.name}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                            {f.key}
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                            {f.dataType}
                          </span>
                          {f.isRequired && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {f.validationRegex && (
                          <div className="font-mono text-[10px] text-slate-500 mt-1 truncate">
                            Regex: {f.validationRegex}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-xs p-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Field Sub-Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900">Add Field to Schema:</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Field Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. Registered Address"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">JSON Key *</label>
                    <input
                      type="text"
                      placeholder="e.g. regAddress"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Data Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value="STRING">STRING</option>
                      <option value="NUMBER">NUMBER</option>
                      <option value="DATE">DATE</option>
                      <option value="REGEX">REGEX</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Validation Regex (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ^[0-9]{8}[A-Z]{4}$"
                      value={newFieldRegex}
                      onChange={(e) => setNewFieldRegex(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                >
                  + Add Field Definition
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setFieldConfigDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFieldConfig}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Save Schema Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
