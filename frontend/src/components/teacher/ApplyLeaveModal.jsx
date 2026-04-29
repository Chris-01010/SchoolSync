import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertTriangle } from 'lucide-react';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Duty Leave', 'Emergency Leave'];

// Dummy affected classes based on date range
const AFFECTED = [
  { date: 'Monday, Jan 20', periods: 'Period 2, 4, 7' },
  { date: 'Tuesday, Jan 21', periods: 'Period 1, 3, 5' },
];

const ApplyLeaveModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    leaveType: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    file: null,
  });
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const firstRef = useRef(null);

  // Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => firstRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    setForm((f) => ({ ...f, file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
    // Reset
    setForm({ leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '', file: null });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] pointer-events-auto
                         border border-gray-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[15px] font-bold text-gray-900">Apply for Leave</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600
                             transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                {/* Leave type */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    Leave Type
                  </label>
                  <select
                    ref={firstRef}
                    value={form.leaveType}
                    onChange={set('leaveType')}
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg
                               bg-white text-gray-800 focus:outline-none focus:border-blue-400
                               transition-colors appearance-none"
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Date range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={form.fromDate}
                      onChange={set('fromDate')}
                      required
                      className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg
                                 bg-white text-gray-800 focus:outline-none focus:border-blue-400
                                 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={form.toDate}
                      onChange={set('toDate')}
                      required
                      min={form.fromDate}
                      className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg
                                 bg-white text-gray-800 focus:outline-none focus:border-blue-400
                                 transition-colors"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    Reason for Leave
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={set('reason')}
                    rows={3}
                    placeholder="Please provide brief details for your leave request..."
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg
                               bg-white text-gray-800 placeholder-gray-400 resize-none
                               focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Affected classes */}
                {form.fromDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={13} className="text-amber-500" />
                      <span className="text-[11px] font-bold text-amber-700">Affected Classes</span>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-1">
                      {AFFECTED.map((a) => (
                        <div key={a.date} className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-amber-700">{a.date}:</span>
                          <span className="text-[10px] text-amber-600">{a.periods}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* File upload */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    Supporting Documents (Optional)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center
                                justify-center gap-2 cursor-pointer transition-all ${
                      dragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
                    }`}
                  >
                    <Upload size={20} className={dragging ? 'text-blue-500' : 'text-gray-400'} />
                    <p className="text-[11px] font-semibold text-gray-600 text-center">
                      {form.file
                        ? form.file.name
                        : 'Click to upload or drag and drop'}
                    </p>
                    {!form.file && (
                      <p className="text-[10px] text-gray-400">PDF, JPG or PNG (max. 5MB)</p>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200
                               rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-lg
                               hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplyLeaveModal;
