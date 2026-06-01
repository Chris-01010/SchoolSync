import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, UserCheck, BarChart3 } from 'lucide-react';
import {
  AlertCircle,
  Users,
  Clock,
  ArrowRight,
  Plus,
  MoreVertical,
  Wifi,
} from 'lucide-react';

// ─── Fallback mock data (used only if API fails) ────────────────────────────
const MOCK_STATS = {
  department_name: 'CS',
  pending_approvals_count: 0,
  missing_reliefs: 0,
  teacher_workload_alert: false,
  active_conflicts: 0,
};

const MOCK_STAFF = [
  { name: 'Ms. Julia Lee',   free: 'Free: Periods 4, 5, 8', initials: 'JL', color: 'bg-purple-100 text-purple-700' },
  { name: 'Mr. David Smith', free: 'Free: Period 4 ONLY',   initials: 'DS', color: 'bg-blue-100 text-blue-700'   },
  { name: 'Ms. Sarah Oh',    free: 'In Class (Ends 12:20)', initials: 'SO', color: 'bg-green-100 text-green-700' },
];

const WORKLOAD_DATA = [
  { day: 'M', teaching: 70, relief: 20 },
  { day: 'T', teaching: 60, relief: 15 },
  { day: 'W', teaching: 85, relief: 30 },
  { day: 'T', teaching: 65, relief: 25 },
  { day: 'F', teaching: 75, relief: 10 },
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Sub-components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status, teacherName, originalName }) => {
  if (status === 'ongoing')
    return (
      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200">
        Ongoing
      </span>
    );
  if (status === 'relief')
    return (
      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
        Relief{teacherName ? `: ${teacherName}` : ''}
      </span>
    );
  if (status === 'scheduled')
    return (
      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
        Scheduled
      </span>
    );
  if (status === 'cancelled')
    return (
      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-semibold border border-red-100 line-through decoration-red-400">
        Cancelled
      </span>
    );
  if (status === 'vacant')
    return (
      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-semibold border border-orange-200">
        ⚠ Vacant{originalName ? ` (was ${originalName})` : ''}
      </span>
    );
  return null;
};

