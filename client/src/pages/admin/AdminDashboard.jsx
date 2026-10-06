import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 font-bold">CAR OWNERS</p>
          <h2 className="text-2xl font-black mt-1">1,420</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 font-bold">ACTIVE GARAGES</p>
          <h2 className="text-2xl font-black mt-1 text-green-600">85 Verified</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 font-bold">SOS DISPATCHES</p>
          <h2 className="text-2xl font-black mt-1 text-blue-600">3,890</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 font-bold">TOTAL REVENUE</p>
          <h2 className="text-2xl font-black mt-1 text-amber-600">$42,500</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h3 className="font-bold">Admin Quick Actions</h3>
        <div className="flex gap-4">
          <Link to="/admin/licenses" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold">
            Review Trade License Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
