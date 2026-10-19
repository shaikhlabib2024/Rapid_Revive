import React, { useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function DriverLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
      isActive
        ? 'bg-red-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* DRIVER TOP APP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* BRAND & ROLE BADGE */}
          <div className="flex items-center gap-3">
            <Link to="/driver" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              Rapid-Revive
            </Link>
            <span className="bg-red-950/80 border border-red-800/80 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Car Owner Portal
            </span>
          </div>

          {/* DRIVER PORTAL NAVIGATION TABS */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/driver" end className={navClass}>
              <span>🏠</span> Overview
            </NavLink>
            <NavLink to="/driver/sos" className={navClass}>
              <span>🚨</span> Live SOS Tracker
            </NavLink>
            <NavLink to="/driver/vehicles" className={navClass}>
              <span>🚘</span> My Vehicles
            </NavLink>
            <NavLink to="/driver/booking" className={navClass}>
              <span>🔧</span> Book Maintenance
            </NavLink>
            <NavLink to="/driver/invoices" className={navClass}>
              <span>🧾</span> Invoices
            </NavLink>
          </nav>

          {/* USER ACTIONS & LOGOUT */}
          <div className="flex items-center gap-3">
            <Link 
              to="/driver/sos" 
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 animate-pulse"
            >
              <span>🚨</span> SOS Quick Call
            </Link>

            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-xs text-slate-300 font-semibold">
                {user?.fullName || 'Driver'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DRIVER WORKSPACE BODY */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
