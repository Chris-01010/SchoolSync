import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicRoute, PrivateRoute } from './components/auth/RouteGuards';
import { useAuth } from './context/AuthContext';

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPlaceholder = lazy(() => import('./pages/DashboardPlaceholder'));

// ─── Teacher dashboard (existing, untouched) ─────────────────────────────────
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));

// ─── Legacy app (existing, untouched) ────────────────────────────────────────
const LegacyApp = lazy(() => import('./LegacyApp'));

// ─── HOD layout + pages ──────────────────────────────────────────────────────
const HODLayout = lazy(() => import('./components/layout/HODLayout'));
const HODDashboard = lazy(() => import('./components/HODDashboard'));
const TimetableGrid = lazy(() => import('./components/TimetableGrid'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const ReliefManagement = lazy(() => import('./pages/ReliefManagement'));

// ─── Placeholder for Analytics (not yet built) ───────────────────────────────
const AnalyticsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="text-blue-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </div>
    <p className="text-[13px] font-semibold text-gray-500">
      Analytics coming soon
    </p>
  </div>
);

// ─── Page loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-[32px] font-bold text-gray-900">
      Page not found
    </h1>

    <p className="text-gray-400 text-sm">
      The page you're looking for doesn't exist.
    </p>

    <a
      href="/login"
      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
    >
      ← Back to Sign in
    </a>
  </div>
);

function RoleBasedDashboard() {
  const { user } = useAuth();
  if (user?.role === 'hod') return <Navigate to="/hod" replace />;
  if (user?.role === 'admin') return <Navigate to="/app" replace />;
  return <TeacherDashboard />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes */}
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
              path="/verify-email"
              element={<VerifyEmailPage />}
            />

            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* ── HOD Portal (/hod/*) ── */}
            <Route
              path="/hod"
              element={
                <PrivateRoute>
                  <HODLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<HODDashboard />} />
              <Route path="timetables" element={<TimetableGrid />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="relief" element={<ReliefManagement />} />
              <Route path="analytics" element={<AnalyticsPlaceholder />} />
            </Route>

            {/* Role-based dashboard */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />

            {/* Legacy app */}
            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <LegacyApp />
                </PrivateRoute>
              }
            />

            {/* Placeholder dashboard */}
            <Route
              path="/placeholder"
              element={
                <PrivateRoute>
                  <DashboardPlaceholder />
                </PrivateRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}