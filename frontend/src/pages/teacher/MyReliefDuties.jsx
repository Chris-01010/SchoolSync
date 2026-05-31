import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, MapPin, User, BookOpen, Calendar } from 'lucide-react';
import { useTeacherReliefPending, useTeacherReliefConfirmed } from '../../hooks/useTeacherData';

const TABS = ['Upcoming', 'Completed', 'History'];

const UpcomingCard = ({ duty }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <Calendar size={12} className="text-orange-500" />
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{duty.date}</span>
      </div>
      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
        <MoreVertical size={14} />
      </button>
    </div>
    <h3 className="text-[15px] font-bold text-gray-900 mb-2">{duty.subject}</h3>
    <div className="space-y-1.5 mb-4">
      <div className="flex items-center gap-2 text-[11px] text-gray-500"><MapPin size={11} className="text-gray-400" />{duty.room}</div>
      <div className="flex items-center gap-2 text-[11px] text-gray-500"><User size={11} className="text-gray-400" />Relieving: {duty.relieving}</div>
      {duty.notes && <div className="flex items-center gap-2 text-[11px] text-gray-500"><BookOpen size={11} className="text-gray-400" />{duty.notes}</div>}
    </div>
    <div className="flex gap-2">
      {duty.lessonPlanUrl && (
        <button className="flex-1 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors">
          View Lesson Plan
        </button>
      )}
      <button className={`${duty.lessonPlanUrl ? 'px-3' : 'flex-1'} py-2 border border-gray-200 text-[11px] font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors`}>
        Details
      </button>
    </div>
  </motion.div>
);

const CompletedRow = ({ duty, i }) => (
  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
    className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Calendar size={14} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-bold text-gray-800">{duty.subject}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{duty.date} · Period {duty.period} · {duty.room}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-[10px] font-semibold text-gray-600">{duty.relieving}</p>
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">Completed</span>
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
  const { data: upcomingData,  loading: upcomingLoading  } = useTeacherReliefPending();
  const { data: completedData, loading: completedLoading } = useTeacherReliefConfirmed();

  const upcoming = (upcomingData ?? []).map((r) => ({
    id: r.id,
    date: r.day && r.period ? `${r.day} Period ${r.period}` : (r.day ?? 'TBD'),
    subject: r.subject && r.class ? `${r.subject} (${r.class})` : (r.subject ?? '—'),
    room: r.room ?? 'TBD',
    relieving: r.absentTeacher ?? r.originalTeacher ?? '—',
    notes: r.notes ?? null,
  }));

  const completed = (completedData ?? []).map((r) => ({
    id: r.id,
    date: r.day ?? '',
    subject: r.subject && r.class ? `${r.subject} (${r.class})` : (r.subject ?? '—'),
    room: r.room ?? 'TBD',
    relieving: r.originalTeacher ?? r.absentTeacher ?? '—',
    period: r.period ?? '—',
  }));

  const isLoading = upcomingLoading || completedLoading;

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5 py-4">
      <div className="max-w-[900px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[18px] font-bold text-gray-900">My Relief Duties</h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  activeTab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t}
                {i === 0 && upcoming.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                    {upcoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="text-center py-12 text-[12px] text-gray-400">Loading relief duties…</div>}

        {!isLoading && activeTab === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.length === 0 ? (
              <div className="col-span-2"><EmptyState label="No other upcoming duties for this week" /></div>
            ) : (
              <>
                {upcoming.map((d) => <UpcomingCard key={d.id} duty={d} />)}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 min-h-[160px]">
                  <div className="text-center text-gray-400">
                    <Calendar size={20} className="mx-auto mb-2 opacity-50" />
                    <p className="text-[11px] font-semibold">No other upcoming duties for this week</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!isLoading && activeTab === 1 && (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-[12px] font-bold text-gray-700 mb-3">Completed Relief Duties</h3>
            {completed.length === 0 ? <EmptyState label="No completed duties" /> : completed.map((d, i) => <CompletedRow key={d.id} duty={d} i={i} />)}
          </div>
        )}

        {!isLoading && activeTab === 2 && <EmptyState label="Full history coming soon" />}

        {/* Stats footer */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total Relief Hours This Week',  value: '4h' },
            { label: 'Total Relief Hours This Month', value: '8h' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
              <p className="text-[11px] text-gray-500 font-medium">{s.label}:</p>
              <p className="text-[14px] font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}