import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getGarageEarnings } from '../../api/garageApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function GarageEarningsPage() {
  const { user } = useContext(AuthContext);
  const garageId = user?.garageId || 1;

  const [summary, setSummary] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    completedJobs: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const loadEarnings = useCallback(async () => {
    try {
      const res = await getGarageEarnings(garageId);
      if (res.success) {
        setSummary(res.summary);
        setTransactions(res.transactions || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load workshop earnings.');
    }
  }, [garageId]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  useRealtimeEvents(['invoice:updated', 'sos:updated'], loadEarnings);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Workshop Earnings & Revenue Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Live income aggregated directly from completed dispatches and invoices in MySQL (৳ BDT).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Revenue</span>
          <h2 className="text-2xl font-black text-white mt-1">৳{summary.today.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Last 7 Days</span>
          <h2 className="text-2xl font-black text-emerald-400 mt-1">৳{summary.thisWeek.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">This Month Gross</span>
          <h2 className="text-2xl font-black text-amber-400 mt-1">৳{summary.thisMonth.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Completed Jobs</span>
          <h2 className="text-2xl font-black text-blue-400 mt-1">{summary.completedJobs}</h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Completed Job Invoices</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No completed job invoices recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Customer & Service</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total (BDT)</th>
                <th className="p-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {transactions.map((t) => (
                <tr key={t.invoice_id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-mono font-bold text-slate-300">
                    INV-#{t.invoice_id} (Req #{t.request_id})
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{t.customer_name}</p>
                    <p className="text-[11px] text-slate-400">{t.issue_description}</p>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(t.issued_at).toLocaleDateString()}</td>
                  <td className="p-4 font-black text-emerald-400">
                    ৳{parseFloat(t.total_amount).toLocaleString()} BDT
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      t.payment_status === 'Paid' || t.payment_status === 'Simulated_Success'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {t.payment_status} ({t.payment_method})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
