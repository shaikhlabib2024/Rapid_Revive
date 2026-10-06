import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HeroPage from './pages/HeroPage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';

import CarOwnerDashboard from './pages/carOwner/CarOwnerDashboard';
import MyVehicles from './pages/carOwner/MyVehicles';
import GarageDashboard from './pages/garage/GarageDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import LicenseAudit from './pages/admin/LicenseAudit';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HeroPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/dashboard/user" element={<CarOwnerDashboard />} />
              <Route path="/dashboard/user/vehicles" element={<MyVehicles />} />
              <Route path="/dashboard/garage" element={<GarageDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/licenses" element={<LicenseAudit />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
