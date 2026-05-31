import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Duty Leave', 'Emergency Leave'];
const MAX_FILE_BYTES = 3 * 1024 * 1024;

const ApplyLeaveModal = ({ isOpen, onClose, onSubmit, leaveBalance }) => {
  const [form, setForm] = useState({
    leaveType: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    file: null,
    fileDataUrl: null,
  });
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [encoding, setEncoding] = useState(false);
  const [touched, setTouched] = useState({ fromDate: false, toDate: false });
  const fileRef = useRef(null);
  const firstRef = useRef(null);

  const errors = {
    fromDate: !form.fromDate
      ? 'Please select a start date'
      : form.toDate && form.fromDate > form.toDate
      ? 'Start date cannot be after end date'
      : null,
    toDate: !form.toDate
      ? 'Please select an end date'
      : form.fromDate && form.toDate < form.fromDate
      ? 'End date cannot be before start date'
      : null,
  };

  const dayCount = form.fromDate && form.toDate
    ? Math.round((new Date(form.toDate) - new Date(form.fromDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const isValid = !errors.fromDate && !errors.toDate && form.reason.trim();

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => firstRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 3 MB.`);
      return;
    }
    setEncoding(true);
    const reader = new FileReader();
    reader.onload = (ev) => { setForm((f) => ({ ...f, file, fileDataUrl: ev.target.result })); setEncoding(false); };
    reader.onerror = () => { setFileError('Failed to read file. Please try again.'); setEncoding(false); };
    reader.readAsDataURL(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setForm((f) => ({ ...f, file: null, fileDataUrl: null }));
    setFileError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // Use onClick instead of onSubmit to avoid HTML5 form validation blocking interaction
  const handleSubmit = async () => {
    if (encoding) return;
    setTouched({ fromDate: true, toDate: true });
    if (!isValid) return;
    try {
      await onSubmit?.({ ...form, dayCount });
      setForm({ leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '', file: null, fileDataUrl: null });
      setFileError(null);
      setTouched({ fromDate: false, toDate: false });
    } catch {
      // parent handles the error alert
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

          <motion.div key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] pointer-events-auto border border-gray-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[15px] font-bold text-gray-900">Apply for Leave</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Body — plain div, no form tag */}
              <div className="px-5 py-4 space-y-4">

                {/* Leave type */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Leave Type</label>
                  <select ref={firstRef} value={form.leaveType} onChange={set('leaveType')}
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-400 transition-colors appearance-none">
                    {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Date range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">From Date</label>
                    <input type="date" value={form.fromDate}
                      onChange={(e) => { set('fromDate')(e); setTouched(t => ({ ...t, fromDate: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, fromDate: true }))}
                      className={`w-full px-3 py-2 text-[12px] border rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-400 transition-colors ${
                        touched.fromDate && errors.fromDate ? 'border-red-400' : 'border-gray-200'
                      }`} />
                    <AnimatePresence>
                      {touched.fromDate && errors.fromDate && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }} className="flex items-center gap-1 mt-1">
                          <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
                          <p className="text-[10px] text-red-500 font-medium">{errors.fromDate}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">To Date</label>
                    <input type="date" value={form.toDate} min={form.fromDate}
                      onChange={(e) => { set('toDate')(e); setTouched(t => ({ ...t, toDate: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, toDate: true }))}
                      className={`w-full px-3 py-2 text-[12px] border rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-400 transition-colors ${
                        touched.toDate && errors.toDate ? 'border-red-400' : 'border-gray-200'
                      }`} />
                    <AnimatePresence>
                      {touched.toDate && errors.toDate && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }} className="flex items-center gap-1 mt-1">
                          <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
                          <p className="text-[10px] text-red-500 font-medium">{errors.toDate}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Reason for Leave</label>
                  <textarea value={form.reason} onChange={set('reason')} rows={3}
                    placeholder="Please provide brief details for your leave request..."
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 transition-colors" />
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    Supporting Documents <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  {!form.file && (
                    <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        dragging ? 'border-blue-400 bg-blue-50' : fileError ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}>
                      <Upload size={20} className={dragging ? 'text-blue-500' : fileError ? 'text-red-400' : 'text-gray-400'} />
                      <p className="text-[11px] font-semibold text-gray-600 text-center">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-gray-400">PDF, JPG or PNG · max 3 MB</p>
                      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                        onChange={(e) => handleFile(e.target.files[0])} />
                    </div>
                  )}
                  {encoding && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] text-blue-600">Reading file…</span>
                    </div>
                  )}
                  {form.file && !encoding && (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-green-800 truncate">{form.file.name}</p>
                        <p className="text-[10px] text-green-600">{(form.file.size / 1024).toFixed(0)} KB · ready to attach</p>
                      </div>
                      <button type="button" onClick={removeFile} className="p-0.5 rounded text-green-400 hover:text-red-500 transition-colors">
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                  {fileError && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                      <p className="text-[11px] text-red-600">{fileError}</p>
                    </div>
                  )}
                </div>

                {/* Low balance warning */}
                {dayCount > 0 && leaveBalance !== null && dayCount > leaveBalance && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-800">Insufficient Leave Balance</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        You are requesting {dayCount} day{dayCount > 1 ? 's' : ''} but only have {leaveBalance.toFixed(1)} day{leaveBalance !== 1 ? 's' : ''} remaining. Your balance will go to 0.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="px-4 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={encoding || !isValid}
                    className="px-5 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
                    {encoding ? 'Processing…' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplyLeaveModal;