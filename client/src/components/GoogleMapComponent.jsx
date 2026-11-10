import React, { useState, useEffect, useCallback } from 'react';
import { getVerifiedGarages } from '../api/garageApi';
import { reverseGeocodeLocation } from '../api/sosApi';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';

const BASHUNDHARA_LAT = 23.8103;
const BASHUNDHARA_LNG = 90.4125;

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

export default function GoogleMapComponent() {
  const [garages, setGarages] = useState([]);
  const [center, setCenter] = useState({ lat: BASHUNDHARA_LAT, lng: BASHUNDHARA_LNG });
  const [locationName, setLocationName] = useState('Dhaka, Bangladesh');

  const loadGarages = useCallback(async () => {
    try {
      const res = await getVerifiedGarages();
      if (res.success) {
        setGarages(res.garages || []);
      }
    } catch {
      // Leave empty if API unavailable
    }
  }, []);

  useEffect(() => {
    loadGarages();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenter({ lat, lng });
          try {
            const res = await reverseGeocodeLocation(lat, lng);
            if (res.success && res.locationName) {
              setLocationName(res.locationName);
            }
          } catch {
            // Keep fallback label if Geocoding key is not yet set
          }
        },
        () => {}
      );
    }
  }, [loadGarages]);

  useRealtimeEvents(['garage:updated'], loadGarages);

  const onlineCount = garages.filter((g) => g.is_online).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
      <div className="flex justify-between items-center px-1 pt-1">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>📍</span> Live Network Map — {locationName}
          </h3>
          <p className="text-[11px] text-slate-400">
            Showing verified workshops with Google Maps location names
          </p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
          ● {onlineCount} Verified Garage{onlineCount !== 1 ? 's' : ''} Online
        </span>
      </div>

      <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-800">
        <iframe
          title="Google Map Network"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: 'brightness(0.95) contrast(1.05)' }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&z=14&output=embed`}
          allowFullScreen
        ></iframe>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {garages.map((g) => {
          const dist = haversineKm(center.lat, center.lng, parseFloat(g.latitude), parseFloat(g.longitude));
          return (
            <div key={g.garage_id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">{g.garage_name}</p>
                <p className="text-[11px] text-slate-400">{g.address}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <span className={`block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  g.is_online
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {g.is_online ? 'Online' : 'Offline'}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">{dist} km</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
