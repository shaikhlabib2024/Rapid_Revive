import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-base mb-2">⚡ Rapid-Revive</h3>
          <p className="leading-relaxed">With You Through Every Drive and Detour. Digitizing roadside assistance & routine vehicle maintenance.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Support Hotline</h4>
          <p className="text-red-400 font-bold text-sm">📞 1-800-REVIVE-SOS (24/7)</p>
          <p className="mt-1">Department of CSE, UITS</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Platform Portals</h4>
          <ul className="space-y-1">
            <li><a href="/login" className="hover:underline">Car Owner Portal</a></li>
            <li><a href="/login" className="hover:underline">Garage Partner Portal</a></li>
            <li><a href="/login" className="hover:underline">System Admin Panel</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-8 pt-6 border-t border-slate-900">
        © 2026 Rapid-Revive. All Rights Reserved.
      </div>
    </footer>
  );
}
