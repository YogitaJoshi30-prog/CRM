import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { RefreshCw, CalendarClock, AlertTriangle } from 'lucide-react';

export function RenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState('');

  const fetchRenewals = async () => {
    try {
      let query = '/renewals';
      if (daysFilter) query += `?days=${daysFilter}`;
      const res = await apiRequest(query);
      if (res.success) {
        setRenewals(res.renewals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, [daysFilter]);

  if (loading) return <LoadingSpinner text="Calculating Renewal Expiry Dates..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Compliance Renewal Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">Monitor upcoming regulatory license expirations, annual return due dates, and audits.</p>
        </div>
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
        >
          <option value="">All Renewals</option>
          <option value="7">Expiring within 7 Days</option>
          <option value="30">Expiring within 30 Days</option>
          <option value="60">Expiring within 60 Days</option>
        </select>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Client Company</th>
                <th className="px-3 py-2.5">Compliance Service</th>
                <th className="px-3 py-2.5">Case Number</th>
                <th className="px-3 py-2.5">Expiry Date</th>
                <th className="px-3 py-2.5">Days to Expiry</th>
                <th className="px-3 py-2.5">Renewal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {renewals.map((ren) => (
                <tr key={ren.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3.5 font-extrabold text-white">{ren.case?.client?.companyName}</td>
                  <td className="px-3 py-3.5 text-slate-200">{ren.service?.name}</td>
                  <td className="px-3 py-3.5 font-mono text-brand-400">{ren.case?.caseNumber}</td>
                  <td className="px-3 py-3.5 font-mono text-slate-300">{formatDate(ren.expiryDate)}</td>
                  <td className="px-3 py-3.5 font-bold">
                    <span className={ren.daysUntilExpiry < 0 ? 'text-red-500' : ren.daysUntilExpiry <= 7 ? 'text-rose-400' : 'text-amber-400'}>
                      {ren.daysUntilExpiry < 0 ? `${Math.abs(ren.daysUntilExpiry)} days ago` : `${ren.daysUntilExpiry} days left`}
                    </span>
                  </td>
                  <td className="px-3 py-3.5"><StatusBadge status={ren.computedStatus || ren.renewalStatus} type="renewal" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
