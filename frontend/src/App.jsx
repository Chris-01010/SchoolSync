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

// ─── Admin dashboard layout + pages ──────────────────────────────────────────
const AdminLayout            = lazy(() => import('./components/layout/AdminLayout'));
const AdminHome              = lazy(() => import('./pages/AdminHome'));
const TimetablePage          = lazy(() => import('./pages/TimetablePage'));
const ReliefManagementPage   = lazy(() => import('./pages/ReliefManagementPage'));
const LeaveOversightPage     = lazy(() => import('./pages/LeaveOversightPage'));
const UserManagementPage     = lazy(() => import('./pages/UserManagementPage'));
const WorkloadAnalyticsPage  = lazy(() => import('./pages/WorkloadAnalyticsPage'));
const DepartmentsPage        = lazy(() => import('./pages/DepartmentsPage'));
const RoomsResourcesPage     = lazy(() => import('./pages/RoomsResourcesPage'));
const ReportsPage            = lazy(() => import('./pages/ReportsPage'));

// ─── Placeholder for Unbuilt Admin Pages ───────────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-[14px] font-medium text-gray-500">Coming soon</p>
  </div>
);

const AnalyticsPlaceholder = () => <PlaceholderPage title="HOD Analytics" />;

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

            {/* ── Admin Dashboard (Root) ── */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="timetables" element={<TimetablePage />} />
              <Route path="relief" element={<ReliefManagementPage />} />
              <Route path="leave" element={<LeaveOversightPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="rooms" element={<RoomsResourcesPage />} />
              <Route path="analytics" element={<WorkloadAnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="announcements" element={<PlaceholderPage title="Announcements" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>

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