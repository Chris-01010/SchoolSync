import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, SlidersHorizontal,
  Calendar, AlertTriangle, RefreshCw, Clock,
} from 'lucide-react';

const PERIODS = [
  { label: 'Period 1', time: '08:00–09:00' },
  { label: 'Period 2', time: '09:00–10:00' },
  { label: 'Period 3', time: '10:00–11:00' },
  { label: 'Break',    time: '11:00–11:30' },
  { label: 'Period 4', time: '11:30–12:30' },
  { label: 'Period 5', time: '12:30–13:30' },
  { label: 'Period 6', time: '13:30–14:30' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const TEACHERS = [
  {
    id: 'SA', name: 'Dr. Sarah Adams', color: 'bg-rose-100 text-rose-700',
    slots: [
      { type: 'regular', subject: 'BIO-101', room: 'Room 402' },
      { type: 'regular', subject: 'BIO-101', room: 'Room 402' },
      { type: 'free',    label: 'PREPARATION' },
      { type: 'break' },
      { type: 'relief',  subject: 'CHEM-202', room: 'Rm 102', badge: true },
      { type: 'free',    label: 'FREE' },
      { type: 'regular', subject: 'BIO-101', room: 'Room 304' },
    ],
  },
  {
    id: 'JM', name: 'Prof. John Miller', color: 'bg-blue-100 text-blue-700',
    slots: [
      { type: 'conflict', subject: 'CONFLICT', room: '' },
      { type: 'regular',  subject: 'PHY-301',  room: 'Physics Lab' },
      { type: 'regular',  subject: 'PHY-301',  room: 'Physics Lab' },
      { type: 'break' },
      { type: 'free',    label: 'FREE' },
      { type: 'regular', subject: 'PHY-102', room: 'Room 303' },
      { type: 'regular', subject: 'LAB-01',  room: 'Unassigned' },
    ],
  },
  {
    id: 'EL', name: 'Emily Lawson', color: 'bg-teal-100 text-teal-700',
    slots: [
      { type: 'free',    label: 'FREE' },
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
  { value: '42', label: 'Total Slots',    icon: Clock,         color: 'text-blue-600',  iconBg: 'bg-blue-50' },
  { value: '12', label: 'Free Slots', sub: '28%', icon: RefreshCw, color: 'text-green-600', iconBg: 'bg-green-50' },
  { value: '04', label: 'Active Reliefs', icon: AlertTriangle, color: 'text-amber-600', iconBg: 'bg-amber-50' },
  { value: '01', label: 'Conflicts',      icon: AlertTriangle, color: 'text-red-600',   iconBg: 'bg-red-50' },
];

const TYPE_DOT = {
  regular: 'bg-blue-400', relief: 'bg-amber-400',
  conflict: 'bg-red-400', free: 'bg-green-400', break: 'bg-gray-300',
};

const TimetableCell = ({ slot }) => {
  if (!slot) return <div className="h-full bg-gray-50 rounded-lg border border-dashed border-gray-200" />;
  if (slot.type === 'break') return (
    <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Break</span>
    </div>
  );
  if (slot.type === 'free') return (
    <div className="h-full bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
      <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide">{slot.label || 'FREE'}</span>
    </div>
  );
  if (slot.type === 'conflict') return (
    <div className="h-full bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center gap-0.5 p-1">
      <AlertTriangle size={10} className="text-red-500" />
      <span className="text-[8px] font-bold text-red-500 uppercase">CONFLICT</span>
    </div>
  );
  if (slot.type === 'relief') return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="h-full bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between gap-0.5">
        <span className="text-[9px] font-bold text-amber-800 leading-tight">{slot.subject}</span>
        {slot.badge && <span className="text-[7px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded font-bold leading-none flex-shrink-0">R</span>}
      </div>
      <span className="text-[8px] text-amber-600">{slot.room}</span>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
    </motion.div>
  );
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="h-full bg-blue-50 border border-blue-100 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden">
      <span className="text-[9px] font-bold text-blue-800 leading-tight">{slot.subject}</span>
      <span className="text-[8px] text-blue-500">{slot.room}</span>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
    </motion.div>
  );
};

const WeekViewGrid = ({ teachers = TEACHERS }) => {
  const todayCol = new Date().getDay() - 1;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 520 }}>
          <div className="grid border-b border-gray-100 bg-gray-50"
            style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
            <div className="px-3 py-2.5">
              <span className="text-[10px] font-semibold text-gray-500">Period</span>
            </div>
            {DAYS.map((d, i) => (
              <div key={d} className={`px-2 py-2.5 text-center border-l border-gray-100 ${i === todayCol ? 'bg-blue-50' : ''}`}>
                <p className={`text-[11px] font-bold ${i === todayCol ? 'text-blue-700' : 'text-gray-700'}`}>{d}</p>
              </div>
            ))}
          </div>
          {PERIODS.map((period, pi) => {
            if (period.label === 'Break') return (
              <div key="break" className="grid border-b border-gray-100 bg-gray-50"
                style={{ gridTemplateColumns: '80px 1fr' }}>
                <div className="px-3 py-1.5 border-r border-gray-100">
                  <span className="text-[9px] text-gray-400 font-medium">11:00</span>
                </div>
                <div className="flex items-center justify-center py-1.5">
                  <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">☕ Break</span>
                </div>
              </div>
            );
            return (
              <div key={pi} className="grid border-b border-gray-100 last:border-0"
                style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                <div className="px-3 py-2 border-r border-gray-100 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-700">{period.label}</p>
                  <p className="text-[9px] text-gray-400">{period.time}</p>
                </div>
                {DAYS.map((_, di) => {
                  const teacher = teachers[di % Math.max(teachers.length, 1)];
                  const slot = teacher ? teacher.slots[pi] || { type: 'free' } : { type: 'free' };
                  const dot = TYPE_DOT[slot.type] || 'bg-gray-300';
                  return (
                    <div key={di} className={`p-2 border-l border-gray-100 flex flex-col gap-1 ${di === todayCol ? 'bg-blue-50/40' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                        <span className="text-[9px] font-semibold text-gray-700 truncate">
                          {slot.type === 'free' ? 'Free' : slot.type === 'break' ? '—' : slot.subject}
                        </span>
                      </div>
                      {slot.room && <span className="text-[8px] text-gray-400 truncate pl-3.5">{slot.room}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TimetableGrid = ({ timetable: externalTimetable }) => {
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [statusFilter, setStatusFilter] = useState('All Staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('day');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportToast, setExportToast] = useState(false);

  const allSubjects = ['All Subjects', ...new Set(
    TEACHERS.flatMap(t => t.slots.map(s => s.subject).filter(Boolean))
  )];
  const allStatuses = ['All Staff', 'Has Conflict', 'Has Relief', 'Has Free'];

  const filteredTeachers = TEACHERS.filter(teacher => {
    if (searchQuery && !teacher.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === 'Has Conflict' && !teacher.slots.some(s => s.type === 'conflict')) return false;
    if (statusFilter === 'Has Relief'   && !teacher.slots.some(s => s.type === 'relief'))   return false;
    if (statusFilter === 'Has Free'     && !teacher.slots.some(s => s.type === 'free'))     return false;
    if (subjectFilter !== 'All Subjects' && !teacher.slots.some(s => s.subject === subjectFilter)) return false;
    return true;
  });

  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
    window.print();
  };

  const displayDate = new Date(activeDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Department Timetable</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">CS Department • {displayDate}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-[11px] font-medium border rounded-lg ${viewMode === 'day' ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}>
            Day View
          </button>
          <button onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-[11px] font-medium border rounded-lg ${viewMode === 'week' ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}>
            Week View
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            <Download size={11} /> Export
          </button>
          <button onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg ${showAdvanced ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            <SlidersHorizontal size={11} /> Advanced
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Active Date</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50">
            <Calendar size={11} className="text-gray-400" />
            <input type="date" value={activeDate} onChange={e => setActiveDate(e.target.value)}
              className="text-[11px] text-gray-700 bg-transparent outline-none cursor-pointer" />
          </div>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Subject Filter</span>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-white cursor-pointer min-w-[130px] focus:outline-none focus:border-blue-300">
            {allSubjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Teacher Status</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-white cursor-pointer min-w-[110px] focus:outline-none focus:border-blue-300">
            {allStatuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div className="flex flex-col flex-1 min-w-[140px]">
          <span className="text-[9px] font-semibold text-gray-400 uppercase mb-1">Quick Search</span>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teacher name..."
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-300 w-full" />
        </div>
        {(subjectFilter !== 'All Subjects' || statusFilter !== 'All Staff' || searchQuery) && (
          <button onClick={() => { setSubjectFilter('All Subjects'); setStatusFilter('All Staff'); setSearchQuery(''); }}
            className="px-2.5 py-1.5 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 mt-4">
            Clear
          </button>
        )}
      </div>

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Show Only</span>
            <div className="flex gap-2">
              {['All', 'Conflicts', 'Relief', 'Free Slots'].map(f => (
                <button key={f} className="px-2.5 py-1 text-[10px] font-semibold rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-100">{f}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Sort By</span>
            <div className="flex gap-2">
              {['Teacher Name', 'Most Conflicts', 'Most Free'].map(f => (
                <button key={f} className="px-2.5 py-1 text-[10px] font-semibold rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-100">{f}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {viewMode === 'week' ? <WeekViewGrid teachers={filteredTeachers} /> : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 820 }}>
              <div className="grid border-b border-gray-100 bg-gray-50"
                style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}>
                <div className="px-4 py-2.5 flex items-center">
                  <span className="text-[10px] font-semibold text-gray-500">Teacher Name</span>
                </div>
                {PERIODS.map((p, i) => (
                  <div key={i} className={`px-2 py-2 text-center border-l border-gray-100 ${p.label === 'Break' ? 'bg-gray-100' : ''}`}>
                    <p className="text-[10px] font-bold text-gray-700">{p.label}</p>
                    <p className="text-[9px] text-gray-400">{p.time}</p>
                  </div>
                ))}
              </div>
              {filteredTeachers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-[12px] text-gray-400">No teachers match the current filters.</p>
                </div>
              ) : filteredTeachers.map((teacher, ti) => (
                <motion.div key={teacher.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ti * 0.06 }}
                  className="grid border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  style={{ gridTemplateColumns: '160px repeat(7, 1fr)', minHeight: 60 }}>
                  <div className="px-3 py-2 flex items-center gap-2 border-r border-gray-100">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${teacher.color}`}>
                      {teacher.id}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700 leading-tight">{teacher.name}</span>
                  </div>
                  {teacher.slots.map((slot, si) => (
                    <div key={si} className={`p-1.5 border-l border-gray-50 ${PERIODS[si]?.label === 'Break' ? 'bg-gray-50' : ''}`}>
                      <TimetableCell slot={slot} />
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Color Legend</p>
          <div className="space-y-2">
            {[
              { color: 'bg-blue-400',  label: 'Standard Session' },
              { color: 'bg-amber-400', label: 'Relief Duty' },
              { color: 'bg-green-400', label: 'Free / Planning' },
              { color: 'bg-red-400',   label: 'Conflict / Action Required' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                <span className="text-[10px] text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
        {METRICS.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${m.iconBg}`}>
              <m.icon size={14} className={m.color} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-[22px] font-bold ${m.color}`}>{m.value}</span>
                {m.sub && <span className="text-[10px] text-gray-400 font-medium">{m.sub}</span>}
              </div>
              <p className="text-[10px] text-gray-400">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-[12px] font-semibold flex items-center gap-2">
          <span className="text-green-400">✓</span> Timetable exported successfully
        </div>
      )}
    </div>
  );
};

export default TimetableGrid;