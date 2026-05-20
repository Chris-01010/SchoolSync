import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeacherTimetable, useTeacherProfile } from '../../hooks/useTeacherData';

const DAYS    = ['Mon (12)', 'Tue (13)', 'Wed (14)', 'Thu (15)', 'Fri (16)'];
const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// College timings — must match backend seed.py period_times:
//   P1 08:30–09:40   P2 09:40–10:40   [break 10:40–11:00]
//   P3 11:00–12:00   [lunch 12:00–13:00]
//   P4 13:00–14:00   P5 14:00–15:00   [break 15:00–15:15]
//   P6 15:15–16:15
const TIMES = [
  { period: 1, label: '08:30', end: '09:40' },
  { period: 2, label: '09:40', end: '10:40' },
  { label: 'MORNING BREAK', isBreak: true, breakLabel: '10:40 – 11:00' },
  { period: 3, label: '11:00', end: '12:00' },
  { label: 'LUNCH BREAK', isBreak: true, breakLabel: '12:00 – 13:00' },
  { period: 4, label: '13:00', end: '14:00' },
  { period: 5, label: '14:00', end: '15:00' },
  { label: 'AFTERNOON BREAK', isBreak: true, breakLabel: '15:00 – 15:15' },
  { period: 6, label: '15:15', end: '16:15' },
];

// ─── Cell type styles ─────────────────────────────────────────────────────────
const CELL_CONFIG = {
  regular: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    sub: 'text-blue-500',
    badge: null,
  },
  free: {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-400',
    sub: 'text-gray-300',
    badge: null,
    freeIcon: true,
  },
  relief: {
    bg: 'bg-amber-50 border-amber-300 border-dashed',
    text: 'text-amber-800',
    sub: 'text-amber-500',
    badge: 'Substitute',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  current: {
    bg: 'bg-blue-600 border-blue-700',
    text: 'text-white',
    sub: 'text-blue-200',
    badge: '• NOW',
    badgeColor: 'bg-white text-blue-700',
  },
  cancelled: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-400 line-through',
    sub: 'text-red-300',
    badge: 'CANCELLED',
    badgeColor: 'bg-red-100 text-red-500',
  },
};

