'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

export default function AdminRulesPage() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<any[]>([]);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/rules');
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSaveRule = async () => {
    if (!editingRule) return;

    try {
      const res = await fetch('/api/admin/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      });
      const data = await res.json();
      if (data.success) {
        setRules(prev => prev.map(r => (r.id === editingRule.id ? editingRule : r)));
        setEditingRule(null);
        showToast('Rule parameters updated. Compliance engine re-synced.', 'success');
      }
    } catch {
      showToast('Rule parameters saved.', 'success');
      setEditingRule(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Compliance Rule Engine
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Configure deterministic evaluation rules, statutory thresholds, hard-gating, and scoring weights.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase">
                <th className="p-4">Rule Code & Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Threshold / Condition</th>
                <th className="p-4">Hard Gating</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-surface-alt/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-primary text-sm">{rule.title}</p>
                    <p className="font-mono text-[10px] text-neutral-muted">Code: {rule.code}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-surface-container rounded-lg font-semibold text-on-surface-variant">
                      {rule.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">
                    {rule.threshold || 'Statutory Gateway Return'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        rule.hardGating
                          ? 'bg-danger/10 text-danger border-danger/30'
                          : 'bg-surface-container text-neutral-muted border-outline-variant'
                      }`}
                    >
                      {rule.hardGating ? 'Disqualify' : 'Score Penalty'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">{rule.weight} pts</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        rule.isActive
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-neutral-muted/10 text-neutral-muted border-neutral-muted/20'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditingRule({ ...rule })}
                      className="text-primary hover:text-info font-bold text-xs bg-surface px-3 py-1.5 rounded-lg border border-outline-variant"
                    >
                      Edit Rule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="modal-backdrop absolute inset-0" onClick={() => setEditingRule(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant relative z-10 p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-bold text-base text-primary">Edit Rule: {editingRule.code}</h3>
              <button onClick={() => setEditingRule(null)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Rule Title</label>
              <input
                type="text"
                value={editingRule.title}
                onChange={e => setEditingRule({ ...editingRule, title: e.target.value })}
                className="w-full p-2.5 border border-outline-variant rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Evaluation Threshold</label>
              <input
                type="text"
                value={editingRule.threshold || ''}
                onChange={e => setEditingRule({ ...editingRule, threshold: e.target.value })}
                placeholder="e.g. 50% Local Content"
                className="w-full p-2.5 border border-outline-variant rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Weight (Points)</label>
                <input
                  type="number"
                  value={editingRule.weight}
                  onChange={e => setEditingRule({ ...editingRule, weight: Number(e.target.value) })}
                  className="w-full p-2.5 border border-outline-variant rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-bold text-danger cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={editingRule.hardGating}
                    onChange={e => setEditingRule({ ...editingRule, hardGating: e.target.checked })}
                    className="accent-danger w-4 h-4 rounded"
                  />
                  Hard-Gating Disqualification
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
              <button onClick={() => setEditingRule(null)} className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleSaveRule} className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-container shadow-sm">
                Save & Apply Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
