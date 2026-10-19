import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Shells
import PublicLayout from './layouts/PublicLayout';
import DriverLayout from './layouts/DriverLayout';
import GarageLayout from './layouts/GarageLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HeroPage from './pages/HeroPage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';

// Car Owner (Driver) Portal Pages
import DriverHeroPage from './pages/carOwner/DriverHeroPage';
import CarOwnerDashboard from './pages/carOwner/CarOwnerDashboard';
import MyVehicles from './pages/carOwner/MyVehicles';
import BookServicePage from './pages/carOwner/BookServicePage';
import DriverInvoicesPage from './pages/carOwner/DriverInvoicesPage';

// Garage Owner Portal Pages
import GarageHeroPage from './pages/garage/GarageHeroPage';
import GarageDashboard from './pages/garage/GarageDashboard';
import GarageJobsPage from './pages/garage/GarageJobsPage';
import GarageServicesPage from './pages/garage/GarageServicesPage';
import GarageEarningsPage from './pages/garage/GarageEarningsPage';

// System Administrator Portal Pages
import AdminHeroPage from './pages/admin/AdminHeroPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import LicenseAudit from './pages/admin/LicenseAudit';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ========================================================
              1. PUBLIC HERO WEBSITE (Unauthenticated Marketing & Auth)
              ======================================================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HeroPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* ========================================================
              2. CAR OWNER DEDICATED SITE (Driver Cockpit)
              ======================================================== */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['car_owner']}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverHeroPage />} />
            <Route path="sos" element={<CarOwnerDashboard />} />
            <Route path="vehicles" element={<MyVehicles />} />
            <Route path="booking" element={<BookServicePage />} />
            <Route path="invoices" element={<DriverInvoicesPage />} />
          </Route>

          {/* ========================================================
              3. GARAGE OWNER DEDICATED SITE (Workshop Console)
              ======================================================== */}
          <Route
            path="/garage"
            element={
              <ProtectedRoute allowedRoles={['garage_owner']}>
                <GarageLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GarageHeroPage />} />
            <Route path="dispatch" element={<GarageDashboard />} />
            <Route path="jobs" element={<GarageJobsPage />} />
            <Route path="services" element={<GarageServicesPage />} />
            <Route path="earnings" element={<GarageEarningsPage />} />
          </Route>

          {/* ========================================================
              4. SYSTEM ADMINISTRATOR DEDICATED SITE (Master Control)
              ======================================================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHeroPage />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="licenses" element={<LicenseAudit />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Legacy route redirects */}
          <Route path="/dashboard/user" element={<Navigate to="/driver" replace />} />
          <Route path="/dashboard/user/vehicles" element={<Navigate to="/driver/vehicles" replace />} />
          <Route path="/dashboard/garage" element={<Navigate to="/garage" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
