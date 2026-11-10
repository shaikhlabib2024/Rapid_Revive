import React, { useState, useEffect, useCallback } from 'react';
import { getPendingVerifications, verifyGarage } from '../../api/adminApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function LicenseAudit() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  const loadVerifications = useCallback(async () => {
    try {
      const res = await getPendingVerifications();
      if (res.success) {
        setApplications(
          (res.garages || []).map((g) => ({
            id: g.garage_id,
            name: g.garage_name,
            owner: g.owner_name || 'Business Owner',
            licenseNo: g.trade_license_no,
            nidNo: g.nid_number,
            phone: g.phone_number || 'N/A',
            address: g.address || 'Dhaka'
          }))
        );
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load pending verifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  useRealtimeEvents(['garage:updated'], loadVerifications);

  const handleVerify = async (id, approve) => {
    setErrorMsg('');
    setNotice('');
    try {
      await verifyGarage(id, approve);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setNotice(
        approve
          ? '✓ Workshop approved in database and activated for live dispatch!'
          : 'Workshop verification marked as rejected in database.'
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update garage verification.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Workshop Verification Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit both Municipal Trade License and National ID (NID) before approving new workshops.
          </p>
        </div>
        <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-800">
          {applications.length} Pending Dual Audits
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {notice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-bold">
          {notice}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading verification queue...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            ✓ Verification queue is completely clear. All registered workshops are verified.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Workshop</th>
                <th className="p-4">Owner & Phone</th>
                <th className="p-4">Municipal Trade License</th>
                <th className="p-4">National ID (NID)</th>
                <th className="p-4">Workshop Address</th>
                <th className="p-4 text-right">Dual Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-bold text-white">{app.name}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-200">{app.owner}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{app.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-amber-400 font-bold bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded-lg text-[11px]">
                      {app.licenseNo}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-blue-400 font-bold bg-blue-950/50 border border-blue-800/60 px-2 py-0.5 rounded-lg text-[11px]">
                      {app.nidNo}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 max-w-xs">{app.address}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleVerify(app.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Approve Both
                    </button>
                    <button
                      onClick={() => handleVerify(app.id, false)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Reject
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
