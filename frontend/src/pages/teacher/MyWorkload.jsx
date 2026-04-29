import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';
import { workloadStats } from '../../mockData';

// ─── Donut chart (Teaching Hours) ────────────────────────────────────────────
const DonutChart = ({ current, total }) => {
  const pct = Math.round((current / total) * 100);
  const data = [
    { name: 'Done', value: current },
    { name: 'Left', value: total - current },
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
  const s = workloadStats;

  const isDown = s.changeFromLastWeek < 0;

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
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                timeFilter === i
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top row: Donut + Stacked bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teaching Hours donut */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
        >
          <h3 className="text-[12px] font-bold text-gray-700 mb-4">Teaching Hours</h3>
          <DonutChart current={s.teachingHours.current} total={s.teachingHours.total} />

          <div className="mt-4 flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full ${
                isDown
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {isDown ? '' : '+'}{s.changeFromLastWeek}h from last week
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

          {/* Dept benchmark */}
          <div className="mt-5 bg-blue-600 rounded-xl p-4 text-white">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Dept Benchmark
            </p>
            <p className="text-[28px] font-bold leading-none">{s.deptBenchmarkDelta}</p>
            <p className="text-[10px] text-blue-200 mt-1">{s.deptBenchmarkLabel}</p>
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
        <h3 className="text-[12px] font-bold text-gray-700 mb-4">Daily Teaching Hours</h3>
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
                  fill={index === 2 ? '#3b82f6' : '#bfdbfe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
