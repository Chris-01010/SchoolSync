// ─────────────────────────────────────────────────────────────────────────────
// src/pages/teacher/TeacherNotifications.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Repeat2, Users, Bell, Check } from 'lucide-react';
import { notifications as mockNotifs } from '../../mockData';

const ICON_MAP = {
  leave_approved:  { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  relief_assigned: { icon: Repeat2,      bg: 'bg-orange-50',  color: 'text-orange-500' },
  announcement:    { icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-500' },
};

const TABS = ['All', 'Unread', 'Alerts', 'Announcements'];

export function TeacherNotifications() {
  const [notifs, setNotifs] = useState(mockNotifs);
  const [tab, setTab] = useState(0);

  const markRead = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

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
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:underline"
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
        {displayed.map((n, i) => {
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
        })}
        {displayed.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Bell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-[12px] font-semibold">All caught up! No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherNotifications;