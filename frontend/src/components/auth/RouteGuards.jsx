import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Helper: where does each role land? ──────────────────────────────────────
function roleHome(role) {
  if (role === 'hod')   return '/hod';
  if (role === 'admin') return '/admin';
  return '/dashboard'; // teacher (default)
}

/**
 * PublicRoute — wraps login/signup.
 * If already authenticated, redirect to the correct portal for their role.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={roleHome(role)} replace />;
  return children;
}

/**
 * PrivateRoute — wraps any authenticated page.
 * If NOT authenticated, redirect to /login.
 */
export function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RoleRoute — wraps role-specific portals.
 * If the user's role is not in allowedRoles, redirect them to their correct portal.
 * Usage: <RoleRoute allowedRoles={['hod']}><HODLayout /></RoleRoute>
 */
export function RoleRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    // Wrong portal — send them to their correct one
    return <Navigate to={roleHome(role)} replace />;
  }
  return children;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
      <svg
        className="animate-spin h-8 w-8 text-[#0051d5]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
        role="img"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

