import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FileText, CheckCircle2, ArrowRight, XCircle, Clock, Sparkles, Building2, Sliders } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Conversion Form State
  const [caseTitle, setCaseTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [totalFee, setTotalFee] = useState('');
  const [converting, setConverting] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const res = await apiRequest('/service-requests');
      if (res.success) {
        setRequests(res.serviceRequests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const openReviewModal = (req) => {
    setSelectedRequest(req);
    setStatus(req.status);
    setNotes(req.notes || '');
    setModalOpen(true);
  };

  const openConvertModal = (req) => {
    setSelectedRequest(req);
    setCaseTitle(`${req.service?.name} - ${req.client?.companyName}`);
    setPriority('MEDIUM');
    setTotalFee(req.service?.defaultFee || 0);
    setConvertModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      setMessage('');

      const res = await apiRequest(`/service-requests/${selectedRequest.id}`, 'PUT', {
        status,
        notes
      });

      if (res.success) {
        setMessage('Service request status updated successfully!');
        setModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to update request.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setConverting(true);
      setMessage('');

      const res = await apiRequest(`/service-requests/${selectedRequest.id}/convert`, 'POST', {
        title: caseTitle,
        priority,
        totalFee: Number(totalFee)
      });

      if (res.success) {
        setMessage(`Successfully converted request into Case ${res.case.caseNumber} with auto-generated document checklist!`);
        setConvertModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to convert request to case.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Client Service Requests..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
            <FileText className="w-6 h-6 mr-2.5 text-brand-400" />
            Client Service Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming compliance service requests from clients, evaluate scope, approve requirements, and convert into active Cases.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No client service requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Client Entity</th>
                  <th className="px-4 py-3">Requested Service</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Est. Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3.5 font-bold text-white flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-brand-400 shrink-0" />
                      <div>
                        <div>{r.client?.companyName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{r.client?.contactPerson}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{r.service?.name}</td>
                    <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">{r.description || 'No notes provided'}</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-400">{formatINR(r.service?.defaultFee)}</td>
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
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openReviewModal(r)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition"
                      >
                        Review
                      </button>
                      {r.status !== 'CONVERTED' && (
                        <button
                          onClick={() => openConvertModal(r)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[11px] font-semibold shadow transition inline-flex items-center"
                        >
                          Convert to Case <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Review Service Request - {selectedRequest.client?.companyName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block uppercase">Requested Service</span>
                <span className="text-slate-200 font-bold">{selectedRequest.service?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase">Client Message</span>
                <p className="p-3 bg-slate-950 rounded-xl text-slate-300">{selectedRequest.description || 'No description provided.'}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Request Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl px-3 py-2 text-xs"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-3 text-xs"
                  placeholder="Internal review comments..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Case Modal */}
      {convertModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-brand-400" />
              Convert Request into Official Compliance Case
            </h3>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="text-slate-400">Client Entity: <strong className="text-white">{selectedRequest.client?.companyName}</strong></div>
              <div className="text-slate-400">Compliance Service: <strong className="text-brand-400">{selectedRequest.service?.name}</strong></div>
            </div>

            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Case Title *</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Agreed Fee (INR ₹)</label>
                  <input
                    type="number"
                    value={totalFee}
                    onChange={(e) => setTotalFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl px-3.5 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-[11px] text-brand-300">
                ✨ <strong>Automated Checklist Generation:</strong> All template checklist items for {selectedRequest.service?.name} will be automatically generated into the Case Document checklist.
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={converting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center"
                >
                  {converting ? 'Generating Case...' : 'Create Case & Auto Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
