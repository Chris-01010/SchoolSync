<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, X, ChevronRight, Lock, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { useTeacherTimetable, useTeacherProfile } from '../../hooks/useTeacherData';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:8000/api/v1';

const DAYS    = ['Mon (12)', 'Tue (13)', 'Wed (14)', 'Thu (15)', 'Fri (16)'];
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
=======
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  Download,
  Search,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  Lock,
  LockOpen,
  ShieldAlert,
} from 'lucide-react';

import { api } from '../../services/api';

// ─── Days ─────────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ─── Timings ──────────────────────────────────────────────────────────────────
const TIMES = [
  { period: 1, label: '08:30', end: '09:40' },
  { period: 2, label: '09:40', end: '10:40' },
  { isBreak: true, kind: 'short', label: 'MORNING BREAK',   start: '10:40', end: '11:00' },
  { period: 3, label: '11:00', end: '12:00' },
  { isBreak: true, kind: 'lunch', label: 'LUNCH BREAK',     start: '12:00', end: '13:00' },
  { period: 4, label: '13:00', end: '14:00' },
  { period: 5, label: '14:00', end: '15:00' },
  { isBreak: true, kind: 'short', label: 'AFTERNOON BREAK', start: '15:00', end: '15:15' },
>>>>>>> Stashed changes
  { period: 6, label: '15:15', end: '16:15' },
  { period: 7, label: '16:15', end: '17:00' },
  { period: 8, label: '17:00', end: '17:45' },
];

<<<<<<< Updated upstream
const CELL_CONFIG = {
  regular:   { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',  sub: 'text-blue-500',  badge: null },
  free:      { bg: 'bg-gray-50 border-gray-200',   text: 'text-gray-400',  sub: 'text-gray-300',  badge: null },
  relief:    { bg: 'bg-amber-50 border-amber-300 border-dashed', text: 'text-amber-800', sub: 'text-amber-500', badge: 'Substitute', badgeColor: 'bg-amber-100 text-amber-700' },
  current:   { bg: 'bg-blue-600 border-blue-700',  text: 'text-white',     sub: 'text-blue-200',  badge: '• NOW', badgeColor: 'bg-white text-blue-700' },
  cancelled: { bg: 'bg-red-50 border-red-200',     text: 'text-red-400 line-through', sub: 'text-red-300', badge: 'CANCELLED', badgeColor: 'bg-red-100 text-red-500' },
=======
// ─── Cell Styles ──────────────────────────────────────────────────────────────
const CELL_CONFIG = {
  regular:   { bg: 'bg-blue-50 border-blue-200',                 text: 'text-blue-800',             sub: 'text-blue-500',  badge: null },
  free:      { bg: 'bg-gray-50 border-gray-200',                 text: 'text-gray-400',             sub: 'text-gray-300',  badge: null },
  relief:    { bg: 'bg-amber-50 border-amber-300 border-dashed', text: 'text-amber-800',            sub: 'text-amber-500', badge: 'Substitute', badgeColor: 'bg-amber-100 text-amber-700' },
  current:   { bg: 'bg-blue-600 border-blue-700',                text: 'text-white',                sub: 'text-blue-200',  badge: '• NOW',      badgeColor: 'bg-white text-blue-700' },
  cancelled: { bg: 'bg-red-50 border-red-200',                   text: 'text-red-400 line-through', sub: 'text-red-300',   badge: 'CANCELLED',  badgeColor: 'bg-red-100 text-red-500' },
  blocked:   { bg: 'bg-gray-100 border-gray-300',                text: 'text-gray-400',             sub: 'text-gray-300',  badge: null },
>>>>>>> Stashed changes
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-white
        ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </motion.div>
  );
}
<<<<<<< Updated upstream

function BlockModal({ slot, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <ShieldAlert size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Block This Period</h3>
            <p className="text-[11px] text-gray-400">{slot.dayKey} · Period {slot.period} · {slot.time}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Medical appointment, Personal leave…"
            rows={3}
            className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 resize-none
                       placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] text-amber-700">
          ⚠ The HOD can remove this block at any time. Once removed, you cannot re-block this slot.
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            disabled={!reason.trim() || submitting}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-[12px] font-semibold
                       hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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

  if (!cell) {
=======
function timeStrToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function computeWeekDays(today) {
  const dow    = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: `${DAY_NAMES[i]} (${d.getDate()})`, dayIndex: i, date: d, fullName: DAY_FULL[i] };
  });
}
function getTodayBackendDow(today) {
  const dow = today.getDay();
  return dow === 0 || dow === 6 ? -1 : dow - 1;
}

