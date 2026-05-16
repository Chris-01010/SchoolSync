import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Crown,
  X,
  Eye,
} from "lucide-react";

/* ===================================================================
   Summary stat cards
   =================================================================== */

const summaryStats = [
  { label: "TOTAL RELIEF TODAY", value: "24", sub: "Across all departments",   accent: "text-teal-600",    icon: ShieldCheck,   iconBg: "bg-teal-50" },
  { label: "ASSIGNED",          value: "20", sub: "Successfully covered",     accent: "text-emerald-600", icon: CheckCircle2,  iconBg: "bg-emerald-50" },
  { label: "UNASSIGNED",        value: "4",  sub: "Needs immediate action",   accent: "text-red-600",     icon: AlertTriangle, iconBg: "bg-red-50" },
  { label: "ADMIN OVERRIDES",   value: "2",  sub: "Overridden by admin",      accent: "text-purple-600",  icon: Crown,         iconBg: "bg-purple-50" },
];

/* ===================================================================
   Relief table data
   =================================================================== */

const reliefRows = [
  { id: 1, dept: "Math",    period: "Period 1", substitute: "Mr. Smith",   absent: "Dr. Johnson",  cls: "10A", status: "assigned",   override: false },
  { id: 2, dept: "Science", period: "Period 2", substitute: null,          absent: "Dr. Patel",    cls: "10B", status: "unassigned", override: false },
  { id: 3, dept: "English", period: "Period 3", substitute: "Ms. Lee",     absent: "Ms. Williams", cls: "9C",  status: "assigned",   override: false },
  { id: 4, dept: "Math",    period: "Period 4", substitute: null,          absent: "Dr. Johnson",  cls: "11A", status: "unassigned", override: false },
  { id: 5, dept: "Science", period: "Period 5", substitute: "Prof. Kumar", absent: "Dr. Patel",    cls: "10C", status: "overridden", override: true },
  { id: 6, dept: "History", period: "Period 6", substitute: "Mr. Davis",   absent: "Ms. Brown",    cls: "9A",  status: "assigned",   override: false },
];

const statusConfig = {
  assigned:   { label: "Assigned",   pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" },
  unassigned: { label: "Unassigned", pill: "bg-amber-50 text-amber-700 ring-amber-500/20",      dot: "bg-amber-500" },
  overridden: { label: "Overridden", pill: "bg-purple-50 text-purple-700 ring-purple-500/20",    dot: "bg-purple-500" },
};

/* ===================================================================
   Animation
   =================================================================== */

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
const modalContent = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

/* ===================================================================
   ReliefManagementPage
   =================================================================== */

export default function ReliefManagementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);

  const openAssign = (row) => {
    setModalRow(row);
    setModalOpen(true);
  };

  return (
    <>
      <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">

        {/* ======= HEADER ======= */}
        <motion.div variants={itemV} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Relief Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and assign relief duties across all departments.</p>
          </div>
          <button className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Download size={15} />
            Export
          </button>
        </motion.div>

        {/* ======= 4 STAT CARDS ======= */}
        <motion.div variants={itemV} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.accent}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className={`mt-0.5 text-[28px] font-bold leading-none tracking-tight ${s.accent}`}>{s.value}</p>
                  <p className="mt-1.5 text-xs font-medium text-gray-400">{s.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ======= FILTER ROW ======= */}
        <motion.div variants={itemV} className="flex flex-wrap items-center gap-3">
          {/* department */}
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Department: All</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
              <option>History</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* date */}
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Date: Today</option>
              <option>Yesterday</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* status */}
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Status: All</option>
              <option>Assigned</option>
              <option>Unassigned</option>
              <option>Overridden</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* search */}
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search relief..."
              className="w-52 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </motion.div>

        {/* ======= RELIEF TABLE ======= */}
        <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["DEPT", "PERIOD", "SUBSTITUTE TEACHER", "ABSENT TEACHER", "CLASS", "STATUS", "ACTION"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reliefRows.map((r) => {
                  const sc = statusConfig[r.status];
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${
                        r.override ? "bg-purple-50/40" : ""
                      }`}
                      title={r.override ? "Overridden by Admin on Jan 15" : undefined}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-gray-700">{r.dept}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.period}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px]">
                        {r.substitute ? (
                          <span className="font-medium text-gray-900">{r.substitute}</span>
                        ) : (
                          <span className="italic text-red-400">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.absent}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.cls}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${sc.pill}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {r.status === "unassigned" ? (
                          <button
                            onClick={() => openAssign(r)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            Assign
                          </button>
                        ) : (
                          <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 transition hover:text-indigo-600">
                            <Eye size={13} />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* table summary footer */}
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-emerald-600">12 assigned</span>
              {" | "}
              <span className="font-semibold text-amber-600">4 unassigned</span>
              {" | "}
              <span className="font-semibold text-purple-600">2 overridden by Admin</span>
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
              <Download size={13} />
              Export
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ======= ASSIGN RELIEF MODAL ======= */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              {/* modal header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Assign Relief Teacher</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* form */}
              <div className="space-y-4">
                {/* absent teacher */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Absent Teacher
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalRow?.absent || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
                  />
                </div>

                {/* class */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Class
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalRow?.cls || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
                  />
                </div>

                {/* period */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Period
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalRow?.period || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
                  />
                </div>

                {/* select substitute */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Select Substitute
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option value="">Choose a teacher...</option>
                      <option>Mr. Smith</option>
                      <option>Ms. Lee</option>
                      <option>Prof. Kumar</option>
                      <option>Mr. Davis</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* override checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Override HOD allocation</span>
                </label>

                {/* notes */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reason for override (optional)"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
              </div>

              {/* modal buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Assign Relief
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
