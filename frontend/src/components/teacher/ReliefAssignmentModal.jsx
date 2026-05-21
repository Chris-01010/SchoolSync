import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, User, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

const FLAG_REASONS = [
  { value: 'conflict',         label: 'Schedule conflict' },
  { value: 'not_qualified',    label: 'Not qualified for this subject' },
  { value: 'already_assigned', label: 'Already assigned for overlapping period' },
  { value: 'other',            label: 'Other' },
];

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

const ReliefAssignmentModal = ({ isOpen, onClose, assignment, onAccept, onReject, onFlag }) => {
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason]     = useState('');
  const [flagComment, setFlagComment]   = useState('');
  const [flagError, setFlagError]       = useState('');
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const resetFlagForm = () => {
    setShowFlagForm(false);
    setFlagReason('');
    setFlagComment('');
    setFlagError('');
  };

  const handleClose = () => {
    resetFlagForm();
    setToast(null);
    onClose();
  };

  const handleRespond = async (status, flag_reason = null, flag_comment = null) => {
    if (!assignment?.id) return;
    setLoading(true);
    try {
      const body = { status };
      if (flag_reason)  body.flag_reason  = flag_reason;
      if (flag_comment) body.flag_comment = flag_comment;

      await api.put(`/relief-assignments/${assignment.id}/respond`, body);

      if (status === 'accepted') {
        showToast('Relief accepted! Your timetable has been updated.', 'accept');
        setTimeout(() => { onAccept?.(); handleClose(); }, 1200);
      } else if (status === 'rejected') {
        showToast('Relief request rejected.', 'reject');
        setTimeout(() => { onReject?.(); handleClose(); }, 1200);
      } else {
        showToast('Request flagged for admin review.', 'flag');
        setTimeout(() => { onFlag?.(); handleClose(); }, 1200);
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong.';
      if (msg.includes('already')) {
        showToast('This request was already taken by another teacher.', 'error');
        setTimeout(() => { onReject?.(); handleClose(); }, 1500);
      } else if (msg.includes('expired') || msg.includes('Gone')) {
        showToast('This request has expired.', 'error');
        setTimeout(() => { onReject?.(); handleClose(); }, 1500);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFlagSubmit = () => {
    if (!flagReason) {
      setFlagError('Please select a reason.');
      return;
    }
    if (flagReason === 'other' && !flagComment.trim()) {
      setFlagError("Please provide a comment for 'Other' reason.");
      return;
    }
    setFlagError('');
    handleRespond('flagged', flagReason, flagComment.trim());
  };

  const toastStyles = {
    accept: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    reject: 'bg-gray-50 border-gray-200 text-gray-700',
    flag:   'bg-amber-50 border-amber-200 text-amber-700',
    error:  'bg-red-50 border-red-200 text-red-700',
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
                  <div>
                    <h2 id="relief-modal-title" className="text-[15px] font-bold text-gray-900">
                      {showFlagForm ? 'Flag Relief Request' : 'New Relief Assignment'}
                    </h2>
                    <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                      {showFlagForm
                        ? 'Tell us why you cannot take this duty'
                        : 'instant substitute notification'}
                    </p>
                  </div>
                  <button onClick={handleClose} aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1">
                    <X size={16} />
                  </button>
                </div>

                {!showFlagForm ? (
                  <>
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <InfoCell Icon={BookOpen} label="Class"
                        value={assignment.class_name} />
                      <InfoCell Icon={Clock} label="Period"
                        value={`Period ${assignment.period}`}
                        sub={assignment.period_start_time && assignment.period_end_time
                          ? `${assignment.period_start_time} – ${assignment.period_end_time}`
                          : null} />
                      <InfoCell Icon={User} label="Teacher"
                        value={assignment.original_teacher_name} />
                      <InfoCell Icon={Calendar} label="Day"
                        value={assignment.day_label} />
                    </div>

                    {/* Three action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond('rejected')}
                        disabled={loading}
                        aria-label={`Reject relief for ${assignment.class_name}`}
                        className="border border-gray-200 text-gray-700 hover:bg-gray-50
                                   px-3 py-2.5 rounded-lg text-[12px] font-semibold flex-1
                                   flex items-center justify-center gap-1.5 transition-colors
                                   disabled:opacity-50"
                      >
                        <X size={13} /> Reject
                      </button>

                      <button
                        onClick={() => setShowFlagForm(true)}
                        disabled={loading}
                        aria-label={`Flag relief for ${assignment.class_name}`}
                        className="border border-amber-300 bg-amber-50 text-amber-700
                                   hover:bg-amber-100 px-3 py-2.5 rounded-lg text-[12px]
                                   font-semibold flex-1 flex items-center justify-center
                                   gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle size={13} /> Flag
                      </button>

                      <button
                        onClick={() => handleRespond('accepted')}
                        disabled={loading}
                        aria-label={`Accept relief for ${assignment.class_name}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5
                                   rounded-lg text-[12px] font-semibold flex-1 flex items-center
                                   justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        {loading ? '...' : 'Accept'}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Flag form */
                  <>
                    <div className="space-y-2.5 mb-3">
                      {FLAG_REASONS.map((r) => (
                        <label key={r.value}
                          className="flex items-center gap-2.5 cursor-pointer group">
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
                                   resize-none focus:outline-none focus:ring-2 focus:ring-amber-400
                                   mt-1"
                        rows={3} maxLength={200}
                        placeholder="Please describe the issue (max 200 chars)..."
                        value={flagComment}
                        onChange={(e) => {
                          setFlagComment(e.target.value);
                          setFlagError('');
                        }}
                      />
                    )}

                    {flagError && (
                      <p className="text-[11px] text-red-500 mt-1.5">{flagError}</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={resetFlagForm}
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
                        {loading ? 'Submitting...' : 'Submit Flag'}
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