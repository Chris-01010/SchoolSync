import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, UserCheck, BarChart3 } from 'lucide-react';
import {
  AlertCircle,
  Wifi,
  ArrowRight,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { api } from '../services/api';

// ─── Fallback mock data (used only if API fails) ────────────────────────────
const MOCK_STATS = {
  department_name: '',
  pending_approvals_count: 0,
  missing_reliefs: 0,
  teacher_workload_warning: false,
  active_conflicts: 0,
  total_teachers: 0,
};

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
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

// ─── Staff availability card item ────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
];

const StaffItem = ({ teacher, index }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = teacher.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const reliefUsed  = teacher.current_relief_hours ?? 0;
  const reliefCap   = teacher.weekly_relief_cap ?? 3;
  const hoursWorked = teacher.total_hours_worked ?? 0;
  const maxHours    = teacher.max_weekly_hours ?? 30;

  const atRelief  = reliefCap > 0 && reliefUsed >= reliefCap;
  const nearLimit = !atRelief && reliefCap > 0 && reliefUsed >= reliefCap - 1;

  const subText = atRelief
    ? `Relief cap reached (${reliefUsed}/${reliefCap})`
    : nearLimit
    ? `Near relief cap (${reliefUsed}/${reliefCap})`
    : `${hoursWorked}h worked · ${reliefUsed}/${reliefCap} relief`;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-gray-800 truncate">{teacher.name}</p>
        <p className={`text-[10px] truncate ${atRelief ? 'text-red-400' : 'text-gray-400'}`}>
          {subText}
        </p>
      </div>
      {atRelief && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 flex-shrink-0">
          FULL
        </span>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const HODDashboard = ({ user }) => {
  const [stats, setStats]               = useState(MOCK_STATS);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teachers, setTeachers]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [errors, setErrors]             = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const errs = {};

      // 1. HOD stats — correct endpoint (was /hod/dashboard which doesn't exist)
      try {
        const statsData = await api.get('/api/v1/admin/hod-stats');
        setStats((prev) => ({ ...prev, ...statsData }));
      } catch (e) {
        errs.stats = e.message;
        // keep MOCK_STATS as fallback
      }

      // 2. Pending leave requests — correct endpoint, now uses api client (fixes 401)
      try {
        const leavesData = await api.get('/leaves/pending');
        // API returns { success, count, data: [...] }
        setPendingLeaves(leavesData.data ?? leavesData ?? []);
      } catch (e) {
        errs.leaves = e.message;
      }

      // 3. Department teachers — new endpoint (see backend fix below)
      //    Falls back gracefully if not yet deployed
      try {
        const teachersData = await api.get('/api/v1/admin/hod/teachers');
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (e) {
        errs.teachers = e.message;
        // non-fatal — staff card will be empty
      }

      setErrors(errs);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  // Use real pending count from leaves API, fallback to hod-stats value
  const pendingCount = pendingLeaves.length > 0
    ? pendingLeaves.length
    : (stats.pending_approvals_count ?? 0);

  const missingReliefs = stats.missing_reliefs ?? 0;

  // Workload from real teacher data
  const avgReliefHours  = teachers.length > 0
    ? (teachers.reduce((s, t) => s + (t.current_relief_hours ?? 0), 0) / teachers.length).toFixed(1)
    : 0;
  const avgTeachingHours = teachers.length > 0
    ? (teachers.reduce((s, t) => s + (t.total_hours_worked ?? 0), 0) / teachers.length).toFixed(1)
    : 0;
  const maxTeachingHours = teachers.length > 0
    ? (teachers.reduce((s, t) => s + (t.max_weekly_hours ?? 30), 0) / teachers.length)
    : 30;
  const maxReliefHours = teachers.length > 0
    ? (teachers.reduce((s, t) => s + (t.weekly_relief_cap ?? 3), 0) / teachers.length)
    : 3;

  const teachingPct = maxTeachingHours > 0
    ? Math.min(100, Math.round((avgTeachingHours / maxTeachingHours) * 100))
    : 0;
  const reliefPct = maxReliefHours > 0
    ? Math.min(100, Math.round((avgReliefHours / maxReliefHours) * 100))
    : 0;

  const workloadAlert = stats.teacher_workload_warning ?? teachingPct > 90;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      value: pendingCount,
      label: 'Pending Leave Approvals',
      badge: 'PENDING',
      badgeColor: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      value: missingReliefs,
      label: 'Missing Reliefs',
      badge: 'URGENT',
      badgeColor: missingReliefs > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400',
      borderColor: missingReliefs > 0 ? 'border-red-200' : 'border-gray-100',
    },
    {
      value: workloadAlert ? '⚠' : '✓',
      label: 'Teacher Workload',
      badge: 'LOAD',
      badgeColor: workloadAlert ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600',
      borderColor: workloadAlert ? 'border-amber-200' : 'border-green-200',
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
    <div className="space-y-5 max-w-6xl mx-auto p-4 sm:p-6">

      {/* ── API error banner (dev-only) ─────────────────────────────────── */}
      {Object.keys(errors).length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
          <strong>API warnings:</strong>{' '}
          {Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </div>
      )}

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
            { label: 'Timetables',        icon: CalendarDays,   path: '/hod/timetables' },
            { label: 'Leave Approvals',   icon: ClipboardCheck, path: '/hod/leave'       },
            { label: 'Relief Management', icon: UserCheck,      path: '/hod/relief'      },
            { label: 'Analytics',         icon: BarChart3,      path: '/hod/analytics'   },
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
                <span className="text-[11px] font-semibold text-gray-700 group-hover:text-blue-700 leading-tight">
                  {qa.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Critical Alerts — only if there are missing reliefs */}
          {missingReliefs > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-red-500" />
                <h3 className="text-[13px] font-semibold text-gray-800">Critical Alerts</h3>
              </div>
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">
                    {missingReliefs} Unassigned Relief{missingReliefs > 1 ? 's' : ''} Today
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Approved absences without relief coverage
                  </p>
                </div>
                <button
                  onClick={() => navigate('/hod/relief')}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg"
                >
                  Assign Now
                </button>
              </div>
            </div>
          )}

          {/* Pending Leave Requests */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">
                Pending Leave Requests
              </h3>
              <button
                onClick={() => navigate('/hod/leave')}
                className="flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:text-blue-700"
              >
                View All <ArrowRight size={11} />
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-6">
                No pending leave requests.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 5).map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">
                        {leave.teacher_name ?? 'Unknown Teacher'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {leave.leave_type} · {leave.start_date ?? leave.date}
                        {leave.end_date && leave.end_date !== (leave.start_date ?? leave.date)
                          ? ` → ${leave.end_date}`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/hod/leave')}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-lg hover:bg-blue-100"
                    >
                      Review
                    </button>
                  </div>
                ))}
                {pendingLeaves.length > 5 && (
                  <p className="text-[11px] text-gray-400 text-center pt-1">
                    +{pendingLeaves.length - 5} more · <button onClick={() => navigate('/hod/leave')} className="text-blue-500 hover:underline">View All</button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Staff Availability — real data from /api/v1/admin/hod/teachers */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">
                Staff ({stats.total_teachers ?? teachers.length})
              </h3>
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                <Wifi size={8} /> LIVE
              </span>
            </div>
            {teachers.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4">
                {errors.teachers ? 'Could not load staff data.' : 'No teachers found.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {teachers.slice(0, 5).map((t, i) => (
                  <StaffItem key={t.id} teacher={t} index={i} />
                ))}
                {teachers.length > 5 && (
                  <p className="text-[10px] text-gray-400 text-center pt-1">
                    +{teachers.length - 5} more teachers
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Weekly Workload — real averages from teacher data */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">Dept Workload</h3>
              <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                <MoreVertical size={13} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Avg Teaching Hours</span>
                  <span className="text-[10px] text-gray-400 font-medium">{avgTeachingHours}h</span>
                </div>
                <MiniBar value={teachingPct} color="bg-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Avg Relief Hours</span>
                  <span className="text-[10px] text-gray-400 font-medium">{avgReliefHours}h</span>
                </div>
                <MiniBar value={reliefPct} color="bg-amber-400" />
              </div>

              {/* Per-teacher relief bars */}
              {teachers.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Relief by Teacher</p>
                  {teachers.slice(0, 4).map((t) => {
                    const pct = t.weekly_relief_cap > 0
                      ? Math.min(100, Math.round((t.current_relief_hours / t.weekly_relief_cap) * 100))
                      : 0;
                    return (
                      <div key={t.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 truncate w-20 flex-shrink-0">
                          {t.name.split(' ').slice(-1)[0]}
                        </span>
                        <div className="flex-1">
                          <MiniBar
                            value={pct}
                            color={pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-blue-400'}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 w-6 text-right flex-shrink-0">
                          {t.current_relief_hours}/{t.weekly_relief_cap}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/hod/leave')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-colors z-50"
        title="Review Pending Leaves"
      >
        <ClipboardCheck size={20} />
      </button>
    </div>
  );
};

export default HODDashboard;
