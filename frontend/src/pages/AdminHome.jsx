import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, BookOpen, Plane, AlertCircle, CheckSquare,
  AlertTriangle, RefreshCw, CalendarPlus, ClipboardList, Send, Clock, Radio,
} from "lucide-react";
import { api } from "../services/api";

const accentMap = {
  indigo: { iconBg: "bg-indigo-50", iconText: "text-indigo-600" },
  blue:   { iconBg: "bg-blue-50",   iconText: "text-blue-600" },
  purple: { iconBg: "bg-purple-50", iconText: "text-purple-600" },
  orange: { iconBg: "bg-orange-50", iconText: "text-orange-600" },
  red:    { iconBg: "bg-red-50",    iconText: "text-red-600" },
  teal:   { iconBg: "bg-teal-50",   iconText: "text-teal-600" },
  amber:  { iconBg: "bg-amber-50",  iconText: "text-amber-600" },
  gray:   { iconBg: "bg-gray-100",  iconText: "text-gray-600" },
};

function MetricCard({ title, value, subtext, icon: Icon, accent = "indigo" }) {
  const a = accentMap[accent] || accentMap.indigo;
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm cursor-default">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-[34px] font-bold leading-none tracking-tight text-gray-900">{value}</p>
          {subtext && <p className="pt-0.5 text-xs font-medium text-gray-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

const alerts = [
  { color: "bg-red-500",   title: "Room 101 Conflict Detected", description: "Mathematics Year 10 and Physics Year 12 scheduled simultaneously.", time: "2 mins ago" },
  { color: "bg-red-500",   title: "4 Unassigned Reliefs",       description: "Critical shortage for Period 4. No relief teachers have accepted requests.", time: "15 mins ago" },
  { color: "bg-amber-500", title: "Workload Warning",           description: "Teacher 'John Smith' has exceeded maximum weekly relief hours.", time: "1 hour ago" },
];

const quickActions = [
  { label: "Create Timetable",  icon: CalendarPlus,  path: "/admin/timetables"   },
  { label: "Manage Relief",     icon: RefreshCw,     path: "/admin/relief"        },
  { label: "Review Leaves",     icon: ClipboardList, path: "/admin/leave"         },
  { label: "Manage Users",      icon: Users,         path: "/admin/users"         },
  { label: "Manage Depts",      icon: Building2,     path: "/admin/departments"   },
  { label: "Send Announcement", icon: Send,          path: "/admin/announcements" },
];

const conflicts = [
  { type: "Room Overlap",   entities: "Room 101: Math 10A / Physics 12C",              slot: "Period 3 (10:30-11:15)" },
  { type: "Double Booking", entities: "Dr. Alan Turing: CS 101 / Staff Meeting",       slot: "Period 5 (12:45-13:30)" },
  { type: "Resource Gap",   entities: "Lab 4: Chemistry Year 11 (No Lab Assistant)",   slot: "Period 2 (09:40-10:25)" },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // admin_dashboard router is mounted at /api/v1/admin
      const data = await api.get("/api/v1/admin/dashboard/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const metrics = stats
    ? [
        { title: "Total Departments",        value: stats.total_departments,       subtext: "Active departments",         icon: Building2,     accent: "indigo" },
        { title: "Total Teachers",           value: stats.total_teachers,          subtext: "Including HODs",             icon: Users,         accent: "blue"   },
        { title: "Total Classes",            value: stats.total_classes,           subtext: "All sections",               icon: BookOpen,      accent: "purple" },
        { title: "Teachers on Leave",        value: stats.teachers_on_leave,       subtext: "Today",                      icon: Plane,         accent: "orange" },
        { title: "Pending Leave Requests",   value: stats.pending_leave_requests,  subtext: "Across all depts",           icon: AlertCircle,   accent: "red"    },
        { title: "Total Relief Duties Today",value: stats.total_relief_duties,     subtext: "Assigned today",             icon: CheckSquare,   accent: "teal"   },
        { title: "Unassigned Relief Periods",value: stats.unassigned_relief_periods,subtext: "Need action",              icon: AlertTriangle, accent: "amber"  },
      ]
    : [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

      {/* HEADER */}
      <motion.section variants={itemVariants} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back, Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Manage institutional timetables and teacher reliefs with precision.</p>
        </div>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">{new Date().toLocaleString()}</span>
          <span className="mx-1 text-gray-300">&bull;</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
            <Radio size={10} className="animate-pulse" /> LIVE STATUS
          </span>
        </div>
      </motion.section>

      {/* METRIC CARDS */}
      <motion.section variants={itemVariants}>
        {loading && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Loading dashboard stats…</div>}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={fetchStats} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
          </div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metrics.map((m) => (<MetricCard key={m.title} {...m} />))}
          </div>
        )}
      </motion.section>

      {/* ALERTS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.section variants={itemVariants} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-[15px] font-bold text-gray-900">Critical Alerts</h2>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-inset ring-red-500/20">Action Required</span>
          </div>
          <div className="flex-1 divide-y divide-gray-100">
            {alerts.map((a, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 transition hover:bg-gray-50/60">
                <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${a.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-900">{a.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{a.description}</p>
                  <p className="mt-1.5 text-[11px] text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-[15px] font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <motion.button key={qa.label} onClick={() => qa.path && navigate(qa.path)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-5 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                  <Icon size={22} strokeWidth={1.8} className="text-indigo-500 transition group-hover:text-indigo-700" />
                  <span className="text-[12px] font-semibold text-gray-700 group-hover:text-indigo-700">{qa.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* CONFLICTS TABLE */}
      <motion.section variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-[15px] font-bold text-gray-900">Active Conflicts &amp; Resolutions</h2>
          <button className="text-[13px] font-semibold text-indigo-600 transition hover:text-indigo-800">View All Conflicts</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {["Conflict Type", "Affected Entities", "Time Slot", "Action"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conflicts.map((c, i) => (
                <tr key={i} className="transition-colors hover:bg-indigo-50/30">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      <span className="font-medium text-gray-900">{c.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{c.entities}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">{c.slot}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <button className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  );
}