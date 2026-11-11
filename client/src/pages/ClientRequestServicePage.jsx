import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Send, FilePlus, Sparkles, CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function ClientRequestServicePage() {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [servicesRes, requestsRes] = await Promise.all([
        apiRequest('/services'),
        apiRequest('/service-requests')
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.services.filter(s => s.isActive));
        if (servicesRes.services.length > 0) {
          setSelectedServiceId(servicesRes.services[0].id);
        }
      }

      if (requestsRes.success) {
        setRequests(requestsRes.serviceRequests);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to load services data.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setErrorMessage('Please select a compliance service.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await apiRequest('/service-requests', 'POST', {
        serviceId: selectedServiceId,
        description
      });

      if (res.success) {
        setSuccessMessage('Your service request has been submitted successfully! Our compliance team will review it shortly.');
        setDescription('');
        // Refresh list
        const updatedRes = await apiRequest('/service-requests');
        if (updatedRes.success) {
          setRequests(updatedRes.serviceRequests);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit service request.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  if (loading) return <LoadingSpinner text="Loading Compliance Services..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <FilePlus className="w-6 h-6 mr-2.5 text-teal-400" />
          Request New Compliance Service
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a compliance service for your business entity. Our compliance officers will review your request, prepare the proposal, and initiate your official case.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-xs flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-teal-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-teal-400" /> Service Request Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Compliance Service *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category || 'General'}) - Default Fee: {formatINR(s.defaultFee)}
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{selectedService.name}</span>
                  <span className="text-teal-400">{formatINR(selectedService.defaultFee)}</span>
                </div>
                <p className="text-xs text-slate-400">{selectedService.description || 'Standard compliance filing & audit workflow.'}</p>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Renewal Period: Every {selectedService.renewalPeriodMonths || 12} Months
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Request Details & Requirements (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe any specific timeline requirements, multi-location details, or scope requests..."
                className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Request...' : 'Submit Service Request'}</span>
            </button>
          </form>
        </div>

        {/* Informational Guidance Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center text-teal-400">
              <Clock className="w-4 h-4 mr-2" /> Request Workflow
            </h3>
            <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
              <li><strong className="text-white">Submit Request:</strong> Select the required service above.</li>
              <li><strong className="text-white">Staff Review:</strong> Our compliance manager reviews details & scope.</li>
              <li><strong className="text-white">Case Activation:</strong> Once approved, an official Case is generated.</li>
              <li><strong className="text-white">Upload Checklist:</strong> Track checklist & upload files under <em>My Cases</em>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Submitted Requests History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-teal-400" /> Submitted Service Requests History
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No service requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Service Name</th>
                  <th className="px-4 py-3">Details / Notes</th>
                  <th className="px-4 py-3">Est. Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3.5 font-bold text-white">{r.service?.name}</td>
                    <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate">{r.description || 'No additional notes'}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{formatINR(r.service?.defaultFee)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        r.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        r.status === 'APPROVED' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                        r.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
