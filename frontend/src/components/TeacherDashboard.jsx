import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, LogOut, ChevronDown } from 'lucide-react';

import TimetableGrid from './TimetableGrid';
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const flagReasons = ['Overwork', 'Emergency Duty', 'Schedule Conflict', 'Incorrect Allocation'];
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

export default function TeacherDashboard() {
  const { user } = useAuth();

  // ── Real data state ──
  const [teacherData, setTeacherData]   = useState(null);
  const [timetable, setTimetable]       = useState({});
  const [pending, setPending]           = useState([]);
  const [confirmed, setConfirmed]       = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ── UI state ──
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [activeFlagId, setActiveFlagId] = useState(null);
  const [leaveFormResetKey, setLeaveFormResetKey] = useState(0);
  const applyBtnRef        = useRef(null);
  const modalFirstFieldRef = useRef(null);

  // ── Fetch all dashboard data ──
  useEffect(() => {
    const token = localStorage.getItem('schoolsync_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:8000/teacher/me/profile',           { headers }).then(r => r.json()),
      fetch('http://localhost:8000/teacher/me/timetable',         { headers }).then(r => r.json()),
      fetch('http://localhost:8000/teacher/me/relief/pending',    { headers }).then(r => r.json()),
      fetch('http://localhost:8000/teacher/me/relief/confirmed',  { headers }).then(r => r.json()),
    ])
      .then(([profile, timetableData, pendingData, confirmedData]) => {
        setTeacherData(profile);
        setTimetable(timetableData);
        setPending(Array.isArray(pendingData) ? pendingData : []);
        setConfirmed(Array.isArray(confirmedData) ? confirmedData : []);
      })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setIsLoadingData(false));
  }, []);

  // ── Focus trap for modal ──
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setIsModalOpen(false); }
      if (e.key === 'Tab') {
        const focusables = document.querySelectorAll(
          '[data-leave-modal="true"] button, [data-leave-modal="true"] select, [data-leave-modal="true"] textarea, [data-leave-modal="true"] input'
        );
        const arr = Array.from(focusables).filter(el => !el.disabled && el.tabIndex !== -1);
        if (!arr.length) return;
        if (e.shiftKey && document.activeElement === arr[0]) { e.preventDefault(); arr[arr.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === arr[arr.length - 1]) { e.preventDefault(); arr[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) setTimeout(() => modalFirstFieldRef.current?.focus?.(), 0);
    else applyBtnRef.current?.focus?.();
  }, [isModalOpen]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (typeof e.target?.closest === 'function' && e.target.closest('[data-flag-dropdown="true"]')) return;
      setActiveFlagId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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

  // ── Loading state ──
  if (isLoadingData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const teacherName        = teacherData?.name ?? user?.email ?? 'Teacher';
  const teacherDept        = teacherData?.department ?? '';
  const teachingCompleted  = teacherData?.teachingHours?.completed ?? 0;
  const teachingTotal      = teacherData?.teachingHours?.total ?? 30;
  const reliefCompleted    = teacherData?.reliefHours?.completed ?? 0;
  const reliefTotal        = teacherData?.reliefHours?.total ?? 5;
  const remainingCap       = teacherData?.remainingCap ?? 0;

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
            <button
              className="relative p-2 rounded-lg border border-outline-variant bg-surface-container-low"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-primary-600" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-white text-[12px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

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

        {/* Weekly Timetable + Pending */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-[24px] font-bold text-slate-900">Weekly Timetable</h2>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Mon–Fri · Periods 1–6</p>
            <div className="mt-4">
              <TimetableGrid timetable={timetable} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Pending Relief */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-900">Pending Relief Requests</h2>
                <span className="text-[12px] font-bold text-slate-500">{pending.length}</span>
              </div>
              {pending.length === 0 ? (
                <div className="mt-6 flex items-center justify-center text-center py-10">
                  <p className="text-[14px] font-semibold text-slate-500">No pending requests</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pending.map(req => (
                    <ReliefRequestCard
                      key={req.id}
                      request={req}
                      onResponded={(id) => {
                        setPending(prev => prev.filter(r => r.id !== id));
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Confirmed Relief */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-900">Confirmed Relief Duties</h2>
                <span className="text-[12px] font-bold text-slate-500">{confirmed.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {confirmedSorted.length === 0 ? (
                  <div className="text-center py-10">
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
                        <p className="text-[12px] font-semibold text-slate-500">Original Teacher: {d.originalTeacher}</p>
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
