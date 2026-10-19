import React, { useState } from 'react';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [users, setUsers] = useState([
    { id: 101, name: 'Alex Rivera', email: 'alex@example.com', role: 'Car Owner', phone: '01922-334455', status: 'Active', vehicles: 2 },
    { id: 102, name: 'Tariq Hasan', email: 'tariq@example.com', role: 'Car Owner', phone: '01711-998877', status: 'Active', vehicles: 1 },
    { id: 103, name: 'Farhan Kabir', email: 'farhan@example.com', role: 'Car Owner', phone: '01833-221100', status: 'Active', vehicles: 3 }
  ]);

  const [garages, setGarages] = useState([
    { id: 201, name: 'MotorFix Workshop', owner: 'Kabir Hossain', address: 'Block C, Bashundhara', status: 'Verified', license: 'TL-2026-9901', nid: 'NID-1985261049912' },
    { id: 202, name: 'Apex Auto Care', owner: 'Mahmud Hasan', address: '300 Feet Road, Dhaka', status: 'Verified', license: 'TL-2026-9043', nid: 'NID-1991261099431' },
    { id: 203, name: 'Dhaka City Towing', owner: 'Shakil Mia', address: 'Block G, Bashundhara', status: 'Under Review', license: 'TL-2026-8812', nid: 'NID-1980261088319' }
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const toggleGarageStatus = (id) => {
    setGarages(garages.map(g => g.id === id ? { ...g, status: g.status === 'Verified' ? 'Suspended' : 'Verified' } : g));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Users & Garage Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Supervise registered driver accounts and verified partner workshops.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'drivers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Car Owners ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('garages')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'garages' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Garages ({garages.length})
          </button>
        </div>
      </div>

      {activeTab === 'drivers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Driver Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Vehicles</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-white">#{u.id}</td>
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4 text-slate-300">{u.phone}</td>
                  <td className="p-4 text-slate-300">{u.vehicles} linked</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      u.status === 'Active' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400' : 'bg-rose-950/80 border-rose-700 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className="text-[11px] font-bold px-3 py-1 rounded-xl transition border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-4">Garage ID</th>
                <th className="p-4">Workshop Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Trade License & NID</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {garages.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-white">#{g.id}</td>
                  <td className="p-4 font-bold text-white">{g.name}</td>
                  <td className="p-4 text-slate-300">{g.owner}</td>
                  <td className="p-4 space-y-1">
                    <span className="font-mono text-amber-400 font-bold block text-[11px]">{g.license}</span>
                    <span className="font-mono text-blue-400 font-bold block text-[11px]">{g.nid}</span>
                  </td>
                  <td className="p-4 text-slate-400">{g.address}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      g.status === 'Verified' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400' : 'bg-amber-950/80 border-amber-700 text-amber-400'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleGarageStatus(g.id)}
                      className="text-[11px] font-bold px-3 py-1 rounded-xl transition border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {g.status === 'Verified' ? 'Revoke' : 'Re-verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
