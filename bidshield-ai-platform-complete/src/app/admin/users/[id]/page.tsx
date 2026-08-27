'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const userId = (params.id as string) || 'USR-02';

  const [role, setRole] = useState('PROCUREMENT_OFFICER');
  const [status, setStatus] = useState('ACTIVE');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-3 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <button
          onClick={() => router.push('/admin/users')}
          className="p-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
        </button>
        <div>
          <h2 className="font-display font-black text-2xl text-primary">User Profile Governance</h2>
          <p className="text-xs text-neutral-muted mt-0.5">User ID: {userId}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-primary mb-1">Full Name</label>
          <input type="text" disabled value="P. Sharma" className="w-full p-2.5 bg-surface border border-outline-variant rounded-xl" />
        </div>
        <div>
          <label className="block font-semibold text-primary mb-1">Email</label>
          <input type="text" disabled value="p.sharma@cpcl.co.in" className="w-full p-2.5 bg-surface border border-outline-variant rounded-xl" />
        </div>
        <div>
          <label className="block font-semibold text-primary mb-1">Operational Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full p-2.5 border border-outline-variant rounded-xl bg-white font-bold"
          >
            <option value="BIDDER">BIDDER (Vendor)</option>
            <option value="PROCUREMENT_OFFICER">PROCUREMENT_OFFICER (Client Desk)</option>
            <option value="ADMIN">ADMIN (Central Control)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-primary mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2.5 border border-outline-variant rounded-xl bg-white font-bold"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => {
              showToast('User permissions saved to directory.', 'success');
              router.push('/admin/users');
            }}
            className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-primary-container"
          >
            Save User Role
          </button>
        </div>
      </div>
    </div>
  );
}
