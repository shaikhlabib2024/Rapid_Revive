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
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      <h1 className="text-2xl font-bold text-white">My Registered Vehicles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-base">{v.makeModel}</h3>
              <p className="text-xs text-slate-400 mt-0.5">License Plate: {v.plate}</p>
              <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold border border-slate-700">
                {v.fuel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white">Add New Vehicle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input 
            required 
            placeholder="Make & Model (e.g. Toyota Premio)" 
            value={form.makeModel} 
            onChange={(e) => setForm({...form, makeModel: e.target.value})} 
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500" 
          />
          <input 
            required 
            placeholder="License Plate No." 
            value={form.plate} 
            onChange={(e) => setForm({...form, plate: e.target.value})} 
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500" 
          />
          <select 
            value={form.fuel} 
            onChange={(e) => setForm({...form, fuel: e.target.value})} 
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="Octane" className="bg-slate-900 text-white p-2">Octane</option>
            <option value="Diesel" className="bg-slate-900 text-white p-2">Diesel</option>
            <option value="Hybrid / EV" className="bg-slate-900 text-white p-2">Hybrid / EV</option>
            <option value="CNG" className="bg-slate-900 text-white p-2">CNG</option>
          </select>
        </div>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md">
          + Add Vehicle Profile
        </button>
      </form>
    </div>
  );
}