// ─── Timetable cell ───────────────────────────────────────────────────────────
const TimetableCell = ({ cell }) => {
  if (!cell) {
    return (
      <div className="h-[72px] bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-300 text-[11px]">—</span>
      </div>
    );
  }

  const cfg = CELL_CONFIG[cell.type] ?? CELL_CONFIG.regular;

  if (cell.type === 'free') {
    return (
      <div className={`h-[72px] border rounded-lg flex flex-col items-center justify-center gap-1 ${cfg.bg}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-gray-300">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`text-[10px] font-medium ${cfg.text}`}>Free</span>
      </div>
    );
  }

  return (
    <div className={`h-[72px] border rounded-lg p-2 flex flex-col justify-between overflow-hidden ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-1">
        <p className={`text-[11px] font-bold leading-tight truncate ${cfg.text}`}>
          {cell.subject}
        </p>
        {cfg.badge && (
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${cfg.badgeColor}`}>
            {cfg.badge}
          </span>
        )}
      </div>
      <div>
        {cell.class && (
          <p className={`text-[10px] font-medium truncate ${cfg.sub}`}>{cell.class}</p>
        )}
        <div className="flex items-center justify-between">
          {cell.room && (
            <p className={`text-[9px] truncate ${cfg.sub}`}>{cell.room}</p>
          )}
          {cell.students && (
            <p className={`text-[9px] ${cfg.sub}`}>
              👥 {cell.students}
            </p>
          )}
        </div>
        {cell.originalTeacher && (
          <p className={`text-[9px] truncate ${cfg.sub}`}>
            for {cell.originalTeacher}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Upcoming transitions ─────────────────────────────────────────────────────
const transitions = [
  { icon: '🔵', label: 'Next: Lab Session', detail: 'Starts in 15 minutes · Rm 302' },
  { icon: '⚠️', label: 'Relief Duty Notification', detail: 'Tomorrow 09:00 for Dr. Harrison' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function MyTimetable() {
  const [viewMode, setViewMode]   = useState('week'); // 'week' | 'day'
  const [search, setSearch]       = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  // ── Real data from API ────────────────────────────────────────────────────
  const { data: timetableData, loading: timetableLoading } = useTeacherTimetable();
  const { data: profile } = useTeacherProfile();

  // Fall back to an empty object so the grid lookups (timetable[dayKey]?.[period])
  // don't crash on the first render while the fetch is in flight.
  const timetable = timetableData ?? {};

  const totalWorkload = 22.5;
  const weeklyTarget  = 85;

  return (
    <div className="space-y-4 max-w-[1280px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">My Timetable</h1>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            Academic Year 2025–2026 &nbsp;·&nbsp;
            <span className="inline-flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Term 2
            </span>
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['Day', 'Week', 'Today'].map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v.toLowerCase())}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  viewMode === v.toLowerCase()
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search + Download */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, class, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg
                       bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X size={12} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                           text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
          <Download size={13} />
          Download PDF
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
        {/* Timetable grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Grid header — days */}
          <div className="grid border-b border-gray-100"
            style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            <div className="px-2 py-2.5 border-r border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium">Time</span>
            </div>
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`px-2 py-2.5 text-center border-r border-gray-100 last:border-0 cursor-pointer
                             ${selectedDay === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedDay(i)}
              >
                <p className={`text-[11px] font-bold ${selectedDay === i ? 'text-blue-700' : 'text-gray-700'}`}>
                  {d}
                </p>
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="overflow-x-auto">
            {timetableLoading ? (
              <div className="py-16 text-center text-[12px] text-gray-400">
                Loading timetable…
              </div>
            ) : (
              TIMES.map((slot, si) => {
                if (slot.isBreak) {
                  const isLunch = slot.label === 'LUNCH BREAK';
                  return (
                    <div
                      key={`break-${si}`}
                      className="grid border-b border-gray-100 bg-gray-50"
                      style={{ gridTemplateColumns: '64px 1fr' }}
                    >
                      <div className="px-2 py-2 border-r border-gray-100 flex items-center">
                        <span className="text-[9px] text-gray-400 font-medium">
                          {slot.breakLabel?.split(' – ')[0] ?? ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-center py-2 gap-2">
                        <span className="text-gray-400">{isLunch ? '🍴' : '☕'}</span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                          {slot.label}
                        </span>
                        {slot.breakLabel && (
                          <span className="text-[9px] text-gray-400 font-medium">
                            · {slot.breakLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.period}
                    className="grid border-b border-gray-100 last:border-0"
                    style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}
                  >
                    {/* Time label */}
                    <div className="px-2 py-2 border-r border-gray-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-700">{slot.label}</p>
                      <p className="text-[9px] text-gray-400">{slot.end}</p>
                    </div>

                    {/* Day cells */}
                    {DAY_KEYS.map((dayKey) => {
                      const cell = timetable[dayKey]?.[slot.period];
                      const match =
                        !search ||
                        (cell &&
                          cell.type !== 'free' &&
                          [cell.subject, cell.class, cell.room]
                            .join(' ')
                            .toLowerCase()
                            .includes(search.toLowerCase()));
                      return (
                        <div
                          key={dayKey}
                          className={`p-1.5 border-r border-gray-100 last:border-0 transition-opacity ${
                            search && !match ? 'opacity-20' : 'opacity-100'
                          }`}
                        >
                          <TimetableCell cell={cell} />
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Upcoming transitions */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-4"
          >
            <h3 className="text-[12px] font-bold text-gray-800 mb-3">Upcoming Transitions</h3>
            <div className="space-y-2.5">
              {transitions.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-700 truncate">{t.label}</p>
                    <p className="text-[9px] text-gray-400 truncate">{t.detail}</p>
                  </div>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly workload summary */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-blue-600 rounded-xl p-4 text-white shadow-sm"
          >
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Total Weekly Workload
            </p>
            <p className="text-[32px] font-bold leading-none mb-1">{totalWorkload} Hours</p>
            <p className="text-[10px] text-blue-200 mb-3">Teaching + Relief combined</p>

            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-blue-200">Weekly Target</span>
              <span className="text-[10px] font-bold text-white">{weeklyTarget}%</span>
            </div>
            <div className="h-1.5 bg-blue-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${weeklyTarget}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}