import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { X, User, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const AbsenceModal = ({ isOpen, onClose, teachers }) => {
  const [step, setStep] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Mock finding candidates
  const findCandidates = () => {
    setCandidates([
      { id: 1, name: 'Mr. James Miller', score: 95, reason: 'Same department, lowest load' },
      { id: 2, name: 'Ms. Emily Chen', score: 82, reason: 'Free this period' },
      { id: 3, name: 'Mrs. Sarah Thompson', score: 78, reason: 'Available' },
    ]);
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
=======
import { X, Search, User, Filter, AlertCircle, Send } from 'lucide-react';

const AbsenceModal = ({ isOpen, onClose, teachers }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
<<<<<<< HEAD
=======
        {/* Modal Content */}
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
<<<<<<< HEAD
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Mark Absence</h2>
              <p className="text-xs text-slate-500 font-medium">Schedule relief for an absent teacher</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Absent Teacher</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none font-bold text-slate-900"
                    >
                      <option value="">Select Teacher...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
=======
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedTeacher?.id === teacher.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
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
                  <p className="text-sm font-bold">Marking <span className="text-primary-600">{selectedTeacher.name}</span> as absent for today.</p>
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
<<<<<<< HEAD
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">From Period</label>
                    <input type="number" defaultValue={1} min={1} max={8} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">To Period</label>
                    <input type="number" defaultValue={8} min={1} max={8} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>

                <button 
                  onClick={findCandidates}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  Find Relief Candidates
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Clock size={16} />
                  <p className="text-sm font-bold">Recommended relief for Period 1:</p>
                </div>
                {candidates.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-primary-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:border-primary-200">
                        {c.score}%
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <p className="text-[11px] text-slate-500 font-medium">{c.reason}</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-primary-500 flex items-center justify-center transition-colors">
                      <CheckCircle2 className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                    </div>
                  </motion.div>
                ))}
                
                <div className="pt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs">Back</button>
                  <button onClick={onClose} className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 uppercase tracking-widest text-xs">Confirm All</button>
                </div>
              </div>
=======
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

                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-600/20 uppercase tracking-widest text-xs">
                  Generate Relief Schedule <Send size={16} />
                </button>
              </motion.div>
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AbsenceModal;
