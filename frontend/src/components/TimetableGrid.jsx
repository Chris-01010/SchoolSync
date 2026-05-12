import React from 'react';
import { motion } from 'framer-motion';

const TimetableGrid = ({ data }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="min-w-[1000px] pb-4">
        {/* Header Row */}
        <div className="grid grid-cols-9 gap-3 mb-6">
          <div className="col-span-1"></div>
          {periods.map(p => (
            <div key={p} className="text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period</div>
              <div className="text-sm font-bold text-slate-900 bg-slate-50 py-2 rounded-lg border border-slate-100">
                {p}
              </div>
            </div>
          ))}
        </div>

        {/* Days Rows */}
        {days.map((day, dIdx) => (
          <div key={day} className="grid grid-cols-9 gap-3 mb-3 items-stretch">
            <div className="col-span-1 flex items-center">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight transform -rotate-0 lg:rotate-0">
                {day}
              </span>
            </div>
            {periods.map(p => {
              // Find slot if exists
              const slot = data.find(s => s.day === dIdx && s.period === p);
              
              return (
                <motion.div
                  key={`${day}-${p}`}
                  whileHover={{ y: -2, scale: 1.02, zIndex: 10 }}
                  className={`relative p-3 rounded-xl border min-h-[90px] flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    slot 
                      ? 'bg-primary-50/50 border-primary-200 shadow-sm shadow-primary-500/5' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 border-dashed'
                  }`}
                >
                  {slot ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <div className="text-[9px] uppercase font-black text-primary-600 tracking-widest leading-none">
                          {slot.subject}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          {slot.class}
                        </div>
                      </div>
                      <div className="mt-auto pt-2 border-t border-primary-100/50">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-slate-500 truncate">{slot.teacher}</span>
                          <span className="text-[9px] font-black text-slate-400 bg-white px-1 rounded border border-slate-100">{slot.room}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold">
                        +
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;
