// ─────────────────────────────────────────────────────────────────────────────
// src/pages/teacher/TeacherNotifications.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Repeat2, Users, Bell, Check } from 'lucide-react';
import { useTeacherNotifications } from '../../hooks/useTeacherData';

const BASE = 'http://localhost:8000';

const ICON_MAP = {
  leave_approved:  { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  relief_assigned: { icon: Repeat2,      bg: 'bg-orange-50',  color: 'text-orange-500' },
  announcement:    { icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-500' },
};

const TABS = ['All', 'Unread', 'Alerts', 'Announcements'];

export function TeacherNotifications() {
  // ── Real data from API ────────────────────────────────────────────────────
  const { data: fetchedNotifs, loading } = useTeacherNotifications();

  const [notifs, setNotifs] = useState([]);
  const [tab, setTab] = useState(0);

  // Sync server data into local state so we can optimistically toggle `read`
  // without a refetch round-trip on every "Mark" click.
  useEffect(() => {
    if (fetchedNotifs.length > 0) setNotifs(fetchedNotifs);
  }, [fetchedNotifs]);

  // Mark a single notification read. Optimistic: flip the UI first, fire the
  // PATCH, roll back if it fails. This matches the responsiveness users expect
  // from notifications.
  const markRead = async (id) => {
    // optimistic flip
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    try {
      const token = localStorage.getItem('schoolsync_token');
      const res = await fetch(`${BASE}/teacher/me/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // rollback on failure
      console.error('Failed to mark notification read:', err);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  // Mark all read — currently local-only. Backend has no bulk endpoint yet.
  // TODO: replace with single POST /teacher/me/notifications/mark-all-read
  // when backend supports it.
  const markAll = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const displayed =
    tab === 1 ? notifs.filter((n) => !n.read)
    : tab === 2 ? notifs.filter((n) => ['relief_assigned'].includes(n.type))
    : tab === 3 ? notifs.filter((n) => n.type === 'announcement')
    : notifs;

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-[700px] space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">Notifications</h1>
        <button
          onClick={markAll}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:underline disabled:text-gray-300 disabled:cursor-not-allowed disabled:no-underline"
        >
          <Check size={12} /> Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
              tab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'Unread' && unreadCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full
                               bg-red-100 text-red-600 text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-[12px]">Loading notifications…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-[12px] font-semibold">All caught up! No new notifications.</p>
          </div>
        ) : (
          displayed.map((n, i) => {
            const cfg = ICON_MAP[n.type] ?? ICON_MAP.announcement;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  n.read
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50/40 border-blue-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-[10px] font-semibold text-blue-600 hover:underline flex-shrink-0 mt-0.5"
                  >
                    Mark
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TeacherNotifications;