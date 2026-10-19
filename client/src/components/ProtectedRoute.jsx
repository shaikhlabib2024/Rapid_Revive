import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dedicated role portal if unauthorized for this route
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'garage_owner') return <Navigate to="/garage" replace />;
    return <Navigate to="/driver" replace />;
  }

  return children;
}
