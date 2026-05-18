// ─────────────────────────────────────────────────────────────────────────────
// src/pages/teacher/TeacherProfile.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Key, Mail, Phone, Building, Calendar } from 'lucide-react';
import { useTeacherProfile } from '../../hooks/useTeacherData';
import { useAuth } from '../../context/AuthContext';

export function TeacherProfile() {
  // ── Real data from API ────────────────────────────────────────────────────
  const { data: profile, loading } = useTeacherProfile();
  const { user } = useAuth();

  const [prefs, setPrefs] = useState({
    emailLeave: true,
    emailRelief: true,
    dailyEmail: false,
  });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  // Compose the view-model. Falls through profile → user → safe default so the
  // page never renders "undefined" while the fetch is in flight or if the
  // teacher profile is missing (e.g. admin viewing this page).
  const teacherData = {
    name: profile?.name ?? user?.email ?? 'Teacher',
    employeeId: user?.college_id ?? '—',
    email: user?.email ?? '—',
    phone: 'Not set',           // backend has no phone field yet
    department: profile?.department ?? '—',
    joined: 'N/A',              // backend doesn't expose created_at on profile
  };

  // Initials: first letter of first two words. Falls back to first 2 chars
  // (e.g. "te" for an email-as-name fallback).
  const initials =
    teacherData.name
      .split(' ')
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'T';

  const fields = [
    { icon: Mail,     label: 'Email',       value: teacherData.email },
    { icon: Phone,    label: 'Phone',       value: teacherData.phone },
    { icon: Building, label: 'Department',  value: teacherData.department },
    { icon: Calendar, label: 'Joined',      value: teacherData.joined },
  ];

  const prefItems = [
    { key: 'emailLeave',  label: 'Email notifications for leave updates' },
    { key: 'emailRelief', label: 'Email notifications for relief assignments' },
    { key: 'dailyEmail',  label: 'Daily schedule email (8:00 AM)' },
  ];

  return (
    <div className="max-w-[700px] space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">My Profile</h1>
        <button
          disabled
          title="Edit profile coming soon"
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                     text-[11px] font-semibold text-gray-400 bg-white cursor-not-allowed"
        >
          <Pencil size={12} /> Edit
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center text-[12px] text-gray-400">
          Loading profile…
        </div>
      ) : (
        <>
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white
                              text-[22px] font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">{teacherData.name}</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Employee ID: {teacherData.employeeId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-[12px] font-semibold text-gray-700 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preferences — local-only for now; not persisted to backend */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
          >
            <h3 className="text-[13px] font-bold text-gray-800 mb-4">Preferences</h3>
            <div className="space-y-3">
              {prefItems.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggle(key)}
                    className={`w-8 h-4 rounded-full transition-all flex-shrink-0 relative cursor-pointer ${
                      prefs[key] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
                        prefs[key] ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">
              Preferences are local-only for now — they reset on refresh.
            </p>
          </motion.div>

          {/* Change password */}
          <button
            disabled
            title="Change password coming soon"
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg
                       text-[12px] font-semibold text-gray-400 bg-white cursor-not-allowed"
          >
            <Key size={14} className="text-gray-300" />
            Change Password
          </button>
        </>
      )}
    </div>
  );
}

export default TeacherProfile;