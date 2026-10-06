import React, { useState } from 'react';

export default function GarageDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingCall, setIncomingCall] = useState({
    id: 104,
    user: 'Shakil Ahmed',
    issue: 'Flat Tire Replacement',
    distance: '1.4 km',
    vehicle: 'Toyota Premio'
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">MotorFix Workshop</h1>
          <p className="text-xs text-slate-400">Trade License: TL-2026-9901 | Status: Verified</p>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`px-6 py-3 rounded-xl font-bold transition text-xs ${isOnline ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}
        >
          {isOnline ? '🟢 ONLINE (ACCEPTING DISPATCHES)' : '🔴 OFFLINE'}
        </button>
      </div>

      {isOnline && incomingCall && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-black/30 px-3 py-1 rounded-full text-xs font-bold">🚨 INCOMING EMERGENCY SOS CALL</span>
              <h2 className="text-2xl font-black mt-2">{incomingCall.issue}</h2>
              <p className="text-sm mt-1">Customer: {incomingCall.user} ({incomingCall.vehicle})</p>
              <p className="text-xs text-amber-100">Distance: {incomingCall.distance} away</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIncomingCall(null)} className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs">REJECT</button>
              <button onClick={() => alert('SOS Accepted!')} className="px-8 py-3 bg-white text-orange-600 rounded-xl font-black text-xs shadow-lg">ACCEPT SOS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
