import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { History, Shield } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await apiRequest('/audit-logs');
        if (res.success) {
          setLogs(res.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching System Audit Logs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Audit Log</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable security and operational event trail across leads, cases, documents, and payments.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-3 py-2.5">Target Entity</th>
                <th className="px-3 py-2.5">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3 text-slate-400">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-bold text-slate-200">{log.user?.name || 'System'}</td>
                  <td className="px-3 py-3 text-brand-400">{log.user?.role || 'SYSTEM'}</td>
                  <td className="px-3 py-3 text-emerald-400 font-bold">{log.action}</td>
                  <td className="px-3 py-3 text-slate-300">{log.entity}</td>
                  <td className="px-3 py-3 text-slate-400 truncate max-w-[250px]">{log.metadata || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
