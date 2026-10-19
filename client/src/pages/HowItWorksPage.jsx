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
          A digitized ecosystem designed to eliminate unpredictable roadside wait times, prevent scams, provide transparent distance pricing in ৳ BDT, and grow local garage businesses.
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
              <h3 className="text-sm font-bold text-white">1. 1-Click GPS SOS + Landmark Sharing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The browser captures your precise GPS coordinates while letting you specify your road number or landmark (e.g. "Near Evercare Hospital, Bashundhara").
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">2. Haversine Nearest Garage Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The backend calculates distances to verified operational garages in real time and broadcasts your ticket to the closest active mechanic.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">3. Transparent BDT Fare Estimation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anti-scam formula calculates exact costs: <code className="text-amber-400">Total = Base Callout (৳400 BDT) + (Distance in KM × ৳45/km)</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">4. Live Route & ETA Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your assigned mechanic's vehicle en-route on the map with real-time status timeline updates.
              </p>
            </div>
          </div>

          <Link to="/login" className="block text-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg">
            Register as Car Owner
          </Link>
        </div>

        <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔧</span>
            <div>
              <h2 className="text-xl font-bold text-white">For Garage Owners & Workshops</h2>
              <p className="text-xs text-slate-400">Streamline dispatches and expand business revenue</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">1. Instant SOS Dispatch Popup Notifications</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Garages receive real-time audio and visual popups for nearby stranded motorists with vehicle info, landmark, and GPS position.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">2. Workshop Location Pinning on Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Workshops can share and update their live GPS location to pin their workshop on customer maps for instant matching.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">3. Dual Verification: Trade License & NID</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Admins audit submitted municipal Trade Licenses and owner National IDs (NID), granting workshops a verified trust badge.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <h3 className="text-sm font-bold text-white">4. Tactile Online Toggle & BDT Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Intuitive sliding switch to pause/resume dispatches and track total daily and monthly income in ৳ BDT.
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
