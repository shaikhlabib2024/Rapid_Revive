import React, { useState, useEffect, useCallback } from 'react';
import { getAdminDirectory, updateUserStatus, verifyGarage } from '../../api/adminApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [users, setUsers] = useState([]);
  const [garages, setGarages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDirectory = useCallback(async () => {
    try {
      const res = await getAdminDirectory();
      if (res.success) {
        setUsers(res.users || []);
        setGarages(res.garages || []);
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load user and workshop directory.');
    }
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  useRealtimeEvents(['user:updated', 'garage:updated', 'vehicle:updated'], loadDirectory);

  const handleToggleUserStatus = async (u) => {
    const nextStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await updateUserStatus(u.user_id, nextStatus);
      setUsers((prev) =>
        prev.map((row) => (row.user_id === u.user_id ? { ...row, status: nextStatus } : row))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleToggleGarageStatus = async (g) => {
    const nextApprove = !g.is_verified;
    try {
      await verifyGarage(g.garage_id, nextApprove);
      setGarages((prev) =>
        prev.map((row) =>
          row.garage_id === g.garage_id ? { ...row, is_verified: nextApprove ? 1 : 0 } : row
        )
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update workshop status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Users & Garage Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live registered driver accounts and partner workshops from MySQL.
          </p>
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

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {activeTab === 'drivers' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Vehicles</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4">
                    <p className="font-bold text-white">{u.full_name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{u.phone_number || 'N/A'}</td>
                  <td className="p-4 text-slate-300">{u.vehicle_count} Linked</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.status !== 'Suspended'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      {u.status !== 'Suspended' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Workshop & Owner</th>
                <th className="p-4">Trade License & NID</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {garages.map((g) => (
                <tr key={g.garage_id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4">
                    <p className="font-bold text-white">{g.garage_name}</p>
                    <p className="text-[11px] text-slate-400">
                      Owner: {g.owner_name} ({g.phone_number || g.email})
                    </p>
                  </td>
                  <td className="p-4 space-y-1">
                    <span className="font-mono text-amber-400 block">{g.trade_license_no}</span>
                    <span className="font-mono text-blue-400 text-[11px] block">{g.nid_number}</span>
                  </td>
                  <td className="p-4 text-slate-300">{g.address}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      g.is_verified
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : g.verification_status === 'Rejected'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {g.is_verified ? 'Verified' : g.verification_status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleGarageStatus(g)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      {g.is_verified ? 'Revoke' : 'Verify'}
                    </button>
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
