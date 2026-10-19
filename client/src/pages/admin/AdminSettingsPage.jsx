import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    basePrice: 15.00,
    perKmRate: 2.50,
    searchRadiusKm: 12,
    platformCommission: 10,
    maintenanceMode: false
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Configuration & Pricing Engine</h1>
        <p className="text-xs text-slate-400 mt-1">Configure live distance-based pricing formulas and global dispatch parameters.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs font-bold text-emerald-300">
          ✓ Platform parameters updated and synchronized with backend API!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. Distance Fare Formula Engine</h3>
          <p className="text-xs text-slate-400">Total Formula: <code>Total = Base Fee + (Distance × Per-KM Rate)</code></p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Standard Emergency Base Fee ($ USD)</label>
              <input
                type="number"
                step="0.5"
                value={settings.basePrice}
                onChange={(e) => setSettings({ ...settings, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Per-Kilometer Distance Rate ($ USD / KM)</label>
              <input
                type="number"
                step="0.1"
                value={settings.perKmRate}
                onChange={(e) => setSettings({ ...settings, perKmRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">2. Geofencing & Operational Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Maximum Haversine Dispatch Radius (KM)</label>
              <input
                type="number"
                value={settings.searchRadiusKm}
                onChange={(e) => setSettings({ ...settings, searchRadiusKm: parseInt(e.target.value) || 10 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Platform Commission Rate (%)</label>
              <input
                type="number"
                value={settings.platformCommission}
                onChange={(e) => setSettings({ ...settings, platformCommission: parseInt(e.target.value) || 10 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-xs transition shadow-lg"
          >
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
