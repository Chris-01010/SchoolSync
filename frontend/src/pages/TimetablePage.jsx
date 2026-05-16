import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, Clock, AlertCircle, Info, RefreshCw } from "lucide-react";

const viewTabs = ["Dept-Wise", "Teacher-Wise", "Room-Wise", "Class-Wise"];

const days = [
  { label: "MONDAY",    date: "21 Oct" },
  { label: "TUESDAY",   date: "22 Oct" },
  { label: "WEDNESDAY", date: "23 Oct" },
  { label: "THURSDAY",  date: "24 Oct" },
  { label: "FRIDAY",    date: "25 Oct" },
];

const timeSlots = ["08:00", "09:00", "10:00", "11:00"];

const timetableData = {
  "08:00-0": { type: "standard",  code: "10A", subject: "MATH",     teacher: "Johnson" },
  "08:00-1": { type: "free" },
  "08:00-2": { type: "relief",    code: "09C", subject: "ALGEBRA",  teacher: "Smith",   note: "Relieving" },
  "08:00-3": { type: "conflict",  code: "11B", subject: "CALC",     teacher: "Roberts", conflict: "Room Conflict: Lab 2" },
  "08:00-4": { type: "standard",  code: "08A", subject: "GEOM",     teacher: "Davis" },
  "10:00-0": { type: "relief",    code: "10B", subject: "MATH",     teacher: "Parker",  note: "Relief" },
  "10:00-1": { type: "standard",  code: "12C", subject: "ADVANCED", teacher: "Johnson" },
  "10:00-2": { type: "standard",  code: "09A", subject: "MATH",     teacher: "Davis" },
  "10:00-3": { type: "free" },
  "10:00-4": { type: "standard",  code: "10A", subject: "MATH",     teacher: "Roberts" },
  "11:00-0": { type: "freeperiod" },
  "11:00-1": { type: "standard",  code: "11B", subject: "TRIG",     teacher: "Smith" },
  "11:00-2": { type: "standard",  code: "10C", subject: "MATH",     teacher: "Parker" },
  "11:00-3": { type: "conflict",  code: "08B", subject: "MATH",     teacher: "Unassigned", conflict: "Unassigned" },
  "11:00-4": { type: "standard",  code: "12A", subject: "STATS",    teacher: "Johnson" },
};

function TimetableCell({ data }) {
  if (!data || data.type === "free") {
    return (
      <div className="flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
        <span className="text-xs italic text-gray-400">Available</span>
      </div>
    );
  }
  if (data.type === "freeperiod") {
    return (
      <div className="flex h-full min-h-[72px] items-center justify-center rounded-lg bg-white">
        <span className="text-xs italic text-gray-400">Free Period</span>
      </div>
    );
  }
  const isRelief = data.type === "relief";
  const isConflict = data.type === "conflict";
  const bgClass = isRelief ? "bg-violet-50" : "bg-white";
  const borderClass = isConflict ? "border-l-red-500" : isRelief ? "border-l-purple-500" : "border-l-indigo-500";

  return (
    <div className={`relative flex min-h-[72px] flex-col justify-center rounded-lg border border-gray-100 ${bgClass} border-l-[3px] ${borderClass} px-3 py-2.5`}>
      {isRelief && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-purple-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-purple-700">Relief</span>
      )}
      {isConflict && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
      )}
      <p className={`text-[12px] font-bold leading-tight ${isConflict ? "text-red-700" : isRelief ? "text-purple-700" : "text-indigo-700"}`}>
        {data.code} - {data.subject}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">
        {data.teacher}
        {data.note && <span className="ml-1 text-purple-500">({data.note})</span>}
      </p>
      {isConflict && data.conflict && (
        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-red-500">
          <AlertCircle size={10} /> {data.conflict}
        </p>
      )}
    </div>
  );
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState("Dept-Wise");
  const [editMode, setEditMode] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      <motion.h1 variants={itemVariants} className="text-[28px] font-bold tracking-tight text-gray-900">
        Timetable Management
      </motion.h1>

      {/* VIEW TABS */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {viewTabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${
                active ? "bg-indigo-600 text-white shadow-sm" : "border border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              }`}>
              {tab}
            </button>
          );
        })}
      </motion.div>

      {/* CONTROLS ROW */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Select Department</label>
            <div className="relative">
              <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-800 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Viewing Week</label>
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
              <CalendarDays size={14} className="text-gray-400" />
              Oct 21 - Oct 25, 2024
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          <Info size={13} />
          Department: Mathematics / 14 Faculty Members
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <label className="text-xs font-medium text-gray-500">Edit Mode</label>
          <button onClick={() => setEditMode((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${editMode ? "bg-indigo-600" : "bg-gray-300"}`}>
            <motion.span animate={{ x: editMode ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block rounded-full bg-white shadow-sm" style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </motion.div>

      {/* TIMETABLE GRID */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="w-20 whitespace-nowrap px-4 py-3 text-center">
                  <Clock size={16} className="mx-auto text-gray-400" />
                </th>
                {days.map((d) => (
                  <th key={d.label} className="whitespace-nowrap px-3 py-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700">{d.label}</p>
                    <p className="text-[11px] font-medium text-gray-400">{d.date}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => {
                if (slot === "09:00") {
                  return (
                    <tr key={slot} className="border-b border-gray-100">
                      <td className="whitespace-nowrap px-4 py-2 text-center text-xs font-bold text-gray-500">{slot}</td>
                      <td colSpan={5} className="bg-gray-100/70 px-4 py-3 text-center text-xs italic text-gray-400">Tea Break</td>
                    </tr>
                  );
                }
                return (
                  <tr key={slot} className="border-b border-gray-100">
                    <td className="whitespace-nowrap px-4 py-2 text-center text-xs font-bold text-gray-500">{slot}</td>
                    {days.map((_, di) => {
                      const cellKey = `${slot}-${di}`;
                      const data = timetableData[cellKey];
                      return (<td key={cellKey} className="px-2 py-2"><TimetableCell data={data} /></td>);
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* LEGEND */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] bg-indigo-500" /> Standard Schedule</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] bg-purple-500" /> Relief Assigned</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Conflict / Action Required</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 bg-white" /> Free / Unassigned</div>
      </motion.div>

      {/* FLOATING UNSAVED CHANGES BAR */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-6 rounded-2xl bg-gray-900 px-6 py-3.5 shadow-2xl">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-indigo-400" />
                <div>
                  <p className="text-sm font-bold text-white">Unsaved changes detected</p>
                  <p className="text-[11px] text-gray-400">3 modifications pending publishing to the institution portal.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="rounded-lg border border-gray-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800">Discard</button>
                <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">Publish</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
