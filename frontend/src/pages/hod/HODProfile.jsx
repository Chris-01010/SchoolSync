import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Key, Mail, Phone, Building, Calendar, Check, X, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HODProfile() {
  const { user } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [deptName, setDeptName]   = useState('—');
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);
  const [prefs, setPrefs]         = useState({ emailLeave: true, emailRelief: true, dailyEmail: false });

  useEffect(() => {
    api.get('/api/v1/teachers/me')
      .then(async (p) => {
        setProfile(p);
        setForm({ name: p.name || '', phone: p.phone || '', email: p.email || '' });
        if (p.department_id) {
          try {
            const dept = await api.get(`/api/v1/departments/${p.department_id}`);
            setDeptName(dept?.name ?? '—');
          } catch { setDeptName('—'); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        await api.put(`/api/v1/teachers/${profile.id}`, { name: form.name }).catch(() => {});
      }
      setProfile(p => ({ ...p, name: form.name }));
      setEditing(false);
    } finally { setSaving(false); }
  };

  const displayName = profile?.name || user?.email || 'HOD';
  const initials    = displayName.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'HO';

  const fields = [
    { icon: Mail,     label: 'Email',      value: profile?.email || user?.email || '—' },
    { icon: Phone,    label: 'Phone',      value: profile?.phone || 'Not set' },
    { icon: Building, label: 'Department', value: deptName },
    { icon: User,     label: 'Employee ID',value: user?.college_id || '—' },
    { icon: Calendar, label: 'Role',       value: 'Head of Department' },
  ];

  return (
    <div className="max-w-[700px] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">My Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50">
            <Pencil size={12} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700">
              <Check size={12} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50">
              <X size={12} /> Cancel
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center text-[12px] text-gray-400">Loading profile…</div>
      ) : (
        <>
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl bg-purple-600 flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                {editing ? (
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="text-[16px] font-bold text-gray-900 border-b border-blue-400 outline-none bg-transparent w-full" />
                ) : (
                  <h2 className="text-[16px] font-bold text-gray-900">{displayName}</h2>
                )}
                <p className="text-[11px] text-gray-500 mt-0.5">Head of Department · {deptName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-[12px] font-semibold text-gray-700 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-gray-800 mb-4">Preferences</h3>
            <div className="space-y-3">
              {[
                { key: 'emailLeave',  label: 'Email notifications for leave approvals' },
                { key: 'emailRelief', label: 'Email notifications for relief assignments' },
                { key: 'dailyEmail',  label: 'Daily department summary (8:00 AM)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-8 h-4 rounded-full transition-all flex-shrink-0 relative cursor-pointer ${prefs[key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${prefs[key] ? 'left-4' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">Preferences are currently local-only and will reset on refresh.</p>
          </motion.div>

          {/* Change Password */}
          <button onClick={() => alert('Change Password coming soon.')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Key size={14} className="text-gray-400" /> Change Password
          </button>
        </>
      )}
    </div>
  );
}