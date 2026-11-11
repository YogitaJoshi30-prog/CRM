import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Building2, Mail, Phone, MapPin, FileText, Briefcase, ArrowLeft } from 'lucide-react';

export function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await apiRequest(`/clients/${id}`);
        if (res.success) {
          setClient(res.client);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading client profile..." />;
  if (!client) return <div className="text-center py-12 text-slate-400">Client profile not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/clients" className="inline-flex items-center text-xs font-semibold text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clients List
      </Link>

      {/* Profile Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white">{client.companyName}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {client.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Contact: {client.contactPerson} • {client.industry}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
          <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Corporate Details</h3>
          <div className="flex items-center text-slate-300"><Mail className="w-3.5 h-3.5 mr-2 text-slate-500" />{client.email}</div>
          <div className="flex items-center text-slate-300"><Phone className="w-3.5 h-3.5 mr-2 text-slate-500" />{client.phone || 'N/A'}</div>
          <div className="flex items-center text-slate-300"><MapPin className="w-3.5 h-3.5 mr-2 text-slate-500" />{client.city}, {client.state}</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
          <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Tax Identifiers</h3>
          <div>GSTIN: <strong className="text-white font-mono">{client.gstin || 'Not Provided'}</strong></div>
          <div>PAN: <strong className="text-white font-mono">{client.pan || 'Not Provided'}</strong></div>
          <div>Country: <strong className="text-slate-200">{client.country}</strong></div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
          <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Portal Account</h3>
          <div>Account Status: <strong className="text-emerald-400">{client.user ? 'Active Login' : 'No User Linked'}</strong></div>
          <div>User Account: <span className="text-slate-300">{client.user?.email || 'N/A'}</span></div>
        </div>
      </div>

      {/* Active Compliance Cases */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-brand-400" /> Active Compliance Cases ({client.cases?.length || 0})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2">Case Number</th>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">Assigned Staff</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(client.cases || []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3 font-bold text-brand-400">{c.caseNumber}</td>
                  <td className="px-3 py-3 text-slate-200">{c.service?.name}</td>
                  <td className="px-3 py-3 text-slate-400">{c.assignedStaff?.name || 'Unassigned'}</td>
                  <td className="px-3 py-3"><StatusBadge status={c.status} type="case" /></td>
                  <td className="px-3 py-3 text-right">
                    <Link to={`/cases/${c.id}`} className="px-2.5 py-1 bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white rounded text-[11px] font-semibold transition">
                      Open Case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
