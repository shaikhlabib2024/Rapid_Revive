import React, { useState } from 'react';

export default function DriverInvoicesPage() {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2026-9042',
      service: 'Flat Tire Replacement & Puncture Fix',
      garage: 'MotorFix Workshop',
      date: 'Oct 19, 2026',
      baseFee: 400.00,
      distanceKm: 3.0,
      distanceRate: 45.00,
      total: 535.00,
      status: 'Paid',
      paymentMethod: 'Simulated Card / bKash'
    },
    {
      id: 'INV-2026-8819',
      service: 'Flatbed Towing Service',
      garage: 'Apex Auto Care',
      date: 'Oct 12, 2026',
      baseFee: 1500.00,
      distanceKm: 6.2,
      distanceRate: 45.00,
      total: 1779.00,
      status: 'Unpaid',
      paymentMethod: 'Cash on Delivery (Pending)'
    }
  ]);

  const handlePay = (id) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid', paymentMethod: 'bKash / Nagad (Settled)' } : inv));
    alert('Invoice payment settled successfully via simulated BDT gateway!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Digital Invoices & Service Receipts</h1>
        <p className="text-xs text-slate-400 mt-1">Itemized distance-based fare receipts calculated in local Bangladeshi Taka (৳ BDT).</p>
      </div>

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-wrap justify-between items-start border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                  {inv.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{inv.service}</h3>
                <p className="text-xs text-slate-400">Workshop: {inv.garage} | {inv.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  inv.status === 'Paid'
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                    : 'bg-amber-950/80 border-amber-700 text-amber-400'
                }`}>
                  ● {inv.status.toUpperCase()}
                </span>
                <h2 className="text-xl font-black text-white mt-1">৳{inv.total.toFixed(2)} BDT</h2>
              </div>
            </div>

            {/* ITEMIZED BDT BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950/70 rounded-2xl text-xs border border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Base Callout Fee:</span>
                <span className="font-bold text-white">৳{inv.baseFee.toFixed(2)} BDT</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Distance Rate ({inv.distanceKm} km @ ৳45/km):</span>
                <span className="font-bold text-white">৳{(inv.distanceKm * inv.distanceRate).toFixed(2)} BDT</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Settlement Method:</span>
                <span className="font-bold text-slate-300">{inv.paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-bold transition"
              >
                🖨️ Print Receipt
              </button>
              {inv.status !== 'Paid' && (
                <button
                  onClick={() => handlePay(inv.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-xl text-xs font-bold transition shadow"
                >
                  Pay Now (৳{inv.total.toFixed(2)})
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
