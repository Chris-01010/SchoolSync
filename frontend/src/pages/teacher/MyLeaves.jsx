import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Eye, Pencil, X as XIcon, Clock, CheckCircle2,
<<<<<<< Updated upstream
  XCircle, MessageSquare, MinusCircle, Upload,
=======
  XCircle, MessageSquare, MinusCircle,
>>>>>>> Stashed changes
} from 'lucide-react';
import ApplyLeaveModal from '../../components/teacher/ApplyLeaveModal';
import { api } from '../../services/api';

<<<<<<< Updated upstream
// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:                  { label: 'Pending',        color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock,          dot: 'bg-amber-400'  },
  approved:                 { label: 'Approved',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  rejected:                 { label: 'Rejected',       color: 'bg-red-50 text-red-600 border-red-200',         icon: XCircle,        dot: 'bg-red-500'    },
  clarification_requested:  { label: 'Action Needed',  color: 'bg-purple-50 text-purple-700 border-purple-200', icon: MessageSquare, dot: 'bg-purple-500' },
  clarification:            { label: 'Action Needed',  color: 'bg-purple-50 text-purple-700 border-purple-200', icon: MessageSquare, dot: 'bg-purple-500' },
  cancelled:                { label: 'Cancelled',      color: 'bg-gray-100 text-gray-500 border-gray-200',     icon: MinusCircle,    dot: 'bg-gray-400'   },
};

const TABS = ['Active Requests', 'History', 'Clarifications'];
=======
const STATUS = {
  pending:                 { label: 'Pending',      color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: Clock,         dot: 'bg-amber-400'  },
  approved:                { label: 'Approved',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2,  dot: 'bg-emerald-500'},
  rejected:                { label: 'Rejected',     color: 'bg-red-50 text-red-600 border-red-200',            icon: XCircle,       dot: 'bg-red-500'    },
  clarification_requested: { label: 'Action Needed',color: 'bg-purple-50 text-purple-700 border-purple-200',   icon: MessageSquare, dot: 'bg-purple-500' },
  clarification:           { label: 'Action Needed',color: 'bg-purple-50 text-purple-700 border-purple-200',   icon: MessageSquare, dot: 'bg-purple-500' },
  cancelled:               { label: 'Cancelled',    color: 'bg-gray-100 text-gray-500 border-gray-200',        icon: MinusCircle,   dot: 'bg-gray-400'   },
};

const TABS       = ['Active Requests', 'History', 'Clarifications'];
>>>>>>> Stashed changes
const LEAVE_TYPES = ['sick', 'casual', 'other'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] ?? STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
<<<<<<< Updated upstream
      <Icon size={10} /> {cfg.label}
=======
      <Icon size={10} />{cfg.label}
>>>>>>> Stashed changes
    </span>
  );
};

const fmt = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

