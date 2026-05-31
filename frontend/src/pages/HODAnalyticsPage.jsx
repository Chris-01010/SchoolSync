import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, RefreshCw, Calendar, Download } from 'lucide-react';

const LEAVE_DATA = {
  'This Week':  [
    { name: 'Mon', sick: 1, casual: 0, other: 1 },
    { name: 'Tue', sick: 0, casual: 1, other: 0 },
    { name: 'Wed', sick: 2, casual: 0, other: 0 },
    { name: 'Thu', sick: 1, casual: 1, other: 1 },
    { name: 'Fri', sick: 0, casual: 0, other: 1 },
  ],
  'This Month': [
    { name: 'W1', sick: 3, casual: 2, other: 1 },
    { name: 'W2', sick: 1, casual: 3, other: 2 },
    { name: 'W3', sick: 4, casual: 1, other: 0 },
    { name: 'W4', sick: 2, casual: 2, other: 3 },
  ],
  'This Term': [
    { name: 'Jan', sick: 8,  casual: 5, other: 3 },
    { name: 'Feb', sick: 5,  casual: 7, other: 2 },
    { name: 'Mar', sick: 12, casual: 4, other: 5 },
    { name: 'Apr', sick: 6,  casual: 8, other: 1 },
    { name: 'May', sick: 4,  casual: 3, other: 4 },
  ],
};

const WORKLOAD_DATA = {
  'This Week': [
    { name: 'Dr. Adams', teaching: 18, relief: 4 },
    { name: 'J. Miller', teaching: 22, relief: 2 },
    { name: 'E. Lawson', teaching: 16, relief: 6 },
    { name: 'S. Patel',  teaching: 20, relief: 3 },
    { name: 'R. Thomas', teaching: 14, relief: 5 },
  ],
  'This Month': [
    { name: 'Dr. Adams', teaching: 72, relief: 16 },
    { name: 'J. Miller', teaching: 88, relief: 8  },
    { name: 'E. Lawson', teaching: 64, relief: 24 },
    { name: 'S. Patel',  teaching: 80, relief: 12 },
    { name: 'R. Thomas', teaching: 56, relief: 20 },
  ],
  'This Term': [
    { name: 'Dr. Adams', teaching: 288, relief: 64 },
    { name: 'J. Miller', teaching: 352, relief: 32 },
    { name: 'E. Lawson', teaching: 256, relief: 96 },
    { name: 'S. Patel',  teaching: 320, relief: 48 },
    { name: 'R. Thomas', teaching: 224, relief: 80 },
  ],
};

const RELIEF_DATA = {
  'This Week': [
    { name: 'Mon', assigned: 3, covered: 3, uncovered: 0 },
    { name: 'Tue', assigned: 2, covered: 1, uncovered: 1 },
    { name: 'Wed', assigned: 4, covered: 4, uncovered: 0 },
    { name: 'Thu', assigned: 2, covered: 2, uncovered: 0 },
    { name: 'Fri', assigned: 1, covered: 0, uncovered: 1 },
  ],
  'This Month': [
    { name: 'W1', assigned: 8,  covered: 7,  uncovered: 1 },
    { name: 'W2', assigned: 6,  covered: 6,  uncovered: 0 },
    { name: 'W3', assigned: 10, covered: 8,  uncovered: 2 },
    { name: 'W4', assigned: 7,  covered: 7,  uncovered: 0 },
  ],
  'This Term': [
    { name: 'Jan', assigned: 24, covered: 22, uncovered: 2 },
    { name: 'Feb', assigned: 18, covered: 18, uncovered: 0 },
    { name: 'Mar', assigned: 30, covered: 26, uncovered: 4 },
    { name: 'Apr', assigned: 20, covered: 19, uncovered: 1 },
    { name: 'May', assigned: 12, covered: 11, uncovered: 1 },
  ],
};

const ATTENDANCE_DATA = {
  'This Week': [
    { name: 'Mon', present: 8,  absent: 2 },
    { name: 'Tue', present: 9,  absent: 1 },
    { name: 'Wed', present: 7,  absent: 3 },
    { name: 'Thu', present: 9,  absent: 1 },
    { name: 'Fri', present: 10, absent: 0 },
  ],
  'This Month': [
    { name: 'W1', present: 42, absent: 8  },
    { name: 'W2', present: 45, absent: 5  },
    { name: 'W3', present: 38, absent: 12 },
    { name: 'W4', present: 44, absent: 6  },
  ],
  'This Term': [
    { name: 'Jan', present: 168, absent: 32 },
    { name: 'Feb', present: 180, absent: 20 },
    { name: 'Mar', present: 152, absent: 48 },
    { name: 'Apr', present: 176, absent: 24 },
    { name: 'May', present: 88,  absent: 12 },
  ],
};

const RANGES = ['This Week', 'This Month', 'This Term'];

