import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Clock, FileText, CheckCircle2,
  Repeat2, BookOpen, Star, Plus, ChevronRight,
  MapPin, Users, MoreHorizontal,
} from 'lucide-react';
import {
  teacher,
  teacherStats,
  todaySchedule,
  notifications,
  activeReliefDutiesToday,
} from '../../mockData';
import ApplyLeaveModal from '../../components/teacher/ApplyLeaveModal';

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconColor, iconBg, badge, badgeColor, value, label, sub, subColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md
               transition-shadow cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-2">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={15} className={iconColor} />
      </div>
      {badge && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    <p className="text-[26px] font-bold text-gray-900 leading-none mb-1">{value}</p>
    <p className="text-[11px] font-semibold text-gray-500">{label}</p>
    {sub && (
      <p className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${subColor ?? 'text-gray-400'}`}>
        {sub}
      </p>
    )}
  </motion.div>
);

// ─── Schedule row ─────────────────────────────────────────────────────────────
const ScheduleRow = ({ item }) => {
  const isCurrent = item.type === 'current';
  const isFree    = item.type === 'free';
  const isUpcoming = item.type === 'upcoming';

  return (
    <div
      className={`rounded-xl p-3.5 border transition-all ${
        isCurrent
          ? 'bg-white border-l-4 border-l-emerald-500 border-gray-100 shadow-sm'
          : isFree
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${
              isCurrent ? 'text-emerald-600' : isUpcoming ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {item.label}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {item.timeStart} – {item.timeEnd}
        </span>
      </div>

      <p className="text-[14px] font-bold text-gray-900">{item.subject}</p>

      {!isFree && item.room && (
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <MapPin size={10} /> {item.room}
          </span>
          {item.students && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Users size={10} /> {item.students} Students
            </span>
          )}
        </div>
      )}
      {isFree && item.note && (
        <p className="text-[10px] text-gray-400 mt-1">{item.note}</p>
      )}
    </div>
  );
};

// ─── Notification row ─────────────────────────────────────────────────────────
const NotifRow = ({ n }) => {
  const icons = {
    leave_approved: { el: <CheckCircle2 size={14} className="text-emerald-600" />, bg: 'bg-emerald-50' },
    relief_assigned: { el: <Repeat2 size={14} className="text-orange-500" />, bg: 'bg-orange-50' },
    announcement: { el: <Users size={14} className="text-blue-500" />, bg: 'bg-blue-50' },
  };
  const cfg = icons[n.type] ?? icons.announcement;
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        {cfg.el}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-800 leading-tight">{n.title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
      </div>
      <span className="text-[9px] text-gray-400 whitespace-nowrap mt-0.5">{n.time}</span>
    </div>
  );
};

// ─── Relief duty card ─────────────────────────────────────────────────────────
const ReliefCard = ({ duty }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
        {duty.forTeacher.split(' ').map((s) => s[0]).join('').slice(0, 2)}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-800 truncate">{duty.forTeacher}</p>
        {duty.department && (
          <p className="text-[9px] text-gray-400 truncate">{duty.department}</p>
        )}
      </div>
      <span className="ml-auto text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
        Period {duty.period}
      </span>
    </div>
    <p className="text-[11px] font-semibold text-gray-700">{duty.subject}</p>
    {duty.room && (
      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
        <MapPin size={9} /> {duty.room}
      </p>
    )}
    <div className="flex gap-2 mt-2.5">
      <button className="flex-1 py-1.5 bg-blue-600 text-white text-[10px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        View Lesson Plan
      </button>
      <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
        <MoreHorizontal size={12} />
      </button>
    </div>
    {duty.upcoming && (
      <p className="text-[9px] text-gray-400 text-center mt-1.5">Upcoming</p>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const STATS = [
  {
    icon: CalendarDays,
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    badge: 'Today', badgeColor: 'bg-blue-50 text-blue-600',
    value: teacherStats.totalClassesToday,
    label: 'Total Classes Today',
    sub: `✓ Completed: ${teacherStats.completedClassesToday}`,
    subColor: 'text-emerald-600',
    delay: 0,
  },
  {
    icon: Clock,
    iconBg: 'bg-green-50', iconColor: 'text-green-600',
    badge: 'Available', badgeColor: 'bg-green-50 text-green-600',
    value: teacherStats.freePeriodsToday,
    label: 'Free Periods Today',
    sub: 'Ready for relief duty',
    subColor: 'text-gray-400',
    delay: 0.05,
  },
  {
    icon: FileText,
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    badge: 'Pending', badgeColor: 'bg-amber-50 text-amber-600',
    value: teacherStats.pendingLeaveRequests,
    label: 'Leave Requests',
    sub: 'Awaiting approval',
    subColor: 'text-gray-400',
    delay: 0.1,
  },
  {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    badge: 'Monthly', badgeColor: 'bg-emerald-50 text-emerald-600',
    value: teacherStats.approvedLeaves,
    label: 'Approved Leaves',
    sub: 'This month',
    subColor: 'text-gray-400',
    delay: 0.15,
  },
  {
    icon: Repeat2,
    iconBg: 'bg-orange-50', iconColor: 'text-orange-600',
    badge: 'Upcoming', badgeColor: 'bg-orange-50 text-orange-600',
    value: teacherStats.reliefDutiesToday,
    label: 'Relief Duties',
    sub: 'Assigned for today',
    subColor: 'text-gray-400',
    delay: 0.2,
  },
  {
    icon: BookOpen,
    iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
    badge: 'Weekly', badgeColor: 'bg-purple-50 text-purple-600',
    value: teacherStats.totalTeachingHoursWeek,
    label: 'Total Teaching Hours',
    sub: '+1hr since yesterday',
    subColor: 'text-purple-500',
    delay: 0.25,
  },
  {
    icon: Star,
    iconBg: 'bg-teal-50', iconColor: 'text-teal-600',
    badge: 'Weekly', badgeColor: 'bg-teal-50 text-teal-600',
    value: teacherStats.totalReliefHoursWeek,
    label: 'Total Relief Hours',
    sub: '+1hr since yesterday',
    subColor: 'text-teal-500',
    delay: 0.3,
  },
];

export default function TeacherHome() {
  const ctx = useOutletContext();
  const [leaveOpen, setLeaveOpen] = useState(ctx?.leaveModalOpen ?? false);
  const navigate = useNavigate();

  // Sync with layout-level modal state
  React.useEffect(() => {
    if (ctx?.leaveModalOpen) setLeaveOpen(true);
  }, [ctx?.leaveModalOpen]);

  const handleCloseLeave = () => {
    setLeaveOpen(false);
    ctx?.setLeaveModalOpen?.(false);
  };

  return (
    <div className="space-y-5 max-w-[1280px]">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-[20px] font-bold text-blue-600 leading-tight">
            Welcome back, {teacher.name}
          </h1>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            }).toUpperCase()}{' '}
            · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>

      {/* 7 Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Middle row: Schedule + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Schedule Preview */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-gray-400" />
              <span className="text-[13px] font-bold text-gray-800">Schedule Preview</span>
            </div>
            <button
              onClick={() => navigate('/dashboard/timetable')}
              className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View Full Timetable <ChevronRight size={11} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {todaySchedule.map((item) => (
              <ScheduleRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-800">🔔 Notifications</span>
            </div>
            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="text-[10px] font-semibold text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="px-4 py-1">
            {notifications.map((n) => (
              <NotifRow key={n.id} n={n} />
            ))}
          </div>
        </div>
      </div>

      {/* Active Relief Duties Today */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className="text-[13px] font-bold text-gray-800">Active Relief Duties Today</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/relief-duties')}
            className="text-[10px] font-semibold text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>
        <div className="p-4 flex gap-4 overflow-x-auto">
          {activeReliefDutiesToday.map((duty) => (
            <ReliefCard key={duty.id} duty={duty} />
          ))}
        </div>
      </div>

      {/* Apply Leave modal */}
      <ApplyLeaveModal
        isOpen={leaveOpen}
        onClose={handleCloseLeave}
        onSubmit={async (data) => {
  const token = localStorage.getItem('schoolsync_token');

  const res = await fetch('http://localhost:8000/leaves/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      start_date: data.startDate,
      end_date: data.endDate || data.startDate,
      period_start: 1,
      period_end: 2,
      leave_type: data.leaveType?.toLowerCase().replace(' leave', '') || 'sick',
      reason: data.reason,
      handover_url: null,
    }),
  });

  console.log('Leave API:', await res.json());
  handleCloseLeave();
}}
      />
    </div>
  );
}
