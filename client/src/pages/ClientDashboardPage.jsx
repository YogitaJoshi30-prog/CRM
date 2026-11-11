import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CreditCard, CalendarClock, ArrowUpRight, MessageSquare } from 'lucide-react';

export function ClientDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientDashboard() {
      try {
        const res = await apiRequest('/dashboard/summary');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Client dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClientDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading client portal details..." />;
  if (!data) return <div className="text-center py-12 text-slate-400">Failed to load client data.</div>;

  const { summary, cases, recentUpdates } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Portal Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Track active compliance applications, document requests, payments, and updates.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cases</span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400"><Briefcase className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{summary.activeCases}</p>
          <span className="text-[11px] text-teal-400 font-medium">Compliance Files In Progress</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Documents</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400"><FileText className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{summary.pendingDocuments}</p>
          <span className="text-[11px] text-amber-400 font-medium">Action Required by You</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400"><CreditCard className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{formatINR(summary.totalOutstandingFee)}</p>
          <span className="text-[11px] text-slate-400">Total Paid: <strong className="text-emerald-400">{formatINR(summary.totalPaidFee)}</strong></span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Renewal</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><CalendarClock className="w-5 h-5" /></div>
          </div>
          <p className="text-lg font-bold text-white mt-3 truncate">
            {summary.upcomingRenewal ? formatDate(summary.upcomingRenewal.expiryDate) : 'No renewals due'}
          </p>
          <span className="text-[11px] text-blue-400 font-medium truncate block">
            {summary.upcomingRenewal?.service?.name || 'All current filings active'}
          </span>
        </div>
      </div>

      {/* Grid: My Cases & Client Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Compliance Cases */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-teal-400" /> Active Compliance Cases
            </h3>
            <Link to="/client/cases" className="text-xs text-teal-400 hover:underline flex items-center">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Case No</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50">
                    <td className="px-3 py-3 font-bold text-teal-400">{c.caseNumber}</td>
                    <td className="px-3 py-3 text-slate-200">{c.service?.name}</td>
                    <td className="px-3 py-3"><StatusBadge status={c.status} type="case" /></td>
                    <td className="px-3 py-3 text-right">
                      <Link to={`/client/cases/${c.id}`} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-semibold transition">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Staff Updates */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-brand-400" /> Operational Case Updates
          </h3>
          <div className="space-y-3">
            {recentUpdates.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent client updates.</p>
            ) : (
              recentUpdates.map((update) => (
                <div key={update.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-teal-400">{update.case?.caseNumber}</span>
                    <span>{formatDate(update.createdAt)}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{update.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
