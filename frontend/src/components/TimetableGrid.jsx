import React from 'react';
import { motion } from 'framer-motion';

const TimetableGrid = ({ data = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left border-b border-slate-100"></th>
            {periods.map((p) => (
              <th key={p} className="p-4 text-center border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period {p}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dIdx) => (
            <tr key={day} className="group">
              <td className="p-4 font-black text-slate-900 border-b border-slate-100 bg-slate-50/50">{day}</td>
              {periods.map((period) => {
                const slot = data.find((s) => s.day === dIdx && s.period === period);
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
    </div>
  );
};

export default TimetableGrid;

