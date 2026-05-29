import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle, LogOut, X, CheckCircle2, Repeat2, Users } from 'lucide-react';

import TimetableGrid from './TimetableGrid';
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';
import { useAuth } from '../context/AuthContext';
import { useTeacherNotifications } from '../hooks/useTeacherData';

const BASE = 'http://localhost:8000';
function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { Authorization: `Bearer ${token}` };
}

const ICON_MAP = {
  LEAVE_APPROVED:  { Icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  LEAVE_REJECTED:  { Icon: X,            bg: 'bg-red-50',     color: 'text-red-500'     },
  LEAVE_REQUEST:   { Icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-600'    },
  RELIEF_REQUEST:  { Icon: Repeat2,      bg: 'bg-orange-50',  color: 'text-orange-600'  },
  GENERAL:         { Icon: Bell,         bg: 'bg-gray-50',    color: 'text-gray-500'    },
};

const ProgressBar = ({ value, total, fillClassName }) => {
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full ${fillClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const StatCard = ({ title, value, total, fillClassName }) => {
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-[12px] font-black text-slate-600 uppercase tracking-wide">{title}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-[14px] font-semibold text-slate-600">/{total}</p>
      </div>
      <div className="mt-3">
        <ProgressBar value={value} total={total} fillClassName={fillClassName} />
        <p className="mt-2 text-[12px] font-semibold text-slate-500">{pct.toFixed(1)}%</p>
      </div>
    </section>
  );
};

// ── Notification Detail Modal ─────────────────────────────────────────────
function NotificationDetailModal({ notif, onClose }) {
  if (!notif) return null;
  const cfg = ICON_MAP[notif.notification_type] ?? ICON_MAP.GENERAL;
  const { Icon } = cfg;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
              <Icon size={18} className={cfg.color} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">{notif.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {notif.notification_type?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            {notif.content}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>
            {notif.created_at
              ? new Date(notif.created_at).toLocaleString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit',
                })
              : ''}
          </span>
          {notif.action_url && (
            <a
              href={notif.action_url}
              className="text-blue-600 font-semibold hover:underline"
            >
              View Details →
            </a>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-[12px] font-semibold hover:bg-slate-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Notifications Panel ───────────────────────────────────────────────────
function NotificationsPanel({ notifs, onMarkRead, onMarkAllRead, onSelect }) {
  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-slate-600" />
          <span className="text-[13px] font-bold text-slate-800">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
              {unread} new
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
          >
            <CheckCircle size={11} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={22} className="text-slate-200 mx-auto mb-2" />
            <p className="text-[12px] font-semibold text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifs.slice(0, 8).map((n) => {
            const cfg = ICON_MAP[n.notification_type] ?? ICON_MAP.GENERAL;
            const { Icon } = cfg;
            return (
              <button
                key={n.id}
                onClick={() => { onMarkRead(n.id); onSelect(n); }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                  !n.is_read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={13} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 truncate">{n.title}</p>
                  <p className="text-[10px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.content}</p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : ''}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: notifs, loading: notifsLoading } = useTeacherNotifications();

  // ── Real data state ──
  const [teacherData, setTeacherData]     = useState(null);
  const [timetable, setTimetable]         = useState({});
  const [pending, setPending]             = useState([]);
  const [confirmed, setConfirmed]         = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [leaveBalance, setLeaveBalance]   = useState(null);

  // ── Notification state ──
  const [localNotifs, setLocalNotifs]       = useState([]);
  const [selectedNotif, setSelectedNotif]   = useState(null);

  // ── UI state ──
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [leaveFormResetKey, setLeaveFormResetKey] = useState(0);
  const applyBtnRef        = useRef(null);
  const modalFirstFieldRef = useRef(null);
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Sync hook data → local state so we can mutate (mark read)
  useEffect(() => {
    setLocalNotifs(notifs);
  }, [notifs]);

  // ── Fetch dashboard data ──
  useEffect(() => {
    const token = localStorage.getItem('schoolsync_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // AFTER
    Promise.all([
      fetch(`${BASE}/teacher/me/profile`,          { headers }).then(r => r.json()),
      fetch(`${BASE}/teacher/me/timetable`,        { headers }).then(r => r.json()),
      fetch(`${BASE}/teacher/me/relief/pending`,   { headers }).then(r => r.json()),
      fetch(`${BASE}/teacher/me/relief/confirmed`, { headers }).then(r => r.json()),
      fetch(`${BASE}/leave-balance/me`,            { headers }).then(r => r.json()),
    ])
      .then(([profile, timetableData, pendingData, confirmedData, balanceData]) => {
        setTeacherData(profile);
        setTimetable(timetableData);
        setPending(Array.isArray(pendingData) ? pendingData : []);
        setConfirmed(Array.isArray(confirmedData) ? confirmedData : []);
        setLeaveBalance(balanceData?.data ?? null);
      })

  // ── Focus trap ──
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setIsModalOpen(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) setTimeout(() => modalFirstFieldRef.current?.focus?.(), 0);
    else applyBtnRef.current?.focus?.();
  }, [isModalOpen]);

  // ── Mark read handlers ──
  const markRead = async (id) => {
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await fetch(`${BASE}/leaves/notifications/${id}/read`, {
      method: 'PUT', headers: getHeaders(),
    }).catch(console.error);
  };

  const markAllRead = async () => {
    await fetch(`${BASE}/leaves/notifications/read-all`, {
      method: 'PUT', headers: getHeaders(),
    }).catch(console.error);
    setLocalNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = localNotifs.filter(n => !n.is_read).length;

  const leaveSubmit = () => {
    setIsModalOpen(false);
    setLeaveFormResetKey(k => k + 1);
  };

  const confirmedSorted = useMemo(() => {
    return [...confirmed].sort((a, b) => {
      const da = dayOrder.indexOf(a.day);
      const db = dayOrder.indexOf(b.day);
      return da !== db ? da - db : a.period - b.period;
    });
  }, [confirmed]);

  if (isLoadingData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const teacherName       = teacherData?.name ?? user?.email ?? 'Teacher';
  const teacherDept       = teacherData?.department ?? '';
  const teachingCompleted = teacherData?.teachingHours?.completed ?? 0;
  const teachingTotal     = teacherData?.teachingHours?.total ?? 30;
  const reliefCompleted   = teacherData?.reliefHours?.completed ?? 0;
  const reliefTotal       = teacherData?.reliefHours?.total ?? 5;
  const remainingCap      = teacherData?.remainingCap ?? 0;

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="px-4 py-3 max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <div className="min-w-0">
              <p className="text-[20px] font-bold text-primary-900 truncate">SchoolSync</p>
              <p className="text-[12px] font-semibold text-slate-500 truncate">
                {teacherName} · {teacherDept}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell — now just decorative in header since panel is below */}
            <div
              className="relative p-2 rounded-lg border border-outline-variant bg-surface-container-low cursor-default"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-primary-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            <button
              ref={applyBtnRef}
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:opacity-95 text-white rounded-lg px-3 py-2 text-[13px] font-semibold shadow-sm hidden sm:block"
            >
              Apply for Leave
            </button>

            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-slate-700 font-bold">
              {teacherName.split(' ').map(s => s[0]).slice(0, 2).join('')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Teaching Hours"     value={teachingCompleted} total={teachingTotal} fillClassName="bg-secondary" />
          <StatCard title="Relief Hours"       value={reliefCompleted}   total={reliefTotal}   fillClassName="bg-secondary-container" />
          <StatCard title="Remaining Capacity" value={remainingCap}      total={teachingTotal} fillClassName="bg-primary-container" />
        </section>

        {/* Weekly Timetable + Right sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-[24px] font-bold text-slate-900">Weekly Timetable</h2>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Mon–Fri · Periods 1–6</p>
            <div className="mt-4">
              <TimetableGrid timetable={timetable} />
            </div>
          </div>

          <div className="space-y-4">
            {/* 🔔 Notifications Panel — wired to real API */}
            
            <NotificationsPanel
              notifs={localNotifs}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onSelect={setSelectedNotif}
            />

            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-600" style={{ fontSize: 18 }}>
                  event_available
                </span>
                <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-wide">
                  Leave Balance
                </h2>
              </div>

              {!leaveBalance ? (
                <p className="text-[12px] text-slate-400 text-center py-4">
                  No balance data yet
                </p>
              ) : (
                <>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[38px] font-bold text-slate-900 leading-none">
                        {leaveBalance.balance.toFixed(1)}
                      </p>
                      <p className="text-[12px] font-semibold text-slate-500 mt-1">
                        days available
                      </p>
                    </div>
                    {leaveBalance.balance < 2 && (
                      <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                        Low
                      </span>
                    )}
                  </div>

                  <div className="my-3 h-px bg-slate-100" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-500 font-medium">Carry-over</span>
                      <span className="font-bold text-slate-700">
                        {leaveBalance.carry_over.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-500 font-medium">Used this year</span>
                      <span className="font-bold text-slate-700">
                        {leaveBalance.used_ytd.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-500 font-medium">Academic year</span>
                      <span className="font-bold text-slate-700">
                        {leaveBalance.academic_year}
                      </span>
                    </div>
                  </div>

                  {leaveBalance.balance < 2 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-[11px] font-semibold text-amber-700">
                        ⚠️ Balance is low. Next credit on the 1st of next month.
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Pending Relief */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-900">Pending Relief</h2>
                <span className="text-[12px] font-bold text-slate-500">{pending.length}</span>
              </div>
              {pending.length === 0 ? (
                <div className="mt-6 flex items-center justify-center text-center py-8">
                  <p className="text-[14px] font-semibold text-slate-500">No pending requests</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pending.map(req => (
                    <ReliefRequestCard
                      key={req.id}
                      request={req}
                      onResponded={(id) => setPending(prev => prev.filter(r => r.id !== id))}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Confirmed Relief */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-900">Confirmed Duties</h2>
                <span className="text-[12px] font-bold text-slate-500">{confirmed.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {confirmedSorted.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[14px] font-semibold text-slate-500">No confirmed duties yet</p>
                  </div>
                ) : (
                  confirmedSorted.map(d => (
                    <div key={d.id} className="flex items-start gap-3 bg-surface-container-low border border-outline-variant rounded-lg p-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-fixed border border-secondary flex items-center justify-center">
                        <CheckCircle size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900">{d.subject} · {d.class}</p>
                        <p className="text-[12px] font-semibold text-slate-600">{d.day} · Period {d.period}</p>
                        <p className="text-[12px] font-semibold text-slate-500">Original: {d.originalTeacher}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="grid grid-cols-4">
          {['Home', 'Schedule', 'Relief', 'Profile'].map((label, idx) => (
            <button
              key={label}
              className={`py-3 min-h-[44px] flex flex-col items-center justify-center gap-1 ${idx === 0 ? 'bg-secondary-container/10 text-secondary font-bold' : 'text-slate-500'}`}
              aria-label={label}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                {idx === 0 ? 'home' : idx === 1 ? 'schedule' : idx === 2 ? 'group' : 'person'}
              </span>
              <span className="text-[11px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification detail modal */}
      {selectedNotif && (
        <NotificationDetailModal
          notif={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}

      <LeaveApplicationForm
        key={leaveFormResetKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={leaveSubmit}
        firstFieldRef={modalFirstFieldRef}
      />
    </div>
  );
}
