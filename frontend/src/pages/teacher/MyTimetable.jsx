import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import { motion } from 'framer-motion';

import {
  Download,
  Search,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { api } from '../../services/api';

// ─── Days ─────────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
];

// ─── Timings ──────────────────────────────────────────────────────────────────

const TIMES = [
  { period: 1, label: '08:30', end: '09:40' },
  { period: 2, label: '09:40', end: '10:40' },

  {
    isBreak: true,
    kind: 'short',
    label: 'MORNING BREAK',
    start: '10:40',
    end: '11:00',
  },

  { period: 3, label: '11:00', end: '12:00' },

  {
    isBreak: true,
    kind: 'lunch',
    label: 'LUNCH BREAK',
    start: '12:00',
    end: '13:00',
  },

  { period: 4, label: '13:00', end: '14:00' },
  { period: 5, label: '14:00', end: '15:00' },

  {
    isBreak: true,
    kind: 'short',
    label: 'AFTERNOON BREAK',
    start: '15:00',
    end: '15:15',
  },

  { period: 6, label: '15:15', end: '16:15' },
];

// ─── Cell Styles ──────────────────────────────────────────────────────────────

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
    badgeColor:
      'bg-amber-100 text-amber-700',
  },

  current: {
    bg: 'bg-blue-600 border-blue-700',
    text: 'text-white',
    sub: 'text-blue-200',
    badge: '• NOW',
    badgeColor:
      'bg-white text-blue-700',
  },

  cancelled: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-400 line-through',
    sub: 'text-red-300',
    badge: 'CANCELLED',
    badgeColor:
      'bg-red-100 text-red-500',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleCase(s) {
  if (!s) return s;

  return s
    .split(' ')
    .map(
      (w) =>
        w.charAt(0).toUpperCase() +
        w.slice(1)
    )
    .join(' ');
}

function timeStrToMinutes(t) {
  if (!t) return 0;

  const [h, m] = t
    .split(':')
    .map(Number);

  return h * 60 + m;
}

function computeWeekDays(today) {
  const dow = today.getDay();

  const offset =
    dow === 0 ? -6 : 1 - dow;

  const monday = new Date(today);

  monday.setDate(
    today.getDate() + offset
  );

  return Array.from(
    { length: 5 },
    (_, i) => {
      const d = new Date(monday);

      d.setDate(
        monday.getDate() + i
      );

      return {
        label: `${DAY_NAMES[i]} (${d.getDate()})`,
        dayIndex: i,
        date: d,
      };
    }
  );
}

function getTodayBackendDow(today) {
  const dow = today.getDay();

  return dow === 0 || dow === 6
    ? -1
    : dow - 1;
}

// ─── Timetable Cell ───────────────────────────────────────────────────────────

