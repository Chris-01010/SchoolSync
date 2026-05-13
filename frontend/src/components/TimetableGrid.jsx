import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

function cellFor(timetable, day, period) {
  return timetable?.[day]?.[period] ?? null;
}

export default function TimetableGrid({ timetable }) {
  const normalized = useMemo(() => {
    return days.map((day) => ({
      day,
      periods: periods.map((p) => ({
        period: p,
        cell: cellFor(timetable, day, p)
      }))
    }));
  }, [timetable]);

  return (
    <div className="overflow-x-auto">
      {/* Mobile: ensure horizontal scroll */}
      <div className="min-w-[800px]">
        <div className="grid grid-cols-9 gap-3">
          {/* header spacer */}
          <div />
          {periods.map((p) => (
            <div key={p} className="text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period</div>
              <div className="text-[14px] font-bold text-slate-900 bg-surface-container-lowest border border-outline-variant rounded-lg py-2">
                {p}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {normalized.map(({ day, periods: pArr }) => (
            <div key={day} className="grid grid-cols-9 gap-3 items-stretch">
              <div className="flex items-center">
                <div className="text-[16px] font-bold text-slate-900">{day}</div>
              </div>

              {pArr.map(({ period, cell }) => {
                if (!cell) {
                  return (
                    <div
                      key={`${day}-${period}`}
                      className="border-2 border-dashed border-outline-variant/80 rounded-xl min-h-[92px] flex items-center justify-center opacity-60"
                    >
                      <span className="text-[14px] font-semibold text-slate-600">Free</span>
                    </div>
                  );
                }

                if (cell.type === 'regular') {
                  return (
                    <motion.div
                      key={`${day}-${period}`}
                      whileHover={{ y: -2, scale: 1.01, zIndex: 10 }}
                      className="relative rounded-xl border border-outline-variant min-h-[92px] bg-surface-container-low"
                      style={{ borderLeftWidth: 4 }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary rounded-l-xl" />
                      <div className="p-3 pl-4 flex flex-col h-full">
                        <div className="text-[12px] font-bold text-slate-900">{cell.subject}</div>
                        <div className="text-[12px] font-semibold text-slate-600 mt-1">{cell.class} · Room {cell.room}</div>
                        <div className="mt-auto text-[12px] font-bold text-slate-500">{cell.teacher ?? ''}</div>
                      </div>
                    </motion.div>
                  );
                }

                if (cell.type === 'relief') {
                  return (
                    <motion.div
                      key={`${day}-${period}`}
                      whileHover={{ y: -2, scale: 1.01, zIndex: 10 }}
                      className="relative rounded-xl border border-secondary min-h-[92px] bg-secondary-fixed"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary rounded-l-xl" />
                      <div className="p-3 pl-4 flex flex-col h-full">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[12px] font-bold text-slate-900">{cell.subject}</div>
                          <AlertTriangle size={16} className="text-secondary" />
                        </div>
                        <div className="text-[12px] font-semibold text-slate-700 mt-1">{cell.class} · {cell.room}</div>
                        <div className="mt-auto text-[12px] font-bold text-secondary">Relief Duty</div>
                      </div>
                    </motion.div>
                  );
                }

                // free / planning
                return (
                  <div
                    key={`${day}-${period}`}
                    className="rounded-xl border-2 border-dashed border-outline-variant/80 min-h-[92px] flex items-center justify-center opacity-60"
                  >
                    <span className="text-[14px] font-semibold text-slate-600">{period % 2 === 0 ? 'Planning' : 'Free'}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

