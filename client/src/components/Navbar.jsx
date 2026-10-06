import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-lg text-white tracking-tight">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          Rapid-Revive
        </Link>
        
        <div className="flex items-center gap-6 text-xs text-slate-300 font-semibold">
          <Link to="/" className="hover:text-red-400 transition">Home</Link>
          <Link to="/services" className="hover:text-red-400 transition">Services & Guides</Link>
          <Link to="/how-it-works" className="hover:text-red-400 transition">How It Works</Link>
          
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
              <span className="text-[11px] text-slate-400 font-mono">
                {user.fullName} ({user.role})
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
