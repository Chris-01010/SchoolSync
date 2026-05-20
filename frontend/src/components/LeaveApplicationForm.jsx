import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const leaveTypeOptions = [
  { value: 'sick',   label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'other',  label: 'Emergency Leave' },
];

export default function LeaveApplicationForm({
  isOpen,
  onClose,
  onSubmit,
  firstFieldRef
}) {
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    document: null
  });

  useEffect(() => {
    if (!isOpen) return;
    // reset on open for consistent UX
    setLeaveForm({ leaveType: '', startDate: '', endDate: '', reason: '', document: null });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...leaveForm,
      document: leaveForm.document ? leaveForm.document.name : null
    };

    if (leaveForm.endDate && leaveForm.startDate && leaveForm.endDate < leaveForm.startDate) {
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        data-leave-modal="true"
      >
        <div className="w-full max-w-[440px] bg-white border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold text-slate-900">Apply for Leave</h2>
              <p className="text-[14px] font-semibold text-slate-500">Submit your request</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5" aria-label="Leave application form">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
              <select
                ref={firstFieldRef}
                required
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold"
              >
               <option value="" disabled>Select Leave Type</option>
               {leaveTypeOptions.map((t) => (

                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
               ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  required
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                <input
                  required
                  type="date"
                  min={leaveForm.startDate || undefined}
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
              <textarea
                required
                rows={3}
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Provide a brief explanation…"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Supporting Document</label>
              <input
                type="file"
                onChange={(e) => setLeaveForm((p) => ({ ...p, document: e.target.files?.[0] || null }))}
                className="w-full text-slate-700"
              />
              <p className="text-[12px] font-semibold text-slate-500 mt-1">Optional</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-700 font-bold uppercase tracking-wider hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-secondary text-white font-bold uppercase tracking-wider hover:opacity-95"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