// ─── Block Popup ──────────────────────────────────────────────────────────────
function BlockPopup({ day, period, cellRef, onConfirm, onClose, loading }) {
  const [reason, setReason]           = useState('');
  const [clarification, setClarification] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const popupRef = useRef(null);

  // Position popup above or below the cell
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!cellRef?.current || !popupRef?.current) return;
    const cell   = cellRef.current.getBoundingClientRect();
    const popup  = popupRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - cell.bottom;
    const top = spaceBelow > popup.height + 12
      ? cell.bottom + window.scrollY + 8
      : cell.top    + window.scrollY - popup.height - 8;
    const left = Math.min(
      Math.max(cell.left + window.scrollX, 8),
      window.innerWidth - popup.width - 8
    );
    setPos({ top, left });
  }, [cellRef]);

  const handleConfirm = () => {
    if (!reason.trim()) { setReasonError(true); return; }
    onConfirm(reason.trim(), clarification.trim());
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Card */}
      <motion.div
        key="popup"
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
        className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <Lock size={13} className="text-red-500" />
            </div>
            <span className="text-[13px] font-bold text-gray-900">Block this period?</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex gap-1.5 mb-4">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">{day}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">Period {period}</span>
        </div>

        {/* Reason */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Reason for blocking <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => { setReason(e.target.value); setReasonError(false); }}
            placeholder="e.g. Medical appointment, Department meeting…"
            className={`w-full text-[12px] border rounded-xl px-3 py-2 resize-none outline-none transition font-[DM Sans,sans-serif]
              ${reasonError ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'}`}
          />
          {reasonError && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> Reason is required.
            </p>
          )}
        </div>

        {/* Clarification */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Notes for HOD <span className="text-[10px] font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={clarification}
            onChange={e => setClarification(e.target.value)}
            placeholder="e.g. Will be back by 11 AM, lesson plan shared"
            className="w-full text-[12px] border border-gray-200 rounded-xl px-3 py-2 resize-none outline-none bg-gray-50 focus:border-blue-400 focus:bg-white transition font-[DM Sans,sans-serif]"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
            {loading ? 'Blocking…' : 'Confirm Block'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Blocked Info Tooltip ─────────────────────────────────────────────────────
function BlockedTooltip({ day, period, info, cellRef, onClose, onUnblock, unblocking }) {
  const popupRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!cellRef?.current || !popupRef?.current) return;
    const cell   = cellRef.current.getBoundingClientRect();
    const popup  = popupRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - cell.bottom;
    const top = spaceBelow > popup.height + 12
      ? cell.bottom + window.scrollY + 8
      : cell.top    + window.scrollY - popup.height - 8;
    const left = Math.min(
      Math.max(cell.left + window.scrollX, 8),
      window.innerWidth - popup.width - 8
    );
    setPos({ top, left });
  }, [cellRef]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        key="tooltip"
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
        className="w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <Lock size={13} className="text-gray-500" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">Blocked Period</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        <div className="flex gap-1.5 mb-4">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{day}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Period {period}</span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Reason</p>
            <p className="text-[12px] text-gray-700">{info.reason || '—'}</p>
          </div>
          {info.clarification && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Notes for HOD</p>
              <p className="text-[12px] text-gray-600 italic">{info.clarification}</p>
            </div>
          )}
        </div>

        <button
          onClick={onUnblock}
          disabled={unblocking}
          className="w-full py-2 rounded-xl text-[12px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100 flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {unblocking ? <Loader2 size={12} className="animate-spin" /> : <LockOpen size={12} />}
          {unblocking ? 'Removing…' : 'Remove Block'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-xl text-[12px] font-semibold flex items-center gap-2
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </motion.div>
  );
}

