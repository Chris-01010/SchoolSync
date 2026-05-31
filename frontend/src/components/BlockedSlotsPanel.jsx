import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, X, CheckCircle, AlertCircle } from "lucide-react";

const API = "http://localhost:8000/api/v1";  // keep this for now since no proxy

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const PERIOD_LABELS = {
  1: "08:00–09:00",
  2: "09:00–10:00",
  3: "10:00–11:00",
  4: "11:00–12:00",
  5: "12:00–13:00",
  6: "13:00–14:00",
  7: "14:00–15:00",
  8: "15:00–16:00",
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-white
          ${type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
      >
        {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {msg}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Slot Cell ─────────────────────────────────────────────────────────────────
function SlotCell({ slot, onRemove, removing }) {
  if (slot.is_hod_locked) {
    return (
      <div className="flex min-h-[64px] flex-col items-center justify-center rounded-lg bg-gray-100 border border-dashed border-gray-300 gap-1">
        <Lock size={13} className="text-gray-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          HOD Locked
        </span>
      </div>
    );
  }

  if (slot.is_blocked) {
    return (
      <div
        className="relative flex min-h-[64px] flex-col justify-center rounded-lg bg-gray-200 border border-gray-300 px-2.5 py-2 group"
        title={slot.reason || "Blocked"}
      >
        {/* reason */}
        <p className="text-[11px] font-semibold text-gray-600 leading-tight line-clamp-2">
          {slot.reason || "Blocked"}
        </p>
        {/* remove button */}
        <button
          disabled={removing}
          onClick={() => onRemove(slot.block_id)}
          className="mt-1.5 flex items-center gap-1 self-start rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
        >
          <X size={10} />
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[64px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white">
      <span className="text-[11px] italic text-gray-300">Free</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BlockedSlotsPanel() {
  const [teachers, setTeachers]     = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [schedule, setSchedule]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [removing, setRemoving]     = useState(null); // blockId being removed
  const [toast, setToast]           = useState(null); // { msg, type }

  // fetch teachers list
  useEffect(() => {
    fetch(`${API}/blocked-slots/teachers-list`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => setTeachers(Array.isArray(data) ? data : []))
      .catch(() => showToast("Could not load teachers", "error"));

    
  }, []);

  // fetch week when teacher changes
  useEffect(() => {
    if (!selectedId) { setSchedule([]); return; }
    setLoading(true);
    fetch(`${API}/blocked-slots/week/${selectedId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => setSchedule(data.schedule || []))
      .catch(() => showToast("Could not load schedule", "error"))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // HOD remove block
  const handleRemove = useCallback(async (blockId) => {
    if (!window.confirm("Remove this block permanently? The slot will be HOD-locked.")) return;
    setRemoving(blockId);
    try {
      const res = await fetch(`${API}/blocked-slots/${blockId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 404) { showToast("Block not found", "error"); return; }
      if (!res.ok)            { showToast("Failed to remove block", "error"); return; }

      // update local state — turn that slot to locked
      setSchedule((prev) =>
        prev.map((day) => ({
          ...day,
          slots: day.slots.map((s) =>
            s.block_id === blockId
              ? { ...s, is_blocked: false, is_hod_locked: true, block_id: null, reason: null }
              : s
          ),
        }))
      );
      showToast("Block removed. Slot is now HOD-locked.");
    } catch {
      showToast("Network error", "error");
    } finally {
      setRemoving(null);
    }
  }, []);

  // build lookup: day_index → { period → slot }
  const slotMap = {};
  schedule.forEach((dayObj) => {
    slotMap[dayObj.day] = {};
    (dayObj.slots || []).forEach((s) => { slotMap[dayObj.day][s.period] = s; });
  });

  const blockedCount = schedule.flatMap((d) => d.slots).filter((s) => s.is_blocked).length;
  const lockedCount  = schedule.flatMap((d) => d.slots).filter((s) => s.is_hod_locked).length;

  return (
    <div className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Blocked Slot Management</h2>
          <p className="text-[13px] text-gray-400">View and remove teacher-blocked periods</p>
        </div>
        {selectedId && !loading && (
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
              {blockedCount} blocked
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
              {lockedCount} HOD-locked
            </span>
          </div>
        )}
      </div>

      {/* Teacher selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Select Teacher</label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">— Select a teacher —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading schedule…
        </div>
      )}

      {/* Grid */}
      {!loading && selectedId && schedule.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-28 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
                  Period
                </th>
                {DAYS.map((d) => (
                  <th key={d} className="px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-700">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-gray-500">P{period}</p>
                    <p className="text-[10px] text-gray-300">{PERIOD_LABELS[period]}</p>
                  </td>
                  {/* day indices 0–4 = Mon–Fri */}
                  {[0, 1, 2, 3, 4].map((dayIdx) => {
                    const slot = slotMap[dayIdx]?.[period] ?? {
                      period,
                      is_blocked: false,
                      is_hod_locked: false,
                    };
                    return (
                      <td key={dayIdx} className="px-2 py-2">
                        <SlotCell
                          slot={slot}
                          onRemove={handleRemove}
                          removing={removing === slot.block_id}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && !selectedId && (
        <p className="text-center text-sm italic text-gray-300 py-6">
          Select a teacher to view their blocked slots.
        </p>
      )}

      {/* Legend */}
      {!loading && selectedId && (
        <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-[3px] bg-gray-200 border border-gray-300" />
            Blocked by teacher
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-[3px] bg-gray-100 border border-dashed border-gray-300" />
            HOD-locked (cannot re-block)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-[3px] border border-dashed border-gray-200 bg-white" />
            Free
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// helper — reads JWT from localStorage (matches your AuthContext pattern)
function getToken() {
  return localStorage.getItem("schoolsync_token") || "";
}