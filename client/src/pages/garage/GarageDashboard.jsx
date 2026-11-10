import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getIncomingRequests, updateJobStatus, getGarageStatus } from '../../api/garageApi';
import { getPlatformPricing } from '../../api/sosApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function GarageDashboard() {
  const { user } = useContext(AuthContext);
  const garageId = user?.garageId || 1;

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [garageInfo, setGarageInfo] = useState(null);
  const [pricing, setPricing] = useState({ basePrice: 400, perKmRate: 45 });
  const [errorMsg, setErrorMsg] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const [reqRes, gRes, pRes] = await Promise.all([
        getIncomingRequests(garageId),
        getGarageStatus(garageId),
        getPlatformPricing()
      ]);

      if (reqRes.success) {
        const all = reqRes.requests || [];
        setPendingRequests(all.filter((r) => r.status === 'Pending'));
        setActiveJobs(all.filter((r) => ['Accepted', 'Dispatched', 'On-Site'].includes(r.status)));
      }
      if (gRes.success && gRes.garage) {
        setGarageInfo(gRes.garage);
      }
      if (pRes.success && pRes.pricing) {
        setPricing({ basePrice: pRes.pricing.basePrice, perKmRate: pRes.pricing.perKmRate });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to sync dispatch queue from database.');
    }
  }, [garageId]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 10000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  useRealtimeEvents(['sos:created', 'sos:updated', 'garage:updated', 'settings:updated'], loadRequests);

  const handleAccept = async (req) => {
    setErrorMsg('');
    try {
      await updateJobStatus(req.request_id, 'Accepted');
      loadRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (reqId) => {
    setErrorMsg('');
    try {
      await updateJobStatus(reqId, 'Cancelled');
      loadRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const handleUpdateStatus = async (job, newStatus) => {
    setErrorMsg('');
    setStatusNotice('');
    try {
      await updateJobStatus(job.request_id, newStatus);
      if (newStatus === 'Completed') {
        setStatusNotice(`✓ Job #${job.request_id} completed and ৳${parseFloat(job.estimated_cost || 0).toLocaleString()} BDT invoice generated in database.`);
      }
      loadRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      {errorMsg && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {statusNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-2xl text-xs font-bold">
          {statusNotice}
        </div>
      )}

      {/* GARAGE STATUS HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-wrap justify-between items-center shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              {garageInfo?.garage_name || user?.garageName || user?.fullName || 'Workshop'}
            </h1>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              garageInfo?.is_verified
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                : garageInfo?.verification_status === 'Rejected'
                ? 'bg-rose-950/80 border-rose-700 text-rose-400'
                : 'bg-amber-950/80 border-amber-700 text-amber-300'
            }`}>
              {garageInfo?.is_verified
                ? '✓ Verified Partner'
                : garageInfo?.verification_status === 'Rejected'
                ? '✕ Verification Rejected'
                : '⏳ Pending Admin Verification'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            📍 {garageInfo?.address || user?.address || 'Dhaka'} | Trade License: {garageInfo?.trade_license_no || user?.tradeLicenseNo || 'N/A'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Standard Callout Rate</span>
          <span className="text-lg font-black text-emerald-400">
            ৳{pricing.basePrice} BDT + ৳{pricing.perKmRate}/km
          </span>
        </div>
      </div>

      {/* LIVE INCOMING PENDING REQUESTS */}
      {pendingRequests.map((req) => (
        <div key={req.request_id} className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-800/80 p-6 md:p-8 rounded-3xl shadow-2xl space-y-4">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="bg-amber-950 text-amber-300 border border-amber-700 px-3 py-0.5 rounded-full text-xs font-mono font-bold">
                🚨 INCOMING {req.request_type} #{req.request_id}
              </span>
              <h2 className="text-2xl font-black text-white">{req.issue_description}</h2>
              <p className="text-xs text-slate-300">
                Customer: <strong className="text-white">{req.full_name}</strong> ({req.vehicle_info || 'Registered Vehicle'}) | 📞 Phone:{' '}
                <strong className="text-white">{req.phone_number || 'N/A'}</strong>
              </p>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl inline-block text-xs text-amber-200">
                <span>
                  📍 <strong>Breakdown Landmark:</strong> {req.location_name || 'Bashundhara R/A, Dhaka'}
                  {req.scheduled_date ? ` | 📅 ${req.scheduled_date} (${req.scheduled_time})` : ''}
                </span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Estimated Total Fare</span>
              <h2 className="text-2xl font-black text-emerald-400">
                ৳{parseFloat(req.estimated_cost || 0).toLocaleString()} BDT
              </h2>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => handleReject(req.request_id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-slate-700 transition"
                >
                  Pass Call
                </button>
                <button
                  onClick={() => handleAccept(req)}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shadow-lg transition"
                >
                  Accept SOS Call
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ACTIVE ACCEPTED / DISPATCHED / ON-SITE JOBS */}
      {activeJobs.map((activeJob) => (
        <div key={activeJob.request_id} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                Active Job #{activeJob.request_id} ({activeJob.request_type})
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">{activeJob.issue_description}</h3>
              <p className="text-xs text-slate-300">
                Driver: {activeJob.full_name} ({activeJob.phone_number || 'N/A'}) | 📍 Location:{' '}
                <span className="text-amber-300">{activeJob.location_name || 'Dhaka'}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Lifecycle State:</span>
              <p className="text-base font-bold text-emerald-400">{activeJob.status}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => handleUpdateStatus(activeJob, 'Dispatched')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                activeJob.status === 'Dispatched'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              1. Mechanic Dispatched
            </button>
            <button
              onClick={() => handleUpdateStatus(activeJob, 'On-Site')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                activeJob.status === 'On-Site'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              2. Arrived On-Site
            </button>
            <button
              onClick={() => handleUpdateStatus(activeJob, 'Completed')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              3. Complete & Generate Invoice (৳{parseFloat(activeJob.estimated_cost || 0).toLocaleString()} BDT)
            </button>
          </div>
        </div>
      ))}

      {pendingRequests.length === 0 && activeJobs.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-3xl text-center space-y-2">
          <p className="text-3xl">📡</p>
          <h3 className="text-base font-bold text-white">Live Roadside Dispatch Radar Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your workshop is listening to live MySQL & SSE dispatch events. As soon as a driver sends an SOS request or maintenance booking, it appears here immediately.
          </p>
        </div>
      )}
    </div>
  );
}