const SUMMARY_CARDS = (range) => [
  {
    label: 'Total Leave Days',
    value: range === 'This Week' ? '6' : range === 'This Month' ? '23' : '68',
    change: '-12%', trend: 'down', icon: Calendar,
    color: 'text-blue-600', bg: 'bg-blue-50',
  },
  {
    label: 'Avg Teaching Hours',
    value: range === 'This Week' ? '18h' : range === 'This Month' ? '72h' : '288h',
    change: '+5%', trend: 'up', icon: Clock,
    color: 'text-purple-600', bg: 'bg-purple-50',
  },
  {
    label: 'Relief Coverage',
    value: range === 'This Week' ? '83%' : range === 'This Month' ? '93%' : '91%',
    change: '+3%', trend: 'up', icon: RefreshCw,
    color: 'text-green-600', bg: 'bg-green-50',
  },
  {
    label: 'Staff Present',
    value: range === 'This Week' ? '86%' : range === 'This Month' ? '88%' : '85%',
    change: '-2%', trend: 'down', icon: Users,
    color: 'text-amber-600', bg: 'bg-amber-50',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-2.5 text-[11px]">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function HODAnalytics() {
  const [range, setRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { key: 'overview',   label: 'Overview' },
    { key: 'leave',      label: 'Leave Trends' },
    { key: 'workload',   label: 'Workload' },
    { key: 'relief',     label: 'Relief Stats' },
    { key: 'attendance', label: 'Attendance' },
  ];

  const handleCSV = () => {
    const cards = SUMMARY_CARDS(range);
    const rows = [
      ['SchoolSync Department Analytics Report'],
      ['Period', range],
      ['Generated', new Date().toLocaleDateString()],
      [],
      ['SUMMARY'],
      ['Metric', 'Value', 'Change'],
      ...cards.map(c => [c.label, c.value, c.change]),
      [],
      ['LEAVE TRENDS'],
      ['Period', 'Sick', 'Casual', 'Other'],
      ...LEAVE_DATA[range].map(d => [d.name, d.sick, d.casual, d.other]),
      [],
      ['WORKLOAD'],
      ['Teacher', 'Teaching Hours', 'Relief Hours'],
      ...WORKLOAD_DATA[range].map(d => [d.name, d.teaching, d.relief]),
      [],
      ['RELIEF COVERAGE'],
      ['Period', 'Assigned', 'Covered', 'Uncovered'],
      ...RELIEF_DATA[range].map(d => [d.name, d.assigned, d.covered, d.uncovered]),
      [],
      ['ATTENDANCE'],
      ['Period', 'Present', 'Absent'],
      ...ATTENDANCE_DATA[range].map(d => [d.name, d.present, d.absent]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolSync_Analytics_${range.replace(/ /g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => window.print();

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Department Analytics</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">CS Department · Real-time insights</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download buttons */}
          <button onClick={handleCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            <Download size={11} /> CSV
          </button>
          <button onClick={handlePDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            <Download size={11} /> PDF
          </button>
          {/* Range toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SUMMARY_CARDS(range).map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={13} className={card.color} />
              </div>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${card.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {card.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {card.change}
              </span>
            </div>
            <p className="text-[22px] font-bold text-gray-900">{card.value}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-[11px] font-semibold border-b-2 transition-all ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab + range}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-gray-800 mb-3">Leave Trends</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={LEAVE_DATA[range]} barSize={8}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sick"   fill="#3B82F6" radius={[2,2,0,0]} name="Sick" />
                  <Bar dataKey="casual" fill="#8B5CF6" radius={[2,2,0,0]} name="Casual" />
                  <Bar dataKey="other"  fill="#F59E0B" radius={[2,2,0,0]} name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-gray-800 mb-3">Teacher Workload</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={WORKLOAD_DATA[range]} layout="vertical" barSize={8}>
                  <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="teaching" fill="#3B82F6" radius={[0,2,2,0]} name="Teaching" stackId="a" />
                  <Bar dataKey="relief"   fill="#F59E0B" radius={[0,2,2,0]} name="Relief"   stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-gray-800 mb-3">Relief Coverage</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={RELIEF_DATA[range]}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="assigned"  stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Assigned" />
                  <Line type="monotone" dataKey="covered"   stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Covered" />
                  <Line type="monotone" dataKey="uncovered" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Uncovered" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-gray-800 mb-3">Staff Attendance</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={ATTENDANCE_DATA[range]} barSize={12}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="present" fill="#10B981" radius={[2,2,0,0]} name="Present" stackId="a" />
                  <Bar dataKey="absent"  fill="#FCA5A5" radius={[2,2,0,0]} name="Absent"  stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-800">Leave Trends — {range}</h3>
              <div className="flex gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Sick</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Casual</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Other</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={LEAVE_DATA[range]} barSize={16}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sick"   fill="#3B82F6" radius={[3,3,0,0]} name="Sick" />
                <Bar dataKey="casual" fill="#8B5CF6" radius={[3,3,0,0]} name="Casual" />
                <Bar dataKey="other"  fill="#F59E0B" radius={[3,3,0,0]} name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-800">Teacher Workload — {range}</h3>
              <div className="flex gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Teaching</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Relief</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={WORKLOAD_DATA[range]} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="teaching" fill="#3B82F6" radius={[0,3,3,0]} name="Teaching" stackId="a" />
                <Bar dataKey="relief"   fill="#F59E0B" radius={[0,3,3,0]} name="Relief"   stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'relief' && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-800">Relief Statistics — {range}</h3>
              <div className="flex gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Assigned</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Covered</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Uncovered</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={RELIEF_DATA[range]}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="assigned"  stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} name="Assigned" />
                <Line type="monotone" dataKey="covered"   stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} name="Covered" />
                <Line type="monotone" dataKey="uncovered" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} name="Uncovered" strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-800">Staff Attendance — {range}</h3>
              <div className="flex gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Present</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" /> Absent</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ATTENDANCE_DATA[range]} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="present" fill="#10B981" radius={[3,3,0,0]} name="Present" stackId="a" />
                <Bar dataKey="absent"  fill="#FCA5A5" radius={[3,3,0,0]} name="Absent"  stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </motion.div>
    </div>
  );
}   