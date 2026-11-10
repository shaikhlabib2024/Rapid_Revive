import React, { useState, useEffect, useCallback } from 'react';
import { getAdminSettings, updateAdminSettings } from '../../api/adminApi';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    basePrice: 400.0,
    perKmRate: 45.0,
    searchRadiusKm: 12,
    platformCommission: 10,
    currency: 'BDT'
  });

  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const res = await getAdminSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load settings from database.');
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaved(false);
    try {
      await updateAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save platform settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Configuration & BDT Pricing Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure live distance-based pricing formulas and global dispatch parameters persisted in MySQL (৳ BDT).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs font-bold text-emerald-300">
          ✓ Platform BDT parameters saved to MySQL and synchronized in real time!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            1. Distance Fare Formula Engine (৳ BDT)
          </h3>
          <p className="text-xs text-slate-400">
            Total Formula: <code>Total = Base Fee (৳{settings.basePrice}) + (Distance × ৳{settings.perKmRate}/KM)</code>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Standard Emergency Base Fee (৳ BDT)</label>
              <input
                type="number"
                step="10"
                value={settings.basePrice}
                onChange={(e) => setSettings({ ...settings, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Per-Kilometer Travel Fee (৳ BDT / km)</label>
              <input
                type="number"
                step="5"
                value={settings.perKmRate}
                onChange={(e) => setSettings({ ...settings, perKmRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            2. Haversine Dispatch Parameters & Commission
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Max Search Radius (Kilometers)</label>
              <input
                type="number"
                value={settings.searchRadiusKm}
                onChange={(e) => setSettings({ ...settings, searchRadiusKm: parseInt(e.target.value, 10) || 1 })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Platform Service Commission (%)</label>
              <input
                type="number"
                value={settings.platformCommission}
                onChange={(e) => setSettings({ ...settings, platformCommission: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-lg"
        >
          Save Global Platform Settings
        </button>
      </form>
    </div>
  );
}
