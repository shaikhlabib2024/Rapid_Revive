import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function GarageHeroPage() {
  const { user } = useContext(AuthContext);

  const capabilities = [
    {
      title: 'Live Emergency Dispatch Radar',
      desc: 'Receive real-time pop-up notifications for nearby stranded motorists with vehicle model, phone, and exact landmark.',
      icon: '🚨',
      link: '/garage/dispatch',
      cta: 'Open Dispatch Radar',
      color: 'border-amber-900/40 hover:border-amber-500'
    },
    {
      title: 'Mechanic Deployment & Lifecycles',
      desc: 'Deploy field technicians, provide driver contact info, and transition job status from Dispatched to Completed.',
      icon: '🔧',
      link: '/garage/jobs',
      cta: 'Manage Active Jobs',
      color: 'border-blue-900/40 hover:border-blue-500'
    },
    {
      title: 'Pin Workshop Location on Map',
      desc: 'Share and update your exact workshop GPS coordinates so drivers in your area can instantly find your garage.',
      icon: '📍',
      link: '/garage/profile',
      cta: 'Pin Location & Profile',
      color: 'border-emerald-900/40 hover:border-emerald-500'
    },
    {
      title: 'BDT Earnings & Financial Ledger',
      desc: 'Track gross daily/monthly income in ৳ BDT generated from completed roadside dispatches and routine appointments.',
      icon: '💰',
      link: '/garage/earnings',
      cta: 'View Financial Ledger',
      color: 'border-purple-900/40 hover:border-purple-500'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Stay Online & Pin GPS Location',
      desc: 'Keep your status toggle set to "LIVE ON RADAR" and pin your workshop GPS coordinates so algorithms can match you.'
    },
    {
      num: '02',
      title: 'Accept Incoming SOS Calls',
      desc: 'When an emergency audio alert pops up, review distance and customer landmark, then click "Accept" to lock in the job.'
    },
    {
      num: '03',
      title: 'Deploy Mechanic & Update Status',
      desc: 'Assign an available field mechanic and advance the job status through "Mechanic Dispatched" and "Arrived On-Site".'
    },
    {
      num: '04',
      title: 'Complete Work & Record Invoicing',
      desc: 'Mark the job as "Completed" once the vehicle is repaired. The automated digital invoice records your revenue in ৳ BDT.'
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* GARAGE HERO BANNER */}
      <section className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-800/80 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold">
            <span>🔧</span> Authorized Workshop Console
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome, <span className="text-amber-500">{user?.garageName || user?.fullName || 'Workshop Partner'}</span>!
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Your centralized garage operations command hub. Accept urgent roadside dispatch orders across Dhaka, pin your exact workshop location on the map, deploy mechanics, and manage your automotive service revenue in ৳ BDT.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/garage/dispatch"
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition text-xs flex items-center gap-2"
            >
              🚨 MONITOR DISPATCH RADAR
            </Link>
            <Link
              to="/garage/profile"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-5 py-3 rounded-xl transition text-xs flex items-center gap-2"
            >
              📍 PIN WORKSHOP ON MAP
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN DO (FEATURE LAUNCHPAD) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">What You Can Do</h2>
          <p className="text-xs text-slate-400 mt-1">Key operational tools for your verified garage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c, i) => (
            <div key={i} className={`bg-slate-900/90 border ${c.color} p-6 rounded-3xl shadow-lg transition flex flex-col justify-between space-y-4 group`}>
              <div className="space-y-3">
                <span className="text-3xl p-3 bg-slate-950 rounded-2xl inline-block group-hover:scale-110 transition">{c.icon}</span>
                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>

              <Link
                to={c.link}
                className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 py-2.5 px-4 rounded-xl text-center transition block border border-slate-700"
              >
                {c.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* HOW YOU CAN DO IT (WORKSHOP OPERATING WORKFLOW) */}
      <section className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl space-y-8">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Operational Protocol</span>
          <h2 className="text-2xl font-black text-white mt-1">Workshop Dispatch Standard Operating Procedure (SOP)</h2>
          <p className="text-xs text-slate-400 mt-1">Follow these 4 operational steps to handle incoming SOS emergency tickets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl space-y-2 relative">
              <span className="text-xl font-black text-amber-500 font-mono">{s.num}</span>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
