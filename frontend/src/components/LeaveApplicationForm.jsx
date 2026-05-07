import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Link as LinkIcon, Send } from 'lucide-react';

const LeaveApplicationForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    leave_type: 'personal',
    date: '',
    period_start: 1,
    period_end: 8,
    reason: '',
    handover_url: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Apply for Leave</h2>
              <p className="text-xs text-slate-500 font-medium">Submit your leave request and handover details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Leave Type</label>
                <select 
                  required
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-slate-900"
                >
                  <option value="personal">Personal Leave</option>
                  <option value="medical">Medical Leave</option>
                  <option value="official">Official Duty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">From Period</label>
                  <input type="number" min={1} max={8} value={formData.period_start} onChange={(e) => setFormData({...formData, period_start: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">To Period</label>
                  <input type="number" min={1} max={8} value={formData.period_end} onChange={(e) => setFormData({...formData, period_end: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    required
                    rows="2"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Briefly explain the reason for your leave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Digital Handover (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="url"
                    value={formData.handover_url}
                    onChange={(e) => setFormData({...formData, handover_url: e.target.value})}
                    placeholder="Link to lesson plan/materials (e.g., Google Drive)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 ml-1">Provide a link to ensure academic continuity while you are away.</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs">Cancel</button>
              <button type="submit" className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                Submit Request <Send size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeaveApplicationForm;
