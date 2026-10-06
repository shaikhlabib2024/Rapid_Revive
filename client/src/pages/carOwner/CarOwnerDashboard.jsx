import React, { useState } from 'react';
import { triggerEmergencySOS } from '../../api/sosApi';

export default function CarOwnerDashboard() {
  const [showSosModal, setShowSosModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState('Towing');

  const issueTypes = ['Towing', 'Battery Jump Start', 'Flat Tire', 'Fuel Delivery', 'Engine Failure', 'Lockout'];

  const handleSosSubmit = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const data = await triggerEmergencySOS({
          issueType: selectedIssue,
          userLat: pos.coords.latitude,
          userLong: pos.coords.longitude
        });
        setActiveTicket(data);
        setShowSosModal(false);
      } catch (err) {
        alert('Failed to dispatch: ' + err.message);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">NEED ROADSIDE ASSISTANCE?</h1>
          <p className="text-red-100 mt-1">Instant GPS dispatch to nearest verified garages.</p>
        </div>
        <button 
          onClick={() => setShowSosModal(true)}
          className="bg-white text-red-700 font-extrabold px-8 py-4 rounded-xl shadow-2xl hover:bg-red-50 text-sm animate-pulse"
        >
          🚨 REQUEST EMERGENCY SOS NOW
        </button>
      </div>

      {activeTicket && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">Ticket #{activeTicket.requestId}</span>
              <h2 className="text-xl font-bold mt-1">Assigned: {activeTicket.assignedGarage}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Est. Distance</p>
              <p className="text-lg font-bold text-slate-800">{activeTicket.distanceKm} km away</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 my-6 text-center text-xs font-semibold">
            <div className="p-2 rounded bg-green-500 text-white">1. Pending</div>
            <div className="p-2 rounded bg-green-500 text-white">2. Accepted</div>
            <div className="p-2 rounded bg-slate-100">3. Dispatched</div>
            <div className="p-2 rounded bg-slate-100">4. Completed</div>
          </div>
        </div>
      )}

      {showSosModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-slate-900">Select Breakdown Issue</h2>
            <div className="grid grid-cols-2 gap-3 my-4">
              {issueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedIssue(type)}
                  className={`p-3 text-xs font-bold rounded-xl border text-left ${selectedIssue === type ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSosModal(false)} className="w-1/2 py-3 border rounded-xl text-slate-600 font-bold text-xs">Cancel</button>
              <button onClick={handleSosSubmit} className="w-1/2 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700">Confirm & Dispatch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
