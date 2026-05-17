import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  CheckSquare,
  Filter,
  FileDown,
  ExternalLink,
  FileText,
  Clock,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_KPI = {
  totalLeaveDays: 24,
  pendingDecisions: 6,
  availableCapacity: 12,
};

const MOCK_LEAVE_IMPACT = [
  { day: 'MON', date: 14, teachers: [{ initials: 'MJ', color: 'bg-blue-200 text-blue-800' }, { initials: 'AL', color: 'bg-pink-200 text-pink-800' }], extra: 2 },
  { day: 'TUE', date: 15, teachers: [{ initials: 'SJ', color: 'bg-purple-200 text-purple-700' }], extra: 0, highlighted: true },
  { day: 'WED', date: 16, teachers: [], extra: 0, empty: true },
];

const MOCK_PENDING = [
  {
    id: 'p1',
    initials: 'MJ',
    color: 'bg-blue-100 text-blue-700',
    name: 'Marcus Johnson',
    role: 'Senior Physics',
    type: 'Sick Leave',
    typeColor: 'bg-red-100 text-red-600',
    dates: 'Oct 14 – Oct 15',
    days: '2 Days',
    reason: "Doctor's appointment...",
    doc: 'Medical_Cert.pdf',
    hasDoc: true,
  },
  {
    id: 'p2',
    initials: 'AL',
    color: 'bg-pink-100 text-pink-700',
    name: 'Alice Low',
    role: 'Biology Lab Tech',
    type: 'Personal',
    typeColor: 'bg-purple-100 text-purple-700',
    dates: 'Oct 20',
    days: '1 Day',
    reason: 'Family emergency -...',
    doc: null,
    hasDoc: false,
  },
];

