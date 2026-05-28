import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Key, Mail, Phone, Building, Calendar, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { useTeacherProfile } from '../../hooks/useTeacherData';
import { useAuth } from '../../context/AuthContext';

export function TeacherProfile() {
  const { data: profile, loading } = useTeacherProfile();
  const { user } = useAuth();

  const [editing, setEditing]         = useState(false);
  const [editValues, setEditValues]   = useState({});
  const [savedValues, setSavedValues] = useState({});
  const [deptName, setDeptName]       = useState('—');
  const [prefs, setPrefs]             = useState({ emailLeave: true, emailRelief: true, dailyEmail: false });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    if (!profile?.department_id) return;
    api.get(`/api/v1/departments/${profile.department_id}`)
      .then(d => setDeptName(d?.name ?? '—'))
      .catch(() => setDeptName('—'));
  }, [profile?.department_id]);

  useEffect(() => {
    const initial = {
      name:       profile?.name    ?? user?.email ?? 'Teacher',
      employeeId: user?.college_id ?? '—',
      email:      profile?.email   ?? user?.email ?? '—',
      phone:      profile?.phone   ?? 'Not set',
      joined:     profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A',
    };
    setSavedValues(initial);
    setEditValues(initial);
  }, [profile, user]);

  useEffect(() => {
    setSavedValues(prev => ({ ...prev, department: deptName }));
    setEditValues(prev  => ({ ...prev, department: deptName }));
  }, [deptName]);

  const handleEditSave = async () => {
    try {
      setSavedValues({ ...editValues });
      setEditing(false);
      if (profile?.id) await api.put(`/api/v1/teachers/${profile.id}`, { name: editValues.name }).catch(() => {});
    } catch { alert('Failed to save profile.'); }
  };

  const displayName = savedValues.name || 'Teacher';
  const initials    = displayName.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'T';

  const fieldDefs = [
    { icon: Mail,     label: 'Email',      key: 'email'      },
    { icon: Phone,    label: 'Phone',      key: 'phone'      },
    { icon: Building, label: 'Department', key: 'department' },
    { icon: Calendar, label: 'Joined',     key: 'joined'     },
  ];

  const prefItems = [
    { key: 'emailLeave',  label: 'Email notifications for leave updates'      },
    { key: 'emailRelief', label: 'Email notifications for relief assignments'  },
    { key: 'dailyEmail',  label: 'Daily schedule email (8:00 AM)'             },
  ];

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5 py-4">
      <div className="max-w-[700px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[18px] font-bold text-gray-900">My Profile</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50">
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleEditSave}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700">
                <Check size={12} /> Save
              </button>
              <button onClick={() => { setEditValues({ ...savedValues }); setEditing(false); }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50">
                <X size={12} /> Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center text-[12px] text-gray-400">
            Loading profile…
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <input value={editValues.name || ''} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                      className="text-[16px] font-bold text-gray-900 border-b border-blue-400 outline-none bg-transparent w-full" />
                  ) : (
                    <h2 className="text-[16px] font-bold text-gray-900">{displayName}</h2>
                  )}
                  <p className="text-[11px] text-gray-500 mt-0.5">Employee ID: {savedValues.employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fieldDefs.map(({ icon: Icon, label, key }) => (
                  <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                    <Icon size={14} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                      {editing && key !== 'employeeId' && key !== 'joined' && key !== 'department' ? (
                        <input value={editValues[key] || ''} onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                          className="text-[12px] font-semibold text-gray-700 bg-transparent border-b border-blue-400 outline-none w-full" />
                      ) : (
                        <p className="text-[12px] font-semibold text-gray-700 truncate">{savedValues[key]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
              <h3 className="text-[13px] font-bold text-gray-800 mb-4">Preferences</h3>
              <div className="space-y-3">
                {prefItems.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => toggle(key)}
                      className={`w-8 h-4 rounded-full transition-all flex-shrink-0 relative cursor-pointer ${prefs[key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${prefs[key] ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-4 italic">Preferences are currently local-only and will reset on refresh.</p>
            </motion.div>

            <button onClick={() => alert('Change Password feature will be connected to backend soon.')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Key size={14} className="text-gray-400" /> Change Password
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default TeacherProfile;