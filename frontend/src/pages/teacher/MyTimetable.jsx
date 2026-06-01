import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, X, ChevronRight, Lock, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const API = 'http://localhost:8000/api/v1';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_INDEX = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };

const TIMES = [
  { period: 1, label: '08:30', end: '09:40' },
  { period: 2, label: '09:40', end: '10:40' },
  { label: 'MORNING BREAK', isBreak: true, breakLabel: '10:40 – 11:00' },
  { period: 3, label: '11:00', end: '12:00' },
  { label: 'LUNCH BREAK', isBreak: true, breakLabel: '12:00 – 13:00' },
  { period: 4, label: '13:00', end: '14:00' },
  { period: 5, label: '14:00', end: '15:00' },
  { label: 'AFTERNOON BREAK', isBreak: true, breakLabel: '15:00 – 15:15' },
  { period: 6, label: '15:15', end: '16:15' },
];

const CELL_CONFIG = {
  regular: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', sub: 'text-blue-500', badge: null },
  free: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-400', sub: 'text-gray-300', badge: null },
  relief: { bg: 'bg-amber-50 border-amber-300 border-dashed', text: 'text-amber-800', sub: 'text-amber-500', badge: 'Substitute', badgeColor: 'bg-amber-100 text-amber-700' },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </motion.div>
  );
}

function BlockModal({ slot, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center"><ShieldAlert size={18} className="text-orange-500" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Block This Period</h3>
            <p className="text-[11px] text-gray-400">{slot.dayKey} · Period {slot.period} · {slot.time}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Reason <span className="text-red-400">*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Medical appointment, Personal leave…" rows={3}
            className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 resize-none placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10" />
        </div>
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] text-amber-700">
          ⚠ The HOD can remove this block at any time. Once removed, you cannot re-block this slot.
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button disabled={!reason.trim() || submitting} onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-[12px] font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {submitting ? 'Blocking…' : 'Block Period'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TimetableCell({ cell, dayKey, period, time, onBlockClick, blockedMap, lockedMap }) {
  const dayIdx = DAY_INDEX[dayKey];
  const key = `${dayIdx}-${period}`;
  const isBlocked = blockedMap[key];
  const isLocked = lockedMap[key];

  if (isLocked) {
    return (
      <div className="h-[72px] bg-gray-100 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1">
        <Lock size={12} className="text-gray-400" />
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">HOD Locked</span>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="h-[72px] bg-orange-50 border border-orange-200 rounded-lg flex flex-col items-center justify-center gap-1">
        <ShieldAlert size={13} className="text-orange-400" />
        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide">Blocked</span>
        <span className="text-[8px] text-orange-400 px-1 text-center truncate w-full">{isBlocked.reason || ''}</span>
      </div>
    );
  }

  if (!cell || cell.type === 'free') {
    const cfg = CELL_CONFIG.free;
    return (
      <div className={`h-[72px] border rounded-lg flex flex-col items-center justify-center gap-1 group relative ${cfg.bg}`}>
        <span className={`text-[10px] font-medium ${cfg.text}`}>Free</span>
        <button onClick={() => onBlockClick({ dayKey, period, time })}
          className="absolute inset-0 w-full h-full rounded-lg bg-orange-500/0 hover:bg-orange-500/10 flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">+ Block</span>
        </button>
      </div>
    );
  }

  const cfg = CELL_CONFIG[cell.type] ?? CELL_CONFIG.regular;
  return (
    <div className={`h-[72px] border rounded-lg p-2 flex flex-col justify-between overflow-hidden ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-1">
        <p className={`text-[11px] font-bold leading-tight truncate ${cfg.text}`}>{cell.subject}</p>
        {cfg.badge && <span className={`text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${cfg.badgeColor}`}>{cfg.badge}</span>}
      </div>
      <div>
        {cell.class && <p className={`text-[10px] font-medium truncate ${cfg.sub}`}>{cell.class}</p>}
        {cell.room && <p className={`text-[9px] truncate ${cfg.sub}`}>{cell.room}</p>}
      </div>
    </div>
  );
}

export default function MyTimetable() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week');
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [modalSlot, setModalSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [blockedMap, setBlockedMap] = useState({});
  const [lockedMap, setLockedMap] = useState({});
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [myTeacherId, setMyTeacherId] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [teachers, subjects, meta, allSlots] = await Promise.all([
          api.get('/api/v1/teachers'),
          api.get('/api/v1/subjects'),
          api.get('/timetable/meta'),
          api.get('/timetable/slots'),
        ]);
        const teachersArr = Array.isArray(teachers) ? teachers : [];
        const subjectsArr = Array.isArray(subjects) ? subjects : [];
        const rooms = meta?.rooms || [];
        const classes = meta?.classes || [];

        const myTeacher = teachersArr.find(t => String(t.email).toLowerCase() === String(user?.email).toLowerCase());
        if (!myTeacher) { setLoading(false); return; }
        setMyTeacherId(myTeacher.id);
        window._myTeacherId = myTeacher.id;

        const subjMap = {}; subjectsArr.forEach(s => subjMap[s.id] = s.name);
        const roomMap = {}; rooms.forEach(r => roomMap[r.id] = r.name);
        const classMap = {}; classes.forEach(c => classMap[c.id] = c.name);
        const teacherMap = {}; teachersArr.forEach(t => teacherMap[t.id] = t.name);

        const slots = Array.isArray(allSlots) ? allSlots : [];
        const mySlots = slots.filter(s => String(s.teacher_id) === String(myTeacher.id));

        const shaped = {};
        DAY_KEYS.forEach(d => { shaped[d] = {}; });
        mySlots.forEach(s => {
          const dayKey = DAY_KEYS[s.day_of_week];
          if (!dayKey) return;
          shaped[dayKey][s.period] = {
            type: s.is_relief ? 'relief' : 'regular',
            subject: subjMap[s.subject_id] || 'Subject',
            class: classMap[s.class_id] || '',
            room: roomMap[s.room_id] || '',
            originalTeacher: s.is_relief ? teacherMap[s.original_teacher_id] : null,
          };
        });
        setTimetable(shaped);

        // Load blocked slots
        try {
          const blockedRes = await fetch(`${API}/blocked-slots/week/${myTeacher.id}`);
          if (blockedRes.ok) {
            const data = await blockedRes.json();
            const bMap = {}; const lMap = {};
            (data?.schedule || []).forEach(dayObj => {
              (dayObj.slots || []).forEach(slot => {
                const k = `${dayObj.day}-${slot.period}`;
                if (slot.is_blocked) bMap[k] = { reason: slot.reason, blockId: slot.block_id };
                if (slot.is_hod_locked) lMap[k] = true;
              });
            });
            setBlockedMap(bMap);
            setLockedMap(lMap);
          }
        } catch {}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) loadAll();
  }, [user?.email]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleBlockConfirm = async (reason) => {
    if (!modalSlot || !myTeacherId) {
      showToast('Could not identify your teacher profile', 'error');
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem('schoolsync_token') || '';
    const dayIdx = DAY_INDEX[modalSlot.dayKey];
    try {
      const res = await fetch(`${API}/blocked-slots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacher_id: myTeacherId, day: dayIdx, period: modalSlot.period, reason }),
      });
      if (res.status === 423) { showToast('This slot is HOD-locked.', 'error'); return; }
      if (res.status === 409) { showToast('Already blocked.', 'error'); return; }
      if (!res.ok) { showToast('Failed to block. Try again.', 'error'); return; }
      const data = await res.json();
      const k = `${dayIdx}-${modalSlot.period}`;
      setBlockedMap(prev => ({ ...prev, [k]: { reason, blockId: data.id } }));
      showToast('Period blocked successfully.');
      setModalSlot(null);
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1280px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">My Timetable</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Academic Year 2025–2026 · Term 2</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {['Day', 'Week', 'Today'].map((v) => (
            <button key={v} onClick={() => setViewMode(v.toLowerCase())}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${viewMode === v.toLowerCase() ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl text-[11px] text-orange-700">
        <ShieldAlert size={13} />
        Hover over a <strong className="mx-1">Free</strong> slot and click <strong className="mx-1">+ Block</strong> to mark yourself unavailable.
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by subject, class, or room..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 bg-white">
          <Download size={13} /> Download PDF
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
          <div className="px-2 py-2.5 border-r border-gray-100"><span className="text-[10px] text-gray-400 font-medium">Time</span></div>
          {DAYS.map((d, i) => (
            <div key={d} className={`px-2 py-2.5 text-center border-r border-gray-100 last:border-0 cursor-pointer ${selectedDay === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedDay(i)}>
              <p className={`text-[11px] font-bold ${selectedDay === i ? 'text-blue-700' : 'text-gray-700'}`}>{d}</p>
            </div>
          ))}
        </div>
        <div>
          {loading ? (
            <div className="py-16 text-center text-[12px] text-gray-400">Loading timetable…</div>
          ) : (
            TIMES.map((slot, si) => {
              if (slot.isBreak) {
                const isLunch = slot.label === 'LUNCH BREAK';
                return (
                  <div key={`break-${si}`} className="grid border-b border-gray-100 bg-gray-50" style={{ gridTemplateColumns: '64px 1fr' }}>
                    <div className="px-2 py-2 border-r border-gray-100 flex items-center">
                      <span className="text-[9px] text-gray-400 font-medium">{slot.breakLabel?.split(' – ')[0] ?? ''}</span>
                    </div>
                    <div className="flex items-center justify-center py-2 gap-2">
                      <span className="text-gray-400">{isLunch ? '🍴' : '☕'}</span>
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{slot.label}</span>
                      {slot.breakLabel && <span className="text-[9px] text-gray-400 font-medium">· {slot.breakLabel}</span>}
                    </div>
                  </div>
                );
              }
              return (
                <div key={slot.period} className="grid border-b border-gray-100 last:border-0" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
                  <div className="px-2 py-2 border-r border-gray-100 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-700">{slot.label}</p>
                    <p className="text-[9px] text-gray-400">{slot.end}</p>
                  </div>
                  {DAY_KEYS.map((dayKey) => {
                    const cell = timetable[dayKey]?.[slot.period];
                    const match = !search || (cell && [cell.subject, cell.class, cell.room].join(' ').toLowerCase().includes(search.toLowerCase()));
                    return (
                      <div key={dayKey} className={`p-1.5 border-r border-gray-100 last:border-0 transition-opacity ${search && !match ? 'opacity-20' : 'opacity-100'}`}>
                        <TimetableCell cell={cell} dayKey={dayKey} period={slot.period} time={`${slot.label}–${slot.end}`}
                          onBlockClick={setModalSlot} blockedMap={blockedMap} lockedMap={lockedMap} />
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalSlot && <BlockModal slot={modalSlot} onClose={() => setModalSlot(null)} onConfirm={handleBlockConfirm} submitting={submitting} />}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}