import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCog,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Recent reports data
   ═══════════════════════════════════════════════════════════════ */

const recentReports = [
  { name: "Timetable Summary — Jan 2024.pdf",  date: "Jan 15, 2024", size: "2.4 MB", type: "pdf" },
  { name: "Relief Duty Report — Week 3.xlsx",   date: "Jan 14, 2024", size: "1.1 MB", type: "xlsx" },
  { name: "Leave Summary — Q1 2024.pdf",        date: "Jan 10, 2024", size: "3.2 MB", type: "pdf" },
  { name: "Workload Analysis — Math.pdf",        date: "Jan 8, 2024",  size: "1.8 MB", type: "pdf" },
  { name: "Department Overview.xlsx",             date: "Jan 5, 2024",  size: "2.0 MB", type: "xlsx" },
  { name: "Audit Log Export — Jan.csv",           date: "Jan 1, 2024",  size: "0.8 MB", type: "csv" },
];

const fileIcon = {
  pdf:  { Icon: FileText,        color: "text-indigo-600", bg: "bg-indigo-50" },
  xlsx: { Icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50" },
  csv:  { Icon: FileCog,         color: "text-gray-500",   bg: "bg-gray-100" },
};

/* ═══════════════════════════════════════════════════════════════
   Audit log data
   ═══════════════════════════════════════════════════════════════ */

const auditRows = [
  { time: "Jan 15, 10:32", user: "Admin",             action: "Override Relief", details: "Relief #R203 — Math Dept" },
  { time: "Jan 15, 09:15", user: "Mr. Adams (HOD)",   action: "Approve Leave",   details: "Leave #L101 — Dr. Johnson" },
  { time: "Jan 14, 16:45", user: "Admin",             action: "Create User",     details: "john.doe@institution.edu" },
  { time: "Jan 14, 14:20", user: "Admin",             action: "Assign HOD",      details: "Dr. Peterson → Science Dept" },
  { time: "Jan 13, 11:10", user: "Ms. Brown (HOD)",   action: "Reject Leave",    details: "Leave #L098 — Mr. Kumar" },
  { time: "Jan 13, 09:00", user: "Admin",             action: "Block Room",      details: "Room 201 — Maintenance" },
];

/* ═══════════════════════════════════════════════════════════════
   Animation
   ═══════════════════════════════════════════════════════════════ */

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

/* ═══════════════════════════════════════════════════════════════
   ReportsPage
   ═══════════════════════════════════════════════════════════════ */

export default function ReportsPage() {
  const [includeCharts, setIncludeCharts] = useState(true);
  const [scheduleEmail, setScheduleEmail] = useState(false);

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">

      {/* ═══════ HEADER ═══════ */}
      <motion.div variants={itemV} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Generate, export, and review institutional reports and audit logs.</p>
        </div>
        <button className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
          <Plus size={15} />
          Generate Report
        </button>
      </motion.div>

      {/* ═══════ TWO COLUMN LAYOUT ═══════ */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-5 xl:grid-cols-5">

        {/* ── LEFT: Generate Report (3/5) ── */}
        <div className="xl:col-span-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-[16px] font-bold text-gray-900">Generate New Report</h2>

          <div className="space-y-4">
            {/* report type */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Report Type
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>Timetable Summary</option>
                  <option>Relief Duty Report</option>
                  <option>Leave Summary</option>
                  <option>Workload Analysis</option>
                  <option>Department Overview</option>
                  <option>Audit Log Export</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* department */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Department
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>All Departments</option>
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>History</option>
                  <option>Computer Science</option>
                  <option>Physics</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* date range */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  defaultValue="2024-01-01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="date"
                  defaultValue="2024-01-31"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* format */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Format
              </label>
              <div className="flex gap-5">
                {["PDF", "Excel", "CSV"].map((fmt, i) => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      defaultChecked={i === 0}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* include charts toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Include Charts</span>
              <button
                onClick={() => setIncludeCharts(!includeCharts)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  includeCharts ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    includeCharts ? "translate-x-[22px]" : "translate-x-[2px]"
                  } mt-[2px]`}
                />
              </button>
            </div>

            {/* schedule email toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Schedule Email</span>
                <button
                  onClick={() => setScheduleEmail(!scheduleEmail)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                    scheduleEmail ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      scheduleEmail ? "translate-x-[22px]" : "translate-x-[2px]"
                    } mt-[2px]`}
                  />
                </button>
              </div>
              {scheduleEmail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="email"
                    placeholder="admin@institution.edu"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </motion.div>
              )}
            </div>

            {/* generate button */}
            <button className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
              Generate Report
            </button>
          </div>
        </div>

        {/* ── RIGHT: Recent Reports (2/5) ── */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[16px] font-bold text-gray-900">Recent Reports</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {recentReports.map((r, idx) => {
              const fi = fileIcon[r.type] || fileIcon.csv;
              const IconComp = fi.Icon;
              return (
                <div key={idx} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/60">
                  {/* icon */}
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${fi.bg}`}>
                    <IconComp size={16} className={fi.color} />
                  </div>

                  {/* name + date */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-gray-900">{r.name}</p>
                    <p className="text-[11px] text-gray-400">{r.date}</p>
                  </div>

                  {/* size */}
                  <span className="hidden sm:block text-[11px] font-medium text-gray-400 flex-shrink-0">{r.size}</span>

                  {/* actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <button className="text-[12px] font-semibold text-indigo-600 transition hover:text-indigo-800">
                      Download
                    </button>
                    <button className="text-[12px] font-semibold text-red-500 transition hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══════ AUDIT LOG TABLE ═══════ */}
      <motion.div variants={itemV} className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[16px] font-bold text-gray-900">Audit Log</h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
            <Download size={13} />
            Export Audit Log
          </button>
        </div>

        {/* filter row */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              defaultValue="2024-01-01"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="date"
              defaultValue="2024-01-31"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Action Type: All</option>
              <option>Override Relief</option>
              <option>Approve Leave</option>
              <option>Reject Leave</option>
              <option>Create User</option>
              <option>Assign HOD</option>
              <option>Block Room</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>User: All</option>
              <option>Admin</option>
              <option>Mr. Adams (HOD)</option>
              <option>Ms. Brown (HOD)</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {["TIMESTAMP", "USER", "ACTION", "DETAILS"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditRows.map((r, idx) => (
                <tr key={idx} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-500 font-mono">{r.time}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-gray-900">{r.user}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
                      {r.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-500">Showing 1 to 10 of 245 entries</p>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  p === 1
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-1 text-xs text-gray-400">…</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
              25
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
