import React from 'react';
import { FolderOpen } from 'lucide-react';

export function EmptyState({ title = 'No records found', description = 'There are no items matching your filter or query.', action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
      <div className="p-3 bg-slate-850 rounded-full text-slate-400 mb-3 border border-slate-800">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