const MiniBar = ({ value, color, max = 100 }) => (
  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${color}`}
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const HODDashboard = ({ user }) => {
  const [stats, setStats]           = useState(MOCK_STATS);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [timetable, setTimetable]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('schoolsync_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, leavesRes, timetableRes] = await Promise.all([
          fetch('http://localhost:8000/hod/dashboard',           { headers }),
          fetch('http://localhost:8000/leaves/pending',          { headers }),
          fetch('http://localhost:8000/leaves/hod/timetable/today', { headers }),
        ]);

        // Stats — best-effort merge with mock
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({ ...prev, ...statsData }));
        }

        // Pending leaves
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          // API returns { success, count, data: [...] }
          setPendingLeaves(leavesData.data ?? leavesData);
        }

        // Today's timetable — real data replaces mock entirely
        if (timetableRes.ok) {
          const ttData = await timetableRes.json();
          setTimetable(ttData.slots ?? []);
        }

      } catch {
        // stay on mock data
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive missing relief count from real timetable data
  const vacantCount = timetable.filter(s => s.status === 'vacant').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      value: stats.pending_approvals_count || pendingLeaves.length,
      label: 'Pending Leave Approvals',
      badge: 'PENDING',
      badgeColor: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      value: vacantCount || stats.missing_reliefs,
      label: 'Missing Reliefs',
      badge: 'URGENT',
      badgeColor: 'bg-red-100 text-red-600',
      borderColor: 'border-red-200',
    },
    {
      value: stats.teacher_workload_alert ? '⚠' : '✓',
      label: 'Teacher Workload',
      badge: 'LOAD',
      badgeColor: 'bg-amber-100 text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      value: stats.active_conflicts ?? 0,
      label: 'Active Conflicts',
      badge: 'CLEAR',
      badgeColor: 'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
    },
  ];

  const todayName = DAY_NAMES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Stat Cards Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white border ${card.borderColor} rounded-xl p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Timetables',        icon: CalendarDays,  path: '/hod/timetables' },
            { label: 'Leave Approvals',   icon: ClipboardCheck, path: '/hod/leave'    },
            { label: 'Relief Management', icon: UserCheck,     path: '/hod/relief'     },
            { label: 'Analytics',         icon: BarChart3,     path: '/hod/analytics'  },
          ].map((qa) => {
            const Icon = qa.icon;
            return (
              <motion.button
                key={qa.label}
                onClick={() => navigate(qa.path)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-5 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 shadow-sm"
              >
                <Icon size={22} strokeWidth={1.8} className="text-blue-500 transition group-hover:text-blue-700" />
                <span className="text-[11px] font-semibold text-gray-700 group-hover:text-blue-700 leading-tight">{qa.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left column (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">

          {/* Critical Alerts — only show if there are vacant slots */}
          {vacantCount > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-red-500" />
                <h3 className="text-[13px] font-semibold text-gray-800">Critical Alerts</h3>
              </div>
              {timetable
                .filter(s => s.status === 'vacant')
                .map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-2">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">
                        Vacant Slot: Period {s.period}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {s.original_teacher_name ? `Was: ${s.original_teacher_name}` : 'No teacher assigned'}
                        {s.class_id ? ` · Class ${s.class_id}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/hod/relief')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg"
                    >
                      Assign Now
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          {/* Today's Timetable */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">
                {todayName}'s Department Timetable
              </h3>
              <button className="flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:text-blue-700">
                Full Schedule <ArrowRight size={11} />
              </button>
            </div>

            <div className="overflow-x-auto">
              {timetable.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-6">
                  No timetable data for today.
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      <th className="text-left pb-2 pr-4">Period</th>
                      <th className="text-left pb-2 pr-4">Teacher</th>
                      <th className="text-left pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {timetable.map((row, i) => (
                      <tr
                        key={i}
                        className={`text-[12px] ${row.status === 'vacant' ? 'bg-orange-50/40' : ''}`}
                      >
                        <td className="py-2 pr-4 font-semibold text-gray-600">
                          {String(row.period).padStart(2, '0')}
                        </td>
                        <td className="py-2 pr-4 text-gray-700">
                          {row.teacher_name ?? (
                            <span className="text-orange-500 font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2">
                          <StatusBadge
                            status={row.status}
                            teacherName={row.teacher_name}
                            originalName={row.original_teacher_name}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right column (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Staff Availability */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">Staff Availability</h3>
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                <Wifi size={8} /> LIVE NOW
              </span>
            </div>
            <div className="space-y-2.5">
              {MOCK_STAFF.map((staff, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${staff.color}`}>
                    {staff.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{staff.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{staff.free}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Workload */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">Weekly Workload</h3>
              <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                <MoreVertical size={13} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Teaching Hours</span>
                  <span className="text-[10px] text-gray-400 font-medium">Avg: 22h</span>
                </div>
                <MiniBar value={78} color="bg-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Relief Duties</span>
                  <span className="text-[10px] text-gray-400 font-medium">Avg: 4h</span>
                </div>
                <MiniBar value={35} color="bg-amber-400" />
              </div>
              <div className="flex items-end justify-between gap-1.5 pt-2" style={{ height: 64 }}>
                {WORKLOAD_DATA.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: 52 }}>
                      <div className="w-full rounded-t-sm bg-blue-200" style={{ height: `${(d.teaching / 100) * 44}px` }} />
                      <div className="w-full rounded-b-sm bg-blue-500" style={{ height: `${(d.relief / 100) * 44}px` }} />
                    </div>
                    <span className={`text-[9px] font-semibold ${d.day === 'W' ? 'text-blue-600' : 'text-gray-400'}`}>
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-colors z-50"
        title="Quick Action"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default HODDashboard;
