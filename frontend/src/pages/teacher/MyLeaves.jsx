import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Eye, Pencil, X as XIcon, Clock, CheckCircle2, XCircle, MessageSquare, MinusCircle } from 'lucide-react';
import ApplyLeaveModal from '../../components/teacher/ApplyLeaveModal';
import { api } from '../../services/api';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, dot: 'bg-amber-400' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, dot: 'bg-red-500' },
  clarification: { label: 'Action Needed', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: MessageSquare, dot: 'bg-purple-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: MinusCircle, dot: 'bg-gray-400' },
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

// ─── Leave card (unchanged from before) ───────────────────────────────────────
const LeaveCard = ({ req, onCancel }) => {
  const canEdit = req.status === 'pending';
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
              Leave Request #{String(req.id).slice(0, 8)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {req.type} · {fmt(req.from)} – {fmt(req.to)} · {req.days} day{req.days > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {req.reason && (
        <p className="text-[11px] text-gray-500 mt-2.5 pl-10 leading-relaxed">{req.reason}</p>
      )}

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

// ─── Map backend leave → UI shape ─────────────────────────────────────────────
function mapLeave(raw) {
  return {
    id: raw.id,
    type: raw.leave_type || raw.type || 'Leave',
    from: raw.date || raw.from,
    to: raw.date || raw.to,
    days: raw.period_end && raw.period_start
      ? (raw.period_end - raw.period_start + 1)
      : (raw.days ?? 1),
    reason: raw.reason || '',
    status: (raw.status || 'pending').toLowerCase(),
    document: raw.handover_url || null,
    affectedClasses: raw.affectedClasses || [],
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MyLeaves() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/leaves/my');
      // Backend returns { success, count, data: [...] }
      const list = Array.isArray(resp) ? resp : (resp?.data || []);
      setRequests(list.map(mapLeave));
    } catch (e) {
      setError(e.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  const handleCancel = (id) => setCancelId(id);
  const confirmCancel = () => {
    // Optimistic UI only — no DELETE endpoint exists yet
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
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === i
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-[13px] font-semibold">Loading your leaves…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-[12px]">
          {error}
          <button onClick={loadLeaves} className="ml-3 underline">Retry</button>
        </div>
      ) : (
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
      )}

      {/* Apply Leave Modal — submits to backend and refetches list */}
      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={async (data) => {
          try {
            const raw = (data.leaveType || 'sick').toLowerCase();
            const leave_type = raw.includes('sick') ? 'sick'
              : raw.includes('casual') ? 'casual'
                : 'other';

            await api.post('/leaves/apply', {
              date: data.startDate || data.fromDate,
              period_start: data.periodStart ?? 1,
              period_end: data.periodEnd ?? 8,
              leave_type,
              reason: data.reason || 'No reason provided',
              handover_url: data.fileDataUrl || null,
            });

            setApplyOpen(false);
            await loadLeaves(); // refresh list
          } catch (err) {
            alert(`Failed to submit leave: ${err.message}`);
          }
        }}
      />

      <AnimatePresence>
        {cancelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setCancelId(null)}
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
                Are you sure you want to cancel this leave request?
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setCancelId(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  No, Keep It
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}