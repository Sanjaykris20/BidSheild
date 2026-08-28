'use client';

import React, { useState, useEffect } from 'react';
import { MockBadge } from '@/components/shared/MockBadge';

interface DatabaseTableResponse {
  table: string;
  columns: string[];
  rows: Record<string, any>[];
}

const TABLES = [
  { id: 'mock_gst', name: 'GSTIN Registry', description: 'Goods & Services Tax Network taxpayer status records.' },
  { id: 'mock_pan', name: 'NSDL PAN Ledger', description: 'Income Tax Department PAN identification database.' },
  { id: 'mock_udyam', name: 'Udyam MSME Register', description: 'Ministry of MSME small enterprise registration numbers.' },
  { id: 'mock_epfo', name: 'EPFO Compliance', description: 'Social security provident fund establishment deposits.' },
  { id: 'mock_mii', name: 'Make In India (MII)', description: 'Declared local content percentages for domestic products.' },
  { id: 'mock_itr', name: 'Income Tax Returns (ITR)', description: 'Historic financial returns filed by corporate organizations.' },
];

export default function AdminDatabasePage() {
  const [selectedTable, setSelectedTable] = useState('mock_gst');
  const [tableData, setTableData] = useState<DatabaseTableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTable = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/database?table=${selectedTable}`);
        if (!res.ok) {
          throw new Error('Failed to query SQLite registry table.');
        }
        const data = await res.json();
        setTableData(data);
      } catch (err: any) {
        setError(err.message || 'Connection to SQLite database failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [selectedTable]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-primary tracking-tight">
            Government Registry Databases
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Live query and inspection of SQLite (`bidcompliance.db`) tables utilized for statutory compliance verification.
          </p>
        </div>
        <MockBadge label="SQLITE DB VISUALIZER" variant="purple" size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-muted mb-3">Select Registry Table</h3>
            <div className="flex flex-col gap-2">
              {TABLES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedTable === t.id
                      ? 'bg-primary/5 border-primary font-bold text-primary ring-1 ring-primary'
                      : 'bg-white border-outline-variant hover:bg-surface-alt hover:text-primary text-on-surface-variant'
                  }`}
                >
                  <div className="font-bold">{t.name}</div>
                  <div className="text-[10px] text-neutral-muted mt-1 font-normal line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid View */}
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-outline-variant/60 bg-surface flex justify-between items-center shrink-0">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-neutral-muted">Active Table</span>
                <h3 className="font-bold text-primary text-base">{TABLES.find(t => t.id === selectedTable)?.name}</h3>
              </div>
              <span className="font-mono text-xs font-bold text-neutral-muted bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant">
                {tableData?.rows.length || 0} Records
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-muted space-y-2">
                  <span className="material-symbols-outlined text-primary animate-spin-slow text-[32px]">sync</span>
                  <span className="text-xs font-semibold">Executing SELECT * FROM {selectedTable}...</span>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-danger p-6 space-y-2 text-center">
                  <span className="material-symbols-outlined text-[36px]">error</span>
                  <span className="text-sm font-bold">Query Execution Failed</span>
                  <span className="text-xs text-neutral-muted max-w-md">{error}</span>
                </div>
              ) : !tableData || tableData.rows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-muted p-6">
                  <span className="material-symbols-outlined text-[32px]">database_off</span>
                  <span className="text-xs font-semibold mt-2">Table contains no records.</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[11px] font-mono whitespace-nowrap">
                  <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant font-bold text-neutral-muted uppercase z-10">
                    <tr>
                      {tableData.columns.map(col => (
                        <th key={col} className="p-3 border-r border-outline-variant/60">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-alt/40 transition-colors">
                        {tableData.columns.map(col => {
                          const val = row[col];
                          return (
                            <td key={col} className="p-3 border-r border-outline-variant/40 max-w-xs truncate">
                              {val === null || val === undefined ? (
                                <span className="text-neutral-muted/40 font-semibold">NULL</span>
                              ) : typeof val === 'number' ? (
                                <span className="text-info font-bold">{val.toLocaleString()}</span>
                              ) : val.toString().startsWith('33') || val.toString().startsWith('27') ? (
                                <span className="text-primary font-bold">{val}</span>
                              ) : (
                                <span>{val.toString()}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
