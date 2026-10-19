import React, { useState, useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toggleOnlineStatus } from '../api/garageApi';

export default function GarageLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await toggleOnlineStatus(user?.garageId || 1, nextState);
    } catch (err) {
      // Local fallback
    }
  };

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
      isActive
        ? 'bg-amber-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* GARAGE TOP CONSOLE BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* WORKSHOP IDENTITY */}
          <div className="flex items-center gap-3">
            <Link to="/garage" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Rapid-Revive
            </Link>
            <span className="bg-amber-950/80 border border-amber-800/80 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Workshop Console
            </span>
          </div>

          {/* GARAGE NAVIGATION TABS */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/garage" end className={navClass}>
              <span>🏠</span> Overview
            </NavLink>
            <NavLink to="/garage/dispatch" className={navClass}>
              <span>🚨</span> Dispatch Radar
            </NavLink>
            <NavLink to="/garage/jobs" className={navClass}>
              <span>🔧</span> Active Jobs
            </NavLink>
            <NavLink to="/garage/services" className={navClass}>
              <span>📋</span> Service Menu
            </NavLink>
            <NavLink to="/garage/earnings" className={navClass}>
              <span>💰</span> Earnings
            </NavLink>
          </nav>

          {/* OPERATIONAL ONLINE TOGGLE & LOGOUT */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition border flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                  : 'bg-rose-950/80 border-rose-700 text-rose-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>

            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-xs text-slate-300 font-semibold">
                {user?.fullName || 'MotorFix Garage'}
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

      {/* GARAGE WORKSPACE BODY */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
