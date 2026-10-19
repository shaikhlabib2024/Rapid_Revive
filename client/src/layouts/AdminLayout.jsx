import React, { useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="space-y-6">
          {/* BRAND & SHIELD */}
          <div>
            <Link to="/admin" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Rapid-Revive
            </Link>
            <span className="inline-block mt-1 bg-blue-950/80 border border-blue-800/80 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              🛡️ Master Admin Panel
            </span>
          </div>

          {/* ADMIN NAVIGATION LINKS */}
          <nav className="space-y-1.5">
            <NavLink to="/admin" end className={navClass}>
              <span>🏠</span> Admin Overview
            </NavLink>
            <NavLink to="/admin/dashboard" className={navClass}>
              <span>📊</span> Analytics & KPIs
            </NavLink>
            <NavLink to="/admin/licenses" className={navClass}>
              <span>📋</span> License Audit Queue
            </NavLink>
            <NavLink to="/admin/users" className={navClass}>
              <span>👥</span> User & Garage CRUD
            </NavLink>
            <NavLink to="/admin/settings" className={navClass}>
              <span>⚙️</span> Platform Settings
            </NavLink>
          </nav>
        </div>

        {/* SYSTEM STATUS & LOGOUT */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              All Systems Operational
            </span>
            <p className="text-[11px] text-slate-400">Server: Online (Vercel API)</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{user?.fullName || 'Root Administrator'}</p>
              <p className="text-[10px] text-slate-400">Superuser Privileges</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-lg transition"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* MOBILE ADMIN TOPBAR */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 h-16 flex items-center justify-between">
          <Link to="/admin" className="font-black text-white text-base">
            🛡️ Rapid-Revive Admin
          </Link>
          <div className="flex gap-2">
            <NavLink to="/admin" end className="text-xs font-bold px-2 py-1 bg-slate-800 rounded">Home</NavLink>
            <NavLink to="/admin/licenses" className="text-xs font-bold px-2 py-1 bg-slate-800 rounded">Queue</NavLink>
            <button onClick={handleLogout} className="text-xs font-bold text-rose-400 px-2 py-1 bg-rose-950/40 rounded">Logout</button>
          </div>
        </header>

        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
