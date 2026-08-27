'use client';
import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Edit,
  Eye,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle2,
  MapPin,
  Users,
  FileStack,
  X,
  Download
} from 'lucide-react';
import { mockOrganizations } from '@/lib/adminData';
import { OrganizationEntity } from '@/types';

export const OrganizationsView: React.FC = () => {
  const [orgs, setOrgs] = useState<OrganizationEntity[]>(mockOrganizations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<OrganizationEntity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOfficerName, setAssigningOfficerName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Org Form
  const [newOrgName, setNewOrgName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (orgId: string, newStatus: OrganizationEntity['status']) => {
    setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: newStatus } : o));
    showToast(`Organization ${orgId} status updated to ${newStatus}`);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newCode) return;
    const created: OrganizationEntity = {
      id: `ORG-${Date.now().toString().slice(-3)}`,
      organization: newOrgName,
      department: newDepartment || 'Procurement Wing',
      code: newCode,
      address: newAddress || 'Central HQ',
      status: 'ACTIVE',
      assignedOfficers: ["Assigned Super Admin"],
      tendersCount: 0,
      createdDate: "24 Aug 2026"
    };
    setOrgs(prev => [created, ...prev]);
    setShowCreateModal(false);
    setNewOrgName('');
    setNewDepartment('');
    setNewCode('');
    setNewAddress('');
    showToast(`Organization ${created.code} successfully created.`);
  };

  const handleAssignOfficer = () => {
    if (!selectedOrg || !assigningOfficerName) return;
    setOrgs(prev => prev.map(o => o.id === selectedOrg.id ? {
      ...o,
      assignedOfficers: [...o.assignedOfficers, assigningOfficerName]
    } : o));
    setShowAssignModal(false);
    setAssigningOfficerName('');
    showToast(`Officer '${assigningOfficerName}' assigned to ${selectedOrg.code}`);
  };

  const filteredOrgs = orgs.filter(o =>
    o.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-2xl font-black text-slate-900">Organization Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {orgs.length} Registered Units
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental structures, division codes, and assigned procurement officers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organization, department, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Organization & Department</th>
                <th className="p-4">Unit Code</th>
                <th className="p-4">Address</th>
                <th className="p-4">Assigned Officers</th>
                <th className="p-4">Tenders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Organization & Dept */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{org.organization}</div>
                    <div className="text-[11px] text-slate-500">{org.department}</div>
                  </td>

                  {/* Code */}
                  <td className="p-4">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {org.code}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{org.address}</span>
                    </div>
                  </td>

                  {/* Assigned Officers */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {org.assignedOfficers.map((off, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {off}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Tenders count */}
                  <td className="p-4 font-bold text-slate-900">
                    <span className="flex items-center gap-1 text-blue-600">
                      <FileStack className="w-3.5 h-3.5" />
                      {org.tendersCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      org.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      ● {org.status}
                    </span>
                  </td>

                  {/* Buttons: Create, Edit, Assign Officer, Suspend, View */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedOrg(org)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold flex items-center gap-1"
                        title="Assign Procurement Officer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>

                      {org.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(org.id, 'SUSPENDED')}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                          title="Suspend Organization"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(org.id, 'ACTIVE')}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Activate Organization"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORGANIZATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Create New Organization / Unit</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai Petroleum Corporation Limited"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department / Division *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical & Instrumentation Wing"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPCL-EI-03"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Refinery Complex, Manali, Chennai - 600068"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN OFFICER MODAL */}
      {showAssignModal && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Assign Officer to {selectedOrg.code}</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Select or enter the procurement officer name to grant evaluation and publishing permissions for this unit.
              </p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Officer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajeshwar Sharma"
                  value={assigningOfficerName}
                  onChange={(e) => setAssigningOfficerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignOfficer}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
