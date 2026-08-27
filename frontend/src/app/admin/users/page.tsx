'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            User Governance & RBAC
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage authenticated users, operational roles, and platform permissions across PSUs and vendors.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
                <th className="p-4">Name & Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-primary text-sm">{u.name}</p>
                    <p className="font-mono text-neutral-muted text-[11px]">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-surface-container rounded-lg font-bold text-primary font-mono text-[11px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant font-medium">{u.organization}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        u.status === 'ACTIVE'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-neutral-muted/10 text-neutral-muted border-neutral-muted/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="text-primary hover:text-info font-bold text-xs bg-surface px-3 py-1.5 rounded-lg border border-outline-variant"
                    >
                      Edit Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
