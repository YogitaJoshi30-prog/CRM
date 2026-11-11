import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CreditCard, IndianRupee, ArrowDownRight } from 'lucide-react';

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await apiRequest('/payments');
        if (res.success) {
          setPayments(res.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Financial Ledger..." />;

  const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Payment Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Audit compliance case payments, bank transfers, and receipts.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <span className="text-[10px] uppercase tracking-wider font-bold block">Total Fee Collected</span>
          <span className="text-lg font-black font-mono">{formatINR(totalCollected)}</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Case Number</th>
                <th className="px-3 py-2.5">Client Company</th>
                <th className="px-3 py-2.5 text-right">Amount (INR ₹)</th>
                <th className="px-3 py-2.5">Payment Method</th>
                <th className="px-3 py-2.5">Reference No</th>
                <th className="px-3 py-2.5">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/50">
                  <td className="px-3 py-3.5 text-slate-400">{formatDate(p.paymentDate)}</td>
                  <td className="px-3 py-3.5 font-bold text-brand-400 font-mono">{p.case?.caseNumber}</td>
                  <td className="px-3 py-3.5 text-slate-200">{p.case?.client?.companyName}</td>
                  <td className="px-3 py-3.5 text-right font-bold text-emerald-400 font-mono">{formatINR(p.amount)}</td>
                  <td className="px-3 py-3.5 text-slate-300">{p.paymentMethod}</td>
                  <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">{p.referenceNumber || '-'}</td>
                  <td className="px-3 py-3.5 text-slate-400">{p.recordedBy?.name || 'Staff'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
