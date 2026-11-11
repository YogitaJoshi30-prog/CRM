import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users,
  Building2,
  Briefcase,
  FileWarning,
  IndianRupee,
  CalendarClock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0c8ce9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899'];

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiRequest('/dashboard/summary');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching real-time compliance metrics..." />;
  if (!data) return <div className="text-center py-12 text-slate-400">Failed to load dashboard statistics.</div>;

  const { summary, charts, tables } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Operations Command Center</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time compliance case execution, revenue, document pipeline, and renewals.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.totalLeads}</p>
          <span className="text-[10px] text-blue-400 font-medium">Pipeline Prospecting</span>
        </div>

        {/* Active Clients */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Clients</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Building2 className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.activeClients}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Onboarded Entities</span>
        </div>

        {/* Active Cases */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Cases</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Briefcase className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.activeCases}</p>
          <span className="text-[10px] text-purple-400 font-medium">In Execution</span>
        </div>

        {/* Pending Docs */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Docs</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><FileWarning className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.pendingDocuments}</p>
          <span className="text-[10px] text-amber-400 font-medium">Awaiting Verification</span>
        </div>

        {/* Outstanding Fee */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Fee</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><IndianRupee className="w-4 h-4" /></div>
          </div>
          <p className="text-lg font-black text-white mt-2 truncate">{formatINR(summary.outstandingPayments)}</p>
          <span className="text-[10px] text-rose-400 font-medium">Uncollected Retainers</span>
        </div>

        {/* Upcoming Renewals */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Renewals Due</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400"><CalendarClock className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.upcomingRenewals}</p>
          <span className="text-[10px] text-teal-400 font-medium">Next 30 Days</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status (Donut) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-brand-400" /> Compliance Cases by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.casesByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {charts.casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-[11px]">
            {charts.casesByStatus.map((item, idx) => (
              <span key={item.status} className="flex items-center text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                {item.status}: <strong className="ml-1 text-white">{item.count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Cases by Service (Bar) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" /> Active Cases by Service Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.casesByService}>
                <XAxis dataKey="serviceName" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#0c8ce9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue / Pending Documents Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" /> Pending Document Action Queue
            </h3>
            <span className="text-xs text-slate-400">{tables.overdueDocuments.length} pending review</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Case</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tables.overdueDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/50">
                    <td className="px-3 py-2.5 font-bold text-brand-400">{doc.case.caseNumber}</td>
                    <td className="px-3 py-2.5 text-slate-200">{doc.case.client.companyName}</td>
                    <td className="px-3 py-2.5 text-slate-300 truncate max-w-[150px]">{doc.originalName || doc.checklistItem?.name}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={doc.status} type="document" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <CalendarClock className="w-4 h-4 mr-2 text-teal-400" /> Upcoming Compliance Expirations
            </h3>
            <span className="text-xs text-slate-400">{tables.upcomingRenewalsList.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Expiry Date</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tables.upcomingRenewalsList.map((ren) => (
                  <tr key={ren.id} className="hover:bg-slate-850/50">
                    <td className="px-3 py-2.5 font-semibold text-slate-200">{ren.case?.client?.companyName}</td>
                    <td className="px-3 py-2.5 text-slate-400">{ren.service.name}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-300">{formatDate(ren.expiryDate)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={ren.renewalStatus} type="renewal" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
