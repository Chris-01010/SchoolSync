import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Eye, Pencil, X as XIcon, Clock, CheckCircle2, XCircle, MessageSquare, MinusCircle } from 'lucide-react';
import { leaveRequests } from '../../mockData';
import ApplyLeaveModal from '../../components/teacher/ApplyLeaveModal';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: 'Pending',        color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock,          dot: 'bg-amber-400' },
  approved:  { label: 'Approved',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  rejected:  { label: 'Rejected',       color: 'bg-red-50 text-red-600 border-red-200',        icon: XCircle,        dot: 'bg-red-500' },
  clarification: { label: 'Action Needed', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: MessageSquare, dot: 'bg-purple-500' },
  cancelled: { label: 'Cancelled',      color: 'bg-gray-100 text-gray-500 border-gray-200',    icon: MinusCircle,    dot: 'bg-gray-400' },
};

const TABS = ['Active Requests', 'History', 'Clarifications'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] ?? STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

// ─── Leave card ───────────────────────────────────────────────────────────────
const LeaveCard = ({ req, onCancel }) => {
  const canEdit   = req.status === 'pending';
  const canCancel = req.status === 'pending';

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900">
              Leave Request #{req.id}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {req.type} · {fmt(req.from)} – {fmt(req.to)} · {req.days} day{req.days > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Reason */}
      {req.reason && (
        <p className="text-[11px] text-gray-500 mt-2.5 pl-10 leading-relaxed">{req.reason}</p>
      )}

      {/* Document */}
      {req.document && (
        <div className="mt-2 pl-10 flex items-center gap-1.5">
          <FileText size={11} className="text-gray-400" />
          <span className="text-[10px] text-gray-500">{req.document}</span>
          <button className="text-[10px] text-blue-600 hover:underline ml-1">View</button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pl-10 flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold
                           text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Eye size={11} /> View Details
        </button>
        {canEdit && (
          <button className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold
                             text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <Pencil size={11} /> Edit
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(req.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold
                       text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XIcon size={11} /> Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Cancel confirm ───────────────────────────────────────────────────────────
const CancelConfirm = ({ onConfirm, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    onClick={onDismiss}
  >
    <motion.div
      initial={{ scale: 0.95, y: 8 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-100"
    >
      <h3 className="text-[14px] font-bold text-gray-900 mb-2">Cancel Leave Request</h3>
      <p className="text-[12px] text-gray-500 mb-5">
        Are you sure you want to cancel this leave request? This action cannot be undone.
      </p>
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          No, Keep It
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-[12px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Yes, Cancel
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function MyLeaves() {
  const [requests, setRequests] = useState(leaveRequests);
  const [activeTab, setActiveTab]   = useState(0);
  const [applyOpen, setApplyOpen]   = useState(false);
  const [cancelId, setCancelId]     = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const handleCancel = (id) => setCancelId(id);
  const confirmCancel = () => {
    setRequests((prev) =>
      prev.map((r) => (r.id === cancelId ? { ...r, status: 'cancelled' } : r))
    );
    setCancelId(null);
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 0) return ['pending', 'clarification'].includes(r.status);
    if (activeTab === 1) return ['approved', 'rejected', 'cancelled'].includes(r.status);
    if (activeTab === 2) return r.status === 'clarification';
    return true;
  });

  return (
    <div className="space-y-5 max-w-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">My Leaves</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Manage your leave requests</p>
        </div>
        <button
          onClick={() => setApplyOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[11px]
                     font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={13} /> Apply
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit gap-0.5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
              activeTab === i
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400"
            >
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[13px] font-semibold">No leave requests found</p>
              <p className="text-[11px] mt-1">Click "Apply" to submit a new request</p>
            </motion.div>
          ) : (
            filtered.map((req) => (
              <LeaveCard key={req.id} req={req} onCancel={handleCancel} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={(data) => {
          const newReq = {
            id: `L-${Date.now()}`,
            type: data.leaveType,
            from: data.fromDate,
            to: data.toDate,
            days: 1,
            reason: data.reason,
            status: 'pending',
            document: data.file?.name ?? null,
            affectedClasses: [],
          };
          setRequests((prev) => [newReq, ...prev]);
          setApplyOpen(false);
        }}
      />

      <AnimatePresence>
        {cancelId && (
          <CancelConfirm onConfirm={confirmCancel} onDismiss={() => setCancelId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
