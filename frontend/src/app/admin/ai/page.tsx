'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { MockBadge } from '@/components/shared/MockBadge';

export default function AdminAIPage() {
  const { showToast } = useToast();

  const services = [
    { name: 'Document Classification Service', model: 'Ensemble Vision + BERT', latency: '210ms', accuracy: '99.2%', status: 'HEALTHY' },
    { name: 'Spatial OCR & Bounding Box Engine', model: 'PaddleOCR + LayoutLMv3', latency: '480ms', accuracy: '98.6%', status: 'HEALTHY' },
    { name: 'Statutory Entity Resolution', model: 'Jaro-Winkler + Semantic Sim', latency: '95ms', accuracy: '99.8%', status: 'HEALTHY' },
    { name: 'Contradiction & Discrepancy Detector', model: 'Deterministic Matrix', latency: '120ms', accuracy: '100%', status: 'HEALTHY' },
    { name: 'AI RFP Blueprint Parser', model: 'LLM Document Extractor', latency: '820ms', accuracy: '97.4%', status: 'HEALTHY' },
    { name: 'Procurement Copilot Q&A', model: 'RAG Grounded in Audit Evidence', latency: '540ms', accuracy: '98.1%', status: 'HEALTHY' },
    { name: 'Recommendation Synthesizer', model: 'Rule-Guided Copilot Logic', latency: '310ms', accuracy: '99.4%', status: 'HEALTHY' },
    { name: 'Audit Trace Explainer', model: 'Deterministic Explainability', latency: '65ms', accuracy: '100%', status: 'HEALTHY' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-neutral-muted uppercase tracking-wider">
              AI Microservices Cluster
            </span>
            <MockBadge label="MOCK ENGINE ACTIVE" size="sm" variant="blue" />
          </div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            AI Services Core
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Document intelligence, spatial OCR extraction, entity resolution, and Procurement Copilot models.
          </p>
        </div>
        <button
          onClick={() => showToast('Flushing AI embedding cache and re-indexing...', 'info')}
          className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-container shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">cached</span>
          Flush Cache & Re-index
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(s => (
          <div key={s.name} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-primary text-sm leading-tight">{s.name}</span>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0 mt-1"></span>
            </div>
            <p className="text-[11px] text-neutral-muted font-mono">{s.model}</p>
            <div className="pt-2 border-t border-outline-variant/60 flex justify-between text-[11px] font-mono">
              <span className="text-neutral-muted">Latency: <strong className="text-primary">{s.latency}</strong></span>
              <span className="text-success font-bold">{s.accuracy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
