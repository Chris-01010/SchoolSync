import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Filter } from 'lucide-react';

const TOKEN_KEY = 'schoolsync_token';

const STATUS_CFG = {
  ACCEPTED:   { label: '✅ Accepted',    row: '',           badge: 'bg-emerald-50 text-emerald-700' },
  PENDING:    { label: '⏳ Pending',     row: 'bg-yellow-50/40', badge: 'bg-yellow-50 text-yellow-600' },
  REJECTED:   { label: '❌ Rejected',    row: 'bg-red-50/40',   badge: 'bg-red-50 text-red-600' },
  FLAGGED:    { label: '🚩 Flagged',     row: 'bg-orange-50/40', badge: 'bg-orange-50 text-orange-600' },
  you:        { label: '🔄 Your Duty',   row: 'bg-blue-50',     badge: 'bg-blue-100 text-blue-700' },
};

export default function ReliefTimetable() {
  const [filter, setFilter] = useState('All');
  const [reliefs, setReliefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const FILTERS = ['All', 'My Reliefs', 'Pending'];

  const fetchReliefs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('http://localhost:8000/teachers/me/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      // Combine relief duties and pending requests
      const pending = data.pending_requests?.filter(r => r.type === 'relief_request') || [];
      const duties = data.relief_duties || [];
      setReliefs([...pending, ...duties]);
    } catch (err) {
      console.error('Failed to fetch relief timetable', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReliefs();
  }, []);

  const filtered = filter === 'My Reliefs'
    ? reliefs.filter(r => r.status === 'ACCEPTED' || r.status === 'accepted')
    : filter === 'Pending'
    ? reliefs.filter(r => r.status === 'PENDING' || r.status === 'pending' || r.type === 'relief_request')
    : reliefs;

  return (
    <div className="max-w-[900px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Relief Timetable</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Your relief assignments and duties</p>
        </div>
        <button
          onClick={fetchReliefs}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                     text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-gray-400" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[12px] font-bold text-gray-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[12px] text-gray-400 font-semibold">
            No relief assignments found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Period', 'Class', 'Absent Teacher', 'Date', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((row, i) => {
                const status = row.status?.toUpperCase() || 'PENDING';
                const cfg = STATUS_CFG[status] || STATUS_CFG['PENDING'];
                return (
                  <tr key={row.id || i} className={`transition-colors hover:bg-gray-50/50 ${cfg.row}`}>
                    <td className="px-4 py-3 text-[12px] font-bold text-gray-700">
                      P{row.period || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">
                      {row.class_name || row.class || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">
                      {row.absent_teacher || row.message || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">
                      {row.date || 'Today'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-gray-400">
            Accepted relief assignments are highlighted in blue.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

