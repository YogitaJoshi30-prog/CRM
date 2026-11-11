import React, { useState, useEffect } from 'react';
import { apiRequest, apiDownload } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FileCheck, Download, Search, CheckCircle2, XCircle } from 'lucide-react';

export function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedDocToReview, setSelectedDocToReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComment, setReviewComment] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await apiRequest('/dashboard/summary');
      if (res.success && res.tables?.overdueDocuments) {
        setDocuments(res.tables.overdueDocuments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openReviewModal = (doc) => {
    setSelectedDocToReview(doc);
    setReviewStatus('APPROVED');
    setReviewComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewStatus === 'REJECTED' && (!reviewComment || !reviewComment.trim())) {
      alert('Rejection reason is mandatory when rejecting a document!');
      return;
    }

    try {
      const res = await apiRequest(`/documents/${selectedDocToReview.id}/review`, 'PUT', {
        status: reviewStatus,
        reviewComment
      });
      if (res.success) {
        setSelectedDocToReview(null);
        fetchDocuments();
        alert(`Document updated to ${reviewStatus}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Document Center..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Document Repository & Verification</h1>
        <p className="text-xs text-slate-400 mt-1">Review uploaded regulatory proof documents, approve submissions, or reject with mandatory reasons.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Document Name</th>
                <th className="px-3 py-2.5">Case Number</th>
                <th className="px-3 py-2.5">Client Company</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3.5 font-bold text-white">{doc.originalName || doc.checklistItem?.name}</td>
                  <td className="px-3 py-3.5 font-mono text-brand-400">{doc.case?.caseNumber}</td>
                  <td className="px-3 py-3.5 text-slate-200">{doc.case?.client?.companyName}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={doc.status} type="document" /></td>
                  <td className="px-3 py-3.5 text-right space-x-2">
                    {doc.fileName && (
                      <button
                        onClick={() => apiDownload(`/documents/${doc.id}/download`, doc.originalName)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition inline-flex items-center"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download
                      </button>
                    )}
                    <button
                      onClick={() => openReviewModal(doc)}
                      className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded text-xs transition"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={Boolean(selectedDocToReview)} onClose={() => setSelectedDocToReview(null)} title="Review Document">
        {selectedDocToReview && (
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p className="font-bold text-white">{selectedDocToReview.originalName}</p>
              <p className="text-slate-400 text-[11px]">Case: {selectedDocToReview.case?.caseNumber}</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Decision *</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-emerald-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="revStatus"
                    value="APPROVED"
                    checked={reviewStatus === 'APPROVED'}
                    onChange={() => setReviewStatus('APPROVED')}
                  />
                  <span>Approve Document</span>
                </label>
                <label className="flex items-center space-x-2 text-rose-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="revStatus"
                    value="REJECTED"
                    checked={reviewStatus === 'REJECTED'}
                    onChange={() => setReviewStatus('REJECTED')}
                  />
                  <span>Reject Document</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Review Comment {reviewStatus === 'REJECTED' && <span className="text-rose-400 font-bold">(MANDATORY for Rejection) *</span>}
              </label>
              <textarea
                rows={3}
                required={reviewStatus === 'REJECTED'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder={reviewStatus === 'REJECTED' ? "Provide clear rejection rationale..." : "Verification comment..."}
              />
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button type="button" onClick={() => setSelectedDocToReview(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Save Review</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
