import React, { useState, useEffect, useCallback } from 'react';
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
import { api } from '../services/api';

const MOCK_LEAVE_IMPACT = [
  { day: 'MON', date: 14, teachers: [{ initials: 'MJ', color: 'bg-blue-200 text-blue-800' }, { initials: 'AL', color: 'bg-pink-200 text-pink-800' }], extra: 2 },
  { day: 'TUE', date: 15, teachers: [{ initials: 'SJ', color: 'bg-purple-200 text-purple-700' }], extra: 0, highlighted: true },
  { day: 'WED', date: 16, teachers: [], extra: 0, empty: true },
];

const KPICard = ({ label, value, icon: Icon, color, barColor, barValue }) => (
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
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barValue}%` }} />
      </div>
    )}
  </div>
);

const TypeBadge = ({ type, color }) => (
  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${color}`}>{type}</span>
);

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = 'Unknown Teacher') {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';
}

const TYPE_COLORS = {
  sick: 'bg-red-100 text-red-600',
  casual: 'bg-purple-100 text-purple-700',
  other: 'bg-blue-100 text-blue-700',
};

function typeColor(t) {
  const key = (t || '').toLowerCase();
  if (key.includes('sick')) return TYPE_COLORS.sick;
  if (key.includes('casual')) return TYPE_COLORS.casual;
  return TYPE_COLORS.other;
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return d;
  }
}

function mapPending(raw) {
  const teacherName = raw.teacher_name || raw.teacher?.name || 'Unknown Teacher';
  const periods = (raw.period_start && raw.period_end)
    ? (raw.period_end - raw.period_start + 1)
    : null;

  return {
    id: raw.id,
    initials: getInitials(teacherName),
    color: avatarColor(teacherName),
    name: teacherName,
    role: raw.teacher?.department_name || '—',
    type: raw.leave_type || 'Leave',
    typeColor: typeColor(raw.leave_type),
    dates: fmtDate(raw.date),
    days: periods ? `${periods} period${periods > 1 ? 's' : ''}` : '',
    reason: raw.reason || 'No reason provided',
    doc: raw.handover_url || null,
    hasDoc: !!raw.handover_url,
  };
}

const LeaveManagement = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [showBanner, setShowBanner] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/hod/leaves/pending');
      const list = Array.isArray(resp) ? resp : (resp?.data || []);
      setPendingLeaves(list.map(mapPending));
    } catch (e) {
      setError(e.message || 'Failed to load pending leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    const apiAction = action === 'approved' ? 'approve' : 'reject';
    let success = false;

    try {
      await api.put(`/leaves/${id}/action`, { action: apiAction });
      success = true;
    } catch (e) {
      alert(`Failed to ${apiAction} leave: ${e.message}`);
    }

    if (success) {
      const moved = pendingLeaves.find((l) => l.id === id);
      setPendingLeaves((prev) => prev.filter((l) => l.id !== id));
      if (moved) {
        setProcessed((prev) => [
          {
            ...moved,
            status: action === 'approved' ? 'approved' : 'rejected',
            meta: `${action === 'approved' ? 'Approved' : 'Rejected'} just now`,
            detail: moved.type,
            dates: moved.dates,
          },
          ...prev,
        ]);
      }
    }

    setActionLoading(null);
  };

  const pendingCount = pendingLeaves.length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Manage department staff absences and relief planning.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 flex gap-3">
          <KPICard
            label="Pending Decisions"
            value={String(pendingCount).padStart(2, '0')}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
            barColor="bg-amber-400"
            barValue={Math.min(100, pendingCount * 15)}
          />
          <KPICard
            label="Processed Today"
            value={String(processed.length).padStart(2, '0')}
            icon={CheckSquare}
            color="bg-green-50 text-green-600"
            barColor="bg-green-500"
            barValue={Math.min(100, processed.length * 20)}
          />
          <KPICard
            label="Department Staff"
            value="—"
            icon={Users}
            color="bg-blue-50 text-blue-600"
            barColor="bg-blue-500"
            barValue={60}
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-gray-800">Leave Impact</p>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              This Week
            </span>
          </div>
          <div className="space-y-2">
            {MOCK_LEAVE_IMPACT.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${item.highlighted ? 'bg-blue-50 border border-blue-100' : ''}`}
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
                        <div key={j} className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${t.color}`}>
                          {t.initials}
                        </div>
                      ))}
                      {item.extra > 0 && (
                        <span className="text-[9px] text-gray-500 font-medium">+{item.extra} away</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-800">
            Pending Requests {pendingCount > 0 && <span className="ml-1 text-gray-400 text-[11px]">({pendingCount})</span>}
          </h3>
          <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 font-medium">
            <Filter size={11} /> Filter by Type
          </button>
        </div>

        <div className="grid px-5 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
          style={{ gridTemplateColumns: '2fr 1fr 1.2fr 2fr 1fr 1.5fr' }}>
          <span>Teacher</span>
          <span>Type</span>
          <span>Date</span>
          <span>Reason</span>
          <span>Docs</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-5 py-8 text-center text-[12px] text-gray-400">Loading pending leaves…</div>
          ) : error ? (
            <div className="px-5 py-6 text-[12px] text-red-600 bg-red-50">
              {error}
              <button onClick={loadPending} className="ml-3 underline">Retry</button>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {pendingLeaves.map((leave) => (
                  <motion.div
                    key={leave.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid px-5 py-3 items-center hover:bg-gray-50/60 transition-colors"
                    style={{ gridTemplateColumns: '2fr 1fr 1.2fr 2fr 1fr 1.5fr' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${leave.color}`}>
                        {leave.initials}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-gray-800">{leave.name}</p>
                        <p className="text-[10px] text-gray-400">{leave.role}</p>
                      </div>
                    </div>

                    <div>
                      <TypeBadge type={leave.type} color={leave.typeColor} />
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-700 font-medium">{leave.dates}</p>
                      <p className="text-[10px] text-gray-400">{leave.days}</p>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate pr-2">{leave.reason}</p>

                    <div>
                      {leave.hasDoc ? (

                        <a href={leave.doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`leave-document-${String(leave.id).slice(0, 8)}.${leave.doc?.match(/^data:([^;]+)/)?.[1]?.split('/')[1]?.replace('jpeg', 'jpg') || 'bin'
                            }`}
                          className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:text-blue-700"
                        >
                          <FileText size={11} />
                          View
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400">None</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleAction(leave.id, 'rejected')}
                        disabled={!!actionLoading}
                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `${leave.id}-rejected` ? '…' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'approved')}
                        disabled={!!actionLoading}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `${leave.id}-approved` ? '…' : 'Approve'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {pendingLeaves.length === 0 && !loading && (
                <div className="px-5 py-8 text-center">
                  <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                  <p className="text-[12px] text-gray-400 font-medium">All requests processed</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-800">Recently Processed</h3>
          <button className="p-1 rounded text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={14} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {processed.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12px] text-gray-400">
              No leaves processed in this session yet.
            </p>
          ) : (
            processed.map((item) => (
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
                  {item.status === 'approved' && <CheckCircle size={15} className="text-green-500" />}
                  {item.status === 'rejected' && <XCircle size={15} className="text-red-400" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showBanner && pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl max-w-sm"
          >
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold">Pending Decisions</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {pendingCount} leave request{pendingCount > 1 ? 's await' : ' awaits'} your decision.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="ml-1 p-0.5 text-gray-500 hover:text-gray-300 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default LeaveManagement; 