import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicRoute, PrivateRoute } from './components/auth/RouteGuards';

// Lazy-loaded pages (code-split for performance)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPlaceholder = lazy(() => import('./pages/DashboardPlaceholder'));

// Legacy authenticated dashboard (role-based, unchanged)
const LegacyApp = lazy(() => import('./LegacyApp'));

// Full-page loader used while lazy chunks download
const PageLoader = () => (
  <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
    <svg
      className="animate-spin h-8 w-8 text-[#0051d5]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading page"
      role="img"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4 p-6 text-center font-sans">
    <span
      className="material-symbols-outlined text-[#c6c6cd]"
      style={{ fontSize: '72px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      aria-hidden="true"
    >
      search_off
    </span>
    <h1 className="text-[32px] font-bold text-[#1b1b1f]">Page not found</h1>
    <p className="text-[#74747e] text-body-md">The page you're looking for doesn't exist.</p>
    <a href="/login" className="mt-2 text-[#0051d5] font-semibold hover:text-[#003fa6] transition-colors">
      ← Back to Sign in
    </a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPlaceholder />
                </PrivateRoute>
              }
            />
            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <LegacyApp />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

