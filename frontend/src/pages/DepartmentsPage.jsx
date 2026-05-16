import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Building2, UserCheck, AlertTriangle, Users, ChevronDown, X, AlertCircle } from "lucide-react";

const summaryStats = [
  { label: "TOTAL DEPARTMENTS", value: "12", sub: "Institution-wide",  accent: "text-indigo-600",  icon: Building2,     iconBg: "bg-indigo-50" },
  { label: "ACTIVE HODs",      value: "10", sub: "Assigned heads",    accent: "text-emerald-600", icon: UserCheck,     iconBg: "bg-emerald-50" },
  { label: "UNASSIGNED HODs",  value: "2",  sub: "Needs assignment",  accent: "text-amber-600",   icon: AlertTriangle, iconBg: "bg-amber-50" },
  { label: "TOTAL FACULTY",    value: "156", sub: "Across all depts", accent: "text-blue-600",    icon: Users,         iconBg: "bg-blue-50" },
];

const departments = [
  { id: 1, name: "Mathematics",      hod: "Mr. Adams",    teachers: 24, workload: 78 },
  { id: 2, name: "Science",          hod: "Dr. Peterson", teachers: 18, workload: 92 },
  { id: 3, name: "English",          hod: null,           teachers: 12, workload: 65 },
  { id: 4, name: "History",          hod: "Ms. Brown",    teachers: 15, workload: 70 },
  { id: 5, name: "Physical Ed.",     hod: "Mr. Adams",    teachers: 24, workload: 55 },
  { id: 6, name: "Computer Science", hod: "Prof. Kumar",  teachers: 10, workload: 88 },
  { id: 7, name: "Physics",          hod: "Dr. Lee",      teachers: 14, workload: 74 },
  { id: 8, name: "Arts",             hod: null,           teachers: 8,  workload: 45 },
];

function workloadColor(pct) {
  if (pct > 90) return "bg-red-500";
  if (pct > 85) return "bg-amber-500";
  if (pct >= 70) return "bg-indigo-500";
  return "bg-emerald-500";
}
function workloadTextColor(pct) {
  if (pct > 90) return "text-red-600";
  if (pct > 85) return "text-amber-600";
  if (pct >= 70) return "text-indigo-600";
  return "text-emerald-600";
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };
const modalOverlay = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalContent = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

export default function DepartmentsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hodModalOpen, setHodModalOpen] = useState(false);
  const [hodModalRow, setHodModalRow] = useState(null);

  const openHodModal = (dept) => { setHodModalRow(dept); setHodModalOpen(true); };

  return (
    <>
      <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">

        {/* HEADER */}
        <motion.div variants={itemV} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Department Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage institutional departments and assign department heads.</p>
          </div>
          <button onClick={() => setAddModalOpen(true)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            <Plus size={15} /> Add Department
          </button>
        </motion.div>

        {/* 4 STAT CARDS */}
        <motion.div variants={itemV} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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

        {/* SEARCH */}
        <motion.div variants={itemV}>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search departments..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </motion.div>

        {/* DEPARTMENTS TABLE */}
        <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["DEPARTMENT", "HOD", "TEACHER COUNT", "WORKLOAD", "ACTIONS"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-gray-900">{d.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px]">
                      {d.hod ? (
                        <span className="font-medium text-gray-700">{d.hod}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                          <AlertTriangle size={12} /> (Unassigned)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{d.teachers}</td>
                    <td className="px-5 py-3.5" style={{ minWidth: 160 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className={`h-full rounded-full ${workloadColor(d.workload)}`} style={{ width: `${d.workload}%` }} />
                        </div>
                        <span className={`text-[12px] font-bold ${workloadTextColor(d.workload)}`}>{d.workload}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button className="text-[12px] font-semibold text-indigo-600 transition hover:text-indigo-800">Edit</button>
                        <button onClick={() => openHodModal(d)} className="text-[12px] font-semibold text-gray-500 transition hover:text-gray-700">Assign HOD</button>
                        <button className="text-[12px] font-semibold text-gray-500 transition hover:text-gray-700">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ADD DEPARTMENT MODAL */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            onClick={() => setAddModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
              onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add Department</h2>
                <button onClick={() => setAddModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Department Name</label>
                  <input type="text" placeholder="e.g. Mathematics"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Department Code</label>
                  <input type="text" placeholder="e.g. MATH"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Assign HOD (Optional)</label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option value="">Select a teacher...</option>
                      <option>Mr. Adams</option><option>Dr. Peterson</option><option>Ms. Brown</option><option>Prof. Kumar</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</label>
                  <textarea rows={3} placeholder="Brief description of the department..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button onClick={() => setAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">Cancel</button>
                <button onClick={() => setAddModalOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">Save Department</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASSIGN HOD MODAL */}
      <AnimatePresence>
        {hodModalOpen && (
          <motion.div variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            onClick={() => setHodModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
              onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Assign HOD</h2>
                <button onClick={() => setHodModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="mb-4 text-sm text-gray-500">
                Current HOD: <span className="font-semibold text-gray-700">{hodModalRow?.hod || "None"}</span>
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Select New HOD</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Choose a teacher...</option>
                    <option>Mr. Adams</option><option>Dr. Peterson</option><option>Ms. Brown</option>
                    <option>Prof. Kumar</option><option>Dr. Lee</option><option>Mr. Davis</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-amber-50 px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-amber-800">
                  The selected teacher will be granted HOD permissions. Previous HOD will be demoted to regular teacher role.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <button onClick={() => setHodModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">Cancel</button>
                <button onClick={() => setHodModalOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">Assign as HOD</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
