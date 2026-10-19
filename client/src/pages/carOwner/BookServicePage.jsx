import React, { useState } from 'react';

export default function BookServicePage() {
  const [selectedGarage, setSelectedGarage] = useState('MotorFix Workshop (Bashundhara R/A)');
  const [selectedService, setSelectedService] = useState('Oil & Filter Change');
  const [date, setDate] = useState('2026-10-25');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const garages = [
    { name: 'MotorFix Workshop (Bashundhara R/A)', distance: '0.6 km', rating: '⭐ 4.9' },
    { name: 'Apex Auto Care (300 Feet Road)', distance: '1.2 km', rating: '⭐ 4.8' },
    { name: 'Dhaka City Towing & Workshop', distance: '1.8 km', rating: '⭐ 4.7' }
  ];

  const services = [
    { name: 'Oil & Filter Change', price: '$35.00' },
    { name: 'Brake Pad Inspection & Replacement', price: '$55.00' },
    { name: 'Complete Engine Diagnostic Tune-Up', price: '$75.00' },
    { name: 'AC Servicing & Gas Refill', price: '$45.00' },
    { name: 'Suspension & Alignment Check', price: '$40.00' }
  ];

  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '02:00 PM - 03:30 PM',
    '03:30 PM - 05:00 PM'
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    setConfirmedBooking({
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      garage: selectedGarage,
      service: selectedService,
      date,
      timeSlot,
      status: 'Confirmed'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Book Routine Maintenance</h1>
        <p className="text-xs text-slate-400 mt-1">Schedule workshop appointments with anti-double-booking slot protection.</p>
      </div>

      {confirmedBooking && (
        <div className="p-5 bg-emerald-950/60 border border-emerald-800 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs bg-emerald-900 text-emerald-300 font-bold px-3 py-1 rounded-full">
            ✓ Appointment Confirmed #{confirmedBooking.id}
          </span>
          <h3 className="text-lg font-bold text-white mt-1">{confirmedBooking.service}</h3>
          <p className="text-xs text-slate-300">Workshop: {confirmedBooking.garage}</p>
          <p className="text-xs text-slate-300">Date & Slot: {confirmedBooking.date} @ {confirmedBooking.timeSlot}</p>
        </div>
      )}

      <form onSubmit={handleBooking} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">1. Select Verified Workshop</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {garages.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedGarage(g.name)}
                className={`p-3.5 rounded-xl border text-left text-xs font-bold transition ${
                  selectedGarage === g.name
                    ? 'border-red-600 bg-red-950/50 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <p className="text-white font-semibold">{g.name}</p>
                <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                  <span>{g.distance}</span>
                  <span className="text-amber-400">{g.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">2. Select Maintenance Service</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedService(s.name)}
                className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold transition ${
                  selectedService === s.name
                    ? 'border-red-600 bg-red-950/50 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span>{s.name}</span>
                <span className="text-emerald-400 font-mono">{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">3. Select Appointment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">4. Select Time Slot (Anti-Double-Booking)</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              {timeSlots.map((ts, i) => (
                <option key={i} value={ts} className="bg-slate-900 text-white">
                  {ts}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-lg"
        >
          Confirm Maintenance Appointment
        </button>
      </form>
    </div>
  );
}
