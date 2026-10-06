import React from 'react';
import { Link } from 'react-router-dom';
import GoogleMapComponent from '../components/GoogleMapComponent';

export default function HeroPage() {
  const services = [
    { title: 'Towing Service', desc: 'Flatbed & wheel-lift emergency dispatch.', icon: '🚜', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80', badge: 'Emergency' },
    { title: 'Battery Jump Start', desc: 'On-demand battery boost and replacement.', icon: '🔋', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80', badge: 'Fast Track' },
    { title: 'Flat Tire Repair', desc: 'On-site tire swap and pressure check.', icon: '🛞', image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=500&q=80', badge: 'Popular' },
    { title: 'Fuel Delivery', desc: 'Emergency fuel delivered to your location.', icon: '⛽', image: 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=500&q=80', badge: '24/7' },
    { title: 'Lockout Assist', desc: 'Unlocking assistance for locked vehicles.', icon: '🔑', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80', badge: 'Security' },
    { title: 'Engine Diagnostics', desc: 'On-site fault code scanning and check.', icon: '⚙️', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=500&q=80', badge: 'Maintenance' },
  ];

  return (
    <div className="space-y-16 py-10 bg-slate-950 text-slate-100">
      {/* HERO BANNER SECTION */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-red-950/50 border border-red-800/60 text-red-400 px-3.5 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            24/7 Roadside Assistance Platform
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            WITH YOU THROUGH EVERY <br />
            <span className="text-red-500">DRIVE AND DETOUR</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
            Rapid-Revive connects drivers with verified nearby garages across Dhaka & Bashundhara through real-time GPS dispatching and transparent distance pricing.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              to="/login" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition text-xs flex items-center gap-2"
            >
              🚨 REQUEST EMERGENCY SOS NOW
            </Link>
            <Link 
              to="/services" 
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-6 py-3 rounded-xl transition text-xs flex items-center gap-2"
            >
              🛠️ EXPLORE DETAILED SERVICES
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-400 border-t border-slate-900">
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">🟢</span> 85+ Garages Online</div>
            <div className="flex items-center gap-1.5"><span className="text-amber-400">⚡</span> &lt; 15 Mins Response</div>
            <div className="flex items-center gap-1.5"><span className="text-blue-400">📍</span> Dhaka Bashundhara</div>
          </div>
        </div>

        {/* HERO IMAGE BANNER */}
        <div className="md:col-span-5 relative">
          <div className="rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900 aspect-4/3 relative">
            <img 
              src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80" 
              alt="Roadside Assistance Dhaka" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <p className="text-xs font-bold text-amber-400">⚡ Vehicle Towing & On-Demand Repair</p>
              <p className="text-sm font-extrabold text-white mt-0.5">Bashundhara R/A & Greater Dhaka</p>
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE MAPS SECTION */}
      <section className="max-w-6xl mx-auto px-6">
        <GoogleMapComponent />
      </section>

      {/* SERVICES WITH IMAGES */}
      <section id="services" className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Emergency Services & Maintenance</h2>
            <p className="text-xs text-slate-400 mt-1">Detailed symptoms, troubleshooting, and step-by-step solutions.</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-red-400 hover:text-red-300 underline">
            View All Guides →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div key={idx} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between">
              <div className="h-40 relative bg-slate-950 overflow-hidden">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover opacity-80" />
                <span className="absolute top-3 right-3 bg-slate-950/90 text-slate-300 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {s.badge}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{s.icon}</span> {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                <Link to="/services" className="inline-block pt-2 text-xs font-bold text-blue-400 hover:underline">
                  Read Fix Guide & Steps →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Platform Ecosystem</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">How Rapid-Revive Helps Car Owners & Garages</h2>
          <p className="text-xs text-slate-400">Connecting drivers in need with local verified workshops in real-time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-3xl">🚘</span>
            <h3 className="text-lg font-bold text-white">For Car Owners</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>✓ <strong>1-Click SOS Dispatch:</strong> Auto-captures GPS coordinates during roadside emergencies.</li>
              <li>✓ <strong>Haversine Smart Matching:</strong> Finds nearest online verified garages in Bashundhara/Dhaka.</li>
              <li>✓ <strong>Fare Transparency:</strong> Anti-scam formula (Base Fee + Distance × Rate).</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-3xl">🔧</span>
            <h3 className="text-lg font-bold text-white">For Garage Owners</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>✓ <strong>Real-Time SOS Queue:</strong> Incoming popups with customer vehicle info & GPS location.</li>
              <li>✓ <strong>Trade License Verification Badge:</strong> Verified status gives higher customer trust.</li>
              <li>✓ <strong>Mechanic Dispatch Management:</strong> Assign mechanics & track monthly revenue.</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/how-it-works" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs inline-block transition">
            Learn Full System Architecture →
          </Link>
        </div>
      </section>
    </div>
  );
}
