import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTeacherReliefPending, useTeacherReliefConfirmed } from '../../hooks/useTeacherData';
import ReliefRequestCard from '../../components/teacher/ReliefRequestCard';

const TABS = ['Pending', 'Confirmed', 'History'];

const CompletedRow = ({ duty, i }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.05 }}
    className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
  >
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Calendar size={14} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-bold text-gray-800">{duty.subject}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{duty.date} · Period {duty.period} · {duty.room}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-[10px] font-semibold text-gray-600">{duty.relieving}</p>
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">
        Confirmed
      </span>
    </div>
  </motion.div>
);

const EmptyState = ({ label }) => (
  <div className="text-center py-14 text-gray-400">
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
      <Calendar size={20} className="text-gray-300" />
    </div>
    <p className="text-[12px] font-semibold">{label}</p>
  </div>
);

export default function MyReliefDuties() {
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: pendingData,
    loading: pendingLoading,
    refetch: refetchPending,
  } = useTeacherReliefPending();

  const {
    data: confirmedData,
    loading: confirmedLoading,
  } = useTeacherReliefConfirmed();

  // Map pending API data → ReliefRequestCard shape
  const pending = (pendingData ?? []).map((r) => ({
    id:            r.id,
    absentTeacher: r.absentTeacher ?? '—',
    subject:       r.subject ?? '—',
    class:         r.class ?? '—',
    day:           r.day ?? '—',
    period:        r.period ?? '—',
    date:          r.date ?? '',
    deadline:      r.deadline ?? null,
    urgency:       null,
  }));

  const confirmed = (confirmedData ?? []).map((r) => ({
    id:        r.id,
    date:      r.day ?? '',
    subject:   r.subject && r.class ? `${r.subject} (${r.class})` : (r.subject ?? '—'),
    room:      r.room ?? 'TBD',
    relieving: r.originalTeacher ?? r.absentTeacher ?? '—',
    period:    r.period ?? '—',
  }));

  const isLoading = pendingLoading || confirmedLoading;

  const handleResponded = useCallback(() => {
    if (typeof refetchPending === 'function') refetchPending();
  }, [refetchPending]);

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5 py-4">
      <div className="max-w-[900px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[18px] font-bold text-gray-900">My Relief Duties</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  activeTab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                {i === 0 && pending.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-[12px] text-gray-400">
            Loading relief duties…
          </div>
        )}

        {/* PENDING TAB — uses ReliefRequestCard with full accept/reject/flag */}
        {!isLoading && activeTab === 0 && (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <EmptyState label="No pending relief requests" />
            ) : (
              pending.map((r) => (
                <ReliefRequestCard
                  key={r.id}
                  request={r}
                  onResponded={handleResponded}
                />
              ))
            )}
          </div>
        )}

        {/* CONFIRMED TAB */}
        {!isLoading && activeTab === 1 && (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-[12px] font-bold text-gray-700 mb-3">Confirmed Relief Duties</h3>
            {confirmed.length === 0 ? (
              <EmptyState label="No confirmed duties yet" />
            ) : (
              confirmed.map((d, i) => (
                <CompletedRow key={d.id} duty={d} i={i} />
              ))
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {!isLoading && activeTab === 2 && (
          <EmptyState label="Full history coming soon" />
        )}

        {/* Stats footer */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total Relief Hours This Week',  value: '4h' },
            { label: 'Total Relief Hours This Month', value: '8h' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
            >
              <p className="text-[11px] text-gray-500 font-medium">{s.label}:</p>
              <p className="text-[14px] font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}