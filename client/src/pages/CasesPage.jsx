import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CasesPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    totalFee: ''
  });

  const fetchCases = async () => {
    try {
      let query = `/cases?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;
      const res = await apiRequest(query);
      if (res.success) {
        setCases(res.cases);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [search, statusFilter, priorityFilter]);

  const openAddModal = async () => {
    try {
      const [clientRes, serviceRes] = await Promise.all([
        apiRequest('/clients'),
        apiRequest('/services')
      ]);
      setClients(clientRes.clients || []);
      setServices(serviceRes.services || []);
      setIsAddModalOpen(true);
    } catch (err) {
      alert('Failed to load clients and services data.');
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/cases', 'POST', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({ clientId: '', serviceId: '', title: '', description: '', priority: 'MEDIUM', totalFee: '' });
        fetchCases();
        alert(`Case ${res.case.caseNumber} created with auto-generated document checklist!`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Compliance Cases..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Compliance Cases</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active filing cases, document verification, payments, and audit execution.</p>
        </div>
        {!isClient && (
          <button
            onClick={openAddModal}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/20 flex items-center transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Case
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Case No, Title, Client Company..."
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
          <option value="DOCUMENTS_PENDING">DOCUMENTS_PENDING</option>
          <option value="DOCUMENTS_RECEIVED">DOCUMENTS_RECEIVED</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
        >
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Case No</th>
                <th className="px-3 py-2.5">Case Title</th>
                <th className="px-3 py-2.5">Client Entity</th>
                <th className="px-3 py-2.5">Service</th>
                <th className="px-3 py-2.5">Priority</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Fee / Outstanding</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3.5 font-bold text-brand-400 font-mono">{c.caseNumber}</td>
                  <td className="px-3 py-3.5 font-semibold text-white max-w-[200px] truncate">{c.title}</td>
                  <td className="px-3 py-3.5 text-slate-200">{c.client?.companyName}</td>
                  <td className="px-3 py-3.5 text-slate-400">{c.service?.name}</td>
                  <td className="px-3 py-3.5"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-3 py-3.5"><StatusBadge status={c.status} type="case" /></td>
                  <td className="px-3 py-3.5 text-right font-mono">
                    <div className="text-slate-200">{formatINR(c.totalFee)}</div>
                    <div className="text-[10px] text-rose-400 font-bold">Bal: {formatINR(c.outstandingAmount)}</div>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Link
                      to={isClient ? `/client/cases/${c.id}` : `/cases/${c.id}`}
                      className="px-3 py-1.5 bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white rounded-lg text-xs font-semibold transition inline-flex items-center"
                    >
                      Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Case */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Compliance Case">
        <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Client Entity *</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            >
              <option value="">-- Choose Client --</option>
              {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.companyName} ({cl.contactPerson})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Compliance Service *</label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => {
                const svc = services.find(s => s.id === e.target.value);
                setFormData({
                  ...formData,
                  serviceId: e.target.value,
                  totalFee: svc ? svc.defaultFee : ''
                });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            >
              <option value="">-- Choose Service --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} (Default Fee: ₹{s.defaultFee})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Case Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="e.g. ISO 9001 Certification 2026 Audit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Agreed Fee (INR ₹)</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="50000"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Create Case & Checklist</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
