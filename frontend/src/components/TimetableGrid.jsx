import React from 'react';
import { motion } from 'framer-motion';

const TimetableGrid = ({ data }) => {
<<<<<<< HEAD
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
=======
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left border-b border-slate-100"></th>
            {periods.map(p => (
              <th key={p} className="p-4 text-center border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period {p}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dIdx) => (
            <tr key={day} className="group">
              <td className="p-4 font-black text-slate-900 border-b border-slate-100 bg-slate-50/50">
                {day}
              </td>
              {periods.map(period => {
                const slot = data.find(s => s.day === dIdx && s.period === period);
                return (
                  <td key={period} className="p-2 border-b border-slate-100 min-w-[140px]">
                    {slot ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                      >
                        <p className="text-[10px] font-black text-primary-600 mb-1">{slot.subject}</p>
                        <p className="text-xs font-bold text-slate-900">{slot.class}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] font-medium text-slate-500">{slot.teacher}</span>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{slot.room}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-20 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Free</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
    </div>
  );
};

export default TimetableGrid;
