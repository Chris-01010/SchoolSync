import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import TimetableGrid from './TimetableGrid';
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';

import {
  teacher as mockTeacher,
  timetable as mockTimetable,
  pendingRequests as mockPendingRequests,
  confirmedReliefs as mockConfirmedReliefs,
  flagReasons as mockFlagReasons
} from '../mockData';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ProgressBar = ({ value, total, fillClassName }) => {
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden" aria-label={`Progress ${pct.toFixed(1)}%`}>
      <div className={`h-full ${fillClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const StatCard = ({ title, value, unit, total, fillClassName }) => {
  const completed = value;
  const pct = total === 0 ? 0 : (completed / total) * 100;
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-[12px] font-black text-slate-600 uppercase tracking-wide">{title}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{completed}</p>
        <p className="text-[14px] font-semibold text-slate-600">/{total}</p>
      </div>
      <div className="mt-3">
        <ProgressBar value={completed} total={total} fillClassName={fillClassName} />
        <p className="mt-2 text-[12px] font-semibold text-slate-500">{pct.toFixed(1)}%</p>
      </div>
      {unit ? <p className="sr-only">{unit}</p> : null}
    </section>
  );
};

export default function TeacherDashboard() {
  const [pending, setPending] = useState([]);
const [confirmed, setConfirmed] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyBtnRef = useRef(null);
  const modalFirstFieldRef = useRef(null);

  const [activeFlagId, setActiveFlagId] = useState(null);
  const [leaveFormResetKey, setLeaveFormResetKey] = useState(0);
  useEffect(() => {
  const fetchReliefs = async () => {
    try {
      const token = localStorage.getItem('schoolsync_token');
      const res = await fetch('http://localhost:8000/teachers/me/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPending(data.pending_requests?.filter(r => r.type === 'relief_request') || []);
    } catch (err) {
      console.error('Failed to fetch reliefs', err);
    }
  };
  fetchReliefs();
}, []);

  // Escape/Focus trap
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsModalOpen(false);
      }
      if (e.key === 'Tab') {
        // Minimal focus trap: keep focus inside modal
        const focusables = document.querySelectorAll(
          '[data-leave-modal="true"] button, [data-leave-modal="true"] select, [data-leave-modal="true"] textarea, [data-leave-modal="true"] input'
        );
        const arr = Array.from(focusables).filter((el) => !el.disabled && el.tabIndex !== -1);
        if (arr.length === 0) return;
        const first = arr[0];
        const last = arr[arr.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      // focus first field
      setTimeout(() => modalFirstFieldRef.current?.focus?.(), 0);
    } else {
      applyBtnRef.current?.focus?.();
    }
  }, [isModalOpen]);

  useEffect(() => {
    // close flag dropdown on outside click
    const onDocClick = (e) => {
      const el = e.target;
      if (typeof el?.closest === 'function' && el.closest('[data-flag-dropdown="true"]')) return;
      setActiveFlagId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const teachingCompleted = mockTeacher.teachingHours.completed;
  const teachingTotal = mockTeacher.teachingHours.total;
  const reliefCompleted = mockTeacher.reliefHours.completed;
  const reliefTotal = mockTeacher.reliefHours.total;
  const remainingTotal = mockTeacher.teachingHours.total;
  const remainingCompleted = mockTeacher.remainingCap;

  const handleRespond = async (id, status, reason) => {
  try {
    const token = localStorage.getItem('schoolsync_token');
    await fetch(`http://localhost:8000/leaves/relief/${id}/respond`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, flag_reason: reason || null })
    });
  } catch (err) {
    console.error('Failed to respond:', err);
  }
    if (status === 'accepted') {
      const req = pending.find((p) => p.id === id);
      if (!req) return;

      setPending((prev) => prev.filter((r) => r.id !== id));
      setConfirmed((prev) => [
        {
          id: `c_${Date.now()}`,
          subject: req.subject,
          class: req.class,
          day: req.day,
          period: req.period,
          originalTeacher: req.absentTeacher
        },
        ...prev
      ]);

      setActiveFlagId(null);
      return;
    }

    if (status === 'rejected') {
      setPending((prev) => prev.filter((r) => r.id !== id));
      setActiveFlagId(null);
      return;
    }

    if (status === 'flagged') {
      console.log(`Flagged request ${id} with reason: ${reason}`);
      setPending((prev) => prev.filter((r) => r.id !== id));
      setActiveFlagId(null);
    }
  };

  const leaveSubmit = async (formData) => {
  try {
    const token = localStorage.getItem('schoolsync_token');
    await fetch('http://localhost:8000/leaves/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
      
    
    });
    setIsModalOpen(false);
    setLeaveFormResetKey((k) => k + 1);
    
  } catch (err) {
    console.error('Failed to submit leave:', err);
  }
  };

  const confirmedSorted = useMemo(() => {
    return [...confirmed].sort((a, b) => {
      const da = dayOrder.indexOf(a.day);
      const db = dayOrder.indexOf(b.day);
      if (da !== db) return da - db;
      return a.period - b.period;
    });
  }, [confirmed]);

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
              <p className="text-[20px] font-bold text-primary-900 truncate">Springfield Public School</p>
              <p className="text-[12px] font-semibold text-slate-500 truncate">
                {mockTeacher.name} · {mockTeacher.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              className="bg-secondary hover:opacity-95 text-white rounded-lg px-4 py-2 text-[14px] font-semibold shadow-sm"
            >
              Apply for Leave
            </button>

            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-slate-700 font-bold">
              {mockTeacher.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Teaching Hours" value={teachingCompleted} total={teachingTotal} fillClassName="bg-secondary" />
          <StatCard title="Relief Hours" value={reliefCompleted} total={reliefTotal} fillClassName="bg-secondary-container" />
          <StatCard title="Remaining Capacity" value={remainingCompleted} total={remainingTotal} fillClassName="bg-primary-container" />
        </section>

        {/* Weekly Timetable + Pending */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-[24px] font-bold text-slate-900">Weekly Timetable</h2>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Mon–Fri · Periods 1–8</p>
            <div className="mt-4">
              <TimetableGrid timetable={mockTimetable} />
            </div>
          </div>

          <div className="space-y-4">
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
                  {pending.map((req) => (
                    <ReliefRequestCard
                      key={req.id}
                      request={req}
                      flagReasons={mockFlagReasons}
                      isFlagOpen={activeFlagId === req.id}
                      onToggleFlag={() => setActiveFlagId((prev) => (prev === req.id ? null : req.id))}
                      onRespond={handleRespond}
                    />
                  ))}
                </div>
              )}
            </section>

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
                  confirmedSorted.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-3 bg-surface-container-low border border-outline-variant rounded-lg p-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary-fixed border border-secondary flex items-center justify-center">
                        <CheckCircle size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900">
                          {d.subject} · {d.class}
                        </p>
                        <p className="text-[12px] font-semibold text-slate-600">
                          {d.day} · Period {d.period}
                        </p>
                        <p className="text-[12px] font-semibold text-slate-500">
                          Original Teacher: {d.originalTeacher}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="grid grid-cols-5">
          {['Home', 'Schedule', 'Relief', 'Profile'].map((label, idx) => (
            <button
              key={label}
              className={`py-3 flex flex-col items-center justify-center gap-1 ${idx === 0 ? 'bg-secondary-container/10 text-secondary font-bold' : 'text-slate-500'}`}
              aria-label={label}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                {idx === 0 ? 'home' : idx === 1 ? 'schedule' : idx === 2 ? 'group' : 'person'}
              </span>
              <span className="text-[11px] font-bold">{idx === 0 ? 'Home' : label}</span>
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

