import React, { useState } from 'react';

export default function GarageJobsPage() {
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-8812',
      customer: 'Alex Rivera',
      phone: '01922-334455',
      vehicle: 'Toyota Corolla (Dhaka Metro-Ga-12)',
      issue: 'Flat Tire Replacement & Puncture Fix',
      location: 'Near Evercare Hospital Gate 2, Road 11, Block D, Bashundhara R/A',
      mechanic: 'Karim Rahman (01822-112233)',
      status: 'Dispatched',
      distance: '1.4 km',
      fare: '৳463 BDT'
    },
    {
      id: 'JOB-8809',
      customer: 'Tariq Hasan',
      phone: '01711-998877',
      vehicle: 'Honda Vezel (Dhaka Metro-Cha-55)',
      issue: '12V Battery Jump Start',
      location: 'Opposite Jamuna Future Park, Main Road, Dhaka',
      mechanic: 'Rahat Khan (01700-445566)',
      status: 'On-Site',
      distance: '2.1 km',
      fare: '৳495 BDT'
    }
  ]);

  const handleUpdateStatus = (jobId, newStatus) => {
    if (newStatus === 'Completed') {
      alert(`Job #${jobId} completed! Digital invoice recorded.`);
      setJobs(jobs.filter(j => j.id !== jobId));
    } else {
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Dispatch Jobs & Mechanics</h1>
          <p className="text-xs text-slate-400 mt-1">Deploy technicians, review customer landmarks, and advance lifecycles in real time.</p>
        </div>
        <span className="text-xs bg-amber-950 border border-amber-800 text-amber-400 font-bold px-3 py-1 rounded-full">
          {jobs.length} Active On Road
        </span>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-wrap justify-between items-start border-b border-slate-800 pb-4 gap-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                  {job.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{job.issue}</h3>
                <p className="text-xs text-slate-300">Driver: {job.customer} ({job.vehicle}) | 📞 {job.phone}</p>
                <div className="inline-block p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-amber-300">
                  📍 <strong>Customer Location:</strong> {job.location}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Assigned Mechanic:</span>
                <span className="text-xs font-bold text-amber-400">{job.mechanic}</span>
                <p className="text-sm text-emerald-400 font-black mt-1">Est. Fare: {job.fare} ({job.distance})</p>
              </div>
            </div>

            {/* LIFECYCLE PROGRESSION CONTROLS */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current State:</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-white">
                  ● {job.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(job.id, 'Dispatched')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                    job.status === 'Dispatched'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  1. Dispatched
                </button>
                <button
                  onClick={() => handleUpdateStatus(job.id, 'On-Site')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                    job.status === 'On-Site'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  2. Arrived On-Site
                </button>
                <button
                  onClick={() => handleUpdateStatus(job.id, 'Completed')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  3. Complete & Settle Job
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