const MOCK_PROCESSED = [
  {
    id: 'r1',
    initials: 'DC',
    color: 'bg-green-100 text-green-700',
    name: 'David Chen',
    meta: 'Approved 2h ago',
    detail: 'Professional Development',
    dates: 'Oct 25 – 27',
    status: 'approved',
  },
  {
    id: 'r2',
    initials: 'EB',
    color: 'bg-amber-100 text-amber-700',
    name: 'Emily Blunt',
    meta: 'Clarification Requested yesterday',
    detail: '',
    dates: '',
    status: 'pending',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const KPICard = ({ label, value, icon: Icon, color, barColor, barValue, subLabel }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex-1 min-w-0">
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="text-[22px] font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-1">{label}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={14} className="opacity-80" />
      </div>
    </div>
    {barColor && (
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${barValue}%` }}
        />
      </div>
    )}
  </div>
);

const TypeBadge = ({ type, color }) => (
  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${color}`}>{type}</span>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
  const ReliefManagement = ({ user }) => {
  const [reliefRequests, setReliefRequests] = useState(() => {
  const assignedIds = JSON.parse(localStorage.getItem('assignedReliefs') || '[]');
  return MOCK_PENDING.filter((r) => !assignedIds.includes(r.id));
});
const [processed, setProcessed] = useState(MOCK_PROCESSED);
const [showBanner, setShowBanner] = useState(true);
const AVAILABLE_RELIEF_TEACHERS = [
  'Ms. Julia Lee',
  'Mr. David Smith',
  'Ms. Sarah Oh',
];

const handleAssign = (id) => {
  const assignedIds = JSON.parse(localStorage.getItem('assignedReliefs') || '[]');
  localStorage.setItem('assignedReliefs', JSON.stringify([...assignedIds, id]));
  const assigned = reliefRequests.find((r) => r.id === id);

  if (assigned) {
    setReliefRequests((prev) =>
      prev.filter((r) => r.id !== id)
    );
    const selectedTeacher = AVAILABLE_RELIEF_TEACHERS[0];
    setProcessed((prev) => [
      {
        ...assigned,
        status: 'assigned',
        availableRelief: selectedTeacher,
        meta: `Relief assigned to ${selectedTeacher} just now`,
      },
      ...prev,
    ]);
  }
};
    

    


  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Relief Management</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Assign and manage relief teachers for approved absences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 bg-white">
            <FileDown size={11} /> Download Report
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700">
            <ExternalLink size={11} /> View School Calendar
          </button>
        </div>
      </div>

      {/* KPI + Leave Impact row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* KPI cards */}
        <div className="lg:col-span-3 flex gap-3">
          <KPICard
            label="Total Relief Requests"
            value={MOCK_KPI.totalLeaveDays}
            icon={Users}
            color="bg-blue-50 text-blue-600"
            barColor="bg-blue-500"
            barValue={60}
          />
          <KPICard
            label="Pending Assignments"
            value={`0${MOCK_KPI.pendingDecisions}`}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
            barColor="bg-amber-400"
            barValue={40}
          />
          <KPICard
            label="Available Teachers"
            value={MOCK_KPI.availableCapacity}
            icon={CheckSquare}
            color="bg-green-50 text-green-600"
            barColor="bg-green-500"
            barValue={75}
          />
        </div>

        {/* Relief Impact */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-gray-800">Leave Impact</p>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              Week 34
            </span>
          </div>
          <div className="space-y-2">
            {MOCK_LEAVE_IMPACT.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                  item.highlighted ? 'bg-blue-50 border border-blue-100' : ''
                }`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  <p className="text-[8px] font-bold text-gray-400 uppercase">{item.day}</p>
                  <p className="text-[13px] font-bold text-gray-800">{item.date}</p>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  {item.empty ? (
                    <p className="text-[10px] text-gray-400 italic">No active absences</p>
                  ) : (
                    <>
                      {item.teachers.map((t, j) => (
                        <div
                          key={j}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${t.color}`}
                        >
                          {t.initials}
                        </div>
                      ))}
                      {item.extra > 0 && (
                        <span className="text-[9px] text-gray-500 font-medium">
                          +{item.extra} away
                        </span>
                      )}
                      {item.highlighted && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[8px] font-bold text-purple-700">
                            SJ
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
        <div
        id="create-relief"
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
        >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-800">Pending Requests</h3>
          <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 font-medium">
            <Filter size={11} /> Filter by Type
          </button>
        </div>

        {/* Table header */}
        <div className="grid px-5 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
          style={{ gridTemplateColumns: '2fr 1fr 1.2fr 2fr 1fr 1.5fr' }}>
          <span>Absent Teacher</span>
          <span>Subject</span>
          <span>Period</span>
          <span>Available Relief</span>
          <span>Status</span>
          <span className="text-right">Assign</span>
          </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {reliefRequests.map((leave) => (
              <motion.div
                key={leave.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid px-5 py-3 items-center hover:bg-gray-50/60 transition-colors"
                style={{ gridTemplateColumns: '2fr 1fr 1.2fr 2fr 1fr 1.5fr' }}
              >
                {/* Teacher */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${leave.color}`}
                  >
                    {leave.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800">{leave.name}</p>
                    <p className="text-[10px] text-gray-400">{leave.role}</p>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <TypeBadge type={leave.type} color={leave.typeColor} />
                  <p className="text-[9px] text-gray-400 mt-0.5">Leave</p>
                </div>

                {/* Dates */}
                <div>
                  <p className="text-[11px] text-gray-700 font-medium">{leave.dates}</p>
                  <p className="text-[10px] text-gray-400">{leave.days}</p>
                </div>

                {/* Reason */}
                <p className="text-[11px] text-gray-500 truncate pr-2">{leave.reason}</p>

                {/* Docs */}
                <div>
                  {leave.hasDoc ? (
                    <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:text-blue-700">
                      <FileText size={11} />
                      {leave.doc}
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400">None</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                  onClick={() => {
                    
                    handleAssign(leave.id);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-semibold hover:bg-blue-700"
                  >  Assign Relief
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {reliefRequests.length === 0 && (
            <div className="px-5 py-8 text-center">
              <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-[12px] text-gray-400 font-medium">All requests processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Relief Assignments */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-800">Recent Relief Assignments</h3>
          <button className="p-1 rounded text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={14} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {processed.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${item.color}`}>
                {item.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800">{item.name}</p>
                <p className="text-[10px] text-gray-400">{item.meta}</p>
              </div>
              {item.detail && (
                <div className="text-right">
                  <p className="text-[11px] text-gray-600 font-medium">{item.detail}</p>
                  <p className="text-[10px] text-gray-400">{item.dates}</p>
                </div>
              )}
              <div className="ml-2">
                {item.status === 'approved' && (
                  <CheckCircle size={15} className="text-green-500" />
                )}
                {item.status === 'rejected' && (
                  <XCircle size={15} className="text-red-400" />
                )}
                {item.status === 'pending' && (
                  <Clock size={15} className="text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom notification banner */}
      <AnimatePresence>
        {showBanner && reliefRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl max-w-sm"
          >
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold">Relief Planning Required</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                3 approved absences lack assigned relief teachers for Tuesday.
              </p>
            </div>
            <button
            onClick={() => {
              if (reliefRequests.length > 0) {
                handleAssign(reliefRequests[0].id);
              }
            }}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 whitespace-nowrap flex-shrink-0"
            >
              Fix Now
              </button>
            <button
              onClick={() => setShowBanner(false)}
              className="ml-1 p-0.5 text-gray-500 hover:text-gray-300 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};


export default ReliefManagement;
