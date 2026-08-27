'use client';
import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Edit,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Download,
  AlertTriangle,
  Mail,
  MapPin,
  FileStack,
  Users
} from 'lucide-react';
import { mockClients } from '@/lib/adminData';
import { ClientEntity } from '@/types';

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<ClientEntity[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (clientId: string, newStatus: ClientEntity['status']) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    if (selectedClient && selectedClient.id === clientId) {
      setSelectedClient(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Client ${clientId} status updated to ${newStatus}`);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-black text-slate-900">Client Entity Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
              {clients.length} Buyer Organizations
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Central Public Sector Undertakings (PSUs), Ministries, and Defence Procurement Authorities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Exporting client organizations catalog...')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PSU name, code, ministry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {client.shortCode.slice(0, 2)}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  client.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  client.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {client.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-base font-bold text-slate-900">{client.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{client.department}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Officers</div>
                  <div className="font-extrabold text-slate-900">{client.procurementOfficersCount}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Live Tenders</div>
                  <div className="font-extrabold text-blue-600">{client.activeTendersCount}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold">Volume</div>
                  <div className="font-extrabold text-emerald-700">{client.totalProcurementValue}</div>
                </div>
              </div>
            </div>

            {/* Buttons: Approve, Suspend, Activate, Edit, View */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => setSelectedClient(client)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>

              <div className="flex items-center gap-1">
                {client.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => handleStatusChange(client.id, 'ACTIVE')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {client.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusChange(client.id, 'SUSPENDED')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold border border-amber-200 flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                ) : client.status === 'SUSPENDED' ? (
                  <button
                    onClick={() => handleStatusChange(client.id, 'ACTIVE')}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold border border-emerald-200 flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Activate</span>
                  </button>
                ) : null}

                <button
                  onClick={() => showToast(`Edit dialog opened for ${client.name}`)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Edit Client Parameters"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Client Detail View Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                  {selectedClient.category} • {selectedClient.shortCode}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedClient.name}</h2>
                <p className="text-xs text-slate-500">{selectedClient.department}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Headquarters Address</span>
                <p className="font-semibold text-slate-800">{selectedClient.address}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400">Official Contact Email</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.contactEmail}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
