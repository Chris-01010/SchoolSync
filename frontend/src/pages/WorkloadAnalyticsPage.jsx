import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { api } from "../services/api";

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

const pieColors = ["#4F46E5", "#C4B5FD"];

export default function WorkloadAnalyticsPage() {
  const [deptData, setDeptData]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/v1/admin/analytics/workload-by-dept");
      const list = Array.isArray(data) ? data : (data?.data || []);
      setDeptData(list);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  // Map API data to chart format
  const barData = deptData.map((d) => ({
    name: d.department_name?.slice(0, 4).toUpperCase() || d.name?.slice(0, 4).toUpperCase() || "—",
    hours: d.avg_teaching_hours || d.total_hours || 0,
  }));

  const overloadedTeachers = deptData
    .filter((d) => (d.load_percentage || 0) > 90)
    .map((d) => ({
      name: d.department_name || d.name || "—",
      dept: d.department_name || "—",
      load: d.load_percentage || 0,
      color: (d.load_percentage || 0) >= 100 ? "text-red-600" : "text-amber-600",
    }));

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-6">

      <motion.h1 variants={itemV} className="text-[28px] font-bold tracking-tight text-gray-900">
        Workload &amp; Analytics
      </motion.h1>

      {/* ERROR */}
      {error && (
        <motion.div variants={itemV} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button onClick={fetchAnalytics} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
        </motion.div>
      )}

      {/* TOP ROW */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Teaching Hours Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Teaching Hours by Dept</h2>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">Loading…</div>
          ) : barData.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">No data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,70,229,0.06)" }} />
                <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Relief Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Relief Distribution</h2>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">Loading…</div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">No data available.</div>
          )}
        </div>

        {/* Relief Fairness */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-gray-600">Relief Fairness</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
                {loading ? "Loading…" : deptData.length === 0 ? "No imbalance data available yet." : "Analysis based on current data."}
              </p>
            </div>
          </div>
          <div className="my-2 h-px bg-gray-100" />
          {!loading && deptData.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-8 text-sm text-gray-400">No data yet.</div>
          )}
          <button className="mt-auto pt-4">
            <span className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">Suggest Rebalancing</span>
          </button>
        </div>
      </motion.div>

      {/* MIDDLE ROW */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Leave Trends (30 Days)</h2>
          <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
            {loading ? "Loading…" : "No trend data available."}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-bold text-gray-900">Overloaded Teachers</h2>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">Loading…</div>
          ) : overloadedTeachers.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">No overloaded teachers.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {["TEACHER NAME", "DEPT", "LOAD%"].map((h) => (
                    <th key={h} className="pb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overloadedTeachers.map((t) => (
                  <tr key={t.name} className="border-b border-gray-100">
                    <td className="py-2.5 text-[13px] font-medium text-gray-900">{t.name}</td>
                    <td className="py-2.5 text-[13px] text-gray-500">{t.dept}</td>
                    <td className={`py-2.5 text-[13px] font-bold ${t.color}`}>{t.load}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* DEPT WORKLOAD TABLE */}
      <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-base font-bold text-gray-900">Department Workload Comparison</h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
            <Download size={13} /> Export Report
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
        ) : deptData.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">No department workload data available.</div>
        ) : (
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
                {deptData.map((d, i) => (
                  <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-gray-900">{d.department_name || d.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.avg_teaching_hours ?? "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.avg_relief_hours ?? "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{d.total_leave_days ?? "—"}</td>
                    <td className="px-5 py-3.5" style={{ minWidth: 140 }}>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${d.load_percentage || 0}%` }} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-500/20">
                        {d.load_percentage || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}