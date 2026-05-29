import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Filter } from 'lucide-react';

const RELIEF_DATA = [
  { period: 1, substitute: 'Mr. Smith',   absent: 'Dr. Johnson',  class: '10A', status: 'assigned'   },
  { period: 2, substitute: null,           absent: 'Ms. Williams', class: '9C',  status: 'unassigned' },
  { period: 3, substitute: 'YOU (Relief)', absent: 'Dr. Patel',   class: '10B', status: 'you'        },
  { period: 4, substitute: 'Ms. Kumar',    absent: 'Mr. Das',      class: '11A', status: 'assigned'   },
  { period: 5, substitute: null,           absent: 'Dr. Mehta',    class: '9A',  status: 'unassigned' },
];

const STATUS_CFG = {
  assigned:   { label: '✅ Assigned',   row: '',           badge: 'bg-emerald-50 text-emerald-700' },
  unassigned: { label: '⚠️ Unassigned', row: 'bg-red-50/40', badge: 'bg-red-50 text-red-600'     },
  you:        { label: '🔄 Your Duty',  row: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700'    },
};

export default function ReliefTimetable() {
  const [filter, setFilter] = useState('All');
  const FILTERS = ['All', 'My Reliefs', 'Unassigned'];

  const data = filter === 'My Reliefs'
    ? RELIEF_DATA.filter((r) => r.status === 'you')
    : filter === 'Unassigned'
    ? RELIEF_DATA.filter((r) => r.status === 'unassigned')
    : RELIEF_DATA;

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5 py-4">
      <div className="max-w-[900px] mx-auto space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">Public Relief Timetable</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Institution-wide relief schedule for today</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                             text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-gray-400" />
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-[12px] font-bold text-gray-700">
              Monday, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Horizontally scrollable on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Period', 'Substitute Teacher', 'Absent Teacher', 'Class', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row) => {
                  const cfg = STATUS_CFG[row.status];
                  return (
                    <tr key={row.period} className={`transition-colors hover:bg-gray-50/50 ${cfg.row}`}>
                      <td className="px-4 py-3 text-[12px] font-bold text-gray-700">P{row.period}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-700">
                        {row.substitute ?? <span className="text-red-400 italic text-[11px]">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{row.absent}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{row.class}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-10 text-[12px] text-gray-400 font-semibold">
              No entries match this filter
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">Your relief assignments are highlighted in blue.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}