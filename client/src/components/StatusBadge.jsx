import React from 'react';
import { CASE_STATUS_CONFIG, DOC_STATUS_CONFIG, RENEWAL_STATUS_CONFIG } from '../utils/formatters';

export function StatusBadge({ status, type = 'case' }) {
  let configMap = CASE_STATUS_CONFIG;
  if (type === 'document') configMap = DOC_STATUS_CONFIG;
  if (type === 'renewal') configMap = RENEWAL_STATUS_CONFIG;

  const config = configMap[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {config.label}
    </span>
  );
}
