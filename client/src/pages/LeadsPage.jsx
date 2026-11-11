import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { Plus, Building2, User, Mail, Phone, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';

const STAGES = ['NEW', 'CONTACTED', 'PROPOSAL', 'WON', 'LOST'];

export function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    source: 'Website Inquiry',
    description: '',
    notes: ''
  });

  const [convertData, setConvertData] = useState({
    gstin: '',
    pan: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    industry: 'Manufacturing'
  });

  const fetchLeads = async () => {
    try {
      const res = await apiRequest('/leads');
      if (res.success) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/leads', 'POST', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({ name: '', companyName: '', email: '', phone: '', source: 'Website Inquiry', description: '', notes: '' });
        fetchLeads();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusMove = async (leadId, newStatus) => {
    try {
      const res = await apiRequest(`/leads/${leadId}`, 'PUT', { status: newStatus });
      if (res.success) {
        fetchLeads();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openConvertModal = (lead) => {
    setSelectedLead(lead);
    setIsConvertModalOpen(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const res = await apiRequest(`/leads/${selectedLead.id}/convert`, 'POST', convertData);
      if (res.success) {
        setIsConvertModalOpen(false);
        setSelectedLead(null);
        fetchLeads();
        alert(`Lead successfully converted to Client: ${res.client.companyName}!`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Lead Pipeline..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Leads & Sales Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">Manage prospects, track status progression, and convert won leads to active clients.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/20 flex items-center transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Lead
        </button>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage);
          return (
            <div key={stage} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col min-h-[500px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-300 tracking-wider uppercase flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    stage === 'NEW' ? 'bg-blue-400' :
                    stage === 'CONTACTED' ? 'bg-purple-400' :
                    stage === 'PROPOSAL' ? 'bg-amber-400' :
                    stage === 'WON' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}></span>
                  {stage}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {stageLeads.length}
                </span>
              </div>

              {/* Stage Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-[11px] text-slate-600 text-center py-8">No leads in {stage}</div>
                ) : (
                  stageLeads.map((lead) => (
                    <div key={lead.id} className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-white leading-tight">{lead.companyName}</h4>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center"><User className="w-3 h-3 mr-1.5 text-slate-500" />{lead.name}</div>
                        <div className="flex items-center"><Mail className="w-3 h-3 mr-1.5 text-slate-500" />{lead.email}</div>
                        {lead.serviceName && (
                          <div className="text-brand-400 font-medium text-[10px] bg-brand-500/10 px-2 py-0.5 rounded inline-block">
                            {lead.serviceName}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {lead.status === 'WON' ? (
                          lead.convertedClientId ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Client Created
                            </span>
                          ) : (
                            <button
                              onClick={() => openConvertModal(lead)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center transition shadow-sm"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Convert to Client
                            </button>
                          )
                        ) : (
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusMove(lead.id, e.target.value)}
                            className="bg-slate-950 text-[10px] text-slate-300 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                          >
                            {STAGES.map(s => <option key={s} value={s}>Move to {s}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Lead */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Prospect Lead">
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="e.g. Vikas Agarwal"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="e.g. Agarwal Chemicals Pvt Ltd"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="vikas@agarwalchem.com"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="+91 98990 12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Lead Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="Requirements details..."
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Save Lead</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Transactional Lead to Client Conversion */}
      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title="Convert WON Lead to Active Client">
        {selectedLead && (
          <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 space-y-1">
              <p className="font-bold">{selectedLead.companyName}</p>
              <p className="text-[11px] text-slate-300">Contact: {selectedLead.name} ({selectedLead.email})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={convertData.gstin}
                  onChange={(e) => setConvertData({ ...convertData, gstin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  placeholder="27AAACA1234A1Z5"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={convertData.pan}
                  onChange={(e) => setConvertData({ ...convertData, pan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  placeholder="AAACA1234A"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={convertData.city}
                  onChange={(e) => setConvertData({ ...convertData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry</label>
                <input
                  type="text"
                  value={convertData.industry}
                  onChange={(e) => setConvertData({ ...convertData, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsConvertModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Execute Client Conversion
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
