import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const barData = [
  { name: "MATH", hours: 24 }, { name: "SCI", hours: 27 }, { name: "ENG", hours: 20 },
  { name: "HST", hours: 22 }, { name: "ART", hours: 18 }, { name: "PE",  hours: 16 },
];

const pieData = [
  { name: "Internal", value: 72, color: "#4F46E5" },
  { name: "Casual",   value: 28, color: "#C4B5FD" },
];

const leaveRaw = [2,3,4,3,5,4,6,5,7,6,8,7,9,8,10,9,10,11,10,12,11,10,9,11,10,12,11,10,12,11];
const leaveData = leaveRaw.map((v, i) => ({ day: i + 1, leaves: v }));

const mostRelief = [
  { initials: "RJ", name: "Robert Jenkins", dept: "Mathematics", hrs: "12.5 hrs", sub: "This Week" },
  { initials: "SW", name: "Sarah Wong",     dept: "Science",     hrs: "11.0 hrs", sub: null },
];
const leastRelief = [
  { initials: "AM", name: "Alan Miller", dept: "English", hrs: "0.0 hrs" },
  { initials: "KL", name: "Karen Lee",   dept: "History", hrs: "0.5 hrs" },
];

const overloaded = [
  { name: "Robert Jenkins",  dept: "Math",    load: 108, color: "text-red-600" },
  { name: "Sarah Wong",      dept: "Science", load: 104, color: "text-red-600" },
  { name: "Marcus Aurelius", dept: "History", load: 98,  color: "text-amber-600" },
];

const deptWorkload = [
  { dept: "Mathematics", avgTeach: "24.5 / wk", avgRelief: "4.2 / wk", leaveDays: "18 Days", pct: 78, barColor: "bg-indigo-500", label: "78% Optimal",  pillColor: "bg-indigo-50 text-indigo-700 ring-indigo-500/20" },
  { dept: "Science",     avgTeach: "26.8 / wk", avgRelief: "5.5 / wk", leaveDays: "24 Days", pct: 96, barColor: "bg-red-500",    label: "96% Critical", pillColor: "bg-red-50 text-red-700 ring-red-500/20" },
  { dept: "English",     avgTeach: "20.2 / wk", avgRelief: "1.5 / wk", leaveDays: "12 Days", pct: 65, barColor: "bg-blue-500",   label: "65% Low Load", pillColor: "bg-blue-50 text-blue-700 ring-blue-500/20" },
  { dept: "Humanities",  avgTeach: "22.1 / wk", avgRelief: "2.8 / wk", leaveDays: "15 Days", pct: 82, barColor: "bg-emerald-500", label: "82% Healthy", pillColor: "bg-emerald-50 text-emerald-700 ring-emerald-500/20" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700">{label ?? payload[0]?.name}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value}</p>
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

export default function WorkloadAnalyticsPage() {
  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-6">

      <motion.h1 variants={itemV} className="text-[28px] font-bold tracking-tight text-gray-900">
        Workload &amp; Analytics
      </motion.h1>

      {/* TOP ROW - 3 columns */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* COL 1: Teaching Hours Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Teaching Hours by Dept</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,70,229,0.06)" }} />
              <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* COL 2: Relief Distribution Donut */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Relief Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 26, fontWeight: 700, fill: "#111827" }}>342</text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: "#9CA3AF" }}>Total Hours</text>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-5 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />Internal 72%</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#C4B5FD" }} />Casual 28%</span>
          </div>
        </div>

        {/* COL 3: Relief Fairness Analysis */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-red-600">Imbalance Detected</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
                3 Teachers in Math are exceeding the fair relief quota by 22%.
              </p>
            </div>
          </div>
          <div className="my-2 h-px bg-gray-100" />
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Most Relief Assigned</p>
          <div className="space-y-2.5">
            {mostRelief.map((r) => (
              <div key={r.initials} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white">{r.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-900">{r.name}</p>
                  <p className="text-[11px] text-gray-400">{r.dept}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-indigo-600">{r.hrs}</p>
                  {r.sub && <p className="text-[10px] text-gray-400">{r.sub}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="my-2.5 h-px bg-gray-100" />
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Least Relief Assigned</p>
          <div className="space-y-2.5">
            {leastRelief.map((r) => (
              <div key={r.initials} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-200 text-[10px] font-bold text-gray-600">{r.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-900">{r.name}</p>
                  <p className="text-[11px] text-gray-400">{r.dept}</p>
                </div>
                <p className="text-[13px] font-bold text-red-600">{r.hrs}</p>
              </div>
            ))}
          </div>
          <button className="mt-auto pt-4">
            <span className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">Suggest Rebalancing</span>
          </button>
        </div>
      </motion.div>

      {/* MIDDLE ROW - 2 columns */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Leave Trends (30 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={leaveData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => (v % 7 === 1 ? `W${Math.ceil(v / 7)}` : "")} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="leaves" stroke="#4F46E5" strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#4F46E5", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#4F46E5" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Overloaded Teachers</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {["TEACHER NAME", "DEPT", "LOAD%"].map((h) => (
                  <th key={h} className="pb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overloaded.map((t) => (
                <tr key={t.name} className="border-b border-gray-100">
                  <td className="py-2.5 text-[13px] font-medium text-gray-900">{t.name}</td>
                  <td className="py-2.5 text-[13px] text-gray-500">{t.dept}</td>
                  <td className={`py-2.5 text-[13px] font-bold ${t.color}`}>{t.load}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* BOTTOM - Dept Workload Comparison */}
      <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-base font-bold text-gray-900">Department Workload Comparison</h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
            <Download size={13} /> Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {["DEPARTMENT", "AVG TEACHING HRS", "AVG RELIEF HRS", "TOTAL LEAVE DAYS", "LOAD CAPACITY", "STATUS"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptWorkload.map((d) => (
                <tr key={d.dept} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-gray-900">{d.dept}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.avgTeach}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.avgRelief}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.leaveDays}</td>
                  <td className="px-5 py-3.5" style={{ minWidth: 140 }}>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${d.barColor}`} style={{ width: `${d.pct}%` }} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${d.pillColor}`}>{d.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
