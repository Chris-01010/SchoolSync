import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin:   { label: 'Administrator', icon: 'admin_panel_settings', color: '#7b2ff7' },
  hod:     { label: 'Head of Department', icon: 'supervisor_account', color: '#0051d5' },
  teacher: { label: 'Teacher', icon: 'school', color: '#1a7a3a' },
};

export default function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleInfo = ROLE_LABELS[user?.role] ?? ROLE_LABELS.teacher;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 font-sans">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card px-8 py-10 flex flex-col items-center gap-6 text-center">

        {/* Avatar / Role badge */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${roleInfo.color}18` }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '40px', color: roleInfo.color, fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            aria-hidden="true"
          >
            {roleInfo.icon}
          </span>
        </div>

        <div>
          <h1 className="text-[28px] font-bold text-[#1b1b1f] mb-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-[#74747e] text-body-md">You are successfully signed in.</p>
        </div>

        {/* User info pill */}
        <div className="w-full bg-[#f8f9ff] border border-[#e1e2ec] rounded-xl px-5 py-4 text-left space-y-2">
          <InfoRow icon="person"         label="Name"  value={user?.name  ?? '—'} />
          <InfoRow icon="mail"           label="Email" value={user?.email ?? '—'} />
          <InfoRow icon="badge"          label="Role"  value={roleInfo.label} />
        </div>

        {/* Notice */}
        <p className="text-label-sm text-[#a8a8b0] italic">
          This is a placeholder dashboard. Full dashboard coming soon.
        </p>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-[#c6c6cd] text-[15px] text-[#ba1a1a] font-semibold
            flex items-center justify-center gap-2 hover:bg-[#fff0ee] transition-all duration-150"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="material-symbols-outlined text-[#74747e] flex-shrink-0"
        style={{ fontSize: '18px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-label-sm text-[#74747e] w-12 flex-shrink-0">{label}</span>
      <span className="text-label-md text-[#1b1b1f] font-medium truncate">{value}</span>
    </div>
  );
}
