'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/context/UserStoreContext';
import {
  Building,
  ShieldCheck,
  Edit3,
  Save,
  CheckCircle2,
  Lock,
  UserCheck,
  CreditCard,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateProfile, addToast } = useUserStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    companyName: profile.companyName,
    tradeName: profile.tradeName,
    companyType: profile.companyType,
    cin: profile.cin,
    pan: profile.pan,
    gstin: profile.gstin,
    udyam: profile.udyam,
    epfoCode: profile.epfoCode,
    addressLine1: profile.registeredAddress.line1,
    addressLine2: profile.registeredAddress.line2,
    city: profile.registeredAddress.city,
    state: profile.registeredAddress.state,
    pincode: profile.registeredAddress.pincode,
    signatoryName: profile.authorizedSignatory.name,
    signatoryDesignation: profile.authorizedSignatory.designation,
    signatoryEmail: profile.authorizedSignatory.email,
    signatoryPhone: profile.authorizedSignatory.phone,
    dinOrDsc: profile.authorizedSignatory.dinOrDsc,
    bankName: profile.bankDetails.bankName,
    accountNumber: profile.bankDetails.accountNumber,
    ifsc: profile.bankDetails.ifsc,
    branch: profile.bankDetails.branch,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      companyName: formData.companyName,
      tradeName: formData.tradeName,
      companyType: formData.companyType,
      cin: formData.cin,
      udyam: formData.udyam,
      epfoCode: formData.epfoCode,
      registeredAddress: {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India',
      },
      authorizedSignatory: {
        name: formData.signatoryName,
        designation: formData.signatoryDesignation,
        email: formData.signatoryEmail,
        phone: formData.signatoryPhone,
        dinOrDsc: formData.dinOrDsc,
      },
      bankDetails: {
        accountName: `${formData.companyName} - Escrow`,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        bankName: formData.bankName,
        branch: formData.branch,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Edit Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 leading-tight">
            Bidder Master Statutory Profile
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Master statutory credentials, verified tax registrations, and authorized DSC signatories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Master Record</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gateway Verification Telemetry Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-display font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Government Direct API Gateways Telemetry</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
            All Systems Nominal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {profile.verifications.map((v, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs">{v.type} Database</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Status: <strong className="text-emerald-400">{v.status}</strong> • {v.latencyMs}ms
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Sync: {v.lastChecked}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 text-xs">
        {/* Statutory Identifiers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              1. Statutory Identifiers & Registrations
            </h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3" /> Immutable Government Gateway Keys
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Legal Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Trade / Brand Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Constitution Type</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.companyType}
                onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">GSTIN Number (REG-06)</label>
              <input
                type="text"
                disabled
                value={formData.gstin}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 cursor-not-allowed"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                ✓ GSTN Verified
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
              <input
                type="text"
                disabled
                value={formData.pan}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 cursor-not-allowed"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                ✓ NSDL Verified
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Udyam Registration No.</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.udyam}
                onChange={(e) => setFormData({ ...formData, udyam: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Registered Address */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              2. Registered Head Office & Manufacturing Facility
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Address Line 1</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">State & Pincode</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${formData.state} - ${formData.pincode}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  setFormData({
                    ...formData,
                    state: parts[0]?.trim() || formData.state,
                    pincode: parts[1]?.trim() || formData.pincode,
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Authorized Signatory & DSC */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              3. Authorized Signatory & Digital Signature (Class-3 DSC)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Signatory Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.signatoryName}
                onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Designation</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.signatoryDesignation}
                onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.signatoryEmail}
                onChange={(e) => setFormData({ ...formData, signatoryEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Banking Escrow Details */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              4. Banking & EMD Escrow Account
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Account Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-slate-800 text-white rounded-xl font-black transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
