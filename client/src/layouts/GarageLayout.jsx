import React, { useState, useEffect, useContext, useCallback } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getGarageStatus, toggleOnlineStatus } from '../api/garageApi';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';

export default function GarageLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(!!user?.isOnline);
  const [isVerified, setIsVerified] = useState(!!user?.isVerified);
  const [verificationStatus, setVerificationStatus] = useState(
    user?.verificationStatus || (user?.isVerified ? 'Approved' : 'Pending')
  );
  const navigate = useNavigate();
  const garageId = user?.garageId || 1;

  const loadGarageStatus = useCallback(async () => {
    try {
      const res = await getGarageStatus(garageId);
      if (res.success && res.garage) {
        const verified = !!res.garage.is_verified;
        setIsVerified(verified);
        setVerificationStatus(
          res.garage.verification_status || (verified ? 'Approved' : 'Pending')
        );
        setIsOnline(verified && !!res.garage.is_online);
      }
    } catch {
      // Keep current state if transient error
    }
  }, [garageId]);

  useEffect(() => {
    loadGarageStatus();
  }, [loadGarageStatus]);

  useRealtimeEvents(['garage:updated'], (evt) => {
    if (!evt.payload?.garageId || evt.payload.garageId === garageId) {
      loadGarageStatus();
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleOnline = async () => {
    if (!isVerified) return;
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await toggleOnlineStatus(garageId, nextState);
    } catch {
      setIsOnline(!nextState);
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
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/garage" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Rapid-Revive
            </Link>
            <span className="bg-amber-950/80 border border-amber-800/80 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Workshop Console
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
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
            <NavLink to="/garage/profile" className={navClass}>
              <span>📍</span> Workshop & Pin Map
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">
                {!isVerified
                  ? verificationStatus === 'Rejected'
                    ? '✕ Verification Rejected'
                    : '⏳ Waiting for Verification'
                  : isOnline
                  ? '🟢 Live on Radar'
                  : '⏸️ Shift Paused'}
              </span>

              <button
                type="button"
                disabled={!isVerified}
                onClick={handleToggleOnline}
                title={
                  !isVerified
                    ? 'Verification required before going online'
                    : isOnline
                    ? 'Click to Pause Dispatches'
                    : 'Click to Go Online'
                }
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                  !isVerified
                    ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                    : isOnline
                    ? 'bg-emerald-600 cursor-pointer'
                    : 'bg-slate-700 cursor-pointer'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                    isOnline && isVerified ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              <Link to="/garage/profile" className="text-xs text-slate-300 hover:text-white font-semibold">
                {user?.fullName || 'Workshop Owner'}
              </Link>
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

      {!isVerified && (
        <div
          className={`border-b px-6 py-2.5 text-center text-xs font-semibold ${
            verificationStatus === 'Rejected'
              ? 'bg-rose-950/80 border-rose-800 text-rose-200'
              : 'bg-amber-950/70 border-amber-800 text-amber-200'
          }`}
        >
          {verificationStatus === 'Rejected'
            ? '✕ Your workshop verification was rejected by System Admin. Dispatches are disabled until re-approved.'
            : '⏳ Your workshop is waiting for System Admin verification (Trade License & NID audit). Radar dispatches will activate once approved.'}
        </div>
      )}

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