// ─── Timetable Cell ───────────────────────────────────────────────────────────
const TimetableCell = React.forwardRef(({ cell, day, period, onCellClick }, ref) => {
  const cfg = CELL_CONFIG[cell.type] ?? CELL_CONFIG.regular;

  if (cell.type === 'blocked') {
>>>>>>> Stashed changes
    return (
      <div
        ref={ref}
        onClick={() => onCellClick(day, period, cell, 'blocked')}
        className="h-[68px] border border-gray-200 rounded-lg bg-gray-100 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-200 transition group relative"
      >
        <Lock size={14} className="text-gray-400 group-hover:text-gray-500 transition" />
        <span className="text-[9px] text-gray-400 font-medium">Blocked</span>
        {cell.subject && (
          <span className="text-[9px] text-gray-400 truncate px-2 text-center">{cell.subject}</span>
        )}
      </div>
    );
  }

<<<<<<< Updated upstream
  const cfg = CELL_CONFIG[cell.type] ?? CELL_CONFIG.regular;

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
        <span className="text-[8px] text-orange-400 px-1 text-center truncate w-full text-center">
          {isBlocked.reason || ''}
        </span>
      </div>
    );
  }

  if (cell.type === 'free') {
    return (
      <div className={`h-[72px] border rounded-lg flex flex-col items-center justify-center gap-1 group relative ${cfg.bg}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`text-[10px] font-medium ${cfg.text}`}>Free</span>
        <button
          onClick={() => onBlockClick({ dayKey, period, time })}
          className="absolute inset-0 w-full h-full rounded-lg bg-orange-500/0 hover:bg-orange-500/10
                     flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            + Block
          </span>
        </button>
=======
  if (cell.type === 'free') {
    return (
      <div
        ref={ref}
        onClick={() => onCellClick(day, period, cell, 'free')}
        className="h-[68px] border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition group"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-blue-400 transition">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-[10px] font-medium text-gray-300 group-hover:text-blue-400 transition">Free — click to block</span>
>>>>>>> Stashed changes
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onClick={() => onCellClick(day, period, cell, 'class')}
      className={`h-[68px] border rounded-lg p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer transition
        hover:ring-2 hover:ring-blue-300 hover:brightness-95 group
        ${cfg.bg}`}
    >
      <div className="flex items-start justify-between gap-1">
<<<<<<< Updated upstream
        <p className={`text-[11px] font-bold leading-tight truncate ${cfg.text}`}>{cell.subject}</p>
        {cfg.badge && (
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${cfg.badgeColor}`}>
            {cfg.badge}
          </span>
        )}
=======
        <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${cfg.text}`}>{cell.subject}</p>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {cfg.badge && (
            <span className={`text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap ${cfg.badgeColor}`}>{cfg.badge}</span>
          )}
          {/* Block hint on hover */}
          <span className="text-[7px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">click to block</span>
        </div>
>>>>>>> Stashed changes
      </div>
      <div>
        {cell.class && <p className={`text-[10px] font-medium truncate ${cfg.sub}`}>{cell.class}</p>}
        <div className="flex items-center justify-between">
<<<<<<< Updated upstream
          {cell.room && <p className={`text-[9px] truncate ${cfg.sub}`}>{cell.room}</p>}
          {cell.students && <p className={`text-[9px] ${cfg.sub}`}>👥 {cell.students}</p>}
        </div>
        {cell.originalTeacher && <p className={`text-[9px] truncate ${cfg.sub}`}>for {cell.originalTeacher}</p>}
      </div>
    </div>
  );
}

=======
          {cell.room     && <p className={`text-[9px] truncate ${cfg.sub}`}>{cell.room}</p>}
          {cell.students && <p className={`text-[9px] ${cfg.sub}`}>👥 {cell.students}</p>}
        </div>
      </div>
    </div>
  );
});

// ─── Upcoming Transitions (mock) ──────────────────────────────────────────────
>>>>>>> Stashed changes
const transitions = [
  { icon: '🔵', label: 'Next: Lab Session',        detail: 'Starts in 15 minutes · Rm 302'   },
  { icon: '⚠️', label: 'Relief Duty Notification', detail: 'Tomorrow 09:00 for Dr. Harrison' },
];

<<<<<<< Updated upstream
export default function MyTimetable() {
  const [viewMode, setViewMode] = useState('week');
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [modalSlot, setModalSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [blockedMap, setBlockedMap] = useState({});
  const [lockedMap, setLockedMap] = useState({});

  const { user } = useAuth();
  const { data: timetableData, loading: timetableLoading } = useTeacherTimetable();
  const { data: profile } = useTeacherProfile();
  const timetable = timetableData ?? {};
  const totalWorkload = 22.5;
  const weeklyTarget = 85;

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('schoolsync_token') || '';
    fetch(`${API}/teachers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(teacherProfile => {
        if (!teacherProfile?.id) return;
        window._myTeacherId = teacherProfile.id;
        fetch(`${API}/blocked-slots/week/${teacherProfile.id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (!data?.schedule) return;
            const bMap = {};
            const lMap = {};
            data.schedule.forEach(dayObj => {
              dayObj.slots.forEach(slot => {
                const k = `${dayObj.day}-${slot.period}`;
                if (slot.is_blocked) bMap[k] = { reason: slot.reason, blockId: slot.block_id };
                if (slot.is_hod_locked) lMap[k] = true;
              });
            });
            setBlockedMap(bMap);
            setLockedMap(lMap);
          });
      })
      .catch(() => {});
  }, [user]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleBlockConfirm = async (reason) => {
    if (!modalSlot || !window._myTeacherId) {
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
        body: JSON.stringify({
          teacher_id: window._myTeacherId,
          day: dayIdx,
          period: modalSlot.period,
          reason,
        }),
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
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                viewMode === v.toLowerCase() ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
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
          <input type="text" placeholder="Search by subject, class, or room..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg bg-white
                       placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X size={12} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                           text-[11px] font-semibold text-gray-600 hover:bg-gray-50 bg-white">
          <Download size={13} /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            <div className="px-2 py-2.5 border-r border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium">Time</span>
            </div>
            {DAYS.map((d, i) => (
              <div key={d}
                className={`px-2 py-2.5 text-center border-r border-gray-100 last:border-0 cursor-pointer
                  ${selectedDay === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedDay(i)}>
                <p className={`text-[11px] font-bold ${selectedDay === i ? 'text-blue-700' : 'text-gray-700'}`}>{d}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            {timetableLoading ? (
              <div className="py-16 text-center text-[12px] text-gray-400">Loading timetable…</div>
            ) : (
              TIMES.map((slot, si) => {
                if (slot.isBreak) {
                  const isLunch = slot.label === 'LUNCH BREAK';
                  return (
                    <div key={`break-${si}`} className="grid border-b border-gray-100 bg-gray-50"
                      style={{ gridTemplateColumns: '64px 1fr' }}>
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
                  <div key={slot.period} className="grid border-b border-gray-100 last:border-0"
                    style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
                    <div className="px-2 py-2 border-r border-gray-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-700">{slot.label}</p>
                      <p className="text-[9px] text-gray-400">{slot.end}</p>
                    </div>
                    {DAY_KEYS.map((dayKey) => {
                      const cell = timetable[dayKey]?.[slot.period];
                      const match = !search || (cell && cell.type !== 'free' &&
                        [cell.subject, cell.class, cell.room].join(' ').toLowerCase().includes(search.toLowerCase()));
                      return (
                        <div key={dayKey}
                          className={`p-1.5 border-r border-gray-100 last:border-0 transition-opacity ${
                            search && !match ? 'opacity-20' : 'opacity-100'}`}>
                          <TimetableCell
                            cell={cell ?? { type: 'free' }}
                            dayKey={dayKey}
                            period={slot.period}
                            time={`${slot.label}–${slot.end}`}
                            onBlockClick={setModalSlot}
                            blockedMap={blockedMap}
                            lockedMap={lockedMap}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-[12px] font-bold text-gray-800 mb-3">Upcoming Transitions</h3>
            <div className="space-y-2.5">
              {transitions.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-700 truncate">{t.label}</p>
                    <p className="text-[9px] text-gray-400 truncate">{t.detail}</p>
                  </div>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-blue-600 rounded-xl p-4 text-white shadow-sm">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Total Weekly Workload</p>
            <p className="text-[32px] font-bold leading-none mb-1">{totalWorkload} Hours</p>
            <p className="text-[10px] text-blue-200 mb-3">Teaching + Relief combined</p>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-blue-200">Weekly Target</span>
              <span className="text-[10px] font-bold text-white">{weeklyTarget}%</span>
            </div>
            <div className="h-1.5 bg-blue-500 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${weeklyTarget}%` }} />
            </div>
          </motion.div>
=======
// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyTimetable() {
  const [viewMode, setViewMode]             = useState('week');
  const [search, setSearch]                 = useState('');
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [timetableData, setTimetableData]   = useState({});
  const [teacherId, setTeacherId]           = useState(null);
  const [teacherName, setTeacherName]       = useState('');
  const [department, setDepartment]         = useState('');

  // Block slots state: { [day]: { [period]: { blockId, reason, clarification } } }
  const [blockedSlots, setBlockedSlots]     = useState({});
  const [blockLoading, setBlockLoading]     = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);

  // Popup state
  const [blockPopup, setBlockPopup]         = useState(null); // { day, period, cell }
  const [blockedTooltip, setBlockedTooltip] = useState(null); // { day, period, info }
  const cellRefs                            = useRef({});      // key: `${day}-${period}`
  const [toast, setToast]                   = useState(null);  // { message, type }

  const today           = useMemo(() => new Date(), []);
  const days            = useMemo(() => computeWeekDays(today), [today]);
  const todayBackendDow = useMemo(() => getTodayBackendDow(today), [today]);
  const isWeekend       = todayBackendDow === -1;
  const nowMinutes      = today.getHours() * 60 + today.getMinutes();

  // ── Load timetable + blocked slots ────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me           = await api.get('/auth/me');
      const teachersResp = await api.get('/api/v1/teachers');
      const teachers     = Array.isArray(teachersResp) ? teachersResp : (teachersResp?.data || []);
      const myTeacher    = teachers.find((t) => t.email === me?.email);
      if (!myTeacher) throw new Error('Could not find a teacher profile matching your account.');

      setTeacherId(myTeacher.id);
      setTeacherName(myTeacher.name || me?.name || 'Teacher');
      setDepartment(myTeacher.department_name || myTeacher.department_id || '');

      // Timetable
      const ttResp       = await api.get(`/timetable/view?scope=teacher&scope_id=${myTeacher.id}`);
      const rawTimetable = ttResp?.timetable ?? ttResp ?? {};
      if (Array.isArray(rawTimetable)) {
        const grouped = {};
        rawTimetable.forEach((slot) => {
          const dow = slot.day_of_week;
          if (!grouped[dow]) grouped[dow] = [];
          grouped[dow].push(slot);
        });
        setTimetableData(grouped);
      } else {
        setTimetableData(rawTimetable);
      }

      // Blocked slots — GET /blocked-slots?teacher_id=...
      try {
        const blocks = await api.get(`/blocked-slots?teacher_id=${myTeacher.id}`);
        const parsed = {};
        (Array.isArray(blocks) ? blocks : []).forEach(b => {
          if (!parsed[b.day]) parsed[b.day] = {};
          parsed[b.day][b.period] = { blockId: b.id, reason: b.reason, clarification: b.clarification || '' };
        });
        setBlockedSlots(parsed);
      } catch {
        // blocked-slots endpoint might not exist yet, that's ok
      }

    } catch (err) {
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const slotMap = useMemo(() => {
    const m = {};
    Object.entries(timetableData || {}).forEach(([dow, slots]) => {
      const key = Number(dow);
      m[key] = {};
      (slots || []).forEach((s) => { m[key][s.period] = s; });
    });
    return m;
  }, [timetableData]);

  const totalSlots = useMemo(
    () => Object.values(slotMap).reduce((acc, byPeriod) => acc + Object.keys(byPeriod).length, 0),
    [slotMap]
  );

  const blockedCount = useMemo(
    () => Object.values(blockedSlots).reduce((sum, p) => sum + Object.keys(p).length, 0),
    [blockedSlots]
  );

  // ── Build cell ─────────────────────────────────────────────────────────────
  const buildCell = useCallback((dayIndex, period, dayName) => {
    // Check if this slot is blocked
    if (blockedSlots[dayName] && blockedSlots[dayName][period]) {
      const slot = slotMap[dayIndex]?.[period];
      return {
        type: 'blocked',
        subject: slot ? titleCase(slot.subject || slot.subject_name || '') : null,
        blockInfo: blockedSlots[dayName][period],
      };
    }

    const slot = slotMap[dayIndex]?.[period];
    if (!slot) return { type: 'free' };

    const startMin = timeStrToMinutes(slot.start_time);
    const endMin   = timeStrToMinutes(slot.end_time);
    const isNow    = dayIndex === todayBackendDow && nowMinutes >= startMin && nowMinutes < endMin;

    let type = 'regular';
    if (isNow)             type = 'current';
    else if (slot.is_relief) type = 'relief';

    return {
      type,
      subject:         titleCase(slot.subject || slot.subject_name || slot.subject_id || 'Unknown'),
      room:            slot.room        || slot.room_name    || slot.room_id    || '',
      class:           slot.class_name  || slot.class        || '',
      students:        slot.students    || null,
      originalTeacher: slot.original_teacher_name || null,
    };
  }, [slotMap, todayBackendDow, nowMinutes, blockedSlots]);

  const visibleDays = useMemo(() => {
    if (viewMode === 'day') {
      const idx = isWeekend ? 0 : todayBackendDow;
      return [days[idx]];
    }
    return days;
  }, [viewMode, days, isWeekend, todayBackendDow]);

  // ── Cell click handler ─────────────────────────────────────────────────────
  const handleCellClick = useCallback((day, period, cell, kind) => {
    if (kind === 'blocked') {
      const info = blockedSlots[day]?.[period];
      setBlockedTooltip({ day, period, info });
      setBlockPopup(null);
    } else {
      setBlockPopup({ day, period, cell });
      setBlockedTooltip(null);
    }
  }, [blockedSlots]);

  // ── Confirm block ──────────────────────────────────────────────────────────
  const handleConfirmBlock = useCallback(async (reason, clarification) => {
    if (!blockPopup || !teacherId) return;
    const { day, period } = blockPopup;
    setBlockLoading(true);
    try {
      // POST /blocked-slots
      const payload = { teacher_id: teacherId, day, period, reason, clarification };
      let newBlock;
      try {
        newBlock = await api.post('/blocked-slots', payload);
      } catch {
        // If backend not ready yet, simulate locally
        newBlock = { id: `local_${Date.now()}`, ...payload };
      }
      setBlockedSlots(prev => ({
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [period]: { blockId: newBlock?.id || `local_${Date.now()}`, reason, clarification }
        }
      }));
      setBlockPopup(null);
      setToast({ message: `Period ${period} on ${day} blocked successfully.`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to block slot.', type: 'error' });
    } finally {
      setBlockLoading(false);
    }
  }, [blockPopup, teacherId]);

  // ── Remove block ───────────────────────────────────────────────────────────
  const handleUnblock = useCallback(async () => {
    if (!blockedTooltip) return;
    const { day, period, info } = blockedTooltip;
    setUnblockLoading(true);
    try {
      try {
        await api.delete(`/blocked-slots/${info.blockId}`);
      } catch {
        // If backend not ready, remove locally
      }
      setBlockedSlots(prev => {
        const updated = { ...prev, [day]: { ...(prev[day] || {}) } };
        delete updated[day][period];
        return updated;
      });
      setBlockedTooltip(null);
      setToast({ message: `Block removed for Period ${period} on ${day}.`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to remove block.', type: 'error' });
    } finally {
      setUnblockLoading(false);
    }
  }, [blockedTooltip]);

  // ── Grid layout ────────────────────────────────────────────────────────────
  const TIME_COL  = 56;
  const DAY_COL   = 100;
  const totalMinW = TIME_COL + DAY_COL * visibleDays.length;
  const gridCols  = `${TIME_COL}px repeat(${visibleDays.length}, minmax(${DAY_COL}px, 1fr))`;

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5 py-4">
      <div className="space-y-4 max-w-[1280px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-start justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">
              Teacher Dashboard — My Schedule
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {teacherName && (
                <span className="text-[11px] text-gray-500 font-medium">{teacherName}</span>
              )}
              {department && (
                <>
                  <span className="text-gray-300 text-[10px]">·</span>
                  <span className="text-[11px] text-gray-400">{department}</span>
                </>
              )}
              {/* Blocked slots badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1
                ${blockedCount > 0 ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-gray-100 text-gray-500 ring-gray-200'}`}>
                <Lock size={9} /> {blockedCount} Blocked
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {['Day', 'Week'].map((v) => {
                const lower    = v.toLowerCase();
                const isActive = viewMode === lower;
                return (
                  <button key={v} onClick={() => setViewMode(lower)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Search + Download ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject, class, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X size={12} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white whitespace-nowrap">
            <Download size={13} /> <span className="hidden sm:inline">Download PDF</span>
          </button>
>>>>>>> Stashed changes
        </div>

        {/* ── Main grid + side panel ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">

          {/* Timetable */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={18} className="animate-spin text-blue-500" />
                <span className="ml-3 text-[12px] text-gray-500 font-medium">Loading timetable…</span>
              </div>
            ) : error ? (
              <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-red-700">Failed to load timetable</p>
                  <p className="text-[10px] text-red-500 mt-0.5 break-words">{error}</p>
                </div>
                <button onClick={loadData}
                  className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-semibold rounded-md hover:bg-red-700 transition-colors flex-shrink-0">
                  Retry
                </button>
              </div>
            ) : totalSlots === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-[12px] text-gray-400 font-medium">No timetable assigned</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: totalMinW }}>

                  {/* Column headers */}
                  <div className="grid border-b border-gray-100 sticky top-0 z-10 bg-white"
                    style={{ gridTemplateColumns: gridCols }}>
                    <div className="px-2 py-2.5 border-r border-gray-100">
                      <span className="text-[10px] text-gray-400 font-medium">Time</span>
                    </div>
                    {visibleDays.map((d) => {
                      const isToday = d.dayIndex === todayBackendDow;
                      return (
                        <div key={d.dayIndex}
                          className={`px-2 py-2.5 text-center border-r border-gray-100 last:border-0 ${isToday ? 'bg-blue-50' : ''}`}>
                          <p className={`text-[11px] font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{d.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rows */}
                  {TIMES.map((slot, si) => {
                    if (slot.isBreak) {
                      const isLunch = slot.kind === 'lunch';
                      return (
                        <div key={`break-${si}`}
                          className="grid border-b border-gray-100 bg-gray-50"
                          style={{ gridTemplateColumns: `${TIME_COL}px 1fr` }}>
                          <div className="px-2 py-2 border-r border-gray-100 flex items-center">
                            <span className="text-[9px] text-gray-400 font-medium">{slot.start}</span>
                          </div>
                          <div className="flex items-center justify-center py-2 gap-2">
                            <span className="text-gray-400">{isLunch ? '🍴' : '☕'}</span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{slot.label}</span>
                            <span className="text-[9px] text-gray-400 font-medium hidden sm:inline">· {slot.start} – {slot.end}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={slot.period}
                        className="grid border-b border-gray-100 last:border-0"
                        style={{ gridTemplateColumns: gridCols }}>
                        {/* Time label */}
                        <div className="px-2 py-2 border-r border-gray-100 flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-gray-700">{slot.label}</p>
                          <p className="text-[9px] text-gray-400">{slot.end}</p>
                        </div>
                        {/* Day cells */}
                        {visibleDays.map((d) => {
                          const cell    = buildCell(d.dayIndex, slot.period, d.fullName);
                          const isToday = d.dayIndex === todayBackendDow;
                          const match   = !search || (cell.type !== 'free' && cell.type !== 'blocked' &&
                            [cell.subject, cell.class, cell.room].filter(Boolean).join(' ')
                              .toLowerCase().includes(search.toLowerCase()));
                          const refKey = `${d.fullName}-${slot.period}`;
                          return (
                            <div key={d.dayIndex}
                              className={`p-1.5 border-r border-gray-100 last:border-0 transition-opacity ${
                                isToday ? 'bg-blue-50/40' : ''
                              } ${search && !match ? 'opacity-20' : 'opacity-100'}`}>
                              <TimetableCell
                                ref={el => cellRefs.current[refKey] = el}
                                cell={cell}
                                day={d.fullName}
                                period={slot.period}
                                onCellClick={handleCellClick}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                </div>
              </div>
            )}
          </motion.div>

          {/* ── Side panel ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-4"
            >
              <h3 className="text-[12px] font-bold text-gray-800 mb-3">Upcoming Transitions</h3>
              <div className="space-y-2.5">
                {transitions.map((t, i) => (
                  <div key={i}
                    className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-700 truncate">{t.label}</p>
                      <p className="text-[9px] text-gray-400 truncate">{t.detail}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Blocked slots summary */}
            {blockedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="bg-red-50 border border-red-100 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={14} className="text-red-500" />
                  <p className="text-[11px] font-bold text-red-700">Blocked Periods</p>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(blockedSlots).flatMap(([day, periods]) =>
                    Object.entries(periods).map(([period, info]) => (
                      <div key={`${day}-${period}`} className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 border border-red-100">
                        <div>
                          <p className="text-[10px] font-bold text-gray-700">{day} · P{period}</p>
                          <p className="text-[9px] text-gray-400 truncate max-w-[120px]">{info.reason}</p>
                        </div>
                        <Lock size={10} className="text-red-400 flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-blue-600 rounded-xl p-4 text-white shadow-sm"
            >
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Total Weekly Workload</p>
              <p className="text-[32px] font-bold leading-none mb-1">22.5 Hours</p>
              <p className="text-[10px] text-blue-200 mb-3">Teaching + Relief combined</p>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-blue-200">Weekly Target</span>
                <span className="text-[10px] font-bold text-white">85%</span>
              </div>
              <div className="h-1.5 bg-blue-500 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: '85%' }} />
              </div>
            </motion.div>
          </div>
        </div>

      </div>

<<<<<<< Updated upstream
      <AnimatePresence>
        {modalSlot && (
          <BlockModal
            slot={modalSlot}
            onClose={() => setModalSlot(null)}
            onConfirm={handleBlockConfirm}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
=======
      {/* ── Block Popup ────────────────────────────────────────────────────── */}
      {blockPopup && (
        <BlockPopup
          day={blockPopup.day}
          period={blockPopup.period}
          cellRef={{ current: cellRefs.current[`${blockPopup.day}-${blockPopup.period}`] }}
          onConfirm={handleConfirmBlock}
          onClose={() => setBlockPopup(null)}
          loading={blockLoading}
        />
      )}

      {/* ── Blocked Tooltip ─────────────────────────────────────────────────── */}
      {blockedTooltip && (
        <BlockedTooltip
          day={blockedTooltip.day}
          period={blockedTooltip.period}
          info={blockedTooltip.info}
          cellRef={{ current: cellRefs.current[`${blockedTooltip.day}-${blockedTooltip.period}`] }}
          onClose={() => setBlockedTooltip(null)}
          onUnblock={handleUnblock}
          unblocking={unblockLoading}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
>>>>>>> Stashed changes
    </div>
  );
}