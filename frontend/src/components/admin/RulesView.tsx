'use client';
import React, { useState } from 'react';
import {
  Scale,
  Search,
  Plus,
  Edit,
  Copy,
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  X,
  FileCode2,
  Download
} from 'lucide-react';
import { mockComplianceRules } from '@/lib/adminData';
import { ComplianceRule } from '@/types';

export const RulesView: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>(mockComplianceRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  
  // Create / Edit modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ruleCode, setRuleCode] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleCat, setRuleCat] = useState<ComplianceRule['category']>('Statutory');
  const [ruleParam, setRuleParam] = useState('');
  const [ruleOperator, setRuleOperator] = useState<ComplianceRule['operator']>('EQUALS');
  const [ruleThreshold, setRuleThreshold] = useState('');
  const [ruleWeight, setRuleWeight] = useState(15);
  const [ruleSeverity, setRuleSeverity] = useState<ComplianceRule['severity']>('CRITICAL');

  // Version History Modal
  const [versionHistoryRule, setVersionHistoryRule] = useState<ComplianceRule | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const next = r.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        showToast(`Rule ${r.ruleCode} status changed to ${next}`);
        return { ...r, status: next };
      }
      return r;
    }));
  };

  const handleCloneRule = (rule: ComplianceRule) => {
    const cloned: ComplianceRule = {
      ...rule,
      id: `RULE-${Date.now().toString().slice(-3)}`,
      ruleCode: `${rule.ruleCode}-CLONE`,
      title: `${rule.title} (Clone)`,
      version: 'v1.0',
      updatedAt: 'Just now',
      lastModifiedBy: 'Super Admin'
    };
    setRules(prev => [cloned, ...prev]);
    showToast(`Rule cloned as ${cloned.ruleCode}`);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setRuleCode(`RULE-CUSTOM-${Date.now().toString().slice(-3)}`);
    setRuleTitle('');
    setRuleDesc('');
    setRuleCat('Statutory');
    setRuleParam('custom_clause_param');
    setRuleOperator('GREATER_EQUAL');
    setRuleThreshold('');
    setRuleWeight(10);
    setRuleSeverity('HIGH');
    setShowRuleModal(true);
  };

  const handleOpenEditModal = (rule: ComplianceRule) => {
    setIsEditing(true);
    setSelectedRule(rule);
    setRuleCode(rule.ruleCode);
    setRuleTitle(rule.title);
    setRuleDesc(rule.description);
    setRuleCat(rule.category);
    setRuleParam(rule.parameter);
    setRuleOperator(rule.operator);
    setRuleThreshold(rule.thresholdValue);
    setRuleWeight(rule.weightPercent);
    setRuleSeverity(rule.severity);
    setShowRuleModal(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedRule) {
      setRules(prev => prev.map(r => r.id === selectedRule.id ? {
        ...r,
        ruleCode,
        title: ruleTitle,
        description: ruleDesc,
        category: ruleCat,
        parameter: ruleParam,
        operator: ruleOperator,
        thresholdValue: ruleThreshold,
        weightPercent: Number(ruleWeight),
        severity: ruleSeverity,
        version: `v${(parseFloat(r.version.replace('v', '')) + 0.1).toFixed(1)}`,
        updatedAt: 'Just now'
      } : r));
      showToast(`Rule ${ruleCode} updated to new version.`);
    } else {
      const created: ComplianceRule = {
        id: `RULE-${Date.now().toString().slice(-3)}`,
        ruleCode,
        title: ruleTitle,
        description: ruleDesc,
        category: ruleCat,
        parameter: ruleParam,
        operator: ruleOperator,
        thresholdValue: ruleThreshold,
        weightPercent: Number(ruleWeight),
        severity: ruleSeverity,
        status: 'ACTIVE',
        version: 'v1.0',
        updatedAt: 'Just now',
        lastModifiedBy: 'Super Admin'
      };
      setRules(prev => [created, ...prev]);
      showToast(`New compliance rule ${created.ruleCode} deployed to engine.`);
    }
    setShowRuleModal(false);
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ruleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

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
            <h1 className="text-2xl font-black text-slate-900">Compliance Rules Engine</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {rules.length} Active Gating Rules
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure statutory gating logic, Make-in-India thresholds, turnover equations & OEM authorization checks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rule title, code, clause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Statutory">Statutory</option>
            <option value="Make-in-India">Make-in-India</option>
            <option value="Financial">Financial</option>
            <option value="Technical">Technical</option>
            <option value="Integrity">Integrity & Debarment</option>
            <option value="Documentation">Documentation</option>
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Rule Code & Title</th>
                <th className="p-4">Condition & Threshold</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Version</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Code & Title */}
                  <td className="p-4 max-w-xs">
                    <div className="font-mono font-bold text-purple-700">{rule.ruleCode}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{rule.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{rule.description}</div>
                  </td>

                  {/* Condition & Threshold */}
                  <td className="p-4 font-mono">
                    <div className="text-slate-800 text-[11px] font-bold">
                      {rule.parameter} <span className="text-purple-600 font-extrabold">{rule.operator}</span>
                    </div>
                    <div className="text-emerald-700 font-bold mt-0.5">{rule.thresholdValue}</div>
                  </td>

                  {/* Weight */}
                  <td className="p-4 font-bold text-slate-900 text-sm">
                    {rule.weightPercent}%
                  </td>

                  {/* Severity */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      rule.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>

                  {/* Version */}
                  <td className="p-4 font-mono text-slate-500 font-semibold">{rule.version}</td>

                  {/* Action Buttons: Create, Edit, Disable, Clone, Version History */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Edit Rule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCloneRule(rule)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Clone Rule"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setVersionHistoryRule(rule)}
                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                        title="View Version History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(rule.id)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border ${
                          rule.status === 'ACTIVE' 
                            ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {rule.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT RULE MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? `Edit Rule: ${ruleCode}` : 'Create New Compliance Rule'}
              </h2>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rule Code *</label>
                  <input
                    type="text"
                    required
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-purple-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={ruleCat}
                    onChange={(e) => setRuleCat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                  >
                    <option value="Statutory">Statutory</option>
                    <option value="Make-in-India">Make-in-India</option>
                    <option value="Financial">Financial</option>
                    <option value="Technical">Technical</option>
                    <option value="Integrity">Integrity</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Content (Make-in-India) Minimum Percentage"
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Statutory Reference</label>
                <textarea
                  rows={2}
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parameter</label>
                  <input
                    type="text"
                    required
                    value={ruleParam}
                    onChange={(e) => setRuleParam(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operator</label>
                  <select
                    value={ruleOperator}
                    onChange={(e) => setRuleOperator(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-mono text-[11px]"
                  >
                    <option value="EQUALS">EQUALS (==)</option>
                    <option value="GREATER_EQUAL">GREATER_EQUAL (&gt;=)</option>
                    <option value="LESS_EQUAL">LESS_EQUAL (&lt;=)</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="NOT_EXPIRED">NOT_EXPIRED</option>
                    <option value="IS_TRUE">IS_TRUE</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Threshold</label>
                  <input
                    type="text"
                    required
                    value={ruleThreshold}
                    onChange={(e) => setRuleThreshold(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold text-emerald-700 text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight Percentage (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={ruleWeight}
                    onChange={(e) => setRuleWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity Level</label>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Hard Gating)</option>
                    <option value="HIGH">HIGH (Scored)</option>
                    <option value="MEDIUM">MEDIUM (Review)</option>
                    <option value="LOW">LOW (Informational)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {isEditing ? 'Update Rule' : 'Create & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {versionHistoryRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Version History: {versionHistoryRule.ruleCode}</h2>
                <p className="text-xs text-slate-500">{versionHistoryRule.title}</p>
              </div>
              <button onClick={() => setVersionHistoryRule(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-700">{versionHistoryRule.version} (Active Release)</span>
                  <span className="text-[10px] text-slate-400">{versionHistoryRule.updatedAt}</span>
                </div>
                <p className="text-slate-600">Updated threshold value to {versionHistoryRule.thresholdValue} based on revised GeM procurement directive.</p>
                <div className="text-[10px] text-slate-400 font-semibold">Modified by: {versionHistoryRule.lastModifiedBy}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 opacity-70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700">v1.0 (Initial Deployment)</span>
                  <span className="text-[10px] text-slate-400">01 Jan 2025</span>
                </div>
                <p className="text-slate-600">Base statutory validation rule seeded for production cluster.</p>
                <div className="text-[10px] text-slate-400 font-semibold">Modified by: Platform Admin</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVersionHistoryRule(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
