/**
 * Format currency to Indian Rupee (INR) string
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format ISO date string into readable date (e.g. 28 Aug 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Case Status badge styling dictionary
 */
export const CASE_STATUS_CONFIG = {
  DOCUMENTS_PENDING: { label: 'Docs Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  DOCUMENTS_RECEIVED: { label: 'Docs Received', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  SUBMITTED: { label: 'Submitted', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  COMPLETED: { label: 'Completed', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  RENEWAL_DUE: { label: 'Renewal Due', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
};

/**
 * Case Priority badge styling dictionary
 */
export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  HIGH: { label: 'High', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  URGENT: { label: 'Urgent', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
};

/**
 * Document Status styling dictionary
 */
export const DOC_STATUS_CONFIG = {
  PENDING: { label: 'Pending Upload', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  UPLOADED: { label: 'Uploaded', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
};

/**
 * Renewal Status styling dictionary
 */
export const RENEWAL_STATUS_CONFIG = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  EXPIRING_SOON: { label: 'Expiring Soon (< 30d)', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  RENEWAL_DUE: { label: 'Renewal Due (< 7d)', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  EXPIRED: { label: 'Expired', bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' }
};
