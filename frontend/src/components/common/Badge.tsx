import React from 'react';
import { BidStatus, ComplianceStatus, RiskLevel, DocStatus } from '@/types/user';
import { cn } from '@/lib/utils';

export const BidStatusBadge: React.FC<{ status: BidStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'SUBMITTED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          SUBMITTED
        </span>
      );
    case 'UNDER_EVALUATION':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          UNDER EVALUATION
        </span>
      );
    case 'CLARIFICATION_REQUIRED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          CLARIFICATION REQUIRED
        </span>
      );
    case 'COMPLIANCE_PASSED':
    case 'AWARDED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {status.replace('_', ' ')}
        </span>
      );
    case 'COMPLIANCE_FAILED':
    case 'REJECTED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-bold border border-rose-300', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {status.replace('_', ' ')}
        </span>
      );
    default:
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200', className)}>
          {status.replace('_', ' ')}
        </span>
      );
  }
};

export const ComplianceBadge: React.FC<{ status: ComplianceStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'PASS':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200', className)}>
          <span className="material-symbols-outlined text-[14px] text-emerald-600 icon-fill">check_circle</span>
          PASS
        </span>
      );
    case 'REVIEW':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300', className)}>
          <span className="material-symbols-outlined text-[14px] text-amber-600 icon-fill">warning</span>
          REVIEW
        </span>
      );
    case 'FAIL':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-300', className)}>
          <span className="material-symbols-outlined text-[14px] text-rose-600 icon-fill">cancel</span>
          FAIL
        </span>
      );
    default:
      return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold', className)}>
          {status}
        </span>
      );
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className }) => {
  switch (risk) {
    case 'LOW':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200', className)}>
          ✓ Low Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300', className)}>
          ⚠️ Medium Risk
        </span>
      );
    case 'HIGH':
    case 'CRITICAL':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300', className)}>
          🛑 High Risk
        </span>
      );
  }
};

export const DocStatusBadge: React.FC<{ status: DocStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Verified
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Expired
        </span>
      );
    case 'REVIEW_REQUIRED':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Review Required
        </span>
      );
    default:
      return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium', className)}>
          {status}
        </span>
      );
  }
};
