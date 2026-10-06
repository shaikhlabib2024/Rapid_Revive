import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  return (
    <div className="py-12 bg-slate-950 text-slate-100 space-y-16">
      <section className="max-w-5xl mx-auto px-6 text-center space-y-4">
        <span className="inline-block bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full">
          ⚙️ Ecosystem & System Architecture
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          How Rapid-Revive Serves Drivers & Workshop Owners
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-400 leading-relaxed">
          A digitized ecosystem designed to eliminate unpredictable roadside wait times, prevent scams, provide transparent distance pricing, and grow local garage businesses.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚘</span>
            <div>
              <h2 className="text-xl font-bold text-white">For Car Owners & Drivers</h2>
              <p className="text-xs text-slate-400">Fast, safe, and transparent roadside help</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">1. 1-Click Geolocation Emergency SOS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The browser API automatically captures your exact GPS coordinates so you don't have to guess where you are stranded.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">2. Haversine Nearest Garage Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The backend calculates distances to verified operational garages in real time and broadcasts your ticket to the closest active mechanic.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">3. Transparent Fare Estimation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anti-scam formula calculates exact costs: <code className="text-amber-400">Total = Base Fee + (Distance in KM × Per-KM Rate)</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">4. Live Route & ETA Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your assigned mechanic's vehicle en-route on the map with status timeline updates.
              </p>
            </div>
          </div>

          <Link to="/login" className="block text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition">
            Register as Car Owner
          </Link>
        </div>

        <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔧</span>
            <div>
              <h2 className="text-xl font-bold text-white">For Garage Owners & Mechanics</h2>
              <p className="text-xs text-slate-400">Streamline dispatches and expand business revenue</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">1. Instant SOS Dispatch Popup Notifications</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Garages receive real-time audio and visual popups for nearby stranded motorists with vehicle info and GPS coordinates.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">2. Acceptance & Auto-Rerouting Controls</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Garages have the power to Accept or Reject calls. Rejecting automatically reroutes the SOS ticket to the next nearest garage.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">3. Trade License Verification Badge</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Admins audit submitted business trade licenses, giving verified workshops a trust badge on the map.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">4. Mechanic Assignment & Financial Logs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign field mechanics with contact numbers to active jobs and track total monthly earnings & digital invoices.
              </p>
            </div>
          </div>

          <Link to="/login" className="block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition border border-slate-700">
            Register Garage Business
          </Link>
        </div>
      </section>
    </div>
  );
}
