import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, User, Calendar, CheckCircle2 } from 'lucide-react';

// ─── Single info cell ─────────────────────────────────────────────────────────
const InfoCell = ({ Icon, label, value, sub }) => (
  <div>
    <div className="flex items-center gap-1 mb-1">
      <Icon size={11} className="text-gray-400" />
      <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">
        {label}
      </span>
    </div>
    <p className="text-[13px] font-bold text-gray-800">{value}</p>
    {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

const ReliefAssignmentModal = ({ isOpen, onClose, assignment, onAccept, onReject }) => {
  return (
    <AnimatePresence>
      {isOpen && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="relief-modal-title"
            className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md"
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
                    New Relief Assignment
                  </h2>
                  <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                    instant substitute notification
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <InfoCell
                  Icon={BookOpen}
                  label="Class"
                  value={assignment.class_name}
                />
                <InfoCell
                  Icon={Clock}
                  label="Period"
                  value={`Period ${assignment.period}`}
                  sub={
                    assignment.period_start_time && assignment.period_end_time
                      ? `${assignment.period_start_time} – ${assignment.period_end_time}`
                      : null
                  }
                />
                <InfoCell
                  Icon={User}
                  label="Teacher"
                  value={assignment.original_teacher_name}
                />
                <InfoCell
                  Icon={Calendar}
                  label="Day"
                  value={assignment.day_label}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onReject}
                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5
                             rounded-lg text-[12px] font-semibold flex-1 flex items-center
                             justify-center gap-1.5 transition-colors"
                >
                  <X size={13} />
                  Reject
                </button>
                <button
                  onClick={onAccept}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg
                             text-[12px] font-semibold flex-1 flex items-center justify-center
                             gap-1.5 transition-colors"
                >
                  <CheckCircle2 size={13} />
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReliefAssignmentModal;
