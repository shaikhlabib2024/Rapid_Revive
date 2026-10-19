import React, { useState } from 'react';

export default function GarageServicesPage() {
  const [services, setServices] = useState([
    { id: 1, name: 'Flatbed Towing Service', basePrice: 1500.00, active: true },
    { id: 2, name: '12V Battery Jump Start', basePrice: 400.00, active: true },
    { id: 3, name: 'Flat Tire Swap & Puncture Fix', basePrice: 450.00, active: true },
    { id: 4, name: 'Emergency Fuel Delivery', basePrice: 350.00, active: true },
    { id: 5, name: 'OBD-II Engine Diagnostic Scan', basePrice: 600.00, active: true },
    { id: 6, name: 'Lockout Vehicle Door Assistance', basePrice: 500.00, active: true }
  ]);

  const [form, setForm] = useState({ name: '', basePrice: '' });

  const handleToggle = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setServices([...services, { id: Date.now(), name: form.name, basePrice: parseFloat(form.basePrice) || 500.00, active: true }]);
    setForm({ name: '', basePrice: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Workshop Service Catalog & Base Rates</h1>
        <p className="text-xs text-slate-400 mt-1">Configure your offered repair services and base rates in local Bangladeshi Taka (৳ BDT).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <h3 className="font-bold text-white text-sm">{s.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">Base Rate: ৳{s.basePrice.toLocaleString()} BDT</p>
            </div>
            <button
              onClick={() => handleToggle(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                s.active
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {s.active ? '● Active' : '○ Inactive'}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white">+ Add Custom Repair Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Service Title (e.g. Radiator Coolant Flush)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            required
            type="number"
            placeholder="Base Rate (৳ BDT)"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow"
        >
          Add to Service Menu
        </button>
      </form>
    </div>
  );
}
