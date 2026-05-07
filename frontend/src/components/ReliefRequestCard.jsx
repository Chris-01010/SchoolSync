import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, X, Flag, AlertTriangle, Calendar as CalendarIcon, User } from 'lucide-react';

const ReliefRequestCard = ({ request, onRespond }) => {
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const handleRespond = (status) => {
    if (status === 'flagged' && !flagReason) return;
    onRespond(request.id, status, flagReason);
    setIsFlagging(false);
    setFlagReason('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
      
      <div className="flex items-start justify-between mb-4 pl-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-md uppercase tracking-wider">
              Action Required
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock size={12} /> Received just now
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Relief Duty Request</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-500">
          <span className="text-[9px] font-black uppercase">Period</span>
          <span className="text-sm font-black text-slate-900">3</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 pl-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><CalendarIcon size={16} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Class</p>
            <p className="font-bold text-slate-900">Grade 10B Science</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><User size={16} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Covering For</p>
            <p className="font-bold text-slate-900">Mr. James Miller</p>
          </div>
        </div>
      </div>

      <div className="pl-2">
        {isFlagging ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Flag Issue</span>
            </div>
            <textarea
              autoFocus
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Why are you flagging this request? (e.g., Conflict, Over workload)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
              rows="2"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFlagging(false)}
                className="flex-1 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRespond('flagged')}
                disabled={!flagReason}
                className="flex-1 py-2 rounded-xl text-xs font-black text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 uppercase tracking-widest transition-colors"
              >
                Submit Flag
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => handleRespond('accepted')}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
            >
              <Check size={16} /> Accept
            </button>
            <button 
              onClick={() => handleRespond('rejected')}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              <X size={16} /> Reject
            </button>
            <button 
              onClick={() => setIsFlagging(true)}
              className="w-12 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-all"
              title="Flag Issue"
            >
              <Flag size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReliefRequestCard;