<<<<<<< Updated upstream
// ─── Map backend leave → UI shape ────────────────────────────────────────────
function mapLeave(raw) {
  const rawStatus = (raw.status || 'pending').toLowerCase();
  const status = rawStatus.includes('clarif') ? 'clarification_requested' : rawStatus;
  return {
    id: raw.id,
    type: raw.leave_type || 'Leave',
    from: raw.date || raw.from,
    to: raw.date || raw.to,
    days: raw.period_end && raw.period_start ? (raw.period_end - raw.period_start + 1) : (raw.days ?? 1),
    reason: raw.reason || '',
    status,
    clarificationNote: raw.clarification_note || null,
    document: raw.handover_url || null,
    periodStart: raw.period_start ?? 1,
    periodEnd: raw.period_end ?? 8,
=======
// ─── helpers ──────────────────────────────────────────────────────────────────
function calcDays(raw) {
  if (raw.start_date && raw.end_date) {
    const start = new Date(raw.start_date);
    const end   = new Date(raw.end_date);
    return Math.round((end - start) / 86_400_000) + 1;
  }
  return raw.days ?? 1;
}

function calcPeriods(raw) {
  if (raw.is_full_day !== undefined)
    return raw.is_full_day ? 'All periods (full day)' : (raw.period_ids?.join(', ') ?? '—');
  if (raw.period_start != null && raw.period_end != null)
    return `${raw.period_start} – ${raw.period_end}`;
  return '—';
}

function mapLeave(raw) {
  const rawStatus = (raw.status || 'pending').toLowerCase();
  const status    = rawStatus.includes('clarif') ? 'clarification_requested' : rawStatus;
  return {
    id:                raw.id,
    type:              raw.leave_type || 'Leave',
    from:              raw.start_date || raw.date || raw.from,
    to:                raw.end_date   || raw.date || raw.to,
    days:              calcDays(raw),
    periods:           calcPeriods(raw),
    reason:            raw.reason || '',
    status,
    clarificationNote: raw.clarification_note || null,
    document:          raw.handover_url || null,
>>>>>>> Stashed changes
  };
}

// ─── View Details Modal ───────────────────────────────────────────────────────
function ViewDetailsModal({ req, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
<<<<<<< Updated upstream
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}>
=======
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
>>>>>>> Stashed changes
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-gray-900">Leave Request Details</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><XIcon size={15} /></button>
        </div>
        <div className="space-y-3 text-[12px]">
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Status</span><StatusBadge status={req.status} /></div>
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Leave Type</span><span className="font-semibold text-gray-800 capitalize">{req.type}</span></div>
<<<<<<< Updated upstream
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Date</span><span className="font-semibold text-gray-800">{fmt(req.from)}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Periods</span><span className="font-semibold text-gray-800">{req.periodStart} – {req.periodEnd}</span></div>
=======
          <div className="flex justify-between">
            <span className="text-gray-400 font-medium">Date</span>
            <span className="font-semibold text-gray-800">{fmt(req.from)}{req.to && req.to !== req.from ? ` – ${fmt(req.to)}` : ''}</span>
          </div>
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Periods</span><span className="font-semibold text-gray-800">{req.periods}</span></div>
>>>>>>> Stashed changes
          <div className="flex justify-between"><span className="text-gray-400 font-medium">Days</span><span className="font-semibold text-gray-800">{req.days}</span></div>
          <div>
            <p className="text-gray-400 font-medium mb-1">Reason</p>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-2.5 leading-relaxed">{req.reason || '—'}</p>
          </div>
          {req.clarificationNote && (
            <div>
              <p className="text-purple-600 font-bold mb-1 uppercase text-[10px] tracking-wide">Clarification Requested</p>
              <p className="text-purple-900 bg-purple-50 rounded-lg p-2.5 border border-purple-200">{req.clarificationNote}</p>
            </div>
          )}
          {req.document && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Document</span>
              <a href={req.document} target="_blank" rel="noreferrer" className="text-blue-600 underline text-[11px]">View File</a>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ req, onClose, onSaved }) {
<<<<<<< Updated upstream
  const [form, setForm] = useState({
    leave_type: req.type,
    date: req.from || '',
    reason: req.reason || '',
  });
=======
  const [form, setForm] = useState({ leave_type: req.type, date: req.from || '', reason: req.reason || '' });
>>>>>>> Stashed changes
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async () => {
<<<<<<< Updated upstream
  setSaving(true);
  setError(null);
  try {
    // Convert DD-MM-YYYY or any format to YYYY-MM-DD
    const dateVal = new Date(form.date);
    const isoDate = dateVal.toISOString().split('T')[0];
    await api.put(`/leaves/${req.id}/edit`, {
      leave_type: form.leave_type,
      date: isoDate,
      reason: form.reason,
      period_start: req.periodStart ?? 1,
      period_end: req.periodEnd ?? 8,
    });
    onSaved();
    onClose();
  } catch (e) {
    setError(typeof e.message === 'string' ? e.message : 'Failed to update leave.');
  } finally {
    setSaving(false);
  }
};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}>
=======
    setSaving(true); setError(null);
    try {
      const isoDate = new Date(form.date).toISOString().split('T')[0];
      await api.put(`/leaves/${req.id}/edit`, {
        start_date:  isoDate,
        leave_type:  form.leave_type,
        reason:      form.reason,
        is_full_day: true,
      });
      onSaved(); onClose();
    } catch (e) { setError(e.message || 'Failed to update leave.'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
>>>>>>> Stashed changes
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-gray-900">Edit Leave Request</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><XIcon size={15} /></button>
        </div>
        {error && <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">Leave Type</label>
            <select value={form.leave_type} onChange={e => setForm(p => ({ ...p, leave_type: e.target.value }))}
              className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400">
              {LEAVE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">Reason</label>
            <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              rows={3} className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

<<<<<<< Updated upstream
// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────
function CancelModal({ req, onClose, onCancelled }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.delete(`/leaves/${req.id}`);
    } catch {
      // optimistic — remove from UI regardless
    } finally {
      onCancelled(req.id);
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}>
=======
// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({ req, onClose, onCancelled }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try { await api.delete(`/leaves/${req.id}`); } catch { }
    finally { onCancelled(req.id); onClose(); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
>>>>>>> Stashed changes
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900 mb-2">Cancel Leave Request</h3>
<<<<<<< Updated upstream
        <p className="text-[12px] text-gray-500 mb-5">Are you sure you want to cancel this leave request? This will remove it from HOD and admin views.</p>
=======
        <p className="text-[12px] text-gray-500 mb-5">Are you sure you want to cancel this leave request?</p>
>>>>>>> Stashed changes
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">No, Keep It</button>
          <button onClick={handleConfirm} disabled={loading}
            className="px-4 py-2 text-[12px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {loading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Leave Card ───────────────────────────────────────────────────────────────
const LeaveCard = ({ req, onView, onEdit, onCancel }) => {
  const canEdit   = req.status === 'pending' || req.status === 'clarification_requested';
  const canCancel = req.status === 'pending' || req.status === 'clarification_requested';
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} layout
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900">Leave Request #{String(req.id).slice(0, 8)}</p>
<<<<<<< Updated upstream
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{req.type} · {fmt(req.from)} · {req.days} day{req.days > 1 ? 's' : ''}</p>
=======
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
              {req.type} · {fmt(req.from)}{req.to && req.to !== req.from ? ` – ${fmt(req.to)}` : ''} · {req.days} day{req.days > 1 ? 's' : ''}
            </p>
>>>>>>> Stashed changes
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>
<<<<<<< Updated upstream

      {req.reason && <p className="text-[11px] text-gray-500 mt-2.5 pl-10 leading-relaxed">{req.reason}</p>}

=======
      {req.reason && <p className="text-[11px] text-gray-500 mt-2.5 pl-10 leading-relaxed">{req.reason}</p>}
>>>>>>> Stashed changes
      {req.clarificationNote && (
        <div className="mt-2.5 ml-10 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Clarification Requested</p>
          <p className="text-[11px] text-purple-900 mt-1">{req.clarificationNote}</p>
        </div>
      )}
      <div className="mt-3 pl-10 flex items-center gap-2 flex-wrap">
        <button onClick={() => onView(req)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Eye size={11} /> View Details
        </button>
        {canEdit && (
          <button onClick={() => onEdit(req)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <Pencil size={11} /> Edit
          </button>
        )}
        {canCancel && (
          <button onClick={() => onCancel(req)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <XIcon size={11} /> Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

<<<<<<< Updated upstream
// ─── Main component ───────────────────────────────────────────────────────────
=======
// ─── Main Component ───────────────────────────────────────────────────────────
>>>>>>> Stashed changes
export default function MyLeaves() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);
<<<<<<< Updated upstream

  const [viewReq,   setViewReq]   = useState(null);
  const [editReq,   setEditReq]   = useState(null);
  const [cancelReq, setCancelReq] = useState(null);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/leaves/my');
      const list = Array.isArray(resp) ? resp : (resp?.data || []);
      setRequests(list.map(mapLeave));
    } catch (e) {
      setError(e.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  const handleCancelled = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  const filtered = requests.filter((r) => {
=======
  const [viewReq, setViewReq]   = useState(null);
  const [editReq, setEditReq]   = useState(null);
  const [cancelReq, setCancelReq] = useState(null);

  const loadLeaves = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const resp = await api.get('/leaves/my');
      const list = Array.isArray(resp) ? resp : (resp?.data || []);
      setRequests(list.map(mapLeave));
    } catch (e) { setError(e.message || 'Failed to load leaves'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  const handleCancelled = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  const filtered = requests.filter(r => {
>>>>>>> Stashed changes
    if (activeTab === 0) return ['pending', 'clarification_requested'].includes(r.status);
    if (activeTab === 1) return ['approved', 'rejected', 'cancelled'].includes(r.status);
    if (activeTab === 2) return r.status === 'clarification_requested';
    return true;
  });

  return (
    <div className="space-y-5 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">My Leaves</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Manage your leave requests</p>
        </div>
        <button onClick={() => setApplyOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={13} /> Apply
        </button>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit gap-0.5">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all ${activeTab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><p className="text-[13px] font-semibold">Loading your leaves…</p></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-[12px]">
          {error} <button onClick={loadLeaves} className="ml-3 underline">Retry</button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-[13px] font-semibold">No leave requests found</p>
                <p className="text-[11px] mt-1">Click "Apply" to submit a new request</p>
              </motion.div>
            ) : (
              filtered.map(req => (
<<<<<<< Updated upstream
                <LeaveCard key={req.id} req={req}
                  onView={setViewReq}
                  onEdit={setEditReq}
                  onCancel={setCancelReq} />
=======
                <LeaveCard key={req.id} req={req} onView={setViewReq} onEdit={setEditReq} onCancel={setCancelReq} />
>>>>>>> Stashed changes
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Apply Modal */}
<<<<<<< Updated upstream
      <ApplyLeaveModal isOpen={applyOpen} onClose={() => setApplyOpen(false)}
=======
      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
>>>>>>> Stashed changes
        onSubmit={async (data) => {
          try {
            const raw = (data.leaveType || 'sick').toLowerCase();
            const leave_type = raw.includes('sick') ? 'sick' : raw.includes('casual') ? 'casual' : 'other';
            await api.post('/leaves/apply', {
<<<<<<< Updated upstream
              date: data.startDate || data.fromDate,
              period_start: data.periodStart ?? 1,
              period_end: data.periodEnd ?? 8,
              leave_type,
              reason: data.reason || 'No reason provided',
=======
              start_date:   data.fromDate  || data.startDate,
              end_date:     data.toDate    || data.endDate || data.fromDate || data.startDate,
              leave_type,
              reason:       data.reason   || 'No reason provided',
              is_full_day:  true,
>>>>>>> Stashed changes
              handover_url: data.fileDataUrl || null,
            });
            setApplyOpen(false);
            await loadLeaves();
<<<<<<< Updated upstream
          } catch (err) {
            alert(`Failed to submit leave: ${err.message}`);
          }
        }} />
=======
          } catch (err) { alert(`Failed to submit leave: ${err.message}`); }
        }}
      />
>>>>>>> Stashed changes

      <AnimatePresence>
        {viewReq   && <ViewDetailsModal req={viewReq}   onClose={() => setViewReq(null)} />}
        {editReq   && <EditModal        req={editReq}   onClose={() => setEditReq(null)}   onSaved={loadLeaves} />}
        {cancelReq && <CancelModal      req={cancelReq} onClose={() => setCancelReq(null)} onCancelled={handleCancelled} />}
      </AnimatePresence>
    </div>
  );
}
