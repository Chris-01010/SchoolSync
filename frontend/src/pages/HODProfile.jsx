import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  User, Mail, Hash, Building2, ShieldCheck, CalendarDays, AlertCircle, RefreshCw,
} from 'lucide-react';

// ─── Avatar helpers ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-600','bg-violet-600','bg-emerald-600',
  'bg-amber-600','bg-rose-600','bg-cyan-600','bg-indigo-600',
];

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function avatarColor(name = '') {
  const code = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Profile field row ───────────────────────────────────────────────────────
const ProfileField = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-blue-600" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[13px] font-semibold truncate ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
        {value || <span className="text-gray-300 font-normal">Not available</span>}
      </p>
    </div>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);
const ProfileSkeleton = () => (
  <div className="space-y-5 max-w-2xl mx-auto">
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex items-center gap-5">
      <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Error state ─────────────────────────────────────────────────────────────
const ProfileError = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-6">
    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
      <AlertCircle size={22} className="text-red-500" />
    </div>
    <div>
      <h3 className="text-[15px] font-bold text-gray-800 mb-1">Couldn't load profile</h3>
      <p className="text-[12px] text-gray-400 max-w-[280px]">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
    >
      <RefreshCw size={13} /> Try Again
    </button>
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const HODProfile = () => {
  const { user: authUser } = useOutletContext() ?? {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('schoolsync_token');
        if (!token) throw new Error('Not authenticated. Please log in again.');

        // Primary: dedicated HOD profile endpoint
        const res = await fetch('http://localhost:8000/hod/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const d = await res.json();
        if (!cancelled) setProfile(d);
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'An unexpected error occurred.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [retryKey]);

  if (loading) return <ProfileSkeleton />;
  if (error)   return <ProfileError message={error} onRetry={() => setRetryKey(k => k + 1)} />;

  // Normalise fields — handle varied backend field names gracefully
  const p = {
    name:         profile?.name         ?? profile?.full_name       ?? authUser?.name       ?? '—',
    employee_id:  profile?.employee_id  ?? profile?.id              ?? '—',
    email:        profile?.email        ?? authUser?.email           ?? '—',
    department:   profile?.department   ?? profile?.department_name  ?? authUser?.department ?? '—',
    role:         profile?.role         ?? 'HOD',
    joining_date: profile?.joining_date ?? profile?.created_at       ?? null,
  };

  const initials = getInitials(p.name);
  const avatarBg = avatarColor(p.name);

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="space-y-5 max-w-2xl mx-auto">

        {/* Banner card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
          <div className="flex items-center gap-5 p-6">
            <div className={`w-20 h-20 rounded-full ${avatarBg} flex items-center justify-center text-white text-[26px] font-bold flex-shrink-0 shadow-md`}>
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight truncate">{p.name}</h2>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5 truncate">{p.department} Department</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  <ShieldCheck size={10} /> HEAD OF DEPARTMENT
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detail fields */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
        >
          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Details</h3>
          <ProfileField icon={User}         label="Full Name"    value={p.name} />
          <ProfileField icon={Hash}         label="Employee ID"  value={p.employee_id} highlight />
          <ProfileField icon={Mail}         label="Email"        value={p.email} />
          <ProfileField icon={Building2}    label="Department"   value={p.department} />
          <ProfileField icon={ShieldCheck}  label="Role"         value="Head of Department (HOD)" />
          <ProfileField icon={CalendarDays} label="Joining Date" value={formatDate(p.joining_date)} />
        </motion.div>

        <p className="text-center text-[10px] text-gray-300 font-medium pb-2">
          Data fetched live from database · Role: HOD · Dept: {p.department}
        </p>
      </div>
    </div>
  );
};

export default HODProfile;