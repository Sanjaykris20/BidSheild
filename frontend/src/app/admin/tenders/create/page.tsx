'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, DollarSign, UploadCloud, 
  BrainCircuit, LayoutTemplate, Eye, CheckCircle2,
  ArrowRight, ArrowLeft, Plus, Trash2, ShieldCheck, Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const STEPS = [
  { id: 'basic', title: 'Basic Details', icon: FileText },
  { id: 'timeline', title: 'Timeline', icon: Calendar },
  { id: 'financial', title: 'Financial', icon: DollarSign },
  { id: 'documents', title: 'Documents', icon: UploadCloud },
  { id: 'ai', title: 'AI Analysis', icon: BrainCircuit },
  { id: 'blueprint', title: 'Blueprint', icon: LayoutTemplate },
  { id: 'preview', title: 'Preview & Publish', icon: Eye }
];

export default function CreateTenderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Fake state for the form
  const [formData, setFormData] = useState({
    title: 'Supply of Heavy Engineering Equipment',
    reference: 'GEM/2026/B/882190',
    category: 'Goods',
    department: 'Ministry of Defense',
    estimatedValue: '5,000,000',
    documentsUploaded: false,
    rules: [
      { id: 1, text: 'Make-In-India (MII) Local Content ≥ 50%', category: 'Statutory' },
      { id: 2, text: 'Active GSTIN', category: 'Statutory' },
      { id: 3, text: 'Minimum Average Annual Turnover: ₹2 Cr', category: 'Financial' }
    ]
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      if (currentStep === 3) {
        // Going to AI step
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
        }, 3000);
      }
      setCurrentStep(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  return (
    // @ts-ignore
    <AdminLayout currentSection="tenders">
      <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Create Tender</h1>
          <p className="text-slate-500 mt-2">Publish a new procurement tender with AI-assisted compliance rule extraction.</p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm mb-8 flex justify-between relative">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
          <div className="absolute top-1/2 left-8 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}></div>
          
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isPassed = index < currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 border-2 ${
                  isActive ? 'bg-primary border-primary text-white shadow-md' : 
                  isPassed ? 'bg-primary border-primary text-white' : 
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive || isPassed ? 'text-primary' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-glass overflow-hidden min-h-[400px] flex flex-col">
          
          {/* Step 1: Basic */}
          {currentStep === 0 && (
            <div className="p-8 animate-in fade-in">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Tender Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tender Title</label>
                  <input type="text" value={formData.title} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference Number</label>
                  <input type="text" value={formData.reference} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option>Goods</option>
                    <option>Services</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 3 && (
            <div className="p-8 animate-in fade-in flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Tender Documents</h2>
              <p className="text-slate-500 mb-6 text-center max-w-md">Upload the official PDF tender document. Our AI will automatically parse it to extract compliance rules and eligibility criteria.</p>
              <button 
                onClick={() => setFormData({...formData, documentsUploaded: true})}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${formData.documentsUploaded ? 'bg-emerald-500 text-white shadow-md' : 'bg-primary text-white hover:bg-slate-800'}`}
              >
                {formData.documentsUploaded ? 'Tender_Specs_2026.pdf Uploaded!' : 'Select PDF File'}
              </button>
            </div>
          )}

          {/* Step 5: AI Analysis */}
          {currentStep === 4 && (
            <div className="p-8 animate-in fade-in flex flex-col items-center justify-center min-h-[300px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <BrainCircuit className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Analyzing Tender Document...</h2>
                  <p className="text-slate-500">Groq LPU is extracting rules via Llama 3.1 at 800+ tokens/sec</p>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete!</h2>
                  <p className="text-slate-500 mb-6">Successfully extracted 24 requirements from the tender document.</p>
                  <div className="flex gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700">8 Statutory</div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700">4 Financial</div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700">12 Technical</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Blueprint */}
          {currentStep === 5 && (
            <div className="p-8 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Compliance Blueprint</h2>
                <button className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20">
                  <Plus className="w-4 h-4" /> Add Rule
                </button>
              </div>
              <div className="space-y-3">
                {formData.rules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{rule.category}</span>
                      <span className="font-semibold text-slate-700">{rule.text}</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholders for other steps */}
          {(currentStep === 1 || currentStep === 2 || currentStep === 6) && (
            <div className="p-8 animate-in fade-in flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{STEPS[currentStep].title}</h2>
              <p className="text-slate-500 max-w-sm">This step is mocked for the hackathon prototype. Click Next to continue.</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto border-t border-slate-200/60 p-6 bg-slate-50/50 flex justify-between rounded-b-3xl">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={handleNext}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {currentStep === STEPS.length - 1 ? 'Publish Tender' : 'Next Step'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
