'use client';
import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Sliders,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { defaultRiskWeights, defaultRiskBands } from '@/lib/adminData';
import { RiskWeightConfig, RiskLevel } from '@/types';

export const RiskView: React.FC = () => {
  const [weights, setWeights] = useState<RiskWeightConfig>(defaultRiskWeights);
  const [bands, setBands] = useState(defaultRiskBands);
  
  // Interactive Simulator inputs
  const [simGst, setSimGst] = useState(true);
  const [simPan, setSimPan] = useState(true);
  const [simUdyam, setSimUdyam] = useState(true);
  const [simTaxScore, setSimTaxScore] = useState(100); // 0 - 100
  const [simLocalContent, setSimLocalContent] = useState(42); // target 50%
  const [simOemValid, setSimOemValid] = useState(60); // 0 - 100 (expired = 60)
  const [simDocsScore, setSimDocsScore] = useState(90);
  const [simDebarmentClear, setSimDebarmentClear] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalWeight = 
    weights.gst + 
    weights.pan + 
    weights.udyam + 
    weights.tax + 
    weights.localContent + 
    weights.oem + 
    weights.documents + 
    weights.debarment;

  const isWeightValid = totalWeight === 100;

  const handleWeightChange = (key: keyof RiskWeightConfig, val: number) => {
    setWeights(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleResetWeights = () => {
    setWeights(defaultRiskWeights);
    showToast('Reset risk weights to default platform standards (100% sum).');
  };

  const handleSaveWeights = () => {
    if (!isWeightValid) {
      showToast('Error: Total weights must equal exactly 100%.');
      return;
    }
    showToast('Risk weight matrix deployed to Module 5 Compliance Engine.');
  };

  // Calculate live simulated score
  const calculateSimulatedScore = (): { score: number; level: RiskLevel; gatingFailed: boolean } => {
    if (!simDebarmentClear || !simGst) {
      return { score: 25, level: 'CRITICAL', gatingFailed: true };
    }

    let score = 0;
    if (simGst) score += weights.gst;
    if (simPan) score += weights.pan;
    if (simUdyam) score += weights.udyam;
    score += (simTaxScore / 100) * weights.tax;
    
    // Local Content: full points if >= 50, proportional if < 50
    const miiRatio = Math.min(1, simLocalContent / 50);
    score += miiRatio * weights.localContent;

    // OEM
    score += (simOemValid / 100) * weights.oem;

    // Documents
    score += (simDocsScore / 100) * weights.documents;

    // Debarment
    if (simDebarmentClear) score += weights.debarment;

    const finalScore = Math.round(score);
    let level: RiskLevel = 'LOW';
    if (finalScore < 50) level = 'CRITICAL';
    else if (finalScore < 70) level = 'HIGH';
    else if (finalScore < 90) level = 'MEDIUM';
    else level = 'LOW';

    return { score: finalScore, level, gatingFailed: false };
  };

  const simResult = calculateSimulatedScore();

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
            <h1 className="text-2xl font-black text-slate-900">Risk Matrix & Weight Configuration</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isWeightValid ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              Total Weight: {totalWeight}% {isWeightValid ? '✓ Valid' : '⚠️ Must Equal 100%'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure risk thresholds, statutory weight distribution & run interactive multi-parameter simulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetWeights}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSaveWeights}
            disabled={!isWeightValid}
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all ${
              isWeightValid ? 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Deploy Risk Weights
          </button>
        </div>
      </div>

      {/* RISK LEVEL BANDS (90-100 Low, 70-89 Med, 50-69 High, 0-49 Critical) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            Statutory Risk Evaluation Bands
          </h2>
          <span className="text-xs text-slate-400">Score Range: 0 to 100</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bands.map((b) => (
            <div key={b.level} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${b.badgeColor}`}>
                  {b.level} RISK
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">{b.minScore} – {b.maxScore}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                {b.actionRequired}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* EDITABLE WEIGHTS & INTERACTIVE SIMULATOR (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Editable Sliders */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              Weight Allocation Matrix
            </h2>
            <p className="text-xs text-slate-500">Adjust the percentage weight of each statutory and technical factor.</p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* GST: 10% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">GST Active & Regular Filings</span>
                <span className="font-mono font-bold text-blue-700">{weights.gst}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.gst}
                onChange={(e) => handleWeightChange('gst', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* PAN: 10% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">PAN & Director KYC Validation</span>
                <span className="font-mono font-bold text-blue-700">{weights.pan}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.pan}
                onChange={(e) => handleWeightChange('pan', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Udyam: 10% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Udyam MSME Classification</span>
                <span className="font-mono font-bold text-blue-700">{weights.udyam}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.udyam}
                onChange={(e) => handleWeightChange('udyam', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Tax: 15% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">ITR & Audited 3-Year Turnover</span>
                <span className="font-mono font-bold text-blue-700">{weights.tax}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.tax}
                onChange={(e) => handleWeightChange('tax', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Local Content: 15% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Make-in-India (Local Content %)</span>
                <span className="font-mono font-bold text-blue-700">{weights.localContent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.localContent}
                onChange={(e) => handleWeightChange('localContent', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* OEM: 15% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">OEM Authorization & Warranty Letter</span>
                <span className="font-mono font-bold text-blue-700">{weights.oem}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.oem}
                onChange={(e) => handleWeightChange('oem', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Documents: 10% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Document Vault Integrity & UDIN</span>
                <span className="font-mono font-bold text-blue-700">{weights.documents}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.documents}
                onChange={(e) => handleWeightChange('documents', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Debarment: 15% */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Central Debarment & Vigilance Status</span>
                <span className="font-mono font-bold text-blue-700">{weights.debarment}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.debarment}
                onChange={(e) => handleWeightChange('debarment', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

          </div>
        </div>

        {/* Right Column: Live Interactive Bidder Scoring Simulator */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold tracking-tight">Live Bidder Scoring Simulator</h2>
              </div>
              <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                REAL-TIME SIMULATION
              </span>
            </div>

            {/* Score Output Banner */}
            <div className="mt-5 p-5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Simulated Compliance Score</span>
                <div className="text-4xl font-black text-white mt-1 flex items-baseline gap-1">
                  {simResult.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  simResult.level === 'LOW' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  simResult.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  simResult.level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  ● {simResult.level} RISK
                </span>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  {simResult.gatingFailed ? '❌ Gating Hard Failure' : 'Evaluated with active weights'}
                </div>
              </div>
            </div>

            {/* Interactive Parameters */}
            <div className="mt-5 space-y-3 text-xs text-slate-300">
              
              <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60">
                <span>Debarment Registry Status</span>
                <button
                  onClick={() => setSimDebarmentClear(!simDebarmentClear)}
                  className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                    simDebarmentClear ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {simDebarmentClear ? 'CLEAR (Passed)' : 'BLACKLISTED (Failed)'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60">
                <span>GSTN API Status</span>
                <button
                  onClick={() => setSimGst(!simGst)}
                  className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                    simGst ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {simGst ? 'ACTIVE' : 'DEFAULT / INACTIVE'}
                </button>
              </div>

              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between">
                  <span>Local Content (Make-in-India): <strong>{simLocalContent}%</strong></span>
                  <span className="text-[10px] text-slate-400">Target ≥ 50%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={simLocalContent}
                  onChange={(e) => setSimLocalContent(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between">
                  <span>OEM Authorization Validity: <strong>{simOemValid}%</strong></span>
                  <span className="text-[10px] text-slate-400">{simOemValid >= 80 ? 'Valid FY26-27' : 'Partial / Expired Scope'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simOemValid}
                  onChange={(e) => setSimOemValid(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

            </div>
          </div>

          <div className="p-3 bg-blue-950/60 border border-blue-800/60 rounded-xl text-[11px] text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <span>
              This simulation reflects the actual mathematical model that Module 5 Compliance Engine executes for all incoming bids.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
