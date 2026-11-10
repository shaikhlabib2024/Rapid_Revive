import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getGarageServices, addGarageService, toggleGarageService } from '../../api/garageApi';

export default function GarageServicesPage() {
  const { user } = useContext(AuthContext);
  const garageId = user?.garageId || 1;

  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', basePrice: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const loadServices = useCallback(async () => {
    try {
      const res = await getGarageServices(garageId);
      if (res.success) {
        setServices(res.services || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load workshop services.');
    }
  }, [garageId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleToggle = async (service) => {
    setErrorMsg('');
    try {
      await toggleGarageService(service.service_id, !service.is_active);
      setServices((prev) =>
        prev.map((s) =>
          s.service_id === service.service_id ? { ...s, is_active: s.is_active ? 0 : 1 } : s
        )
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle service.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await addGarageService({
        garageId,
        serviceName: form.name,
        description: form.description,
        basePrice: parseFloat(form.basePrice) || 500.00
      });
      if (res.success && res.service) {
        setServices((prev) => [...prev, res.service]);
        setForm({ name: '', basePrice: '', description: '' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add service.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Workshop Service Catalog & Base Rates</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your live offered repair services and base rates in Bangladeshi Taka (৳ BDT) stored in MySQL.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.service_id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <h3 className={`font-bold text-sm ${s.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>
                {s.service_name}
              </h3>
              {s.description && <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>}
              <p className="text-xs text-emerald-400 font-mono font-bold mt-1">
                ৳{parseFloat(s.base_price).toLocaleString()} BDT Base
              </p>
            </div>
            <button
              onClick={() => handleToggle(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                s.is_active
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {s.is_active ? '✓ Active' : 'Paused'}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white">Add New Custom Service Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            required
            placeholder="Service Name (e.g. Radiator Flushing)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <input
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <input
            required
            type="number"
            placeholder="Base Fee in BDT (e.g. 800)"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md">
          + Add Service to Menu
        </button>
      </form>
    </div>
  );
}
