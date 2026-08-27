'use client';
import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Sparkles,
  SlidersHorizontal,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Activity,
  FileCode2,
  X,
  Send,
  MessageSquare,
  Bot
} from 'lucide-react';
import { mockAIServices } from '@/lib/adminData';
import { AIServiceMetric } from '@/types';

export const AIView: React.FC = () => {
  const [aiServices, setAiServices] = useState<AIServiceMetric[]>(mockAIServices);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Test modal state
  const [testModalService, setTestModalService] = useState<AIServiceMetric | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testTesting, setTestTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  // Config modal state
  const [configModalService, setConfigModalService] = useState<AIServiceMetric | null>(null);
  const [configModel, setConfigModel] = useState('');
  const [configTemp, setConfigTemp] = useState(0.1);
  const [configMaxTokens, setConfigMaxTokens] = useState(4096);
  const [configPrompt, setConfigPrompt] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleEnable = (id: string) => {
    setAiServices(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        showToast(`${s.serviceName} is now ${next}`);
        return { ...s, status: next };
      }
      return s;
    }));
  };

  const handleOpenTestModal = (service: AIServiceMetric) => {
    setTestModalService(service);
    setTestResponse(null);
    setTestTesting(false);
    if (service.serviceName === 'Tender Parser') {
      setTestPrompt("Extract turnover criteria, earnest money deposit (EMD), and local manufacturing percentage from tender clause #14.2.");
    } else if (service.serviceName === 'Contradiction Detector') {
      setTestPrompt("Evaluate Bidder declaration: 'We declare 42% local content' vs Mandate: 'Minimum 50% Class-I Local content required'.");
    } else {
      setTestPrompt("Test input payload: Audit statutory compliance for PAN AAACA1234F and GSTIN 33AAACA1234F1ZV.");
    }
  };

  const handleRunAITest = () => {
    if (!testModalService) return;
    setTestTesting(true);
    setTestResponse(null);

    setTimeout(() => {
      setTestTesting(false);
      if (testModalService.serviceName === 'Tender Parser') {
        setTestResponse(JSON.stringify({
          clauseId: "14.2",
          turnoverMinimum: "₹ 10.00 Cr (3-Year CA Audited)",
          emdExemption: "Applicable for valid Udyam MSEs",
          localContentClass: "Class-I Local Supplier (>= 50%)",
          confidenceScore: 0.994,
          model: testModalService.modelVersion
        }, null, 2));
      } else if (testModalService.serviceName === 'Contradiction Detector') {
        setTestResponse(JSON.stringify({
          contradictionDetected: true,
          severity: "HIGH",
          deltaPercentage: "-8.0%",
          explanation: "Bidder declared 42.0% local manufacturing addition which fails the mandatory 50.0% Class-I threshold.",
          suggestedAction: "CLARIFICATION_REQUIRED",
          model: testModalService.modelVersion
        }, null, 2));
      } else {
        setTestResponse(JSON.stringify({
          status: "INFERENCE_SUCCESS",
          service: testModalService.serviceName,
          latencyMs: testModalService.latencyMs,
          extractedEntities: ["ABC TECHNOLOGIES", "PAN_VALID", "GSTIN_ACTIVE"],
          confidenceScore: 0.988
        }, null, 2));
      }
      showToast(`AI inference test completed for ${testModalService.serviceName}`);
    }, 700);
  };

  const handleOpenConfigModal = (service: AIServiceMetric) => {
    setConfigModalService(service);
    setConfigModel(service.modelVersion);
    setConfigTemp(service.temperature);
    setConfigMaxTokens(service.maxTokens);
    setConfigPrompt(service.systemPromptSummary);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalService) return;
    setAiServices(prev => prev.map(s => s.id === configModalService.id ? {
      ...s,
      modelVersion: configModel,
      temperature: Number(configTemp),
      maxTokens: Number(configMaxTokens),
      systemPromptSummary: configPrompt
    } : s));
    setConfigModalService(null);
    showToast(`AI model configurations updated for ${configModalService.serviceName}`);
  };

  const filteredServices = aiServices.filter(s =>
    s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.modelVersion.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-2xl font-black text-slate-900">AI Services & Model Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
              8 Dedicated Microservices
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Module 4 AI integrations: Tender Parser, OCR, Document Classifier, Entity Resolver, Contradiction Detector & Copilot
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-800">
            Total Tokens (24h): 92.4M
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI service, model, clause engine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* AI Services Grid (8 Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              
              {/* Service Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{svc.serviceName}</h3>
                    <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.2 rounded border border-sky-200 font-bold">
                      {svc.modelVersion}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  svc.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  ● {svc.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {svc.description}
              </p>

              {/* System Prompt Summary */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic">
                &ldquo;{svc.systemPromptSummary}&rdquo;
              </div>

              {/* Metrics: Requests, Success Rate, Failure Rate, Latency */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">Requests (24h)</div>
                  <div className="font-extrabold text-slate-900">{svc.requests24h.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">Success Rate</div>
                  <div className="font-extrabold text-emerald-600">{svc.successRate}%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">Failure Rate</div>
                  <div className="font-extrabold text-rose-600">{svc.failureRate}%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">Avg Latency</div>
                  <div className="font-mono font-bold text-slate-800">{svc.latencyMs}ms</div>
                </div>
              </div>

            </div>

            {/* Buttons: Configure, Test, Enable, Disable, View Logs */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
              
              <button
                onClick={() => handleOpenTestModal(svc)}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-bold flex items-center gap-1.5"
                title="Test AI Prompt / Payload"
              >
                <Play className="w-3.5 h-3.5 fill-sky-600" />
                <span>Test Bench</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenConfigModal(svc)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>

                <button
                  onClick={() => handleToggleEnable(svc.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                    svc.status === 'ONLINE' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {svc.status === 'ONLINE' ? 'Disable' : 'Enable'}
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* INTERACTIVE TEST BENCH MODAL */}
      {testModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">
                  {testModalService.modelVersion}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  AI Test Console: {testModalService.serviceName}
                </h2>
              </div>
              <button onClick={() => setTestModalService(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Sample Prompt / Input Clause:</label>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {testResponse && (
              <div className="space-y-2 text-xs animate-in fade-in">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Structured Inference Output:</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    Latency: {testModalService.latencyMs}ms • 0 Tokens Hallucinated
                  </span>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {testResponse}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Grounding Source: GeM Indian Procurement Guidelines</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTestModalService(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={handleRunAITest}
                  disabled={testTesting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testTesting ? 'Executing Inference...' : 'Run Test Inference'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIGURE AI SERVICE MODAL */}
      {configModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Configure {configModalService.serviceName}</h2>
              <button onClick={() => setConfigModalService(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Model Version</label>
                <select
                  value={configModel}
                  onChange={(e) => setConfigModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                >
                  <option value="Gemini 1.5 Pro (Tender-Specialized v3)">Gemini 1.5 Pro (Tender-Specialized v3)</option>
                  <option value="Gemini 1.5 Flash (Fast-Inference)">Gemini 1.5 Flash (Fast-Inference)</option>
                  <option value="Tesseract-Custom-OCR-v5.2 + Vision Pro">Tesseract-Custom-OCR-v5.2 + Vision Pro</option>
                  <option value="Classifier-BERT-Procure-v4">Classifier-BERT-Procure-v4</option>
                  <option value="Entity-Graph-Neural-v2">Entity-Graph-Neural-v2</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temperature ({configTemp})</label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={configTemp}
                    onChange={(e) => setConfigTemp(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Token Limit</label>
                  <input
                    type="number"
                    value={configMaxTokens}
                    onChange={(e) => setConfigMaxTokens(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System Prompt Directive</label>
                <textarea
                  rows={3}
                  value={configPrompt}
                  onChange={(e) => setConfigPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setConfigModalService(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Model Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
