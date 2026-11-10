import React, { useState, useEffect, useCallback } from 'react';
import { getLiveDispatches } from '../../api/adminApi';
import { cancelSosRequest } from '../../api/sosApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

const ACTIVE_STATUSES = ['Pending', 'Accepted', 'Dispatched', 'On-Site'];

const STATUS_BADGE = {
  Pending: 'bg-rose-950/90 text-rose-300 border-rose-700',
  Accepted: 'bg-amber-950/90 text-amber-300 border-amber-700',
  Dispatched: 'bg-blue-950/90 text-blue-300 border-blue-700',
  'On-Site': 'bg-purple-950/90 text-purple-300 border-purple-700',
  Completed: 'bg-emerald-950/90 text-emerald-300 border-emerald-700',
  Cancelled: 'bg-slate-800 text-slate-400 border-slate-700'
};

export default function AdminDispatchesPage() {
  const [dispatches, setDispatches] = useState([]);
  const [dispatchHistory, setDispatchHistory] = useState([]);
  const [filterTab, setFilterTab] = useState('ongoing');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDispatches = useCallback(async () => {
    try {
      const res = await getLiveDispatches();
      if (res.success) {
        setDispatches(res.dispatches || []);
        setDispatchHistory(res.dispatchHistory || []);
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load live dispatches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDispatches();
    const interval = setInterval(loadDispatches, 10000);
    return () => clearInterval(interval);
  }, [loadDispatches]);

  useRealtimeEvents(['sos:created', 'sos:updated', 'invoice:updated'], loadDispatches);

  const handleForceCancel = async (requestId) => {
    if (!window.confirm(`Cancel dispatch #${requestId}?`)) return;
    try {
      await cancelSosRequest(requestId);
      loadDispatches();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel dispatch.');
    }
  };

  const countByStatus = (status) => dispatches.filter((d) => d.status === status).length;
  const ongoingCount = dispatches.filter((d) => ACTIVE_STATUSES.includes(d.status)).length;
  const completedCount = countByStatus('Completed');
  const cancelledCount = countByStatus('Cancelled');

  const q = search.trim().toLowerCase();

  const filtered = dispatches.filter((d) => {
    if (filterTab === 'ongoing' && !ACTIVE_STATUSES.includes(d.status)) return false;
    if (filterTab === 'completed' && d.status !== 'Completed') return false;
    if (filterTab === 'cancelled' && d.status !== 'Cancelled') return false;

    if (!q) return true;
    return (
      String(d.request_id).includes(q) ||
      (d.customer_name || '').toLowerCase().includes(q) ||
      (d.garage_name || '').toLowerCase().includes(q) ||
      (d.issue_description || '').toLowerCase().includes(q) ||
      (d.location_name || '').toLowerCase().includes(q)
    );
  });

  const filteredHistory = dispatchHistory.filter((h) => {
    if (!q) return true;
    return (
      String(h.request_id).includes(q) ||
      String(h.dispatch_id).includes(q) ||
      (h.customer_name || '').toLowerCase().includes(q) ||
      (h.garage_name || '').toLowerCase().includes(q) ||
      (h.location_name || '').toLowerCase().includes(q) ||
      (h.current_status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Operations & Dispatch Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor ongoing dispatches and inspect the permanent <code className="text-slate-300">dispatches</code> audit log in MySQL.
          </p>
        </div>

        <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          SSE Live Feed ({ongoingCount} Ongoing)
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* LIVE STAGE COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-rose-400 uppercase">Pending</p>
          <p className="text-2xl font-black text-white mt-1">{countByStatus('Pending')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Accepted</p>
          <p className="text-2xl font-black text-white mt-1">{countByStatus('Accepted')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-blue-400 uppercase">Dispatched</p>
          <p className="text-2xl font-black text-white mt-1">{countByStatus('Dispatched')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-purple-400 uppercase">On-Site</p>
          <p className="text-2xl font-black text-white mt-1">{countByStatus('On-Site')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Completed</p>
          <p className="text-2xl font-black text-white mt-1">{completedCount}</p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setFilterTab('ongoing')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'ongoing' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ongoing ({ongoingCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'completed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilterTab('cancelled')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'cancelled' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({dispatches.length})
          </button>
          <button
            onClick={() => setFilterTab('history')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'history' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 Dispatch Record Log ({dispatchHistory.length})
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search #ID, driver, workshop, or location..."
          className="w-full md:w-72 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {filterTab === 'history' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No dispatch audit records logged yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Log #</th>
                  <th className="p-4">Request</th>
                  <th className="p-4">Customer & Location</th>
                  <th className="p-4">Workshop & Mechanic</th>
                  <th className="p-4">Transition</th>
                  <th className="p-4">Actor & Notes</th>
                  <th className="p-4 text-right">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredHistory.map((h) => (
                  <tr key={h.dispatch_id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-slate-300">DSP-#{h.dispatch_id}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-white">Req #{h.request_id}</span>
                      <p className="text-[11px] text-slate-400">{h.request_type} — {h.issue_description}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{h.customer_name}</p>
                      <p className="text-[11px] text-amber-300">📍 {h.location_name}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{h.garage_name || 'Unassigned'}</p>
                      {h.mechanic_name && <p className="text-[11px] text-blue-300">👷 {h.mechanic_name}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {h.previous_status && (
                          <>
                            <span className="text-[10px] text-slate-400">{h.previous_status}</span>
                            <span className="text-slate-500">→</span>
                          </>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          STATUS_BADGE[h.current_status] || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {h.current_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{h.action_by_role}</span>
                      <span className="text-[11px] text-slate-300">{h.notes || '—'}</span>
                    </td>
                    <td className="p-4 text-right text-[11px] text-slate-400 font-mono">
                      {new Date(h.recorded_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading live dispatches from MySQL...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No dispatches matching this filter right now.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Request</th>
                  <th className="p-4">Customer & Vehicle</th>
                  <th className="p-4">Breakdown Location Name</th>
                  <th className="p-4">Assigned Workshop</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Fare / Payment</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filtered.map((d) => {
                  const isActive = ACTIVE_STATUSES.includes(d.status);
                  return (
                    <tr key={d.request_id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 align-top">
                        <span className="font-mono font-bold text-white block">#{d.request_id}</span>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.request_type === 'SOS'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                        }`}>
                          {d.request_type}
                        </span>
                        <p className="text-[11px] text-slate-300 font-semibold mt-1">{d.issue_description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(d.created_at).toLocaleString()}
                        </p>
                      </td>

                      <td className="p-4 align-top">
                        <p className="font-bold text-white">{d.customer_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{d.customer_phone || 'N/A'}</p>
                        {d.make_model && (
                          <p className="text-[11px] text-slate-300 mt-1">
                            🚘 {d.make_model} ({d.license_plate})
                          </p>
                        )}
                      </td>

                      <td className="p-4 align-top max-w-xs">
                        <p className="text-amber-300 font-semibold">📍 {d.location_name || 'N/A'}</p>
                        {d.scheduled_date && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            📅 {d.scheduled_date} ({d.scheduled_time})
                          </p>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <p className="font-bold text-white">{d.garage_name || 'Unassigned'}</p>
                        <p className="text-[11px] text-slate-400">{d.garage_address || ''}</p>
                        {d.garage_phone && (
                          <p className="text-[11px] text-slate-400 font-mono">📞 {d.garage_phone}</p>
                        )}
                        {d.mechanic_name && (
                          <p className="text-[11px] text-blue-300 mt-1">👷 {d.mechanic_name}</p>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                          STATUS_BADGE[d.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>

                      <td className="p-4 align-top">
                        <p className="font-black text-emerald-400">
                          ৳{parseFloat(d.estimated_cost || 0).toLocaleString()} BDT
                        </p>
                        {d.invoice_id && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            INV-#{d.invoice_id}: {d.payment_status}
                          </span>
                        )}
                      </td>

                      <td className="p-4 align-top text-right">
                        {isActive ? (
                          <button
                            onClick={() => handleForceCancel(d.request_id)}
                            className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded-lg text-[11px] font-bold transition"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
