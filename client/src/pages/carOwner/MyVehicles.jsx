import React, { useState } from 'react';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([
    { id: 1, makeModel: 'Toyota Corolla 2021', plate: 'Dhaka Metro-Ga-12-3456', fuel: 'Octane' }
  ]);

  const [form, setForm] = useState({ makeModel: '', plate: '', fuel: 'Octane' });

  const handleAdd = (e) => {
    e.preventDefault();
    setVehicles([...vehicles, { ...form, id: Date.now() }]);
    setForm({ makeModel: '', plate: '', fuel: 'Octane' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Registered Vehicles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{v.makeModel}</h3>
              <p className="text-xs text-slate-500">Plate: {v.plate}</p>
              <span className="inline-block mt-2 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{v.fuel}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-xl border space-y-4">
        <h3 className="font-bold text-sm">Add New Vehicle</h3>
        <div className="grid grid-cols-3 gap-3">
          <input required placeholder="Make & Model" value={form.makeModel} onChange={(e) => setForm({...form, makeModel: e.target.value})} className="p-2 border rounded-lg text-sm" />
          <input required placeholder="License Plate No." value={form.plate} onChange={(e) => setForm({...form, plate: e.target.value})} className="p-2 border rounded-lg text-sm" />
          <select value={form.fuel} onChange={(e) => setForm({...form, fuel: e.target.value})} className="p-2 border rounded-lg text-sm">
            <option>Octane</option>
            <option>Diesel</option>
            <option>Hybrid / EV</option>
          </select>
        </div>
        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-xs">+ Add Vehicle</button>
      </form>
    </div>
  );
}
