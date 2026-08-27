'use client';

import React, { useState } from 'react';
import { useAuth, UserPersona } from '@/context/AuthContext';

export default function HomePage() {
  const { loginAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserPersona | null>(null);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      loginAs(selectedRole);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Brand Side matching NEW UI */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-primary icon-fill text-[28px]">
              assured_workload
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">
            BidShield AI
          </h1>
        </div>

        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold rounded border border-amber-500/40 mb-4">
            SIH-26100 GeM Central Platform
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Deterministic verification.<br />Evidenced decisions.
          </h2>
          <p className="text-primary-fixed-dim text-base max-w-md mb-8 leading-relaxed">
            Universal public procurement compliance architecture combining real-time statutory gateways, deterministic rule scoring, and AI document intelligence.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full border border-white/20 text-white/90 text-sm font-medium flex items-center gap-2 bg-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
              11 Statutory Gateways Active
            </div>
            <div className="px-4 py-2 rounded-full border border-white/20 text-white/90 text-sm font-medium flex items-center gap-2 bg-white/5">
              <span className="material-symbols-outlined text-info text-[18px]">verified</span>
              CVC Audit Trail Compliant
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/50 font-mono">
          BidShield AI Enterprise v2.4 • Public Procurement Compliance Platform
        </div>
      </div>

      {/* Login / Persona Selection Side */}
      <div className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col justify-center items-center p-8 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in my-auto">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-white icon-fill">assured_workload</span>
            </div>
            <h1 className="font-display font-black text-2xl text-primary">BidShield AI</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-2">Platform Access</h2>
            <p className="text-on-surface-variant text-sm">
              Select an operational persona below to enter its specialized portal environment.
            </p>
          </div>

          <div className="space-y-4">
            {!selectedRole ? (
              <>
                {/* Bidder Role Card */}
                <button
                  onClick={() => setSelectedRole('BIDDER')}
                  className="w-full group relative flex items-center p-5 border border-outline-variant rounded-2xl hover:border-info hover:shadow-soft transition-all text-left bg-white hover:bg-blue-50/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-info flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined icon-fill text-[24px]">storefront</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-primary text-base group-hover:text-info transition-colors">
                      Vendor / Bidder Portal
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      Check eligibility, upload vault docs, submit bids
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-info group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>

                {/* Officer Role Card */}
                <button
                  onClick={() => setSelectedRole('CLIENT')}
                  className="w-full group relative flex items-center p-5 border border-outline-variant rounded-2xl hover:border-warning hover:shadow-soft transition-all text-left bg-white hover:bg-amber-50/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-warning flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined icon-fill text-[24px]">gavel</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-primary text-base group-hover:text-warning transition-colors">
                      Procurement Officer Desk
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      Evaluate submissions, inspect AI evidence, record decisions
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-warning group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>

                {/* Admin Role Card */}
                <button
                  onClick={() => setSelectedRole('ADMIN')}
                  className="w-full group relative flex items-center p-5 border border-outline-variant rounded-2xl hover:border-purple-500 hover:shadow-soft transition-all text-left bg-white hover:bg-purple-50/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined icon-fill text-[24px]">admin_panel_settings</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-primary text-base group-hover:text-purple-600 transition-colors">
                      Admin Control Center
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      Configure rules, risk weights, 11 gateways, master audit trail
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </button>
              </>
            ) : (
              <form onSubmit={handleLogin} className="w-full bg-white p-6 border border-outline-variant rounded-2xl shadow-sm animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    type="button" 
                    onClick={() => setSelectedRole(null)}
                    className="p-2 hover:bg-neutral-light rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
                  </button>
                  <h3 className="font-bold text-lg text-primary">
                    {selectedRole === 'ADMIN' && 'Admin Login'}
                    {selectedRole === 'CLIENT' && 'Procurement Officer Login'}
                    {selectedRole === 'BIDDER' && 'Bidder Login'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {selectedRole === 'ADMIN' || selectedRole === 'CLIENT' ? 'Company/Organization Email' : 'Company Email'}
                    </label>
                    <input 
                      type="email" 
                      required 
                      defaultValue={
                        selectedRole === 'ADMIN' ? 'admin@bidshield.gov.in' : 
                        selectedRole === 'CLIENT' ? 'officer@procurement.gov.in' : 
                        'vendor@techcorp.com'
                      }
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      defaultValue="demo-password-123"
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors mt-2 shadow-sm"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-outline-variant/50 flex items-center justify-between text-xs text-neutral-muted">
            <span>Deterministic Rule Verification</span>
            <span>•</span>
            <span>Evidence-Based AI</span>
            <span>•</span>
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
