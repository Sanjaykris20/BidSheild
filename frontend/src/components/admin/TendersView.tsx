'use client';
import React, { useState } from 'react';
import {
  FileStack,
  Search,
  CheckCircle2,
  Lock,
  Archive,
  Ban,
  UserPlus,
  Eye,
  Building2,
  Calendar,
  Layers,
  Download,
  X,
  AlertTriangle
} from 'lucide-react';
import { mockTenders } from '@/lib/mockData';
import { Tender, TenderStatus } from '@/types';

export const TendersView: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>(mockTenders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showAssignOfficerModal, setShowAssignOfficerModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (tenderId: string, newStatus: TenderStatus) => {
    setTenders(prev => prev.map(t => t.id === tenderId ? { ...t, status: newStatus } : t));
    if (selectedTender && selectedTender.id === tenderId) {
      setSelectedTender(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Tender ${tenderId} status updated to ${newStatus}`);
  };

  const handleAssignOfficer = () => {
    if (!selectedTender || !officerName) return;
    setTenders(prev => prev.map(t => t.id === selectedTender.id ? { ...t, assignedOfficer: officerName } : t));
    setShowAssignOfficerModal(false);
    showToast(`Officer ${officerName} assigned to Tender ${selectedTender.tenderNumber}`);
    setOfficerName('');
  };

  const filteredTenders = tenders.filter(t => {
    const matchesSearch = 
      t.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <h1 className="text-2xl font-black text-slate-900">Tender Oversight Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {tenders.length} Central Tenders
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Universal administrative control over GeM tender publishing, suspensions, archives, and officer assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Exporting universal tender directory as CSV...')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tenders</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tender #, title, PSU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Tenders</option>
            <option value="LIVE">LIVE</option>
            <option value="UNDER_EVALUATION">UNDER EVALUATION</option>
            <option value="CLOSED">CLOSED</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Tenders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Tender Number & Title</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Estimated Value</th>
                <th className="p-4">Bids & Rules</th>
                <th className="p-4">Assigned Officer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Tender ID & Title */}
                  <td className="p-4 max-w-sm">
                    <div className="font-mono font-bold text-blue-700">{tender.tenderNumber}</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{tender.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Closing: {tender.closingDate}</div>
                  </td>

                  {/* Organization */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{tender.organization}</div>
                    <div className="text-[11px] text-slate-500">{tender.category}</div>
                  </td>

                  {/* Value */}
                  <td className="p-4 font-bold text-slate-900 text-sm">
                    {tender.estimatedValue}
                  </td>

                  {/* Bids & Rules */}
                  <td className="p-4">
                    <div className="text-slate-800 font-semibold">{tender.bidsCount} Bids Submitted</div>
                    <div className="text-[11px] text-slate-500">{tender.requirementsCount} Compliance Rules</div>
                  </td>

                  {/* Assigned Officer */}
                  <td className="p-4 font-medium text-slate-800">
                    {tender.assignedOfficer || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      tender.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      tender.status === 'UNDER_EVALUATION' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      tender.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      tender.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      ● {tender.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Buttons: View, Suspend, Archive, Cancel, Assign Officer */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTender(tender)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                        title="View Tender Overview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTender(tender);
                          setShowAssignOfficerModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Assign Procurement Officer"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>

                      {tender.status !== 'SUSPENDED' ? (
                        <button
                          onClick={() => handleStatusChange(tender.id, 'SUSPENDED')}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                          title="Suspend Tender"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(tender.id, 'LIVE')}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Resume / Unsuspend Tender"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(tender.id, 'ARCHIVED')}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                        title="Archive Tender"
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleStatusChange(tender.id, 'CANCELLED')}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Cancel Tender"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN OFFICER MODAL */}
      {showAssignOfficerModal && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Assign Officer to Tender</h2>
              <button onClick={() => setShowAssignOfficerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-mono font-bold text-blue-700">{selectedTender.tenderNumber}</div>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedTender.title}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Procurement Officer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajeshwar Sharma"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAssignOfficerModal(false)}
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
