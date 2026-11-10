import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUserInvoices, payInvoice } from '../../api/sosApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function DriverInvoicesPage() {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadInvoices = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await getUserInvoices(user.id);
      if (res.success) {
        setInvoices(res.invoices || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useRealtimeEvents(['invoice:updated', 'sos:updated'], loadInvoices);

  const handlePay = async (invoiceId) => {
    setErrorMsg('');
    try {
      await payInvoice(invoiceId, 'bKash / Nagad (Settled)');
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.invoice_id === invoiceId
            ? { ...inv, payment_status: 'Paid', payment_method: 'bKash / Nagad (Settled)' }
            : inv
        )
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment update failed.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Receipts & Digital BDT Invoices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live digital itemized invoices automatically generated when workshops complete service requests.
          </p>
        </div>
        <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
          {invoices.length} Total Invoice{invoices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading invoices from database...</p>
      ) : invoices.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center text-xs text-slate-400">
          No invoices issued yet. Invoices appear here automatically once a workshop completes your SOS or maintenance job.
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isPaid = inv.payment_status === 'Paid' || inv.payment_status === 'Simulated_Success';
            return (
              <div key={inv.invoice_id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">INV-#{inv.invoice_id} (Req #{inv.request_id})</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isPaid
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{inv.issue_description}</h3>
                  <p className="text-xs text-slate-400">
                    Workshop: <strong>{inv.garage_name || 'Verified Workshop'}</strong> | Date: {new Date(inv.issued_at).toLocaleDateString()} | Type: {inv.request_type}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Distance: ~{inv.distance_km || 0} km | Method: {inv.payment_method}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Total Fare</span>
                    <p className="text-2xl font-black text-white">৳{parseFloat(inv.total_amount).toLocaleString()} BDT</p>
                  </div>
                  {!isPaid ? (
                    <button
                      onClick={() => handlePay(inv.invoice_id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md"
                    >
                      Pay via bKash / Nagad →
                    </button>
                  ) : (
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition"
                    >
                      🖨️ Print Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
