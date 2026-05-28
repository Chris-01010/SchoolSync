import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, UserCheck, BarChart3 } from 'lucide-react';
import {
  AlertCircle, Plus, ArrowRight, MoreVertical, Wifi,
} from 'lucide-react';
import { api } from '../services/api';

const MOCK_TIMETABLE = [
  { period: '01', time: '08:30', teacher: 'Mrs. Aris',     subject: 'Biology 101',    status: 'ongoing'   },
  { period: '02', time: '09:25', teacher: 'Dr. Singh',     subject: 'Physics AP',     status: 'relief', reliefTeacher: 'Ms. Lee' },
  { period: '03', time: '10:40', teacher: 'Mr. Chen',      subject: 'General Science',status: 'scheduled' },
  { period: '04', time: '11:35', teacher: 'Mr. Henderson', subject: 'Chemistry',      status: 'cancelled' },
];

const WORKLOAD_DATA = [
  { day: 'M', teaching: 70, relief: 20 },
  { day: 'T', teaching: 60, relief: 15 },
  { day: 'W', teaching: 85, relief: 30 },
  { day: 'T', teaching: 65, relief: 25 },
  { day: 'F', teaching: 75, relief: 10 },
];

const StatusBadge = ({ status, reliefTeacher }) => {
  if (status === 'ongoing')   return <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200">Ongoing</span>;
  if (status === 'relief')    return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">Relief: {reliefTeacher}</span>;
  if (status === 'scheduled') return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">Scheduled</span>;
  if (status === 'cancelled') return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-semibold border border-red-100 line-through">Cancelled</span>;
  return null;
};

const MiniBar = ({ value, color, max = 100 }) => (
  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

const HODDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/v1/admin/hod-stats')
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      value:       loading ? '…' : (stats?.pending_approvals_count ?? 0),
      label:       'Pending Leave Approvals',
      badge:       'PENDING',
      badgeColor:  'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      value:       loading ? '…' : (stats?.missing_reliefs ?? 0),
      label:       'Missing Reliefs',
      badge:       'URGENT',
      badgeColor:  'bg-red-100 text-red-600',
      borderColor: 'border-red-200',
    },
    {
      value:       loading ? '…' : (stats?.total_teachers ?? 0),
      label:       'Dept Teachers',
      badge:       'ACTIVE',
      badgeColor:  'bg-emerald-100 text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      value:       loading ? '…' : (stats?.active_conflicts ?? 0),
      label:       'Active Conflicts',
      badge:       'CLEAR',
      badgeColor:  'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Dept Header */}
      {stats?.department_name && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {stats.department_name} Department
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-white border ${card.borderColor} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${card.badgeColor}`}>{card.badge}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Timetables',        icon: CalendarDays,   path: '/hod/timetables' },
            { label: 'Leave Approvals',   icon: ClipboardCheck, path: '/hod/leave'      },
            { label: 'Relief Management', icon: UserCheck,      path: '/hod/relief'     },
            { label: 'Analytics',         icon: BarChart3,      path: '/hod/analytics'  },
          ].map((qa) => {
            const Icon = qa.icon;
            return (
              <motion.button key={qa.label} onClick={() => navigate(qa.path)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-5 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 shadow-sm">
                <Icon size={22} strokeWidth={1.8} className="text-blue-500 transition group-hover:text-blue-700" />
                <span className="text-[11px] font-semibold text-gray-700 group-hover:text-blue-700 leading-tight">{qa.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">

          {/* Critical Alerts */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-red-500" />
              <h3 className="text-[13px] font-semibold text-gray-800">Critical Alerts</h3>
            </div>
            {stats?.missing_reliefs > 0 ? (
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">Unassigned Relief Duties</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{stats.missing_reliefs} relief duties need assignment today</p>
                </div>
                <button onClick={() => navigate('/hod/relief')}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg">
                  Assign Now
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <p className="text-[12px] font-semibold text-green-700">All clear — no critical alerts today</p>
              </div>
            )}
          </div>

          {/* Today's Timetable */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">Today's Department Timetable</h3>
              <button onClick={() => navigate('/hod/timetables')} className="flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:text-blue-700">
                Full Schedule <ArrowRight size={11} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="text-left pb-2 pr-4">Period</th>
                    <th className="text-left pb-2 pr-4">Teacher</th>
                    <th className="text-left pb-2 pr-4">Subject</th>
                    <th className="text-left pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_TIMETABLE.map((row, i) => (
                    <tr key={i} className={`text-[12px] ${row.status === 'cancelled' ? 'opacity-50' : ''}`}>
                      <td className="py-2 pr-4 font-semibold text-gray-600">{row.period}<span className="text-gray-400 font-normal ml-1">({row.time})</span></td>
                      <td className="py-2 pr-4 text-gray-700">{row.teacher}</td>
                      <td className="py-2 pr-4 text-gray-700">{row.subject}</td>
                      <td className="py-2"><StatusBadge status={row.status} reliefTeacher={row.reliefTeacher} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Weekly Workload */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-800">Weekly Workload</h3>
              <button className="p-1 rounded text-gray-400 hover:text-gray-600"><MoreVertical size={13} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Teaching Hours</span>
                  <span className="text-[10px] text-gray-400 font-medium">Avg: 22h</span>
                </div>
                <MiniBar value={78} color="bg-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">Relief Duties</span>
                  <span className="text-[10px] text-gray-400 font-medium">Avg: 4h</span>
                </div>
                <MiniBar value={35} color="bg-amber-400" />
              </div>
              <div className="flex items-end justify-between gap-1.5 pt-2" style={{ height: 64 }}>
                {WORKLOAD_DATA.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: 52 }}>
                      <div className="w-full rounded-t-sm bg-blue-200" style={{ height: `${(d.teaching / 100) * 44}px` }} />
                      <div className="w-full rounded-b-sm bg-blue-500" style={{ height: `${(d.relief / 100) * 44}px` }} />
                    </div>
                    <span className={`text-[9px] font-semibold ${d.day === 'W' ? 'text-blue-600' : 'text-gray-400'}`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-colors z-50">
        <Plus size={20} />
      </button>
    </div>
  );
};

export default HODDashboard;