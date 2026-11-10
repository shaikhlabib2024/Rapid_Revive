import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getVerifiedGarages } from '../../api/garageApi';
import { getUserVehicles } from '../../api/vehicleApi';
import { createBooking, getUserBookings } from '../../api/sosApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function BookServicePage() {
  const { user } = useContext(AuthContext);
  const [garages, setGarages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '02:00 PM - 03:30 PM',
    '03:30 PM - 05:00 PM'
  ];

  const loadData = useCallback(async () => {
    try {
      const [gRes, vRes, bRes] = await Promise.all([
        getVerifiedGarages(),
        user?.id ? getUserVehicles(user.id) : Promise.resolve({ success: true, vehicles: [] }),
        user?.id ? getUserBookings(user.id) : Promise.resolve({ success: true, bookings: [] })
      ]);

      if (gRes.success) {
        const list = gRes.garages || [];
        setGarages(list);
        if (list.length > 0 && !selectedGarageId) {
          setSelectedGarageId(String(list[0].garage_id));
          if (list[0].services?.length > 0) {
            setSelectedServiceId(String(list[0].services[0].service_id));
          }
        }
      }
      if (vRes.success) {
        setVehicles(vRes.vehicles || []);
        if (vRes.vehicles?.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(String(vRes.vehicles[0].vehicle_id));
        }
      }
      if (bRes.success) {
        setBookings(bRes.bookings || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load workshops and bookings.');
    }
  }, [user?.id, selectedGarageId, selectedVehicleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeEvents(['garage:updated', 'service:updated', 'sos:updated', 'sos:created'], loadData);

  const activeGarage = garages.find((g) => String(g.garage_id) === String(selectedGarageId));
  const availableServices = activeGarage?.services || [];

  const handleGarageChange = (gid) => {
    setSelectedGarageId(gid);
    const found = garages.find((g) => String(g.garage_id) === String(gid));
    setSelectedServiceId(found?.services?.[0] ? String(found.services[0].service_id) : '');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setConfirmedBooking(null);
    setSubmitting(true);
    try {
      const res = await createBooking({
        userId: user?.id,
        garageId: Number(selectedGarageId),
        serviceId: Number(selectedServiceId),
        vehicleId: selectedVehicleId ? Number(selectedVehicleId) : null,
        scheduledDate: date,
        scheduledTime: timeSlot,
        notes
      });
      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setNotes('');
        loadData();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Could not confirm booking. Please check your selected slot.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Schedule Routine Maintenance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Book scheduled appointments at verified workshops with live anti-double-booking protection.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {confirmedBooking && (
        <div className="bg-emerald-950/80 border border-emerald-700 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="bg-emerald-900 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold">
              ✓ Appointment Saved #{confirmedBooking.request_id}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              ৳{parseFloat(confirmedBooking.estimated_cost).toLocaleString()} BDT
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{confirmedBooking.service_name}</h3>
          <p className="text-xs text-slate-300">
            Workshop: <strong>{confirmedBooking.garage_name}</strong> | Date: <strong>{confirmedBooking.scheduled_date}</strong> ({confirmedBooking.scheduled_time})
          </p>
        </div>
      )}

      <form onSubmit={handleBooking} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">1. Select Verified Workshop</label>
          {garages.length === 0 ? (
            <p className="text-xs text-slate-400">No verified workshops found in database.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {garages.map((g) => (
                <button
                  key={g.garage_id}
                  type="button"
                  onClick={() => handleGarageChange(String(g.garage_id))}
                  className={`p-4 rounded-2xl border text-left transition ${
                    String(selectedGarageId) === String(g.garage_id)
                      ? 'border-blue-500 bg-blue-950/40 text-white shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs text-white">{g.garage_name}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>{g.address}</span>
                    <span className={g.is_online ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {g.is_online ? '● Online' : 'Offline'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">2. Maintenance Service Package</label>
            <select
              required
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {availableServices.length === 0 && <option value="">No active services at this workshop</option>}
              {availableServices.map((s) => (
                <option key={s.service_id} value={s.service_id}>
                  {s.service_name} — ৳{parseFloat(s.base_price).toLocaleString()} BDT
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Vehicle (Optional)</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Any Registered Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.make_model} ({v.license_plate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">3. Preferred Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">4. Time Slot</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">Additional Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Check front brake noise"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedGarageId || !selectedServiceId}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg"
        >
          {submitting ? 'Booking...' : 'Confirm Maintenance Appointment →'}
        </button>
      </form>

      {/* REAL BOOKING HISTORY */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
        <h2 className="text-sm font-bold text-white">Your Scheduled Appointments ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400">No scheduled maintenance appointments yet.</p>
        ) : (
          <div className="space-y-2.5">
            {bookings.map((b) => (
              <div key={b.request_id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <p className="font-bold text-white">#{b.request_id} — {b.issue_description}</p>
                  <p className="text-slate-400 mt-0.5">
                    {b.garage_name} | {b.scheduled_date} ({b.scheduled_time})
                    {b.make_model ? ` | ${b.make_model}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-bold text-[11px]">
                    {b.status}
                  </span>
                  <p className="text-emerald-400 font-mono font-bold mt-1">
                    ৳{parseFloat(b.estimated_cost || 0).toLocaleString()} BDT
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
