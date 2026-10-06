import React from 'react';

const BASHUNDHARA_LAT = 23.8103;
const BASHUNDHARA_LNG = 90.4125;

export default function GoogleMapComponent() {
  const nearbyGarages = [
    { name: 'MotorFix Workshop', location: 'Block C, Bashundhara R/A, Dhaka', distance: '0.6 km', status: 'Online' },
    { name: 'Apex Auto Care', location: '300 Feet Road, Bashundhara, Dhaka', distance: '1.2 km', status: 'Online' },
    { name: 'Dhaka City Towing', location: 'Block G, Bashundhara R/A, Dhaka', distance: '1.8 km', status: 'Online' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
      <div className="flex justify-between items-center px-1 pt-1">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>📍</span> Live Network Map — Bashundhara R/A, Dhaka
          </h3>
          <p className="text-[11px] text-slate-400">Coordinates: 23.8103° N, 90.4125° E (Bashundhara Residential Area)</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
          ● 3 Garages Online Near You
        </span>
      </div>

      <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-800">
        <iframe
          title="Google Map Bashundhara R/A"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: 'brightness(0.95) contrast(1.05)' }}
          src={`https://maps.google.com/maps?q=${BASHUNDHARA_LAT},${BASHUNDHARA_LNG}&z=15&output=embed`}
          allowFullScreen
        ></iframe>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {nearbyGarages.map((g, i) => (
          <div key={i} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{g.name}</p>
              <p className="text-[11px] text-slate-400">{g.location}</p>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">{g.distance}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
