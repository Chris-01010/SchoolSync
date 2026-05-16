import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  TrendingUp,
  ChevronDown,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  Clock,
} from "lucide-react";

/* ===================================================================
   Stat cards data
   =================================================================== */

const stats = [
  {
    label: "TOTAL USERS",
    value: "156",
    valueColor: "text-gray-900",
    sub: "+12 this month",
    subColor: "text-emerald-600",
    subIcon: TrendingUp,
  },
  {
    label: "ACTIVE",
    value: "148",
    valueColor: "text-indigo-600",
    sub: "Currently logged in",
    subColor: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    label: "HODs",
    value: "8",
    valueColor: "text-indigo-600",
    sub: "Privileged Access",
    subColor: "text-gray-400",
    subIcon: Shield,
  },
  {
    label: "DISABLED",
    value: "8",
    valueColor: "text-red-600",
    sub: "Access suspended",
    subColor: "text-gray-400",
    subIcon: Clock,
  },
];

/* ===================================================================
   Users table data
   =================================================================== */

const users = [
  {
    initials: "SJ",
    avatarBg: "bg-indigo-600",
    name: "Sarah J.",
    email: "sarah.j@institution.edu",
    role: "TEACHER",
    rolePill: "bg-indigo-100 text-indigo-700",
    dept: "Math",
    status: "Active",
    statusPill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    statusDot: "bg-emerald-500",
    lastActive: "Today 9:30",
    disabled: false,
  },
  {
    initials: "MA",
    avatarBg: "bg-gray-500",
    name: "Mr. Adams",
    email: "adams.math@institution.edu",
    role: "HOD",
    rolePill: "bg-purple-100 text-purple-700",
    dept: "Math",
    status: "Active",
    statusPill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    statusDot: "bg-emerald-500",
    lastActive: "Today 8:45",
    disabled: false,
  },
  {
    initials: "JD",
    avatarBg: "bg-gray-300",
    name: "John Doe",
    email: "john.doe@institution.edu",
    role: "TEACHER",
    rolePill: null,
    dept: "Science",
    status: "Disabled",
    statusPill: "bg-red-50 text-red-700 ring-red-500/20",
    statusDot: "bg-red-500",
    lastActive: "Jan 10",
    disabled: true,
  },
];

/* ===================================================================
   Filter pill dropdowns config
   =================================================================== */

const filterDropdowns = [
  { label: "Role", options: ["All", "Teacher", "HOD", "Relief"] },
  { label: "Dept", options: ["All", "Math", "Science", "English", "History"] },
  { label: "Status", options: ["All", "Active", "Disabled", "Pending"] },
];

/* ===================================================================
   Animation
   =================================================================== */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};

/* ===================================================================
   UserManagementPage
   =================================================================== */

export default function UserManagementPage() {
  const [activePage, setActivePage] = useState(1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7"
    >
      {/* ======= HEADER ROW ======= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure institutional access and departmental hierarchies.
          </p>
        </div>
        <button className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
          <Plus size={15} />
          Add User
        </button>
      </motion.div>

      {/* ======= 4 STAT CARDS ======= */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s) => {
          const SubIcon = s.subIcon;
          return (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {s.label}
              </p>
              <p className={`mt-1 text-[34px] font-bold leading-none tracking-tight ${s.valueColor}`}>
                {s.value}
              </p>
              <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${s.subColor}`}>
                {s.dot && (
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
                )}
                {SubIcon && <SubIcon size={12} />}
                {s.sub}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ======= FILTER ROW ======= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        {/* left: pill dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {filterDropdowns.map((f) => (
            <div key={f.label} className="relative">
              <select className="appearance-none rounded-full border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 shadow-sm transition hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {f.label}: {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          ))}
        </div>

        {/* right: icon buttons */}
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700">
            <Download size={15} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </motion.div>

      {/* ======= USER TABLE ======= */}
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {["USER", "ROLE", "DEPT", "STATUS", "LAST ACTIVE", "ACTIONS"].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            {/* body */}
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50/60"
                >
                  {/* USER */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${u.avatarBg}`}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            u.disabled ? "text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {u.name}
                        </p>
                        <p
                          className={`text-[12px] ${
                            u.disabled ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {u.rolePill ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${u.rolePill}`}
                      >
                        {u.role}
                      </span>
                    ) : (
                      <span className="text-[12px] font-medium text-gray-400">
                        {u.role}
                      </span>
                    )}
                  </td>

                  {/* DEPT */}
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                    {u.dept}
                  </td>

                  {/* STATUS */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${u.statusPill}`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${u.statusDot}`}
                      />
                      {u.status}
                    </span>
                  </td>

                  {/* LAST ACTIVE */}
                  <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                    {u.lastActive}
                  </td>

                  {/* ACTIONS */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        className={`text-[12px] font-semibold transition ${
                          u.disabled
                            ? "text-gray-400 hover:text-gray-600"
                            : "text-indigo-600 hover:text-indigo-800"
                        }`}
                      >
                        Edit
                      </button>
                      <button className="text-[12px] font-semibold text-gray-400 transition hover:text-gray-600">
                        Reset
                      </button>
                      {u.disabled && (
                        <button className="text-[12px] font-semibold text-emerald-600 transition hover:text-emerald-800">
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* table footer / pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold">1</span> to{" "}
            <span className="font-semibold">10</span> of{" "}
            <span className="font-semibold">156</span> users
          </p>

          <div className="flex items-center gap-1">
            {/* prev */}
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              disabled={activePage === 1}
            >
              <ChevronLeft size={15} />
            </button>

            {/* page numbers */}
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                  activePage === p
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            {/* ellipsis */}
            <span className="flex h-7 w-7 items-center justify-center text-gray-400">
              <MoreHorizontal size={14} />
            </span>

            {/* last page */}
            <button
              onClick={() => setActivePage(12)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                activePage === 12
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              12
            </button>

            {/* next */}
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
