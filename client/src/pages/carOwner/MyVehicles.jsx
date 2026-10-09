import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUserVehicles, addVehicle, deleteVehicle } from '../../api/vehicleApi';

export default function MyVehicles() {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ makeModel: '', plate: '', fuel: 'Octane' });

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    try {
      if (user?.id) {
        const res = await getUserVehicles(user.id);
        if (res.success && res.vehicles.length > 0) {
          setVehicles(res.vehicles.map(v => ({
            id: v.vehicle_id,
            makeModel: v.make_model,
            plate: v.license_plate,
            fuel: v.fuel_type
          })));
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('Using local vehicle cache / fallback');
    }

    // Fallback to local storage or defaults
    const cached = localStorage.getItem(`vehicles_${user?.id || 'demo'}`);
    if (cached) {
      setVehicles(JSON.parse(cached));
    } else {
      const defaultVehicles = [
        { id: 1, makeModel: 'Toyota Corolla 2021', plate: 'Dhaka Metro-Ga-12-3456', fuel: 'Octane' }
      ];
      setVehicles(defaultVehicles);
      localStorage.setItem(`vehicles_${user?.id || 'demo'}`, JSON.stringify(defaultVehicles));
    }
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newVehicle = {
      makeModel: form.makeModel,
      plate: form.plate,
      fuel: form.fuel
    };

    try {
      const res = await addVehicle({
        userId: user?.id || 1,
        makeModel: form.makeModel,
        licensePlate: form.plate,
        fuelType: form.fuel
      });
      if (res.success) {
        const added = {
          id: res.vehicle.vehicle_id,
          makeModel: res.vehicle.make_model,
          plate: res.vehicle.license_plate,
          fuel: res.vehicle.fuel_type
        };
        const updated = [...vehicles, added];
        setVehicles(updated);
        localStorage.setItem(`vehicles_${user?.id || 'demo'}`, JSON.stringify(updated));
        setForm({ makeModel: '', plate: '', fuel: 'Octane' });
        return;
      }
    } catch (err) {
      // Local fallback
    }

    const localVehicle = { ...newVehicle, id: Date.now() };
    const updated = [...vehicles, localVehicle];
    setVehicles(updated);
    localStorage.setItem(`vehicles_${user?.id || 'demo'}`, JSON.stringify(updated));
    setForm({ makeModel: '', plate: '', fuel: 'Octane' });
  };

  const handleDelete = async (vehicleId) => {
    try {
      await deleteVehicle(vehicleId);
    } catch (err) {
      // Ignore API failure for demo fallback
    }
    const filtered = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(filtered);
    localStorage.setItem(`vehicles_${user?.id || 'demo'}`, JSON.stringify(filtered));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Registered Vehicles</h1>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
          {vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''} Linked
        </span>
      </div>
      
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
            <button 
              onClick={() => handleDelete(v.id)}
              className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded-lg transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white">Add New Vehicle Profile</h3>
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
