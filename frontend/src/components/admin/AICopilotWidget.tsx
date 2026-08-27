'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Why is Alpha Defense high risk?",
  "Which requirements failed?",
  "Why did local content fail?"
];

export const AICopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello Officer! I am your AI Procurement Copilot. How can I assist you with your tender evaluations today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (Mocked for Hackathon)
    setTimeout(() => {
      let response = "I've analyzed the documents. Everything appears to be in order.";
      
      if (text.includes('Alpha') || text.includes('high risk')) {
        response = "Alpha Defense is marked as HIGH RISK because their Make-In-India (MII) Local Content declaration (45%) is below the Class-I threshold (50%) required by the tender. Evidence is found on page 2 of 'Doc_MII_SelfDeclaration.pdf'.";
      } else if (text.includes('requirements failed')) {
        response = "Across all current bids, the most common failed requirement is the 'Minimum Average Annual Turnover: ₹2 Cr'. 3 bidders failed to meet this criteria.";
      } else if (text.includes('local content')) {
        response = "Local content failed for Alpha Defense because they declared 45% (Class-II), but the tender strictly requires ≥50% (Class-I) for preference.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-display text-sm leading-tight">AI Procurement Copilot</h3>
              <p className="text-[10px] text-blue-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Powered by Llama 3.1
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-b border-blue-100 text-[10px] font-bold tracking-wider text-blue-700 uppercase shrink-0">
          <AlertCircle className="w-3 h-3" /> AI insights do not replace manual officer approval
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length < 3 && !isTyping && (
          <div className="px-4 py-2 flex flex-wrap gap-2 shrink-0">
            {SUGGESTED_QUESTIONS.map(q => (
              <button 
                key={q} 
                onClick={() => handleSend(q)}
                className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
          >
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about the bids..." 
              className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
