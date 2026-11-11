import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatINR } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { Sliders, Plus, CheckSquare, Layers } from 'lucide-react';

export function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [checklistItemName, setChecklistItemName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Quality Management Systems',
    description: '',
    defaultFee: '',
    renewalPeriodMonths: 12
  });

  const fetchServices = async () => {
    try {
      const res = await apiRequest('/services');
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/services', 'POST', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({ name: '', category: 'Quality Management Systems', description: '', defaultFee: '', renewalPeriodMonths: 12 });
        fetchServices();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!selectedService || !checklistItemName) return;

    try {
      const res = await apiRequest(`/services/${selectedService.id}/checklist`, 'POST', {
        name: checklistItemName,
        isRequired: true
      });
      if (res.success) {
        setChecklistItemName('');
        setSelectedService(null);
        fetchServices();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Compliance Services Catalogue..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Compliance Services & Checklists</h1>
          <p className="text-xs text-slate-400 mt-1">Configure regulatory service templates and auto-generated document checklist items.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div key={svc.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{svc.name}</h3>
                  <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">{svc.category}</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">{formatINR(svc.defaultFee)}</span>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{svc.description}</p>

              {/* Checklist Items list */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  Document Checklist Template ({svc.checklistItems?.length || 0})
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {svc.checklistItems?.map((item) => (
                    <li key={item.id} className="flex items-center text-[11px]">
                      <CheckSquare className="w-3.5 h-3.5 mr-2 text-brand-400 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedService(svc)}
                className="text-xs text-brand-400 hover:underline font-bold flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Checklist Requirement
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Service */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Compliance Service Template">
        <form onSubmit={handleCreateService} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Service Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="e.g. ISO 27001 Information Security"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Retainer Fee (INR ₹)</label>
              <input
                type="number"
                value={formData.defaultFee}
                onChange={(e) => setFormData({ ...formData, defaultFee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="60000"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Save Service</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Checklist Item */}
      <Modal isOpen={Boolean(selectedService)} onClose={() => setSelectedService(null)} title={`Add Checklist Item for ${selectedService?.name}`}>
        <form onSubmit={handleAddChecklistItem} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Checklist Document Name *</label>
            <input
              type="text"
              required
              value={checklistItemName}
              onChange={(e) => setChecklistItemName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="e.g. Fire Safety NOC Certificate"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setSelectedService(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Add to Template</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
