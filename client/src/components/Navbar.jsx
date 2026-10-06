import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'garage_owner') return '/dashboard/garage';
    return '/dashboard/user';
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          Rapid-Revive
        </Link>
        
        <div className="flex items-center gap-6 text-xs text-slate-300 font-semibold">
          <Link to="/" className="hover:text-red-400 transition">Home</Link>
          <Link to="/services" className="hover:text-red-400 transition">Services & Guides</Link>
          <Link to="/how-it-works" className="hover:text-red-400 transition">How It Works</Link>

          {user && (
            <Link to={getDashboardLink()} className="text-red-400 hover:text-red-300 font-bold underline">
              {user.role === 'admin' ? '🛡️ Admin Panel' : user.role === 'garage_owner' ? '🔧 Garage Portal' : '🚘 Driver Portal'}
            </Link>
          )}

          {user && user.role === 'car_owner' && (
            <Link to="/dashboard/user/vehicles" className="hover:text-slate-100 transition">
              My Vehicles
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
              <span className="text-[11px] text-slate-400 font-mono">
                👤 {user.fullName}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg transition border border-slate-700"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
