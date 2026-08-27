'use client';
import React, { useState } from 'react';
import { Sparkles, UploadCloud, FileText, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';

export const LiveTestingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bid_id', 'LIVE_TEST_' + Date.now().toString().slice(-4));

      const res = await fetch('/api/verification/run', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ error: "Failed to reach AI pipeline." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9900] bg-blue-950 text-white p-3 rounded-full shadow-2xl hover:bg-blue-900 transition-transform hover:scale-105 group border-2 border-amber-500/30 flex items-center gap-2"
        title="Live AI PDF Extraction Mode"
      >
        <Sparkles className="w-5 h-5 text-amber-400 group-hover:animate-pulse" />
        <span className="text-xs font-bold font-mono tracking-wider pr-1 hidden group-hover:inline-block">LIVE AI MODE</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-blue-950 p-4 text-white flex justify-between items-center border-b border-amber-600/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-amber-600 p-1.5 rounded">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Live AI Extraction Mode (Unplugged)</h3>
                  <p className="text-[10px] text-blue-200">Upload a real PDF to test the Llama 3.1 Pipeline</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              {!result && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:border-amber-500 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">
                      {file ? file.name : 'Click or drag a real PDF here'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Upload MII Declaration or GST Cert</p>
                  </div>
                  
                  <button 
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg shadow-sm transition flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing via Llama 3.1...
                      </>
                    ) : 'Push to AI Engine'}
                  </button>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800">Live AI Output</h4>
                    <button onClick={() => setResult(null)} className="text-xs font-semibold text-blue-600 hover:underline">Test Another</button>
                  </div>

                  {result.ai_extraction?.document_type && (
                     <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
                       <div>
                         <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">AI Auto-Classification</div>
                         <div className="font-bold text-blue-900 mt-0.5">{result.ai_extraction.document_type} Document Detected</div>
                       </div>
                       <div className="text-right">
                         <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Renamed & Stored As</div>
                         <div className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded mt-0.5 border border-blue-200">
                           {result.ai_extraction.document_type}_Verified_{Date.now().toString().slice(-4)}.pdf
                         </div>
                       </div>
                     </div>
                  )}
                  
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner border border-slate-700">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                  
                  {result.score !== undefined && (
                     <div className="bg-white border border-slate-200 rounded p-4 flex justify-between items-center shadow-sm">
                       <div>
                         <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic Engine Score</div>
                         <div className="text-2xl font-black text-slate-900 mt-1">{result.score} / 100</div>
                       </div>
                       <div className={`px-3 py-1 rounded font-bold text-sm ${result.risk_level === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                         {result.risk_level} RISK
                       </div>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
