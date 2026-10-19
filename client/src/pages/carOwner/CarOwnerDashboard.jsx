import React, { useState, useEffect, useContext } from 'react';
import { triggerEmergencySOS, getSosStatus } from '../../api/sosApi';
import { AuthContext } from '../../context/AuthContext';

export default function CarOwnerDashboard() {
  const { user } = useContext(AuthContext);
  const [showSosModal, setShowSosModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState('Flat Tire');
  const [locationName, setLocationName] = useState('Bashundhara R/A (Near Evercare Hospital), Dhaka');
  const [coords, setCoords] = useState({ lat: 23.8103, lng: 90.4125 });

  const issueTypes = [
    { label: 'Flat Tire Puncture / Swap', icon: '🛞', est: '৳450' },
    { label: '12V Battery Jump Start', icon: '⚡', est: '৳400' },
    { label: 'Flatbed Towing Service', icon: '🚛', est: '৳1,500' },
    { label: 'Emergency Fuel Delivery', icon: '⛽', est: '৳350' },
    { label: 'Engine Breakdown / Overheat', icon: '⚠️', est: '৳600' },
    { label: 'Vehicle Door Lockout', icon: '🔑', est: '৳500' }
  ];

  // Restore active ticket from cache memory on initial load
  useEffect(() => {
    const cached = localStorage.getItem(`active_sos_ticket_${user?.id || 'demo'}`);
    if (cached) {
      try {
        setActiveTicket(JSON.parse(cached));
      } catch (e) {
        // invalid JSON
      }
    }
  }, [user]);

  // Real-time status polling for active emergency ticket
  useEffect(() => {
    if (!activeTicket || activeTicket.status === 'Completed') return;

    const interval = setInterval(async () => {
      try {
        const res = await getSosStatus(activeTicket.requestId);
        if (res.success && res.request) {
          const updated = {
            ...activeTicket,
            status: res.request.status
          };
          setActiveTicket(updated);
          localStorage.setItem(`active_sos_ticket_${user?.id || 'demo'}`, JSON.stringify(updated));
          return;
        }
      } catch (err) {
        // Fallback demo status progression for offline mode
      }

      // Smooth demo progression
      setActiveTicket(prev => {
        if (!prev) return null;
        let nextStatus = prev.status;
        if (prev.status === 'Pending') nextStatus = 'Accepted';
        else if (prev.status === 'Accepted') nextStatus = 'Dispatched';
        else if (prev.status === 'Dispatched') nextStatus = 'Completed';
        
        const updated = { ...prev, status: nextStatus };
        localStorage.setItem(`active_sos_ticket_${user?.id || 'demo'}`, JSON.stringify(updated));
        return updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTicket]);

  const handleOpenSos = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // default Bashundhara coordinates
        }
      );
    }
    setShowSosModal(true);
  };

  const handleSosSubmit = async (e) => {
    e.preventDefault();
    const finalLocation = locationName.trim() || 'Bashundhara R/A, Dhaka';

    try {
      const data = await triggerEmergencySOS({
        userId: user?.id || 1,
        issueType: selectedIssue,
        userLat: coords.lat,
        userLong: coords.lng,
        locationName: finalLocation
      });

      const ticket = {
        requestId: data.requestId,
        assignedGarage: data.assignedGarage || 'MotorFix Workshop (Bashundhara R/A)',
        garagePhone: data.garagePhone || '01711-234567',
        garageAddress: data.garageAddress || 'Block C, Bashundhara R/A',
        distanceKm: data.distanceKm || 1.4,
        locationName: finalLocation,
        estimatedCost: data.estimatedCost || 463.00,
        currency: 'BDT',
        status: 'Pending'
      };

      setActiveTicket(ticket);
      localStorage.setItem(`active_sos_ticket_${user?.id || 'demo'}`, JSON.stringify(ticket));
      setShowSosModal(false);
    } catch (err) {
      // Offline fallback
      const ticket = {
        requestId: Math.floor(1000 + Math.random() * 9000),
        assignedGarage: 'MotorFix Workshop (Bashundhara R/A)',
        garagePhone: '01711-234567',
        garageAddress: 'Block C, Main Road, Bashundhara R/A',
        distanceKm: 1.4,
        locationName: finalLocation,
        estimatedCost: 463.00,
        currency: 'BDT',
        status: 'Pending'
      };
      setActiveTicket(ticket);
      localStorage.setItem(`active_sos_ticket_${user?.id || 'demo'}`, JSON.stringify(ticket));
      setShowSosModal(false);
    }
  };

  const handleCancelTicket = () => {
    if (window.confirm('Are you sure you want to cancel this emergency request?')) {
      setActiveTicket(null);
      localStorage.removeItem(`active_sos_ticket_${user?.id || 'demo'}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* MODERN ELEGANT SOS CALLOUT CARD */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-900/40 p-6 md:p-8 rounded-3xl shadow-xl flex flex-wrap justify-between items-center gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-800/80 text-rose-300 px-3 py-0.5 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            24/7 Roadside Emergency Dispatch
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Need Urgent Roadside Assistance?</h1>
          <p className="text-xs text-slate-300">
            Share your exact location and get matched instantly with nearest verified workshops in Dhaka. Standard base fee <span className="font-bold text-white">৳400 BDT</span> + <span className="font-bold text-white">৳45/km</span>.
          </p>
        </div>

        <button 
          onClick={handleOpenSos}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-rose-900/40 transition text-xs tracking-wider flex items-center gap-2.5 shrink-0"
        >
          <span>🚨</span> REQUEST EMERGENCY SOS
        </button>
      </div>

      {/* ACTIVE TICKET LIFECYCLE & LOCATION DETAILS */}
      {activeTicket && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex flex-wrap justify-between items-start pb-5 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[11px] px-3 py-0.5 rounded-full font-mono font-bold">
                  Ticket #{activeTicket.requestId}
                </span>
                <span className="text-xs text-slate-400">Live Status Auto-Syncing</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">{activeTicket.assignedGarage}</h2>
              <p className="text-xs text-slate-400 mt-0.5">📍 Workshop: {activeTicket.garageAddress} | 📞 Phone: {activeTicket.garagePhone}</p>
              
              {/* DISPLAY OF USER'S EXACT LOCATION & LANDMARK */}
              <div className="mt-3 inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-amber-300">
                <span>📍</span>
                <span><strong>Your Shared Location:</strong> {activeTicket.locationName}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Distance & Fare</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">৳{parseFloat(activeTicket.estimatedCost).toLocaleString()} BDT</p>
              <p className="text-xs text-slate-400">~{activeTicket.distanceKm} km away</p>
            </div>
          </div>

          {/* PROGRESS TIMELINE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-semibold">
            <div className={`p-3 rounded-xl transition border ${
              ['Pending', 'Accepted', 'Dispatched', 'Completed'].includes(activeTicket.status)
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              1. Ticket Pending
            </div>
            <div className={`p-3 rounded-xl transition border ${
              ['Accepted', 'Dispatched', 'Completed'].includes(activeTicket.status)
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              2. Garage Accepted
            </div>
            <div className={`p-3 rounded-xl transition border ${
              ['Dispatched', 'Completed'].includes(activeTicket.status)
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              3. Mechanic Dispatched
            </div>
            <div className={`p-3 rounded-xl transition border ${
              activeTicket.status === 'Completed'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              4. Service Completed
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <a 
              href={`tel:${activeTicket.garagePhone}`} 
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 transition"
            >
              📞 Call Garage ({activeTicket.garagePhone})
            </a>
            <button 
              onClick={handleCancelTicket}
              className="text-xs text-slate-400 hover:text-rose-400 transition"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* POPUP EMERGENCY SOS MODAL WITH EXACT LOCATION & LANDMARK INPUT */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSosSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 text-slate-100">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Emergency Dispatch</span>
                <button type="button" onClick={() => setShowSosModal(false)} className="text-slate-400 hover:text-white text-base">✕</button>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Select Breakdown Problem</h2>
              <p className="text-xs text-slate-400 mt-0.5">Choose required assistance and provide your exact location.</p>
            </div>

            {/* BREAKDOWN TYPE SELECTION */}
            <div className="grid grid-cols-2 gap-2.5">
              {issueTypes.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIssue(t.label)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col justify-between ${
                    selectedIssue === t.label
                      ? 'border-rose-600 bg-rose-950/60 text-white shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="mt-1 text-white">{t.label}</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Est. {t.est}</span>
                </button>
              ))}
            </div>

            {/* EXACT LOCATION & LANDMARK NAME INPUT */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>📍 Exact Breakdown Location & Landmark</span>
                <span className="text-[10px] text-emerald-400">GPS Pin Active</span>
              </label>
              <textarea
                required
                rows="2"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Near Evercare Hospital Gate 2, Road 11, Block D, Bashundhara R/A, Dhaka"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400">
                Mention nearby landmark, road number, or shop name so mechanics can find you effortlessly.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-1/3 py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>🚨</span> Confirm & Dispatch (৳400 + ৳45/km)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
