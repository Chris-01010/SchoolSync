import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Star,
  Users,
  History,
  Clock,
  Wifi,
  WifiOff,
  Zap,
  SlidersHorizontal,
} from "lucide-react";

const API = "http://localhost:8000";

function getToken() {
  return (
    localStorage.getItem("schoolsync_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Animation variants ────────────────────────────────────────────────────────
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const itemV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};
const modalOverlay = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalContent = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

const statusConfig = {
  pending:    { label: "Pending",          pill: "bg-blue-50 text-blue-700 ring-blue-500/20",          dot: "bg-blue-500" },
  approved:   { label: "Approved",         pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" },
  requested:  { label: "Relief Requested", pill: "bg-indigo-50 text-indigo-700 ring-indigo-500/20",    dot: "bg-indigo-500" },
  covered:    { label: "Covered",          pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" },
  rejected:   { label: "Rejected",         pill: "bg-red-50 text-red-700 ring-red-500/20",             dot: "bg-red-500" },
  flagged:    { label: "Flagged",          pill: "bg-orange-50 text-orange-700 ring-orange-500/20",    dot: "bg-orange-500" },
};

// ── Auto-assign result popup ──────────────────────────────────────────────────
function AutoAssignToast({ results, onClose }) {
  const assigned = results.filter(r => r.status === "assigned");
  const failed   = results.filter(r => r.status === "no_candidate");

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="fixed bottom-6 right-6 z-[200] w-full max-w-sm rounded-2xl bg-white
                 border border-gray-100 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-white" />
          <span className="text-[13px] font-bold text-white">Auto-Assign Complete</span>
        </div>
        <button
          onClick={onClose}
          className="text-indigo-200 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2 max-h-56 overflow-y-auto">
        {assigned.length === 0 && failed.length === 0 && (
          <p className="text-[12px] text-gray-400 text-center py-3">
            All slots already assigned — nothing to do.
          </p>
        )}

        {assigned.map((r) => (
          <div
            key={r.slot_id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100"
          >
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-emerald-800">
                Period {r.period} → <span className="font-bold">{r.teacher_name}</span>
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                Request sent · Score {r.score}
              </p>
            </div>
          </div>
        ))}

        {failed.map((r) => (
          <div
            key={r.slot_id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-100"
          >
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">
                Period {r.period} — No eligible teacher
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Use Override to assign manually
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-[10px] text-gray-400">
          {assigned.length} assigned · {failed.length} need manual override
        </p>
        <button
          onClick={onClose}
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ── ScoreBar & CandidateCard (for Override modal) ─────────────────────────────
function ScoreBar({ label, value, max, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-gray-500">{label}</span>
      <div className="flex-1 rounded-full bg-gray-100 h-1.5">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }}
        />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function CandidateCard({ candidate, rank, selected, onSelect }) {
  const b = candidate.breakdown || {};
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(candidate)}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-50/60"
          : "border-gray-200 bg-white hover:border-indigo-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              rank === 1 ? "bg-amber-100 text-amber-700"
              : rank === 2 ? "bg-gray-100 text-gray-600"
              : "bg-gray-50 text-gray-500"
            }`}
          >
            {rank}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{candidate.name}</p>
            <p className="text-xs text-gray-400">Score: {candidate.total_score} / 90</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5">
          <Star size={11} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700">{candidate.total_score}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <ScoreBar label="Class Continuity" value={b.p1_continuity ?? 0} max={40} color="bg-blue-400" />
        <ScoreBar label="Subject Expertise" value={b.p2_expertise ?? 0} max={25} color="bg-emerald-400" />
        <ScoreBar label="Same Department"   value={b.p3_department ?? 0} max={15} color="bg-violet-400" />
        <ScoreBar label="Fairness"          value={b.fairness ?? 0}      max={10} color="bg-amber-400" />
      </div>
      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
          <CheckCircle2 size={13} />
          Selected
        </div>
      )}
    </motion.div>
  );
}

function StatusPill({ status }) {
  const sc = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${sc.pill}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
      {sc.label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReliefManagementPage() {
  const [activeTab, setActiveTab] = useState("active");

  const [absences, setAbsences]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);

  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Override modal state (manual candidate selection) ─────────────────────
  const [modalOpen, setModalOpen]                   = useState(false);
  const [modalAbsence, setModalAbsence]             = useState(null);
  const [candidates, setCandidates]                 = useState([]);
  const [candidatesLoading, setCandidatesLoading]   = useState(false);
  const [selectedSlot, setSelectedSlot]             = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [dispatching, setDispatching]               = useState(false);
  const [dispatchSuccess, setDispatchSuccess]       = useState(false);
  const [dispatchError, setDispatchError]           = useState(null);
  const [overrideNote, setOverrideNote]             = useState("");

  // ── Auto-assign state ─────────────────────────────────────────────────────
  const [autoAssigning, setAutoAssigning]     = useState(null); // absence id being auto-assigned
  const [autoAssignToast, setAutoAssignToast] = useState(null); // { results: [...] }

  const sseRefs = useRef({});

  // ── Fetch approved absences ───────────────────────────────────────────────
  const fetchAbsences = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(`${API}/leaves/approved`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setAbsences(prev => {
        const prevMap = Object.fromEntries(prev.map(a => [a.id, a]));
        return (data.data || []).map(a => ({
          ...a,
          _reliefStatus: prevMap[a.id]?._reliefStatus ?? null,
          _assignments:  prevMap[a.id]?._assignments  ?? [],
        }));
      });
      setLastRefresh(new Date());
    } catch (e) {
      setError("Could not load absences. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAbsences(); }, [fetchAbsences]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      Object.values(sseRefs.current).forEach(es => es.close());
      sseRefs.current = {};
    };
  }, []);

  const subscribeToAbsence = useCallback((absenceId) => {
    if (sseRefs.current[absenceId]) return;
    const token = getToken();
    const es = new EventSource(`${API}/relief/stream/${absenceId}?token=${token}`);
    es.onopen = () => setSseConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setAbsences(prev =>
          prev.map(a => a.id === absenceId ? { ...a, _assignments: data.assignments } : a)
        );
        const allAccepted =
          data.assignments?.length > 0 &&
          data.assignments.every(a => a.status === "accepted");
        if (allAccepted) fetchAbsences(true);
      } catch {}
    };
    es.onerror = () => {
      es.close();
      delete sseRefs.current[absenceId];
      if (Object.keys(sseRefs.current).length === 0) setSseConnected(false);
    };
    sseRefs.current[absenceId] = es;
    setSseConnected(true);
  }, [fetchAbsences]);

  // ── History ───────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`${API}/relief/assigned`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setHistory(data.data || []);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchHistory]);

  // ── AUTO-ASSIGN handler ───────────────────────────────────────────────────
  const handleAutoAssign = async (absence) => {
    setAutoAssigning(absence.id);
    try {
      const res = await fetch(`${API}/relief/auto-assign/${absence.id}`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      // Update local absence status optimistically
      const anyAssigned = data.assignments?.some(a => a.status === "assigned");
      if (anyAssigned) {
        setAbsences(prev =>
          prev.map(a =>
            a.id === absence.id ? { ...a, _reliefStatus: "requested" } : a
          )
        );
        subscribeToAbsence(absence.id);
      }

      // Show the results popup
      setAutoAssignToast({ results: data.assignments || [] });

    } catch (e) {
      setAutoAssignToast({
        results: [{
          slot_id: "error",
          period: "—",
          status: "no_candidate",
          message: e.message || "Auto-assign failed. Try again or use Override.",
        }],
      });
    } finally {
      setAutoAssigning(null);
    }
  };

  // ── OVERRIDE modal handlers ───────────────────────────────────────────────
  const openOverride = async (absence) => {
    setModalAbsence(absence);
    setModalOpen(true);
    setCandidates([]);
    setSelectedSlot(null);
    setSelectedCandidates({});
    setDispatchSuccess(false);
    setDispatchError(null);
    setOverrideNote("");
    setCandidatesLoading(true);
    try {
      const res = await fetch(
        `${API}/relief/candidates/${absence.id}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const slots = data.slots || [];
      setCandidates(slots);
      if (slots.length > 0) setSelectedSlot(slots[0]);
    } catch (e) {
      console.error("Failed to fetch candidates:", e);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const closeModal = () => {
    if (dispatching) return;
    setModalOpen(false);
    setModalAbsence(null);
    setCandidates([]);
    setSelectedCandidates({});
    setSelectedSlot(null);
    setDispatchSuccess(false);
    setDispatchError(null);
    setOverrideNote("");
  };

  // Override dispatch — manual selection
  const handleOverrideDispatch = async () => {
    if (Object.keys(selectedCandidates).length === 0 || !modalAbsence) return;
    setDispatching(true);
    setDispatchError(null);
    try {
      for (const [slot_id, candidate] of Object.entries(selectedCandidates)) {
        const res = await fetch(`${API}/leaves/relief/${modalAbsence.id}/assign`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            relief_teacher_id: candidate.teacher_id,
            slot_id,
            note: overrideNote || "Manual override by HOD",
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.detail || `Server error ${res.status}`);
        }
      }
      setDispatchSuccess(true);
      setAbsences(prev =>
        prev.map(a =>
          a.id === modalAbsence.id ? { ...a, _reliefStatus: "requested" } : a
        )
      );
      subscribeToAbsence(modalAbsence.id);
      setTimeout(() => setModalOpen(false), 1500);
    } catch (e) {
      setDispatchError(e.message || "Failed to assign relief. Please try again.");
    } finally {
      setDispatching(false);
    }
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const totalToday = absences.length;
  const unassigned = absences.filter(
    a => !a._reliefStatus && !a._assignments?.some(x => x.status === "accepted")
  ).length;
  const assigned = absences.filter(
    a => a._reliefStatus === "requested" || a._assignments?.some(x => x.status === "accepted")
  ).length;

  const summaryStats = [
    { label: "TOTAL RELIEF TODAY", value: String(totalToday), sub: "Across all departments", accent: "text-teal-600",    icon: ShieldCheck,   iconBg: "bg-teal-50" },
    { label: "ASSIGNED",           value: String(assigned),   sub: "Successfully covered",   accent: "text-emerald-600", icon: CheckCircle2,  iconBg: "bg-emerald-50" },
    { label: "UNASSIGNED",         value: String(unassigned), sub: "Needs immediate action",  accent: "text-red-600",    icon: AlertTriangle, iconBg: "bg-red-50" },
  ];

  const selectedCount = Object.keys(selectedCandidates).length;
  const totalSlots    = candidates.length;

  return (
    <div className="overflow-y-auto">
      <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">

        {/* HEADER */}
        <motion.div variants={itemV} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Relief Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and assign relief duties across all departments.
              {lastRefresh && (
                <span className="ml-2 text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              sseConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}>
              {sseConnected ? <><Wifi size={12} /> Live</> : <><WifiOff size={12} /> Offline</>}
            </div>
            <button
              onClick={() => fetchAbsences()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
              <Download size={15} />
              Export
            </button>
          </div>
        </motion.div>

        {/* STAT CARDS */}
        <motion.div variants={itemV} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.accent}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className={`mt-0.5 text-[28px] font-bold leading-none tracking-tight ${s.accent}`}>{s.value}</p>
                  <p className="mt-1.5 text-xs font-medium text-gray-400">{s.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ERROR BANNER */}
        {error && (
          <motion.div variants={itemV} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </motion.div>
        )}

        {/* TABS */}
        <motion.div variants={itemV} className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={15} />
            Active Requests
            {absences.length > 0 && (
              <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                {absences.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <History size={15} />
            Relief History
            {history.length > 0 && (
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                {history.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* ACTIVE REQUESTS TABLE */}
        {activeTab === "active" && (
          <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    {["DATE", "ABSENT TEACHER", "LEAVE TYPE", "PERIODS", "STATUS", "ACTION"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Loader2 size={24} className="mx-auto animate-spin text-indigo-400" />
                        <p className="mt-2 text-sm text-gray-400">Loading leave requests...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && absences.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                        No approved leave requests needing relief. 🎉
                      </td>
                    </tr>
                  )}
                  {!loading && absences.map((absence) => {
                    const isCovered   = absence._assignments?.some(a => a.status === "accepted");
                    const isRequested = absence._reliefStatus === "requested" || absence._assignments?.some(a => a.status === "pending");
                    const displayStatus = isCovered ? "covered" : isRequested ? "requested" : "pending";
                    const isAutoAssigning = autoAssigning === absence.id;

                    return (
                      <tr key={absence.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                          {new Date(absence.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-gray-900">
                          {absence.teacher_name || "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600 capitalize">
                          {absence.leave_type}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                          P{absence.period_start} – P{absence.period_end}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <StatusPill status={displayStatus} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          {isCovered ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                              <CheckCircle2 size={13} /> Covered
                            </span>
                          ) : isRequested ? (
                            // Already requested — show Override only
                            <button
                              onClick={() => openOverride(absence)}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                            >
                              <SlidersHorizontal size={12} />
                              Override
                            </button>
                          ) : (
                            // Not yet assigned — show Auto Assign + Override
                            <div className="flex items-center gap-2">
                              {/* Auto Assign */}
                              <button
                                onClick={() => handleAutoAssign(absence)}
                                disabled={isAutoAssigning}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isAutoAssigning ? (
                                  <><Loader2 size={12} className="animate-spin" /> Assigning…</>
                                ) : (
                                  <><Zap size={12} /> Auto Assign</>
                                )}
                              </button>

                              {/* Override */}
                              <button
                                onClick={() => openOverride(absence)}
                                disabled={isAutoAssigning}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <SlidersHorizontal size={12} />
                                Override
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-emerald-600">{assigned} assigned</span>
                {" | "}
                <span className="font-semibold text-amber-600">{unassigned} unassigned</span>
              </p>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
                <Download size={13} /> Export
              </button>
            </div>
          </motion.div>
        )}

        {/* HISTORY TABLE */}
        {activeTab === "history" && (
          <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    {["DATE", "ABSENT TEACHER", "LEAVE TYPE", "PERIODS", "COVERAGE", "ASSIGNMENTS"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyLoading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Loader2 size={24} className="mx-auto animate-spin text-indigo-400" />
                        <p className="mt-2 text-sm text-gray-400">Loading history...</p>
                      </td>
                    </tr>
                  )}
                  {!historyLoading && history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                        No relief history yet.
                      </td>
                    </tr>
                  )}
                  {!historyLoading && history.map((item) => {
                    const coverageStatus =
                      item.coverage === "covered"   ? "covered"   :
                      item.coverage === "requested" ? "requested" : "pending";
                    const acceptedCount = (item.assignments || []).filter(a => a.status === "accepted").length;
                    const pendingCount  = (item.assignments || []).filter(a => a.status === "pending").length;
                    const total         = (item.assignments || []).length;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                          {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-gray-900">
                          {item.teacher_name || "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600 capitalize">
                          {item.leave_type}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                          P{item.period_start} – P{item.period_end}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <StatusPill status={coverageStatus} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[12px] text-gray-500">
                          {total === 0 ? "—" : (
                            <span>
                              <span className="font-semibold text-emerald-600">{acceptedCount} accepted</span>
                              {pendingCount > 0 && (
                                <span className="ml-2 font-semibold text-indigo-600">{pendingCount} pending</span>
                              )}
                              <span className="ml-2 text-gray-400">/ {total} slots</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* ── AUTO-ASSIGN TOAST ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {autoAssignToast && (
          <AutoAssignToast
            results={autoAssignToast.results}
            onClose={() => setAutoAssignToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ── OVERRIDE MODAL (manual candidate selection) ─────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={modalOverlay}
            initial="hidden" animate="visible" exit="exit"
            onClick={closeModal}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              variants={modalContent}
              initial="hidden" animate="visible" exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-gray-900">Override Relief Assignment</h2>
                  </div>
                  {modalAbsence && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(modalAbsence.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                      {" · "}Periods {modalAbsence.period_start}–{modalAbsence.period_end}
                      {" · "}{modalAbsence.leave_type}
                    </p>
                  )}
                </div>
                <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto px-6 py-5 flex-1">
                {/* Slot selector */}
                {candidates.length > 1 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Select Period
                      {selectedCount > 0 && (
                        <span className="ml-2 normal-case font-medium text-indigo-500">
                          ({selectedCount}/{totalSlots} selected)
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((slot) => {
                        const isSlotSelected = !!selectedCandidates[slot.slot_id];
                        return (
                          <button
                            key={slot.slot_id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`relative rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                              selectedSlot?.slot_id === slot.slot_id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 text-gray-600 hover:border-indigo-300"
                            }`}
                          >
                            Period {slot.period}
                            {isSlotSelected && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                                <CheckCircle2 size={10} className="text-white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {candidatesLoading && (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 size={28} className="animate-spin text-indigo-400" />
                    <p className="text-sm text-gray-400">Ranking eligible teachers...</p>
                  </div>
                )}

                {!candidatesLoading && candidates.length === 0 && (
                  <div className="py-10 text-center">
                    <AlertTriangle size={28} className="mx-auto mb-3 text-amber-400" />
                    <p className="text-sm font-medium text-gray-600">No eligible candidates found.</p>
                    <p className="mt-1 text-xs text-gray-400">
                      All teachers may be busy, at capacity, or the absence date falls on a non-teaching day.
                    </p>
                  </div>
                )}

                {!candidatesLoading && selectedSlot && selectedSlot.candidates?.length > 0 && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Ranked Candidates — Period {selectedSlot.period}
                      </p>
                      <span className="ml-auto text-[11px] text-gray-400">
                        {selectedSlot.candidates.length} eligible
                      </span>
                    </div>
                    <div className="space-y-3">
                      {selectedSlot.candidates.map((candidate, idx) => (
                        <CandidateCard
                          key={candidate.teacher_id}
                          candidate={candidate}
                          rank={idx + 1}
                          selected={selectedCandidates[selectedSlot.slot_id]?.teacher_id === candidate.teacher_id}
                          onSelect={(c) =>
                            setSelectedCandidates(prev => ({ ...prev, [selectedSlot.slot_id]: c }))
                          }
                        />
                      ))}
                    </div>

                    {/* Scoring legend */}
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Scoring Criteria</p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />Class Continuity (40 pts)</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Subject Expertise (25 pts)</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" />Same Department (15 pts)</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Fairness Balance (10 pts)</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Note field */}
                {selectedCount > 0 && (
                  <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Override Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Reason for manual override..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>
                )}

                {/* Assignment summary */}
                {selectedCount > 0 && !dispatchSuccess && (
                  <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                      Assignment Summary
                    </p>
                    <div className="space-y-1">
                      {candidates.map((slot) => {
                        const sel = selectedCandidates[slot.slot_id];
                        return (
                          <div key={slot.slot_id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Period {slot.period}</span>
                            {sel ? (
                              <span className="flex items-center gap-1 font-semibold text-indigo-700">
                                <CheckCircle2 size={11} />
                                {sel.name} <span className="text-indigo-400">(Score: {sel.total_score})</span>
                              </span>
                            ) : (
                              <span className="text-gray-300 italic">Not selected</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Success */}
                {dispatchSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700"
                  >
                    <CheckCircle2 size={16} />
                    {selectedCount} relief request{selectedCount > 1 ? "s" : ""} sent!
                  </motion.div>
                )}

                {/* Error */}
                {dispatchError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Assignment failed</p>
                      <p className="mt-0.5 text-xs">{dispatchError}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400">
                  {selectedCount > 0
                    ? `${selectedCount} of ${totalSlots} period${totalSlots !== 1 ? "s" : ""} selected`
                    : "Select a teacher for each period above"}
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={closeModal}
                    disabled={dispatching}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOverrideDispatch}
                    disabled={selectedCount === 0 || dispatching || dispatchSuccess}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dispatching ? (
                      <><Loader2 size={14} className="animate-spin" />Dispatching...</>
                    ) : dispatchSuccess ? (
                      <><CheckCircle2 size={14} />Sent!</>
                    ) : (
                      `Override ${selectedCount > 0 ? `${selectedCount} ` : ""}Slot${selectedCount > 1 ? "s" : ""}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}