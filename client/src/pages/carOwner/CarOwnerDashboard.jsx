import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  triggerEmergencySOS,
  getSosStatus,
  getActiveSosForUser,
  cancelSosRequest,
  getPlatformPricing,
  reverseGeocodeLocation
} from '../../api/sosApi';
import { getUserVehicles } from '../../api/vehicleApi';
import { AuthContext } from '../../context/AuthContext';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function CarOwnerDashboard() {
  const { user } = useContext(AuthContext);
  const [showSosModal, setShowSosModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('Flat Tire Puncture / Swap');
  const [locationName, setLocationName] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFetchNotice, setLocationFetchNotice] = useState('');
  const [pricing, setPricing] = useState({ basePrice: 400, perKmRate: 45 });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { label: 'Flat Tire Puncture / Swap', icon: '🛞', est: '৳450' },
    { label: '12V Battery Jump Start', icon: '⚡', est: '৳400' },
    { label: 'Flatbed Towing Service', icon: '🚛', est: '৳1,500' },
    { label: 'Emergency Fuel Delivery', icon: '⛽', est: '৳350' },
    { label: 'Engine Breakdown / Overheat', icon: '⚠️', est: '৳600' },
    { label: 'Vehicle Door Lockout', icon: '🔑', est: '৳500' }
  ];

  const mapDbTicket = (r) => ({
    requestId: r.request_id,
    assignedGarage: r.garage_name || 'Assigned Workshop',
    garagePhone: r.garage_phone || 'N/A',
    garageAddress: r.garage_address || 'Dhaka',
    distanceKm: r.distanceKm ?? 0,
    locationName: r.location_name || 'Bashundhara R/A, Dhaka',
    estimatedCost: r.estimated_cost,
    issueDescription: r.issue_description,
    vehicleInfo: r.make_model ? `${r.make_model} (${r.license_plate})` : null,
    mechanicName: r.mechanic_name || null,
    currency: 'BDT',
    status: r.status
  });

  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [pricingRes, vehiclesRes, activeRes] = await Promise.all([
        getPlatformPricing(),
        getUserVehicles(user.id),
        getActiveSosForUser(user.id)
      ]);

      if (pricingRes.success && pricingRes.pricing) {
        setPricing({
          basePrice: pricingRes.pricing.basePrice,
          perKmRate: pricingRes.pricing.perKmRate
        });
      }
      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.vehicles || []);
        if (vehiclesRes.vehicles?.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(String(vehiclesRes.vehicles[0].vehicle_id));
        }
      }
      if (activeRes.success) {
        setActiveTicket(activeRes.request ? mapDbTicket(activeRes.request) : null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to sync live SOS data from server.');
    }
  }, [user?.id, selectedVehicleId]);

  const refreshTicketStatus = useCallback(async () => {
    if (!activeTicket?.requestId) return;
    try {
      const res = await getSosStatus(activeTicket.requestId);
      if (res.success && res.request) {
        if (res.request.status === 'Cancelled') {
          setActiveTicket(null);
        } else {
          setActiveTicket(mapDbTicket(res.request));
        }
      }
    } catch {
      // Keep current state if transient poll fails
    }
  }, [activeTicket?.requestId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Instant SSE updates when garage or admin updates ticket or pricing
  useRealtimeEvents(['sos:updated', 'sos:created', 'settings:updated'], (evt) => {
    if (evt.type === 'settings:updated') {
      loadInitialData();
      return;
    }
    if (activeTicket?.requestId && evt.payload?.requestId === activeTicket.requestId) {
      refreshTicketStatus();
    } else if (evt.payload?.userId === user?.id) {
      loadInitialData();
    }
  });

  // Backup poll every 10s in case SSE reconnects
  useEffect(() => {
    if (!activeTicket || ['Completed', 'Cancelled'].includes(activeTicket.status)) return;
    const interval = setInterval(refreshTicketStatus, 10000);
    return () => clearInterval(interval);
  }, [activeTicket, refreshTicketStatus]);

  const handleOpenSos = () => {
    setErrorMsg('');
    setLocationFetchNotice('');
    setShowSosModal(true);

    if (!navigator.geolocation) {
      setLocationFetchNotice('Browser geolocation is unavailable. Please enter your location name.');
      return;
    }

    setFetchingLocation(true);
    setLocationFetchNotice('Fetching your location name from Google Maps...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
          if (res.success && res.locationName) {
            setLocationName(res.locationName);
            setLocationFetchNotice('✓ Location name fetched from Google Maps.');
          } else {
            setLocationFetchNotice('Could not resolve location name. Please enter it manually.');
          }
        } catch (err) {
          const requiresKey = err.response?.data?.requiresApiKey;
          setLocationFetchNotice(
            requiresKey
              ? '⚠️ Google Maps Geocoding API key not configured yet in server/.env. Enter location name manually or add GOOGLE_MAPS_API_KEY.'
              : 'Could not fetch location name from Google Maps. Please enter it manually.'
          );
        } finally {
          setFetchingLocation(false);
        }
      },
      () => {
        setFetchingLocation(false);
        setLocationFetchNotice('Location permission denied. Please enter your location name manually.');
      }
    );
  };

  const handleSosSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const finalLocation = locationName.trim();

    try {
      const data = await triggerEmergencySOS({
        userId: user?.id,
        vehicleId: selectedVehicleId ? Number(selectedVehicleId) : null,
        issueType: selectedIssue,
        locationName: finalLocation
      });

      setActiveTicket({
        requestId: data.requestId,
        assignedGarage: data.assignedGarage,
        garagePhone: data.garagePhone || 'N/A',
        garageAddress: data.garageAddress,
        distanceKm: data.distanceKm,
        locationName: data.locationName,
        estimatedCost: data.estimatedCost,
        issueDescription: selectedIssue,
        currency: data.currency || 'BDT',
        status: data.status || 'Pending'
      });
      setShowSosModal(false);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to dispatch SOS request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeTicket?.requestId) return;
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    try {
      await cancelSosRequest(activeTicket.requestId);
      setActiveTicket(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel SOS request.');
    }
  };

  const progressSteps = [
    { label: '1. Ticket Pending', activeAt: ['Pending', 'Accepted', 'Dispatched', 'On-Site', 'Completed'] },
    { label: '2. Garage Accepted', activeAt: ['Accepted', 'Dispatched', 'On-Site', 'Completed'] },
    { label: '3. Mechanic Dispatched', activeAt: ['Dispatched', 'On-Site', 'Completed'] },
    { label: '4. Arrived On-Site', activeAt: ['On-Site', 'Completed'] },
    { label: '5. Service Completed', activeAt: ['Completed'] }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      {errorMsg && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold flex justify-between items-center">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-300 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* SOS CALLOUT CARD */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-900/40 p-6 md:p-8 rounded-3xl shadow-xl flex flex-wrap justify-between items-center gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-800/80 text-rose-300 px-3 py-0.5 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            24/7 Roadside Emergency Dispatch
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Need Urgent Roadside Assistance?</h1>
          <p className="text-xs text-slate-300">
            Share your exact location and get matched instantly with the nearest online verified workshop. Base fee{' '}
            <span className="font-bold text-white">৳{pricing.basePrice} BDT</span> +{' '}
            <span className="font-bold text-white">৳{pricing.perKmRate}/km</span>.
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
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live DB Sync Active ({activeTicket.status})
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">{activeTicket.assignedGarage}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                📍 Workshop: {activeTicket.garageAddress} | 📞 Phone: {activeTicket.garagePhone}
              </p>
              {activeTicket.issueDescription && (
                <p className="text-xs text-slate-300 mt-1">
                  🔧 Issue: <strong>{activeTicket.issueDescription}</strong>
                  {activeTicket.vehicleInfo ? ` — ${activeTicket.vehicleInfo}` : ''}
                </p>
              )}
              {activeTicket.mechanicName && (
                <p className="text-xs text-blue-300 mt-1">
                  👷 Assigned Mechanic: <strong>{activeTicket.mechanicName}</strong>
                </p>
              )}

              <div className="mt-3 inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-amber-300">
                <span>📍</span>
                <span><strong>Your Shared Location:</strong> {activeTicket.locationName}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Distance & Fare</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                ৳{parseFloat(activeTicket.estimatedCost || 0).toLocaleString()} BDT
              </p>
              <p className="text-xs text-slate-400">~{activeTicket.distanceKm} km away</p>
            </div>
          </div>

          {/* 5-STAGE LIVE PROGRESS TIMELINE */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs font-semibold">
            {progressSteps.map((step) => (
              <div
                key={step.label}
                className={`p-3 rounded-xl transition border ${
                  step.activeAt.includes(activeTicket.status)
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <a
              href={`tel:${activeTicket.garagePhone}`}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 transition"
            >
              📞 Call Garage ({activeTicket.garagePhone})
            </a>
            {activeTicket.status === 'Completed' ? (
              <button
                onClick={() => setActiveTicket(null)}
                className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-900/60 transition"
              >
                ✓ Dismiss Completed Ticket
              </button>
            ) : (
              <button
                onClick={handleCancelTicket}
                className="text-xs text-slate-400 hover:text-rose-400 transition"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* POPUP EMERGENCY SOS MODAL */}
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

            {vehicles.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Affected Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>
                      {v.make_model} ({v.license_plate})
                    </option>
                  ))}
                </select>
              </div>
            )}

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

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>📍 Breakdown Location Name (Google Maps)</span>
                <span className="text-[10px] text-emerald-400">
                  {fetchingLocation ? 'Resolving...' : 'Location Name Only'}
                </span>
              </label>
              <textarea
                required
                rows="2"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={fetchingLocation ? 'Fetching location name from Google Maps...' : 'e.g. Road 11, Block D, Bashundhara R/A, Dhaka'}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {locationFetchNotice && (
                <p className="text-[11px] text-amber-300 font-semibold">{locationFetchNotice}</p>
              )}
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
                disabled={submitting}
                className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>🚨</span> {submitting ? 'Dispatching...' : `Confirm & Dispatch (৳${pricing.basePrice} + ৳${pricing.perKmRate}/km)`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
