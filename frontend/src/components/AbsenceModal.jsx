import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, AlertCircle, Send } from 'lucide-react';

const AbsenceModal = ({ isOpen, onClose, teachers = [] }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        String(t?.name || '').toLowerCase().includes(q) ||
        String(t?.department || '').toLowerCase().includes(q)
    );
  }, [searchTerm, teachers]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
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
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mark Teacher Absence</h2>
              <p className="text-sm text-slate-500 font-medium">Select a teacher to assign relief coverage</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or department..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Teacher List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    selectedTeacher?.id === teacher.id
                      ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedTeacher?.id === teacher.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{teacher.name}</p>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{teacher.department}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedTeacher && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-6 border-t border-slate-100 space-y-6"
              >
                <div className="flex items-center gap-4 text-slate-900">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-sm font-bold">
                    Marking <span className="text-primary-600">{selectedTeacher.name}</span> as absent for today.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Absence Type</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none">
                      <option>Casual Leave</option>
                      <option>Medical Leave</option>
                      <option>Duty Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none">
                      <option>Full Day</option>
                      <option>Forenoon</option>
                      <option>Afternoon</option>
                    </select>
                  </div>
                </div>

                <button
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-600/20 uppercase tracking-widest text-xs"
                  onClick={onClose}
                  type="button"
                >
                  Generate Relief Schedule <Send size={16} />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AbsenceModal;

