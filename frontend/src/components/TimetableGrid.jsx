import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import BlockedSlotsPanel from "./BlockedSlotsPanel";
// ─── Data ────────────────────────────────────────────────────────────────────
const PERIODS = [
  { label: 'Period 1', time: '08:00–09:00' },
  { label: 'Period 2', time: '09:00–10:00' },
  { label: 'Period 3', time: '10:00–11:00' },
  { label: 'Break', time: '11:00–11:30' },
  { label: 'Period 4', time: '11:30–12:30' },
  { label: 'Period 5', time: '12:30–13:30' },
  { label: 'Period 6', time: '13:30–14:30' },
];

const TEACHERS = [
  {
    id: 'SA',
    name: 'Dr. Sarah Adams',
    color: 'bg-rose-100 text-rose-700',
    slots: [
      { type: 'regular', subject: 'BIO-101', room: 'Room 402' },
      { type: 'regular', subject: 'BIO-101', room: 'Room 402' },
      { type: 'free', label: 'PREPARATION' },
      { type: 'break' },
      { type: 'relief', subject: 'CHEM-202', room: 'Rm 102', badge: true },
      { type: 'free', label: 'FREE' },
      { type: 'regular', subject: 'BIO-101', room: 'Room 304' },
    ],
  },
  {
    id: 'JM',
    name: 'Prof. John Miller',
    color: 'bg-blue-100 text-blue-700',
    slots: [
      { type: 'conflict', subject: 'CONFLICT', room: '' },
      { type: 'regular', subject: 'PHY-301', room: 'Physics Lab' },
      { type: 'regular', subject: 'PHY-301', room: 'Physics Lab' },
      { type: 'break' },
      { type: 'free', label: 'FREE' },
      { type: 'regular', subject: 'PHY-102', room: 'Room 303' },
      { type: 'regular', subject: 'LAB-01', room: 'Unassigned' },
    ],
  },
  {
    id: 'EL',
    name: 'Emily Lawson',
    color: 'bg-teal-100 text-teal-700',
    slots: [
      { type: 'free', label: 'FREE' },
      { type: 'regular', subject: 'CHEM-101', room: 'Chemistry B' },
      { type: 'regular', subject: 'CHEM-101', room: 'Chemistry B' },
      { type: 'break' },
      { type: 'regular', subject: 'SCI-GENERAL', room: 'Room 101' },
      { type: 'regular', subject: 'SCI-GENERAL', room: 'Room 101' },
      { type: 'regular', subject: 'BIO-RE', room: 'Room 403' },
    ],
  },
];

const METRICS = [
  { value: '42', label: 'Total Slots', icon: Clock, color: 'text-blue-600', iconBg: 'bg-blue-50' },
  { value: '12', label: 'Free Slots', sub: '28%', icon: RefreshCw, color: 'text-green-600', iconBg: 'bg-green-50' },
  { value: '04', label: 'Active Reliefs', icon: AlertTriangle, color: 'text-amber-600', iconBg: 'bg-amber-50' },
  { value: '01', label: 'Conflicts', icon: AlertTriangle, color: 'text-red-600', iconBg: 'bg-red-50' },
];

