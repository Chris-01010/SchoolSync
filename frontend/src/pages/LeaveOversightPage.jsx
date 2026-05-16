import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Plus,
  Search,
  ChevronDown,
  CalendarDays,
  Eye,
  MessageSquare,
  XCircle,
  CheckCircle,
} from "lucide-react";

/* ===================================================================
   Tabs
   =================================================================== */

const tabs = [
  { id: "pending",       label: "Pending",       count: 8 },
  { id: "clarification", label: "Clarification", count: 3 },
  { id: "history",       label: "History",        count: null },
  { id: "onleave",       label: "On Leave",       count: null },
];

/* ===================================================================
   Leave request cards data
   =================================================================== */

const leaveRequests = [
  {
    initials: "SJ",
    name: "Sarah Johnson",
    dept: "Math",
    leaveType: "Sick Leave",
    dates: "Jan 20 - Jan 22, 2024",
    status: "Pending",
    since: "since Jan 18",
  },
  {
    initials: "EC",
    name: "Emily Chen",
    dept: "Science",
    leaveType: "Casual Leave",
    dates: "Jan 25, 2024",
    status: "Pending",
    since: null,
  },
];

/* ===================================================================
   Currently on leave data
   =================================================================== */

const onLeaveTeachers = [
  { initials: "JO", name: "Johnson", dept: "Math" },
  { initials: "PA", name: "Patel",   dept: "Science" },
  { initials: "GO", name: "Gomez",   dept: "English" },
  { initials: "SM", name: "Smith",   dept: "History" },
  { initials: "LE", name: "Lee",     dept: "Music" },
];

/* ===================================================================
   Animation variants
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
   LeaveOversightPage
   =================================================================== */

export default function LeaveOversightPage() {
  const [activeTab, setActiveTab] = useState("pending");

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
            Leave Oversight (All Departments)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and audit staff leave requests across the institution.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Download size={15} />
            Export Log
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            <Plus size={15} />
            New Request
          </button>
        </div>
      </motion.div>

      {/* ======= TABS (underline style) ======= */}
      <motion.div
        variants={itemVariants}
        className="flex gap-0 border-b border-gray-200"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-5 pb-3 pt-1 text-[13px] font-semibold transition-colors ${
                active ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    active
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* active underline */}
              {active && (
                <motion.span
                  layoutId="leave-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-600"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ======= FILTER ROW ======= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-3"
      >
        {/* teacher search */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-56 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* department dropdown */}
        <div className="relative">
          <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>All Departments</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>History</option>
            <option>Music</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* date range */}
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <CalendarDays size={14} className="text-gray-400" />
          Jan 01 - Jan 31, 2024
        </div>
      </motion.div>

      {/* ======= LEAVE REQUEST CARDS (2-col grid) ======= */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        {leaveRequests.map((req, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            {/* top row: avatar + name + dept + status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* avatar */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                  {req.initials}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {req.name}
                  </p>
                  <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                    Dept: {req.dept}
                  </span>
                </div>
              </div>

              {/* status badge */}
              <span className="flex-shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                Status: {req.status}
                {req.since && (
                  <span className="ml-1 text-amber-500">({req.since})</span>
                )}
              </span>
            </div>

            {/* divider */}
            <div className="my-4 h-px bg-gray-100" />

            {/* info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Leave Type
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {req.leaveType}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Dates
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {req.dates}
                </p>
              </div>
            </div>

            {/* action buttons */}
            <div className="mt-5 flex items-center gap-2.5">
              <button className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-500 transition hover:text-indigo-600">
                <Eye size={13} />
                View Details
              </button>

              <div className="flex-1" />

              <button className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
                <MessageSquare size={13} />
                Clarify
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50">
                <XCircle size={13} />
                Reject
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                <CheckCircle size={13} />
                Approve
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ======= TEACHERS CURRENTLY ON LEAVE ======= */}
      <motion.section variants={itemVariants} className="space-y-4">
        {/* header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Teachers Currently on Leave
          </h2>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200">
            Live Data Hub
          </span>
        </div>

        {/* 5 teacher cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {onLeaveTeachers.map((t) => (
            <motion.div
              key={t.name}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="relative flex flex-col items-center overflow-hidden rounded-xl border border-gray-100 bg-white py-6 shadow-sm"
            >
              {/* avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">
                {t.initials}
              </div>
              {/* name */}
              <p className="mt-3 text-sm font-bold text-gray-900">{t.name}</p>
              {/* dept */}
              <p className="mt-0.5 text-xs text-gray-400">{t.dept}</p>
              {/* indigo bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
