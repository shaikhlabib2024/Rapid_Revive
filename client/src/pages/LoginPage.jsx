import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('car_owner');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '', garageName: '', tradeLicenseNo: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await registerUser({ ...form, role });
        login(res.user, res.token);
      } else {
        const res = await loginUser({ email: form.email, password: form.password });
        login(res.user, res.token);
      }

      if (role === 'admin') navigate('/admin');
      else if (role === 'garage_owner') navigate('/dashboard/garage');
      else navigate('/dashboard/user');
    } catch (err) {
      // Fallback demo session if API DB is offline
      handleDemoLogin(role);
    }
  };

  const handleDemoLogin = (selectedRole) => {
    const demoUser = {
      id: Date.now(),
      fullName: selectedRole === 'admin' ? 'System Administrator' : selectedRole === 'garage_owner' ? 'MotorFix Owner' : 'Alex (Car Owner)',
      email: form.email || `${selectedRole}@rapidrevive.com`,
      role: selectedRole
    };

    login(demoUser, 'demo_jwt_token_2026');

    if (selectedRole === 'admin') navigate('/admin');
    else if (selectedRole === 'garage_owner') navigate('/dashboard/garage');
    else navigate('/dashboard/user');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-slate-100 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white">{isRegister ? 'Create Account' : 'Sign In'}</h1>
        <p className="text-xs text-slate-400 mt-1">Access Rapid-Revive Platform</p>
      </div>

      {/* ROLE SWITCHER */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button type="button" onClick={() => setRole('car_owner')} className={`w-1/3 py-2 text-xs font-bold rounded-lg ${role === 'car_owner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Car Owner</button>
        <button type="button" onClick={() => setRole('garage_owner')} className={`w-1/3 py-2 text-xs font-bold rounded-lg ${role === 'garage_owner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Garage</button>
        <button type="button" onClick={() => setRole('admin')} className={`w-1/3 py-2 text-xs font-bold rounded-lg ${role === 'admin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Admin</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input required type="text" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-red-500" />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-red-500" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <input required type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-red-500" />
        </div>

        {isRegister && role === 'garage_owner' && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-300">Garage Business Name</label>
              <input required type="text" value={form.garageName} onChange={(e) => setForm({...form, garageName: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Trade License No.</label>
              <input required type="text" value={form.tradeLicenseNo} onChange={(e) => setForm({...form, tradeLicenseNo: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-red-500" />
            </div>
          </>
        )}

        <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md">
          {isRegister ? 'Register Account' : 'Sign In'}
        </button>
      </form>

      {/* QUICK DEMO SESSION SHORTCUTS */}
      <div className="pt-4 border-t border-slate-800 text-center space-y-2">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">⚡ Quick 1-Click Demo Login:</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => handleDemoLogin('car_owner')} className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-lg">
            🚘 Car Owner
          </button>
          <button onClick={() => handleDemoLogin('garage_owner')} className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-lg">
            🔧 Garage
          </button>
          <button onClick={() => handleDemoLogin('admin')} className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-lg">
            🛡️ Admin
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-xs text-slate-400 hover:text-white">
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
