import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getIncomingRequests, updateJobStatus } from '../../api/garageApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function GarageJobsPage() {
  const { user } = useContext(AuthContext);
  const garageId = user?.garageId || 1;
  const [jobs, setJobs] = useState([]);
  const [mechanicInputs, setMechanicInputs] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      const res = await getIncomingRequests(garageId);
      if (res.success) {
        setJobs(res.requests || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load jobs from database.');
    }
  }, [garageId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useRealtimeEvents(['sos:created', 'sos:updated'], loadJobs);

  const handleUpdateStatus = async (job, newStatus) => {
    setErrorMsg('');
    setNotice('');
    const mechanicName = mechanicInputs[job.request_id] ?? job.mechanic_name ?? 'Assigned Field Mechanic';
    try {
      await updateJobStatus(job.request_id, newStatus, mechanicName);
      if (newStatus === 'Completed') {
        setNotice(`✓ Job #${job.request_id} completed and digital BDT invoice saved to database!`);
      }
      loadJobs();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Dispatch Jobs & Mechanics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deploy technicians, review customer landmarks, and update job lifecycles in MySQL in real time.
          </p>
        </div>
        <span className="bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 px-3 py-1 rounded-full">
          {jobs.length} Active Queue
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

      {jobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-sm">
          ✓ No active jobs currently in queue.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.request_id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      REQ-#{job.request_id} ({job.request_type})
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'On-Site'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : job.status === 'Dispatched'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{job.issue_description}</h3>
                  <p className="text-xs text-slate-300">
                    Customer: <strong>{job.full_name}</strong> ({job.phone_number || 'N/A'})
                    {job.vehicle_info ? ` | Vehicle: ${job.vehicle_info}` : ''}
                  </p>
                  <p className="text-xs text-amber-300">
                    📍 {job.location_name || 'Dhaka'}
                    {job.scheduled_date ? ` | 📅 ${job.scheduled_date} (${job.scheduled_time})` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Total Fare</span>
                  <p className="text-xl font-black text-emerald-400">
                    ৳{parseFloat(job.estimated_cost || 0).toLocaleString()} BDT
                  </p>
                  <p className="text-[11px] text-slate-400">~{job.distance_km || 0} km away</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Mechanic:</span>
                  <input
                    type="text"
                    placeholder="Assign mechanic name..."
                    value={mechanicInputs[job.request_id] ?? job.mechanic_name ?? ''}
                    onChange={(e) =>
                      setMechanicInputs({ ...mechanicInputs, [job.request_id]: e.target.value })
                    }
                    className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(job, 'Accepted')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Accept Job
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(job, 'Dispatched')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Mechanic Dispatched
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(job, 'On-Site')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Arrived On-Site
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(job, 'Completed')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    ✓ Mark Completed & Bill
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
