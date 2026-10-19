import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DriverHeroPage() {
  const { user } = useContext(AuthContext);

  const capabilities = [
    {
      title: 'Emergency 1-Click SOS Dispatch',
      desc: 'Instantly broadcast your breakdown with automatic GPS coordinates to verified garages within radius.',
      icon: '🚨',
      link: '/driver/sos',
      cta: 'Launch SOS Radar',
      color: 'border-red-800/80 hover:border-red-500'
    },
    {
      title: 'Vehicle Fleet & Garage Manager',
      desc: 'Link multiple family or personal vehicles (make, model, license plate number, fuel type).',
      icon: '🚘',
      link: '/driver/vehicles',
      cta: 'Manage Vehicles',
      color: 'border-blue-800/80 hover:border-blue-500'
    },
    {
      title: 'Book Routine Maintenance',
      desc: 'Schedule oil changes, brake repairs, and engine checkups with anti-double-booking slot protection.',
      icon: '🔧',
      link: '/driver/booking',
      cta: 'Schedule Appointment',
      color: 'border-amber-800/80 hover:border-amber-500'
    },
    {
      title: 'Transparent Distance Invoicing',
      desc: 'Access itemized digital receipts calculated via Base Fee + Distance per KM with simulated payment toggles.',
      icon: '🧾',
      link: '/driver/invoices',
      cta: 'View Receipts',
      color: 'border-emerald-800/80 hover:border-emerald-500'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Report Your Breakdown',
      desc: 'Open the Live SOS Tracker, choose your issue (Towing, Flat Tire, Battery Jump, Lockout, Fuel), and grant GPS permission.'
    },
    {
      num: '02',
      title: 'Automated Garage Match',
      desc: 'Our backend Haversine algorithm scans all online and verified workshops in Dhaka and pairs you with the closest technician.'
    },
    {
      num: '03',
      title: 'Live Tracking & Communication',
      desc: 'Watch the mechanic move towards your vehicle in real-time, view contact details, and follow status updates.'
    },
    {
      num: '04',
      title: 'Service & Digital Settlement',
      desc: 'Once repairs are complete on-site, receive a printable digital invoice and leave a 1-to-5 star verified rating.'
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* DRIVER HERO BANNER */}
      <section className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-900/60 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-900/40 border border-red-700/60 text-red-300 px-3.5 py-1 rounded-full text-xs font-bold">
            <span>🚘</span> Authenticated Driver Cockpit
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome Back, <span className="text-red-500">{user?.fullName || 'Car Owner'}</span>!
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Your personalized vehicle protection portal. Request rapid roadside rescue within 3 clicks, track assigned field technicians in real time, and organize all your vehicle service records.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/driver/sos"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition text-xs flex items-center gap-2 animate-pulse"
            >
              🚨 REQUEST EMERGENCY SOS
            </Link>
            <Link
              to="/driver/vehicles"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-5 py-3 rounded-xl transition text-xs flex items-center gap-2"
            >
              🚘 VIEW REGISTERED CARS
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN DO (FEATURE LAUNCHPAD) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">What You Can Do</h2>
          <p className="text-xs text-slate-400 mt-1">Explore all capabilities available to your Car Owner account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c, i) => (
            <div key={i} className={`bg-slate-900/90 border ${c.color} p-6 rounded-2xl shadow-lg transition flex flex-col justify-between space-y-4 group`}>
              <div className="space-y-3">
                <span className="text-3xl p-3 bg-slate-950 rounded-xl inline-block group-hover:scale-110 transition">{c.icon}</span>
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

      {/* HOW YOU CAN DO IT (STEP-BY-STEP WORKFLOW GUIDE) */}
      <section className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl space-y-8">
        <div>
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Operational Protocol</span>
          <h2 className="text-2xl font-black text-white mt-1">How It Works: Step-by-Step Roadside Help</h2>
          <p className="text-xs text-slate-400 mt-1">Follow this frictionless process whenever your vehicle encounters an emergency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl space-y-2 relative">
              <span className="text-xl font-black text-red-500 font-mono">{s.num}</span>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
