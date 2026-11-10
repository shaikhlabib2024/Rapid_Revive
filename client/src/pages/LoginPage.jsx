import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('car_owner');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    garageName: '',
    address: '',
    tradeLicenseNo: '',
    nidNumber: ''
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const redirectByRole = (userRole) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'garage_owner') navigate('/garage');
    else navigate('/driver');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = isRegister
        ? await registerUser({ ...form, role })
        : await loginUser({ email: form.email, password: form.password });

      login(res.user, res.token);
      redirectByRole(res.user.role);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Authentication failed. Ensure the server and database are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-slate-100 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-white">{isRegister ? 'Create Account' : 'Sign In'}</h1>
        <p className="text-xs text-slate-400">Access Rapid-Revive Platform</p>
      </div>

      {/* ROLE SWITCHER */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
        <button type="button" onClick={() => setRole('car_owner')} className={`w-1/3 py-2 text-xs font-bold rounded-xl transition ${role === 'car_owner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Car Owner</button>
        <button type="button" onClick={() => setRole('garage_owner')} className={`w-1/3 py-2 text-xs font-bold rounded-xl transition ${role === 'garage_owner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Garage</button>
        <button type="button" onClick={() => setRole('admin')} className={`w-1/3 py-2 text-xs font-bold rounded-xl transition ${role === 'admin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>Admin</button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isRegister && (
          <div>
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input required type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-rose-500" />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-rose-500" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-rose-500" />
        </div>

        {isRegister && (
          <div>
            <label className="text-xs font-semibold text-slate-300">Mobile Phone Number</label>
            <input required type="text" placeholder="e.g. 01711-234567" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-rose-500" />
          </div>
        )}

        {isRegister && role === 'garage_owner' && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-300">Garage Business Name</label>
              <input required type="text" value={form.garageName} onChange={(e) => setForm({ ...form, garageName: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Workshop Address</label>
              <input required type="text" placeholder="e.g. Block C, Bashundhara R/A, Dhaka" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Trade License No.</label>
              <input required type="text" placeholder="e.g. TL-2026-9901" value={form.tradeLicenseNo} onChange={(e) => setForm({ ...form, tradeLicenseNo: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">National ID (NID) No.</label>
              <input required type="text" placeholder="e.g. NID-1984269104882" value={form.nidNumber} onChange={(e) => setForm({ ...form, nidNumber: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs mt-1 text-white focus:outline-none focus:border-amber-500" />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition shadow-md"
        >
          {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-2">
        <button type="button" onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} className="text-xs text-slate-400 hover:text-white">
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