// ─── Cell renderer ────────────────────────────────────────────────────────────
const TimetableCell = ({ slot }) => {
  if (!slot) return <div className="h-full bg-gray-50 rounded-lg border border-dashed border-gray-200" />;

  if (slot.type === 'break') {
    return (
      <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Break</span>
      </div>
    );
  }

  if (slot.type === 'free') {
    return (
      <div className="h-full bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
        <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide">
          {slot.label || 'FREE'}
        </span>
      </div>
    );
  }

  if (slot.type === 'conflict') {
    return (
      <div className="h-full bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center gap-0.5 p-1">
        <AlertTriangle size={10} className="text-red-500" />
        <span className="text-[8px] font-bold text-red-500 uppercase">CONFLICT</span>
      </div>
    );
  }

  if (slot.type === 'relief') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="h-full bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-0.5">
          <span className="text-[9px] font-bold text-amber-800 leading-tight">{slot.subject}</span>
          {slot.badge && (
            <span className="text-[7px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded font-bold leading-none flex-shrink-0">
              R
            </span>
          )}
        </div>
        <span className="text-[8px] text-amber-600">{slot.room}</span>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
      </motion.div>
    );
  }

  // Regular
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="h-full bg-blue-50 border border-blue-100 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden"
    >
      <span className="text-[9px] font-bold text-blue-800 leading-tight">{slot.subject}</span>
      <span className="text-[8px] text-blue-500">{slot.room}</span>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const TimetableGrid = ({ timetable: externalTimetable }) => {
  const [activeDate] = useState('23 Oct, 2023');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [statusFilter, setStatusFilter] = useState('All Staff');

  return (
    <div className="space-y-4 max-w-full">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Department Timetable</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Science Department • Monday, Oct 23 2023</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            Day View
          </button>
          <button className="px-3 py-1.5 text-[11px] font-semibold border border-blue-200 bg-blue-50 rounded-lg text-blue-700">
            Week View
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            <Download size={11} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <SlidersHorizontal size={11} /> Advanced
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
        {/* Active Date */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Active Date</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-gray-50 cursor-pointer">
            <Calendar size={11} className="text-gray-400" />
            {activeDate}
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        {/* Subject Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Subject Filter</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-white cursor-pointer min-w-[120px]">
            {subjectFilter}
            <ChevronDown size={10} className="ml-auto text-gray-400" />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        {/* Teacher Status */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Teacher Status</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-white cursor-pointer min-w-[100px]">
            {statusFilter}
            <ChevronDown size={10} className="ml-auto text-gray-400" />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        {/* Quick search */}
        <div className="flex flex-col flex-1 min-w-[140px]">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Quick Search</span>
          <input
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-300 w-full"
            placeholder="Search teacher name..."
          />
        </div>
      </div>

      {/* Timetable grid */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 820 }}>

            {/* Period header row */}
            <div
              className="grid border-b border-gray-100 bg-gray-50"
              style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
            >
              <div className="px-4 py-2.5 flex items-center">
                <span className="text-[10px] font-semibold text-gray-500">Teacher Name</span>
              </div>
              {PERIODS.map((p, i) => (
                <div
                  key={i}
                  className={`px-2 py-2 text-center border-l border-gray-100 ${
                    p.label === 'Break' ? 'bg-gray-100' : ''
                  }`}
                >
                  <p className="text-[10px] font-bold text-gray-700">{p.label}</p>
                  <p className="text-[9px] text-gray-400">{p.time}</p>
                </div>
              ))}
            </div>

            {/* Teacher rows */}
            {TEACHERS.map((teacher, ti) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ti * 0.06 }}
                className="grid border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                style={{ gridTemplateColumns: '160px repeat(7, 1fr)', minHeight: 60 }}
              >
                {/* Teacher name cell */}
                <div className="px-3 py-2 flex items-center gap-2 border-r border-gray-100">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${teacher.color}`}
                  >
                    {teacher.id}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 leading-tight">
                    {teacher.name}
                  </span>
                </div>

                {/* Period cells */}
                {teacher.slots.map((slot, si) => (
                  <div
                    key={si}
                    className={`p-1.5 border-l border-gray-50 ${
                      PERIODS[si]?.label === 'Break' ? 'bg-gray-50' : ''
                    }`}
                  >
                    <TimetableCell slot={slot} />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Legend */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Color Legend</p>
          <div className="space-y-2">
            {[
              { color: 'bg-blue-400', label: 'Standard Session' },
              { color: 'bg-amber-400', label: 'Relief Duty' },
              { color: 'bg-green-400', label: 'Free / Planning' },
              { color: 'bg-red-400', label: 'Conflict / Action Required' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                <span className="text-[10px] text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        {METRICS.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${m.iconBg}`}>
              <m.icon size={14} className={m.color} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-[22px] font-bold ${m.color}`}>{m.value}</span>
                {m.sub && (
                  <span className="text-[10px] text-gray-400 font-medium">{m.sub}</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
       {/* Blocked Slots Panel */}
      <BlockedSlotsPanel />
    </div>
  );
};

export default TimetableGrid;

