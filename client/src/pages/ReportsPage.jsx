import React, { useState, useEffect } from 'react';
import { apiRequest, apiDownload } from '../services/api';
import { formatINR } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BarChart3, Download, TrendingUp, PieChart, FileSpreadsheet } from 'lucide-react';

export function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await apiRequest('/reports/performance');
        if (res.success) {
          setReport(res.report);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  const triggerCsvDownload = async (type) => {
    try {
      await apiDownload(`/reports/export-csv?type=${type}`, `${type}_report.csv`);
    } catch (err) {
      alert(err.message || 'Failed to export CSV file.');
    }
  };

  if (loading) return <LoadingSpinner text="Generating Operational Analytics Report..." />;
  if (!report) return <div className="text-center py-12 text-slate-400">Failed to load reports data.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Analytics & CSV Export</h1>
          <p className="text-xs text-slate-400 mt-1">Review operational performance metrics and export database records in standard CSV format.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerCsvDownload('cases')}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Cases CSV
          </button>
          <button
            onClick={() => triggerCsvDownload('clients')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Clients CSV
          </button>
          <button
            onClick={() => triggerCsvDownload('payments')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Payments CSV
          </button>
          <button
            onClick={() => triggerCsvDownload('leads')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Leads CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Conversion Rate</span>
          <p className="text-3xl font-black text-emerald-400 mt-2">{report.conversionRate}</p>
          <span className="text-[11px] text-slate-400">{report.wonLeads} won out of {report.totalLeads} prospects</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue Billed</span>
          <p className="text-3xl font-black text-white mt-2 font-mono">{formatINR(report.totalBilled)}</p>
          <span className="text-[11px] text-slate-400">Total Agreed Contract Values</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Revenue</span>
          <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">{formatINR(report.totalCollected)}</p>
          <span className="text-[11px] text-slate-400">Successfully Received Payments</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Receivables</span>
          <p className="text-3xl font-black text-rose-400 mt-2 font-mono">{formatINR(report.outstandingBalance)}</p>
          <span className="text-[11px] text-slate-400">Uncollected Balance Across Cases</span>
        </div>
      </div>

      {/* Service Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-brand-400" /> Compliance Service Revenue Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Service Name</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-center">Total Cases</th>
                <th className="px-3 py-2.5 text-right">Total Billed</th>
                <th className="px-3 py-2.5 text-right">Collected Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.serviceBreakdown?.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3.5 font-bold text-white">{s.serviceName}</td>
                  <td className="px-3 py-3.5 text-slate-400">{s.category}</td>
                  <td className="px-3 py-3.5 text-center font-bold text-brand-400">{s.totalCases}</td>
                  <td className="px-3 py-3.5 text-right font-mono text-slate-200">{formatINR(s.totalBilled)}</td>
                  <td className="px-3 py-3.5 text-right font-mono text-emerald-400 font-bold">{formatINR(s.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
