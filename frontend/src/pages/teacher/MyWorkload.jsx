import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import { useTeacherTimetable, useTeacherProfile } from '../../hooks/useTeacherData';

const DAY_KEYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS_PER_DAY = 6; // matches backend seed (P1..P6)

// ─── Derive workload stats from timetable ────────────────────────────────────
// timetable shape: { Monday: { 1: {type, subject, class, room}, 2: {...}, ... }, ... }
// We count one "hour" per scheduled period. Backend hours model is 1 period = 1 hour.
function deriveWorkload(timetable, profile) {
  // Per-day breakdown (only non-free, non-relief = "teaching")
  const dailyHours = DAY_KEYS.map((dayKey, i) => {
    const day = timetable?.[dayKey] ?? {};
    let teaching = 0;
    let relief = 0;
    for (let p = 1; p <= PERIODS_PER_DAY; p++) {
      const cell = day[p];
      if (!cell) continue;
      if (cell.type === 'relief') relief += 1;
      else if (cell.type !== 'free') teaching += 1;
    }
    return { day: DAY_LABELS[i], dayKey, hours: teaching, relief };
  });

  const totalTeaching = dailyHours.reduce((sum, d) => sum + d.hours, 0);
  const totalRelief   = dailyHours.reduce((sum, d) => sum + d.relief, 0);
  const totalCap      = profile?.teachingHours?.total ?? 30;
  const free          = Math.max(0, totalCap - totalTeaching - totalRelief);

  return {
    teachingHours: { current: totalTeaching, total: totalCap },
    weeklyBreakdown: { teaching: totalTeaching, relief: totalRelief, free },
    deptName: profile?.department ?? 'Department',
    dailyHours,
  };
}

// ─── Donut chart (Teaching Hours) ────────────────────────────────────────────
const DonutChart = ({ current, total }) => {
  const safeTotal = total > 0 ? total : 1;
  const data = [
    { name: 'Done', value: current },
    { name: 'Left', value: Math.max(0, safeTotal - current) },
  ];
  return (
    <div className="relative w-[140px] h-[140px] mx-auto">
      <PieChart width={140} height={140}>
        <Pie
          data={data}
          cx={70}
          cy={70}
          innerRadius={48}
          outerRadius={64}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill="#3b82f6" />
          <Cell fill="#e0e7ff" />
        </Pie>
      </PieChart>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[20px] font-bold text-gray-900 leading-none">
          {current}/{total}
        </p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">HOURS</p>
      </div>
    </div>
  );
};

// ─── Stacked workload bar ─────────────────────────────────────────────────────
const WorkloadBar = ({ teaching, relief, free }) => {
  const total = teaching + relief + free;
  // Guard against an all-zero state during initial load
  if (total === 0) {
    return (
      <div className="space-y-2">
        <div className="flex h-6 rounded-full overflow-hidden bg-gray-100" />
        <p className="text-[10px] text-gray-400">No scheduled hours yet.</p>
      </div>
    );
  }

  const t_pct = (teaching / total) * 100;
  const r_pct = (relief / total) * 100;
  const f_pct = (free / total) * 100;

  const segments = [
    { pct: t_pct, color: 'bg-blue-600', label: `${teaching}h`, tooltip: 'Teaching' },
    { pct: r_pct, color: 'bg-orange-400', label: `${relief}h`, tooltip: 'Relief' },
    { pct: f_pct, color: 'bg-gray-200', label: `${free}h`, tooltip: 'Free' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
        {segments.map((s) => (
          <div
            key={s.tooltip}
            className={`${s.color} flex items-center justify-center transition-all`}
            style={{ width: `${s.pct}%` }}
            title={`${s.tooltip}: ${s.label}`}
          >
            {s.pct > 12 && (
              <span className="text-[9px] font-bold text-white">{s.label}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {[
          { color: 'bg-blue-600', label: 'Teaching' },
          { color: 'bg-orange-400', label: 'Relief' },
          { color: 'bg-gray-300', label: 'Free' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] text-gray-500 font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Custom tooltip for bar chart ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-[11px]">
      <p className="font-bold text-gray-700">{label}</p>
      <p className="text-blue-600 font-semibold">{payload[0].value}h teaching</p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const TIME_FILTERS = ['This Week', 'This Month', 'This Term'];

export default function MyWorkload() {
  const [timeFilter, setTimeFilter] = useState(0);

  // ── Real data from API ────────────────────────────────────────────────────
  const { data: timetableData, loading: timetableLoading } = useTeacherTimetable();
  const { data: profile, loading: profileLoading } = useTeacherProfile();

  const isLoading = timetableLoading || profileLoading;

  // Derive workload from the timetable. Memoized so it doesn't recompute on every
  // re-render (e.g. time-filter clicks) — only when the underlying data changes.
  const s = useMemo(
    () => deriveWorkload(timetableData ?? {}, profile),
    [timetableData, profile]
  );

  // Find the busiest day so we can highlight it on the bar chart
  const busiestDayIndex = useMemo(() => {
    let max = -1, idx = -1;
    s.dailyHours.forEach((d, i) => { if (d.hours > max) { max = d.hours; idx = i; } });
    return idx;
  }, [s.dailyHours]);

  return (
    <div className="max-w-[1100px] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[18px] font-bold text-gray-900">Workload Statistics</h1>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {TIME_FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setTimeFilter(i)}
              disabled={i !== 0}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                timeFilter === i
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={i !== 0 ? 'Coming soon' : ''}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center text-[12px] text-gray-400">
          Loading workload stats…
        </div>
      ) : (
        <>
          {/* Top row: Donut + Stacked bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teaching Hours donut */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
            >
              <h3 className="text-[12px] font-bold text-gray-700 mb-1">Teaching Hours</h3>
              <p className="text-[10px] text-gray-400 mb-4">Scheduled hours this week</p>
              <DonutChart current={s.teachingHours.current} total={s.teachingHours.total} />

              <div className="mt-4 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 px-3 py-1 rounded-full bg-gray-50">
                  {s.teachingHours.total - s.teachingHours.current}h remaining under cap
                </span>
              </div>
            </motion.div>

            {/* Weekly Load Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-gray-700">Weekly Load Breakdown</h3>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {s.deptName}
                </span>
              </div>

              <WorkloadBar
                teaching={s.weeklyBreakdown.teaching}
                relief={s.weeklyBreakdown.relief}
                free={s.weeklyBreakdown.free}
              />

              {/* Summary callout — replaces the fake dept-benchmark card */}
              <div className="mt-5 bg-blue-600 rounded-xl p-4 text-white">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                  Total Scheduled
                </p>
                <p className="text-[28px] font-bold leading-none">
                  {s.weeklyBreakdown.teaching + s.weeklyBreakdown.relief}h
                </p>
                <p className="text-[10px] text-blue-200 mt-1">
                  {s.weeklyBreakdown.teaching}h teaching + {s.weeklyBreakdown.relief}h relief
                </p>
                <button className="mt-3 text-[10px] font-bold text-white underline underline-offset-2
                                   hover:text-blue-200 transition-colors flex items-center gap-1">
                  Request Review <ExternalLink size={10} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Daily Teaching Hours bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
          >
            <h3 className="text-[12px] font-bold text-gray-700 mb-1">Daily Teaching Hours</h3>
            <p className="text-[10px] text-gray-400 mb-4">From your scheduled timetable</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={s.dailyHours} barSize={28}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 6 }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {s.dailyHours.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === busiestDayIndex ? '#3b82f6' : '#bfdbfe'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}