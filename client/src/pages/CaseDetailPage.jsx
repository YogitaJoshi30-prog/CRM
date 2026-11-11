import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest, apiUpload, apiDownload } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Briefcase,
  FileCheck,
  History,
  MessageSquare,
  CreditCard,
  Upload,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  Lock,
  Globe,
  AlertCircle
} from 'lucide-react';

export function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  const [caseRecord, setCaseRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals & form state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedChecklistItemId, setSelectedChecklistItemId] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedDocToReview, setSelectedDocToReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComment, setReviewComment] = useState('');

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');
  const [commentVisibility, setCommentVisibility] = useState(isClient ? 'CLIENT_VISIBLE' : 'INTERNAL');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT)');
  const [paymentRef, setPaymentRef] = useState('');

  const fetchCaseDetail = async () => {
    try {
      const res = await apiRequest(`/cases/${id}`);
      if (res.success) {
        setCaseRecord(res.case);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  // Handle Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      alert('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document', fileToUpload);
    if (selectedChecklistItemId) {
      formData.append('checklistItemId', selectedChecklistItemId);
    }

    try {
      const res = await apiUpload(`/cases/${id}/documents`, formData);
      if (res.success) {
        setIsUploadModalOpen(false);
        setFileToUpload(null);
        setSelectedChecklistItemId('');
        fetchCaseDetail();
        alert('Document uploaded successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Document Review (Approve/Reject with Mandatory Reason)
  const openReviewModal = (doc) => {
    setSelectedDocToReview(doc);
    setReviewStatus('APPROVED');
    setReviewComment('');
    setIsReviewModalOpen(true);
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
        reviewComment: reviewComment
      });
      if (res.success) {
        setIsReviewModalOpen(false);
        setSelectedDocToReview(null);
        fetchCaseDetail();
        alert(`Document marked as ${reviewStatus}!`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/cases/${id}/comments`, 'POST', {
        message: commentMessage,
        visibility: commentVisibility
      });
      if (res.success) {
        setIsCommentModalOpen(false);
        setCommentMessage('');
        fetchCaseDetail();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Payment Recording
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/cases/${id}/payments`, 'POST', {
        amount: paymentAmount,
        paymentMethod: paymentMethod,
        referenceNumber: paymentRef
      });
      if (res.success) {
        setIsPaymentModalOpen(false);
        setPaymentAmount('');
        setPaymentRef('');
        fetchCaseDetail();
        alert(`Payment of ₹${paymentAmount} recorded successfully!`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Status change for staff
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await apiRequest(`/cases/${id}`, 'PUT', { status: newStatus });
      if (res.success) {
        fetchCaseDetail();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading case workspace..." />;
  if (!caseRecord) return <div className="text-center py-12 text-slate-400">Case not found.</div>;

  return (
    <div className="space-y-6">
      <Link to={isClient ? "/client/cases" : "/cases"} className="inline-flex items-center text-xs font-semibold text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cases
      </Link>

      {/* Case Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded border border-brand-500/20">
              {caseRecord.caseNumber}
            </span>
            <h1 className="text-xl font-extrabold text-white">{caseRecord.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Client: <strong className="text-slate-200">{caseRecord.client?.companyName}</strong> • Service: <strong className="text-slate-200">{caseRecord.service?.name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <PriorityBadge priority={caseRecord.priority} />
          <StatusBadge status={caseRecord.status} type="case" />
          {!isClient && (
            <select
              value={caseRecord.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="DOCUMENTS_PENDING">DOCUMENTS_PENDING</option>
              <option value="DOCUMENTS_RECEIVED">DOCUMENTS_RECEIVED</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="RENEWAL_DUE">RENEWAL_DUE</option>
            </select>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'documents', label: `Documents (${caseRecord.documents?.length || 0})`, icon: FileCheck },
          { id: 'timeline', label: `Timeline (${caseRecord.activities?.length || 0})`, icon: History },
          ...(!isClient ? [{ id: 'notes', label: 'Internal Notes', icon: Lock }] : []),
          { id: 'updates', label: 'Client Updates', icon: Globe },
          { id: 'payments', label: `Payments (${caseRecord.payments?.length || 0})`, icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-bold transition ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm">Scope & Description</h3>
            <p className="text-slate-300 leading-relaxed">{caseRecord.description || 'No additional scope details added.'}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Executive</span>
                <p className="font-semibold text-slate-200 mt-0.5">{caseRecord.assignedStaff?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Operations Manager</span>
                <p className="font-semibold text-slate-200 mt-0.5">{caseRecord.manager?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm">Financial Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Total Fee:</span>
                <strong className="text-white font-mono">{formatINR(caseRecord.totalFee)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Paid:</span>
                <strong className="text-emerald-400 font-mono">{formatINR(caseRecord.amountPaid)}</strong>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                <span className="font-bold">Outstanding:</span>
                <strong className="text-rose-400 font-mono font-bold">{formatINR(caseRecord.outstandingAmount)}</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Renewal Expiry</span>
              <p className="font-mono text-teal-400 font-bold">{formatDate(caseRecord.renewalDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Required Document Checklist</h3>
              <p className="text-xs text-slate-400">Upload and verify required regulatory compliance documents.</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center transition shadow-md"
            >
              <Upload className="w-4 h-4 mr-1.5" /> Upload Document
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Checklist Item / Name</th>
                  <th className="px-3 py-2.5">Uploaded File</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Review Comment</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {caseRecord.documents?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/50">
                    <td className="px-3 py-3 font-semibold text-slate-200">
                      {doc.checklistItem?.name || doc.originalName}
                      {doc.checklistItem?.isRequired && <span className="text-rose-400 ml-1">*</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">
                      {doc.fileName ? doc.originalName : <span className="text-slate-600 italic">Not Uploaded</span>}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={doc.status} type="document" /></td>
                    <td className="px-3 py-3 text-slate-300 text-[11px] max-w-[200px] truncate">
                      {doc.reviewComment || '-'}
                    </td>
                    <td className="px-3 py-3 text-right space-x-2">
                      {doc.fileName && (
                        <button
                          onClick={() => apiDownload(`/documents/${doc.id}/download`, doc.originalName)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isClient && doc.status === 'UPLOADED' && (
                        <button
                          onClick={() => openReviewModal(doc)}
                          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded text-[11px]"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">Chronological Audit Timeline</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            {caseRecord.activities?.map((act) => (
              <div key={act.id} className="relative flex items-start pl-8 text-xs">
                <div className="absolute left-2 top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-slate-950"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-white font-semibold">{act.action}</strong>
                    <span className="text-[10px] text-slate-500">{formatDate(act.createdAt)}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">By {act.user?.name || 'System'} ({act.user?.role || 'SYSTEM'})</p>
                  {act.metadata && (
                    <div className="mt-1 font-mono text-[10px] text-slate-500 bg-slate-950 p-1.5 rounded border border-slate-850">
                      {act.metadata}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4 & 5: NOTES & UPDATES */}
      {(activeTab === 'notes' || activeTab === 'updates') && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              {activeTab === 'notes' ? 'Staff Internal Notes' : 'Client-Visible Communication Updates'}
            </h3>
            <button
              onClick={() => {
                setCommentVisibility(activeTab === 'notes' ? 'INTERNAL' : 'CLIENT_VISIBLE');
                setIsCommentModalOpen(true);
              }}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center transition"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add {activeTab === 'notes' ? 'Internal Note' : 'Client Update'}
            </button>
          </div>

          <div className="space-y-3">
            {caseRecord.comments
              ?.filter(c => activeTab === 'notes' ? c.visibility === 'INTERNAL' : c.visibility === 'CLIENT_VISIBLE')
              .map((com) => (
                <div key={com.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-white">{com.author?.name} ({com.author?.role})</span>
                    <span>{formatDate(com.createdAt)}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{com.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 6: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Payment Ledger</h3>
              <p className="text-xs text-slate-400">Record and review financial transactions for this case.</p>
            </div>
            {!isClient && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Record Payment
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Method</th>
                  <th className="px-3 py-2.5">Reference No</th>
                  <th className="px-3 py-2.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {caseRecord.payments?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50">
                    <td className="px-3 py-3 text-slate-400">{formatDate(p.paymentDate)}</td>
                    <td className="px-3 py-3 font-bold text-emerald-400 font-mono">{formatINR(p.amount)}</td>
                    <td className="px-3 py-3 text-slate-200">{p.paymentMethod}</td>
                    <td className="px-3 py-3 text-slate-300 font-mono">{p.referenceNumber || '-'}</td>
                    <td className="px-3 py-3 text-slate-400">{p.recordedBy?.name || 'Staff'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Document Upload */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Compliance Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Checklist Item</label>
            <select
              value={selectedChecklistItemId}
              onChange={(e) => setSelectedChecklistItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
            >
              <option value="">-- General Document --</option>
              {caseRecord.service?.checklistItems?.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select File (PDF, DOCX, PNG, JPG max 15MB) *</label>
            <input
              type="file"
              required
              onChange={(e) => setFileToUpload(e.target.files[0])}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Upload File</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Document Review (Approve / Reject with MANDATORY Reason) */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Review Uploaded Document">
        {selectedDocToReview && (
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p className="font-bold text-white">{selectedDocToReview.originalName}</p>
              <p className="text-slate-400 text-[11px]">Checklist: {selectedDocToReview.checklistItem?.name || 'General'}</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Review Decision *</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-emerald-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="reviewStatus"
                    value="APPROVED"
                    checked={reviewStatus === 'APPROVED'}
                    onChange={() => setReviewStatus('APPROVED')}
                  />
                  <span>Approve Document</span>
                </label>
                <label className="flex items-center space-x-2 text-rose-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="reviewStatus"
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
                placeholder={reviewStatus === 'REJECTED' ? "Specify exact rejection reason (e.g. Missing signature on page 4)..." : "Optional verification note..."}
              />
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Save Review</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Add Comment */}
      <Modal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)} title="Add Comment / Update">
        <form onSubmit={handleAddComment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Message *</label>
            <textarea
              rows={4}
              required
              value={commentMessage}
              onChange={(e) => setCommentMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="Write update or note..."
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsCommentModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg">Post Update</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Payment */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment Transaction">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Payment Amount (INR ₹) *</label>
            <input
              type="number"
              required
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              placeholder="15000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              >
                <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                <option value="RTGS">RTGS</option>
                <option value="UPI / NetBanking">UPI / NetBanking</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reference Number</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                placeholder="NEFT-AXIS-99210"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