const TimetableCell = ({ cell }) => {
  if (!cell) {
    return (
      <div className="h-[72px] bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-300 text-[11px]">
          —
        </span>
      </div>
    );
  }

  const cfg =
    CELL_CONFIG[cell.type] ??
    CELL_CONFIG.regular;

  if (cell.type === 'free') {
    return (
      <div
        className={`h-[72px] border rounded-lg flex flex-col items-center justify-center gap-1 ${cfg.bg}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
          />

          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
          />

          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
          />

          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
          />
        </svg>

        <span
          className={`text-[10px] font-medium ${cfg.text}`}
        >
          Free
        </span>
      </div>
    );
  }

  return (
    <div
      className={`h-[72px] border rounded-lg p-2 flex flex-col justify-between overflow-hidden ${cfg.bg}`}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className={`text-[11px] font-bold leading-tight truncate ${cfg.text}`}
        >
          {cell.subject}
        </p>

        {cfg.badge && (
          <span
            className={`text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${cfg.badgeColor}`}
          >
            {cfg.badge}
          </span>
        )}
      </div>

      <div>
        {cell.class && (
          <p
            className={`text-[10px] font-medium truncate ${cfg.sub}`}
          >
            {cell.class}
          </p>
        )}

        <div className="flex items-center justify-between">
          {cell.room && (
            <p
              className={`text-[9px] truncate ${cfg.sub}`}
            >
              {cell.room}
            </p>
          )}

          {cell.students && (
            <p
              className={`text-[9px] ${cfg.sub}`}
            >
              👥 {cell.students}
            </p>
          )}
        </div>

        {cell.originalTeacher && (
          <p
            className={`text-[9px] truncate ${cfg.sub}`}
          >
            for {cell.originalTeacher}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Mock Upcoming Transitions ────────────────────────────────────────────────

const transitions = [
  {
    icon: '🔵',
    label: 'Next: Lab Session',
    detail:
      'Starts in 15 minutes · Rm 302',
  },

  {
    icon: '⚠️',
    label:
      'Relief Duty Notification',
    detail:
      'Tomorrow 09:00 for Dr. Harrison',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyTimetable() {
  const [viewMode, setViewMode] =
    useState('week');

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [timetableData, setTimetableData] =
    useState({});

  const [subjects, setSubjects] =
    useState([]);

  const [rooms, setRooms] =
    useState([]);

  const today = useMemo(
    () => new Date(),
    []
  );

  const days = useMemo(
    () => computeWeekDays(today),
    [today]
  );

  const todayBackendDow = useMemo(
    () => getTodayBackendDow(today),
    [today]
  );

  const isWeekend =
    todayBackendDow === -1;

  const nowMinutes =
    today.getHours() * 60 +
    today.getMinutes();

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          me,
          teachersResp,
          subjectsResp,
          roomsResp,
        ] = await Promise.all([
          api.get('/auth/me'),
          api.get('/api/v1/teachers'),
          api.get('/subjects'),
          api.get('/rooms'),
        ]);

        const teachers =
          Array.isArray(
            teachersResp
          )
            ? teachersResp
            : teachersResp?.data ||
              [];

        const subjectsList =
          Array.isArray(
            subjectsResp
          )
            ? subjectsResp
            : subjectsResp?.data ||
              [];

        const roomsList =
          Array.isArray(roomsResp)
            ? roomsResp
            : roomsResp?.data ||
              [];

        const myTeacher =
          teachers.find(
            (t) =>
              t.email === me?.email
          );

        if (!myTeacher) {
          throw new Error(
            'Could not find a teacher profile matching your account.'
          );
        }

        const ttResp =
          await api.get(
            '/timetable/view'
          );

        const tt =
          Array.isArray(ttResp)
            ? ttResp
            : ttResp?.data || [];

        const grouped = {};

        tt.forEach((slot) => {
          const dow =
            slot.day_of_week;

          if (!grouped[dow]) {
            grouped[dow] = [];
          }

          grouped[dow].push(slot);
        });

        setTimetableData(grouped);
        setSubjects(subjectsList);
        setRooms(roomsList);
      } catch (err) {
        setError(
          err.message ||
            'Failed to load timetable'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subjectMap = useMemo(() => {
    const m = {};

    subjects.forEach((s) => {
      m[s.id] = titleCase(
        s.name
      );
    });

    return m;
  }, [subjects]);

  const roomMap = useMemo(() => {
    const m = {};

    rooms.forEach((r) => {
      m[r.id] = r.name;
    });

    return m;
  }, [rooms]);

  const slotMap = useMemo(() => {
    const m = {};

    Object.entries(
      timetableData || {}
    ).forEach(
      ([dow, slots]) => {
        const key = Number(dow);

        m[key] = {};

        (slots || []).forEach(
          (s) => {
            m[key][s.period] = s;
          }
        );
      }
    );

    return m;
  }, [timetableData]);

  const totalSlots = useMemo(
    () =>
      Object.values(slotMap).reduce(
        (acc, byPeriod) =>
          acc +
          Object.keys(byPeriod)
            .length,
        0
      ),
    [slotMap]
  );

  const buildCell =
    useCallback(
      (dayIndex, period) => {
        const slot =
          slotMap[dayIndex]?.[
            period
          ];

        if (!slot) {
          return {
            type: 'free',
          };
        }

        const startMin =
          timeStrToMinutes(
            slot.start_time
          );

        const endMin =
          timeStrToMinutes(
            slot.end_time
          );

        const isNow =
          dayIndex ===
            todayBackendDow &&
          nowMinutes >= startMin &&
          nowMinutes < endMin;

        let type = 'regular';

        if (isNow) {
          type = 'current';
        } else if (
          slot.is_relief
        ) {
          type = 'relief';
        }

        return {
          type,

          subject:
            subjectMap[
              slot.subject_id
            ] || 'Unknown',

          room:
            roomMap[
              slot.room_id
            ] || '',

          class:
            slot.class_name ||
            slot.class ||
            '',

          students:
            slot.students ||
            null,

          originalTeacher:
            slot.original_teacher_name ||
            null,
        };
      },
      [
        slotMap,
        subjectMap,
        roomMap,
        todayBackendDow,
        nowMinutes,
      ]
    );

  const visibleDays = useMemo(() => {
    if (viewMode === 'day') {
      const idx = isWeekend
        ? 0
        : todayBackendDow;

      return [days[idx]];
    }

    return days;
  }, [
    viewMode,
    days,
    isWeekend,
    todayBackendDow,
  ]);

  const gridCols = `64px repeat(${visibleDays.length}, 1fr)`;

  return (
    <div className="space-y-4 max-w-[1280px]">
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
        }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">
            My Timetable
          </h1>

          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            Academic Year 2025–2026
            &nbsp;·&nbsp;

            <span className="inline-flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />

                <polyline points="12 6 12 12 16 14" />
              </svg>

              Term 2
            </span>
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              'Day',
              'Week',
            ].map((v) => {
              const lower =
                v.toLowerCase();

              const isActive =
                viewMode === lower;

              return (
                <button
                  key={v}
                  onClick={() =>
                    setViewMode(
                      lower
                    )
                  }
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Search + Download */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by subject, class, or room..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
          />

          {search && (
            <button
              onClick={() =>
                setSearch('')
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X
                size={12}
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          )}
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white"
        >
          <Download size={13} />
          Download PDF
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
        {/* Timetable Grid */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.1,
          }}
          className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={18}
                className="animate-spin text-blue-500"
              />

              <span className="ml-3 text-[12px] text-gray-500 font-medium">
                Loading timetable…
              </span>
            </div>
          ) : error ? (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-red-700">
                  Failed to load
                  timetable
                </p>

                <p className="text-[10px] text-red-500 mt-0.5 break-words">
                  {error}
                </p>
              </div>

              <button
                onClick={loadData}
                className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-semibold rounded-md hover:bg-red-700 transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </div>
          ) : totalSlots === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[12px] text-gray-400 font-medium">
                No timetable
                assigned
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                className="grid border-b border-gray-100"
                style={{
                  gridTemplateColumns:
                    gridCols,
                }}
              >
                <div className="px-2 py-2.5 border-r border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium">
                    Time
                  </span>
                </div>

                {visibleDays.map(
                  (d) => {
                    const isToday =
                      d.dayIndex ===
                      todayBackendDow;

                    return (
                      <div
                        key={
                          d.dayIndex
                        }
                        className={`px-2 py-2.5 text-center border-r border-gray-100 last:border-0 ${
                          isToday
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold ${
                            isToday
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {d.label}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Rows */}
              <div className="overflow-x-auto">
                {TIMES.map(
                  (
                    slot,
                    si
                  ) => {
                    if (
                      slot.isBreak
                    ) {
                      const isLunch =
                        slot.kind ===
                        'lunch';

                      return (
                        <div
                          key={`break-${si}`}
                          className="grid border-b border-gray-100 bg-gray-50"
                          style={{
                            gridTemplateColumns:
                              '64px 1fr',
                          }}
                        >
                          <div className="px-2 py-2 border-r border-gray-100 flex items-center">
                            <span className="text-[9px] text-gray-400 font-medium">
                              {
                                slot.start
                              }
                            </span>
                          </div>

                          <div className="flex items-center justify-center py-2 gap-2">
                            <span className="text-gray-400">
                              {isLunch
                                ? '🍴'
                                : '☕'}
                            </span>

                            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                              {
                                slot.label
                              }
                            </span>

                            <span className="text-[9px] text-gray-400 font-medium">
                              ·{' '}
                              {
                                slot.start
                              }{' '}
                              –{' '}
                              {
                                slot.end
                              }
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={
                          slot.period
                        }
                        className="grid border-b border-gray-100 last:border-0"
                        style={{
                          gridTemplateColumns:
                            gridCols,
                        }}
                      >
                        {/* Time */}
                        <div className="px-2 py-2 border-r border-gray-100 flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-gray-700">
                            {
                              slot.label
                            }
                          </p>

                          <p className="text-[9px] text-gray-400">
                            {
                              slot.end
                            }
                          </p>
                        </div>

                        {/* Cells */}
                        {visibleDays.map(
                          (
                            d
                          ) => {
                            const cell =
                              buildCell(
                                d.dayIndex,
                                slot.period
                              );

                            const isToday =
                              d.dayIndex ===
                              todayBackendDow;

                            const match =
                              !search ||
                              (cell.type !==
                                'free' &&
                                [
                                  cell.subject,
                                  cell.class,
                                  cell.room,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ' '
                                  )
                                  .toLowerCase()
                                  .includes(
                                    search.toLowerCase()
                                  ));

                            return (
                              <div
                                key={
                                  d.dayIndex
                                }
                                className={`p-1.5 border-r border-gray-100 last:border-0 transition-opacity ${
                                  isToday
                                    ? 'bg-blue-50/40'
                                    : ''
                                } ${
                                  search &&
                                  !match
                                    ? 'opacity-20'
                                    : 'opacity-100'
                                }`}
                              >
                                <TimetableCell
                                  cell={
                                    cell
                                  }
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Upcoming */}
          <motion.div
            initial={{
              opacity: 0,
              x: 12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 0.15,
            }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-4"
          >
            <h3 className="text-[12px] font-bold text-gray-800 mb-3">
              Upcoming
              Transitions
            </h3>

            <div className="space-y-2.5">
              {transitions.map(
                (t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                      {t.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-700 truncate">
                        {t.label}
                      </p>

                      <p className="text-[9px] text-gray-400 truncate">
                        {t.detail}
                      </p>
                    </div>

                    <ChevronRight
                      size={12}
                      className="text-gray-300 group-hover:text-gray-500 flex-shrink-0"
                    />
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Workload */}
          <motion.div
            initial={{
              opacity: 0,
              x: 12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 0.2,
            }}
            className="bg-blue-600 rounded-xl p-4 text-white shadow-sm"
          >
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Total Weekly
              Workload
            </p>

            <p className="text-[32px] font-bold leading-none mb-1">
              22.5 Hours
            </p>

            <p className="text-[10px] text-blue-200 mb-3">
              Teaching + Relief
              combined
            </p>

            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-blue-200">
                Weekly Target
              </span>

              <span className="text-[10px] font-bold text-white">
                85%
              </span>
            </div>

            <div className="h-1.5 bg-blue-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: '85%',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}