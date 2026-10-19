import React from 'react';

export default function GarageEarningsPage() {
  const earningsSummary = {
    today: 2450.00,
    thisWeek: 14800.00,
    thisMonth: 62400.00,
    completedJobs: 42
  };

  const payoutHistory = [
    { id: 'PAY-1082', date: 'Oct 18, 2026', jobs: 8, amount: '৳9,800 BDT', status: 'Disbursed (bKash/Bank)' },
    { id: 'PAY-1049', date: 'Oct 11, 2026', jobs: 12, amount: '৳14,500 BDT', status: 'Disbursed (bKash/Bank)' },
    { id: 'PAY-1011', date: 'Oct 04, 2026', jobs: 9, amount: '৳11,200 BDT', status: 'Disbursed (bKash/Bank)' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Workshop Earnings & Revenue Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">Review your income from accepted emergency roadside dispatches and workshop services in ৳ BDT.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Revenue</span>
          <h2 className="text-2xl font-black text-white mt-1">৳{earningsSummary.today.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">This Week</span>
          <h2 className="text-2xl font-black text-emerald-400 mt-1">৳{earningsSummary.thisWeek.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Gross</span>
          <h2 className="text-2xl font-black text-amber-400 mt-1">৳{earningsSummary.thisMonth.toLocaleString()} BDT</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Completed Jobs</span>
          <h2 className="text-2xl font-black text-blue-400 mt-1">{earningsSummary.completedJobs}</h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Recent Payout Settlements</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
            <tr>
              <th className="p-3.5">Settlement ID</th>
              <th className="p-3.5">Cycle Date</th>
              <th className="p-3.5">Jobs Settled</th>
              <th className="p-3.5">Net Amount</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {payoutHistory.map((p, i) => (
              <tr key={i} className="hover:bg-slate-800/40 transition">
                <td className="p-3.5 font-mono text-white font-bold">{p.id}</td>
                <td className="p-3.5">{p.date}</td>
                <td className="p-3.5">{p.jobs} jobs</td>
                <td className="p-3.5 font-bold text-emerald-400">{p.amount}</td>
                <td className="p-3.5 text-right">
                  <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    ✓ {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
