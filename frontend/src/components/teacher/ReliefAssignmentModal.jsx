import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, User, Calendar, CheckCircle2, AlertTriangle, ArrowLeftRight, PlusCircle, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';

const FLAG_REASONS = [
  { value: 'conflict',         label: 'Schedule conflict' },
  { value: 'not_qualified',    label: 'Not qualified for this subject' },
  { value: 'already_assigned', label: 'Already assigned for overlapping period' },
  { value: 'other',            label: 'Other' },
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const InfoCell = ({ Icon, label, value, sub }) => (
  <div>
    <div className="flex items-center gap-1 mb-1">
      <Icon size={11} className="text-gray-400" />
      <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">{label}</span>
    </div>
    <p className="text-[13px] font-bold text-gray-800">{value}</p>
    {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

// ─── View names ───────────────────────────────────────────────────────────────
// 'detail'   — default: shows assignment info + Reject/Flag/Accept
// 'mode'     — after Accept: choose Swap or Consume
// 'swap'     — slot picker
// 'consume'  — confirmation step
// 'flag'     — flag form

const ReliefAssignmentModal = ({ isOpen, onClose, assignment, onAccept, onReject, onFlag }) => {
  const [view, setView]             = useState('detail');
  const [flagReason, setFlagReason] = useState('');
  const [flagComment, setFlagComment] = useState('');
  const [flagError, setFlagError]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);

  // Swap slot picker state
  const [mySlots, setMySlots]           = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // Reset all state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setView('detail');
      setFlagReason('');
      setFlagComment('');
      setFlagError('');
      setLoading(false);
      setToast(null);
      setMySlots([]);
      setSelectedSlotId(null);
    }
  }, [isOpen]);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClose = () => {
    onClose();
  };

  // ── Fetch teacher's swappable slots when entering swap view ──
  const enterSwapView = async () => {
    setView('swap');
    setSlotsLoading(true);
    try {
      const data = await api.get('/relief/my-slots');
      setMySlots(data.slots ?? []);
    } catch {
      showToast('Could not load your slots.', 'error');
      setView('mode');
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Core respond function (handles all modes) ──
  const handleRespond = async (status, extras = {}) => {
    if (!assignment?.id) return;
    setLoading(true);
    try {
      if (status === 'accepted') {
        // New endpoint: POST /relief/assignments/{id}/respond
        const body = { response: 'accepted', mode: extras.mode };
        if (extras.mode === 'swap') body.swap_slot_id = extras.swap_slot_id;
        await api.post(`/relief/assignments/${assignment.id}/respond`, body);

        if (extras.mode === 'consume') {
          showToast('Consume request sent — waiting for absent teacher to confirm.', 'accept');
        } else {
          showToast('Swap accepted! Your timetable has been updated.', 'accept');
        }
        setTimeout(() => { onAccept?.(); handleClose(); }, 1400);

      } else if (status === 'rejected') {
        await api.post(`/relief/assignments/${assignment.id}/respond`, { response: 'rejected' });
        showToast('Relief request rejected.', 'reject');
        setTimeout(() => { onReject?.(); handleClose(); }, 1000);

      } else if (status === 'flagged') {
        await api.post(`/relief/assignments/${assignment.id}/respond`, {
          response: 'flagged',
          flag_reason: extras.flag_reason,
          flag_comment: extras.flag_comment,
        });
        showToast('Request flagged for admin review.', 'flag');
        setTimeout(() => { onFlag?.(); handleClose(); }, 1000);
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagSubmit = () => {
    if (!flagReason) { setFlagError('Please select a reason.'); return; }
    if (flagReason === 'other' && !flagComment.trim()) {
      setFlagError("Please provide a comment for 'Other' reason.");
      return;
    }
    setFlagError('');
    handleRespond('flagged', { flag_reason: flagReason, flag_comment: flagComment.trim() });
  };

  const toastStyles = {
    accept: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    reject: 'bg-gray-50 border-gray-200 text-gray-700',
    flag:   'bg-amber-50 border-amber-200 text-amber-700',
    error:  'bg-red-50 border-red-200 text-red-700',
    success:'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  const viewTitle = {
    detail:  'New Relief Assignment',
    mode:    'How would you like to cover this?',
    swap:    'Choose a period to swap',
    consume: 'Confirm extra hour',
    flag:    'Flag Relief Request',
  };
  const viewSub = {
    detail:  'instant substitute notification',
    mode:    'Choose swap to trade a period, or consume to take extra work',
    swap:    'Your selected period will become vacant',
    consume: 'The absent teacher must approve before your workload updates',
    flag:    'Tell us why you cannot take this duty',
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg border
                        flex items-center gap-2 ${toastStyles[toast.kind] ?? toastStyles.error}`}
          >
            <span className="text-[12px] font-semibold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && assignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClose}
            />

            {/* Modal panel */}
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="relief-modal-title"
              className="relative bg-white rounded-2xl shadow-xl border border-gray-100
                         w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {/* Back button for sub-views */}
                    {(view === 'mode' || view === 'swap' || view === 'consume') && (
                      <button
                        onClick={() => {
                          if (view === 'swap' || view === 'consume') setView('mode');
                          else setView('detail');
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 -ml-1"
                        aria-label="Back"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    <div>
                      <h2 id="relief-modal-title" className="text-[15px] font-bold text-gray-900">
                        {viewTitle[view]}
                      </h2>
                      <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                        {viewSub[view]}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleClose} aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* ── VIEW: detail ── */}
                {view === 'detail' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <InfoCell Icon={BookOpen} label="Class"   value={assignment.class_name} />
                      <InfoCell Icon={Clock}    label="Period"  value={`Period ${assignment.period}`}
                        sub={assignment.period_start_time && assignment.period_end_time
                          ? `${assignment.period_start_time} – ${assignment.period_end_time}` : null} />
                      <InfoCell Icon={User}     label="Teacher" value={assignment.original_teacher_name} />
                      <InfoCell Icon={Calendar} label="Day"     value={assignment.day_label} />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond('rejected')}
                        disabled={loading}
                        className="border border-gray-200 text-gray-700 hover:bg-gray-50
                                   px-3 py-2.5 rounded-lg text-[12px] font-semibold flex-1
                                   flex items-center justify-center gap-1.5 transition-colors
                                   disabled:opacity-50"
                      >
                        <X size={13} /> Reject
                      </button>

                      <button
                        onClick={() => setView('flag')}
                        disabled={loading}
                        className="border border-amber-300 bg-amber-50 text-amber-700
                                   hover:bg-amber-100 px-3 py-2.5 rounded-lg text-[12px]
                                   font-semibold flex-1 flex items-center justify-center
                                   gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle size={13} /> Flag
                      </button>

                      {/* Accept now opens mode picker instead of finalising directly */}
                      <button
                        onClick={() => setView('mode')}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5
                                   rounded-lg text-[12px] font-semibold flex-1 flex items-center
                                   justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} /> Accept
                      </button>
                    </div>
                  </>
                )}

                {/* ── VIEW: mode picker ── */}
                {view === 'mode' && (
                  <div className="space-y-3">
                    <button
                      onClick={enterSwapView}
                      className="w-full flex items-start gap-4 p-4 rounded-xl border-2
                                 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100
                                 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <ArrowLeftRight size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-blue-900">Swap a Period</p>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          You cover this slot — one of your future periods becomes vacant. No workload change.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setView('consume')}
                      className="w-full flex items-start gap-4 p-4 rounded-xl border-2
                                 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100
                                 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                        <PlusCircle size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-emerald-900">Take Extra Hour</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          You cover this as additional work. Absent teacher must confirm before your workload updates.
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* ── VIEW: swap slot picker ── */}
                {view === 'swap' && (
                  <div>
                    {slotsLoading ? (
                      <div className="text-center py-10 text-[12px] text-gray-400">
                        Loading your slots…
                      </div>
                    ) : mySlots.length === 0 ? (
                      <div className="text-center py-10 text-[12px] text-gray-400">
                        No future slots available to swap.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-4">
                        {mySlots.map((s) => (
                          <button
                            key={s.slot_id}
                            onClick={() => setSelectedSlotId(s.slot_id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl
                                        border-2 text-left transition-all text-[12px] font-semibold
                                        ${selectedSlotId === s.slot_id
                                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                        }`}
                          >
                            <span>{DAY_NAMES[s.day_of_week] ?? `Day ${s.day_of_week}`} · Period {s.period}</span>
                            {selectedSlotId === s.slot_id && (
                              <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {!slotsLoading && mySlots.length > 0 && (
                      <button
                        onClick={() => handleRespond('accepted', { mode: 'swap', swap_slot_id: selectedSlotId })}
                        disabled={!selectedSlotId || loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                                   rounded-lg text-[12px] font-semibold disabled:opacity-50
                                   transition-colors"
                      >
                        {loading ? 'Confirming…' : 'Confirm Swap'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── VIEW: consume confirmation ── */}
                {view === 'consume' && (
                  <div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-[12px] text-amber-800">
                      <p className="font-bold mb-1">Before you confirm:</p>
                      <ul className="list-disc list-inside space-y-1 font-medium">
                        <li>You will cover {assignment.class_name} on {assignment.day_label}, Period {assignment.period}</li>
                        <li>The absent teacher must approve before your relief hours are credited</li>
                        <li>If they reject, the slot reverts back to them</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleRespond('accepted', { mode: 'consume' })}
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white
                                 rounded-lg text-[12px] font-semibold disabled:opacity-50
                                 transition-colors"
                    >
                      {loading ? 'Sending…' : 'Send Consume Request'}
                    </button>
                  </div>
                )}

                {/* ── VIEW: flag form ── */}
                {view === 'flag' && (
                  <>
                    <div className="space-y-2.5 mb-3">
                      {FLAG_REASONS.map((r) => (
                        <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="radio" name="flag_reason" value={r.value}
                            checked={flagReason === r.value}
                            onChange={() => { setFlagReason(r.value); setFlagError(''); }}
                            className="accent-amber-500"
                          />
                          <span className="text-[12px] text-gray-700 group-hover:text-gray-900">
                            {r.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {flagReason === 'other' && (
                      <textarea
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-[12px]
                                   resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mt-1"
                        rows={3} maxLength={200}
                        placeholder="Please describe the issue (max 200 chars)..."
                        value={flagComment}
                        onChange={(e) => { setFlagComment(e.target.value); setFlagError(''); }}
                      />
                    )}

                    {flagError && <p className="text-[11px] text-red-500 mt-1.5">{flagError}</p>}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => { setView('detail'); setFlagReason(''); setFlagComment(''); setFlagError(''); }}
                        disabled={loading}
                        className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[12px]
                                   font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleFlagSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-[12px]
                                   font-semibold hover:bg-amber-600 disabled:opacity-50"
                      >
                        {loading ? 'Submitting…' : 'Submit Flag'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReliefAssignmentModal;