import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, MapPin, FileCheck2, ArrowRight } from 'lucide-react';

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    city: 'Pune',
    state: 'Maharashtra',
    industry: 'Engineering & Mfg'
  });

  const fetchClients = async () => {
    try {
      let query = `/clients?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      const res = await apiRequest(query);
      if (res.success) {
        setClients(res.clients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/clients', 'POST', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({ companyName: '', contactPerson: '', email: '', phone: '', gstin: '', pan: '', city: 'Pune', state: 'Maharashtra', industry: 'Engineering & Mfg' });
        fetchClients();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Clients Registry..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Entities</h1>
          <p className="text-xs text-slate-400 mt-1">Manage corporate clients, tax IDs (GSTIN/PAN), and associated compliance cases.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/20 flex items-center transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Client Entity
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Company, Contact, Email, GSTIN, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ONBOARDING">ONBOARDING</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <div key={client.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{client.companyName}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{client.contactPerson}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  client.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                  {client.city || 'Pune'}, {client.state || 'Maharashtra'}
                </div>
                {client.gstin && (
                  <div className="font-mono text-[11px] text-slate-400">GSTIN: <strong className="text-slate-200">{client.gstin}</strong></div>
                )}
                {client.pan && (
                  <div className="font-mono text-[11px] text-slate-400">PAN: <strong className="text-slate-200">{client.pan}</strong></div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">{client._count?.cases || 0} Cases</span>
              <Link to={`/clients/${client.id}`} className="text-brand-400 font-bold hover:underline flex items-center">
                View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Client */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Client Entity">
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">PAN Card</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Save Client</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
