import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicRoute, PrivateRoute, RoleRoute } from './components/auth/RouteGuards';

// ─── Role redirect ────────────────────────────────────────────────────────────
function RoleRedirect() {
  const { role } = useAuth();
  if (role === 'hod')   return <Navigate to="/hod"       replace />;
  if (role === 'admin') return <Navigate to="/admin"     replace />;
  return                       <Navigate to="/dashboard" replace />;
}

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const SignupPage         = lazy(() => import('./pages/SignupPage'));
const VerifyEmailPage    = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));

// ─── HOD layout + pages ──────────────────────────────────────────────────────
const HODLayout        = lazy(() => import('./components/layout/HODLayout'));
const HODDashboard     = lazy(() => import('./components/HODDashboard'));
const TimetableGrid    = lazy(() => import('./components/TimetableGrid'));
const LeaveManagement  = lazy(() => import('./pages/LeaveManagement'));
const ReliefManagement = lazy(() => import('./pages/ReliefManagement'));

// ─── Teacher layout + pages ──────────────────────────────────────────────────
const TeacherLayout        = lazy(() => import('./components/layout/TeacherLayout'));
const TeacherHome          = lazy(() => import('./pages/teacher/TeacherHome'));
const MyTimetable          = lazy(() => import('./pages/teacher/MyTimetable'));
const ReliefTimetable      = lazy(() => import('./pages/teacher/ReliefTimetable'));
const MyLeaves             = lazy(() => import('./pages/teacher/MyLeaves'));
const MyReliefDuties       = lazy(() => import('./pages/teacher/MyReliefDuties'));
const MyWorkload           = lazy(() => import('./pages/teacher/MyWorkload'));
const TeacherNotifications = lazy(() => import('./pages/teacher/TeacherNotifications'));
const TeacherProfile       = lazy(() => import('./pages/teacher/TeacherProfile'));

// ─── Admin layout + pages ────────────────────────────────────────────────────
const AdminLayout           = lazy(() => import('./components/layout/AdminLayout'));
const AdminHome             = lazy(() => import('./pages/AdminHome'));
const TimetablePage         = lazy(() => import('./pages/TimetablePage'));
const ReliefManagementPage  = lazy(() => import('./pages/ReliefManagementPage'));
const LeaveOversightPage    = lazy(() => import('./pages/LeaveOversightPage'));
const UserManagementPage    = lazy(() => import('./pages/UserManagementPage'));
const WorkloadAnalyticsPage = lazy(() => import('./pages/WorkloadAnalyticsPage'));
const DepartmentsPage       = lazy(() => import('./pages/DepartmentsPage'));
const RoomsResourcesPage    = lazy(() => import('./pages/RoomsResourcesPage'));
const ReportsPage           = lazy(() => import('./pages/ReportsPage'));
const AnnouncementsPage     = lazy(() => import('./pages/AnnouncementsPage'));
const SettingsPage          = lazy(() => import('./pages/SettingsPage'));

// ─── Legacy app ───────────────────────────────────────────────────────────────
const LegacyApp = lazy(() => import('./LegacyApp'));

// ─── Placeholders ─────────────────────────────────────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-[14px] font-medium text-gray-500">Coming soon</p>
  </div>
);

const AnalyticsPlaceholder = () => <PlaceholderPage title="HOD Analytics" />;

// ─── Loaders / 404 ────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-[32px] font-bold text-gray-900">Page not found</h1>
    <p className="text-gray-400 text-sm">The page you're looking for doesn't exist.</p>
    <a
      href="/login"
      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
    >
      ← Back to Sign in
    </a>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Root → role-based redirect (protected) */}
            <Route path="/" element={<PrivateRoute><RoleRedirect /></PrivateRoute>} />

            {/* ── Auth ─────────────────────────────────────────────────────── */}
            <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup"          element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/verify-email"    element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* ── Admin Portal — admin role only ───────────────────────────── */}
            <Route
              path="/admin"
              element={<RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute>}
            >
              <Route index              element={<AdminHome />} />
              <Route path="timetables"  element={<TimetablePage />} />
              <Route path="relief"      element={<ReliefManagementPage />} />
              <Route path="leave"       element={<LeaveOversightPage />} />
              <Route path="users"       element={<UserManagementPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="rooms"       element={<RoomsResourcesPage />} />
              <Route path="analytics"   element={<WorkloadAnalyticsPage />} />
              <Route path="reports"     element={<ReportsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="settings"    element={<SettingsPage />} />
            </Route>

            {/* ── HOD Portal — hod role only ───────────────────────────────── */}
            <Route
              path="/hod"
              element={<RoleRoute allowedRoles={['hod']}><HODLayout /></RoleRoute>}
            >
              <Route index             element={<HODDashboard />} />
              <Route path="timetables" element={<TimetableGrid />} />
              <Route path="leave"      element={<LeaveManagement />} />
              <Route path="relief"     element={<ReliefManagement />} />
              <Route path="analytics"  element={<AnalyticsPlaceholder />} />
            </Route>

            {/* ── Teacher Portal — teacher role only ──────────────────────── */}
            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <LegacyApp />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod-dashboard"
              element={
                <PrivateRoute>
                  <HODDashboard />
                </PrivateRoute>
              }
            />
              <Route
              path="/dashboard"
              element={<RoleRoute allowedRoles={['teacher']}><TeacherLayout /></RoleRoute>}
            >
              <Route index                   element={<TeacherHome />} />
              <Route path="timetable"        element={<MyTimetable />} />
              <Route path="relief-timetable" element={<ReliefTimetable />} />
              <Route path="leaves"           element={<MyLeaves />} />
              <Route path="relief-duties"    element={<MyReliefDuties />} />
              <Route path="workload"         element={<MyWorkload />} />
              <Route path="notifications"    element={<TeacherNotifications />} />
              <Route path="profile"          element={<TeacherProfile />} />
            </Route>

            {/* ── Legacy ───────────────────────────────────────────────────── */}
            <Route path="/app/*" element={<PrivateRoute><LegacyApp /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
