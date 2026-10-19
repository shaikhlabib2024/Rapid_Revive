import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AdminHeroPage() {
  const { user } = useContext(AuthContext);

  const capabilities = [
    {
      title: 'Garage Trade License Audit Queue',
      desc: 'Review submitted trade license documentation to approve or reject workshops before they can accept dispatches.',
      icon: '📋',
      link: '/admin/licenses',
      cta: 'Audit Pending Garages',
      color: 'border-blue-800/80 hover:border-blue-500'
    },
    {
      title: 'Platform Analytics & Live KPIs',
      desc: 'Real-time overview of active driver accounts, verified garages, lifetime completed SOS calls, and total revenue.',
      icon: '📊',
      link: '/admin/dashboard',
      cta: 'View System Analytics',
      color: 'border-emerald-800/80 hover:border-emerald-500'
    },
    {
      title: 'User & Workshop Management',
      desc: 'Access complete directory of Car Owners and Garage Owners with full account suspension and audit controls.',
      icon: '👥',
      link: '/admin/users',
      cta: 'Manage Directory',
      color: 'border-amber-800/80 hover:border-amber-500'
    },
    {
      title: 'Platform Pricing Engine & Settings',
      desc: 'Adjust base emergency pricing, per-kilometer distance rates, search radius, and system maintenance switches.',
      icon: '⚙️',
      link: '/admin/settings',
      cta: 'Configure Parameters',
      color: 'border-purple-800/80 hover:border-purple-500'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Audit Submitted Trade Licenses',
      desc: 'Navigate to the License Audit Queue, verify official business registration and trade license numbers.'
    },
    {
      num: '02',
      title: 'Approve & Activate Garages',
      desc: 'Click "Approve" to activate the workshop on customer live maps and allow them into the dispatch pool.'
    },
    {
      num: '03',
      title: 'Supervise Dispatches & Invoicing',
      desc: 'Review live emergency dispatches to ensure fair distance-based fare calculations and high customer satisfaction.'
    },
    {
      num: '04',
      title: 'Account Moderation & Governance',
      desc: 'Suspend fraudulent accounts, resolve cancellation disputes, and perform automated database backups.'
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* ADMIN HERO BANNER */}
      <section className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-900/60 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/60 text-blue-300 px-3.5 py-1 rounded-full text-xs font-bold">
            <span>🛡️</span> Master Administrative Command
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Administrator <span className="text-blue-500">{user?.fullName || 'Superuser'}</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Welcome to the centralized governance center of Rapid-Revive. Review workshop license applications, supervise real-time emergency dispatches across Dhaka & Bashundhara, and adjust core platform parameters.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/admin/licenses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition text-xs flex items-center gap-2 animate-pulse"
            >
              📋 REVIEW LICENSE AUDIT QUEUE
            </Link>
            <Link
              to="/admin/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-5 py-3 rounded-xl transition text-xs flex items-center gap-2"
            >
              📊 VIEW METRICS DASHBOARD
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN DO (FEATURE LAUNCHPAD) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">What You Can Do</h2>
          <p className="text-xs text-slate-400 mt-1">Platform management and governance tools.</p>
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

      {/* HOW YOU CAN DO IT (ADMINISTRATIVE WORKFLOW GUIDE) */}
      <section className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl space-y-8">
        <div>
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Administrative Governance</span>
          <h2 className="text-2xl font-black text-white mt-1">Platform Management Standard Procedure</h2>
          <p className="text-xs text-slate-400 mt-1">Standard administrative steps to maintain quality, safety, and operational reliability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl space-y-2 relative">
              <span className="text-xl font-black text-blue-500 font-mono">{s.num}</span>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
