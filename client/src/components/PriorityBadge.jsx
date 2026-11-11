import React from 'react';
import { PRIORITY_CONFIG } from '../utils/formatters';

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority || 'Medium',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}
