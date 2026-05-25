import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Crown,
  X,
  Eye,
  Loader2,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:8000";

// ── Auth helper ───────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("schoolsync_token");
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

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  assigned:   { label: "Assigned",   pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" },
  unassigned: { label: "Unassigned", pill: "bg-amber-50 text-amber-700 ring-amber-500/20",       dot: "bg-amber-500" },
  pending:    { label: "Pending",    pill: "bg-blue-50 text-blue-700 ring-blue-500/20",           dot: "bg-blue-500" },
  overridden: { label: "Overridden", pill: "bg-purple-50 text-purple-700 ring-purple-500/20",    dot: "bg-purple-500" },
  accepted:   { label: "Accepted",   pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" },
  rejected:   { label: "Rejected",   pill: "bg-red-50 text-red-700 ring-red-500/20",             dot: "bg-red-500" },
  flagged:    { label: "Flagged",    pill: "bg-orange-50 text-orange-700 ring-orange-500/20",    dot: "bg-orange-500" },
};

// ── Score breakdown bar ───────────────────────────────────────────────────────
function ScoreBar({ label, value, max, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-gray-500">{label}</span>
      <div className="flex-1 rounded-full bg-gray-100 h-1.5">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700">{value}</span>
    </div>
  );
}

// ── Candidate card ────────────────────────────────────────────────────────────
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
              rank === 1
                ? "bg-amber-100 text-amber-700"
                : rank === 2
                ? "bg-gray-100 text-gray-600"
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReliefManagementPage() {
  const [absences, setAbsences]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [lastRefresh, setLastRefresh]     = useState(null);

  // Modal state
  const [modalOpen, setModalOpen]         = useState(false);
  const [modalAbsence, setModalAbsence]   = useState(null);
  const [candidates, setCandidates]       = useState([]);   // { slot_id, period, candidates[] }
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [dispatching, setDispatching]     = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [overrideNote, setOverrideNote]   = useState("");

  // SSE refs
  const sseRef = useRef(null);

  // ── Fetch approved absences (these need relief) ───────────────────────────
  const fetchAbsences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/hod/leaves/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      // Also fetch approved absences that may have unassigned relief
      const res2 = await fetch(`${API}/admin/relief/active`, { headers: authHeaders() });
      const active = res2.ok ? await res2.json() : [];

      setAbsences(data);
      setLastRefresh(new Date());
    } catch (e) {
      setError("Could not load absences. Check your connection.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbsences();
    // Poll every 30 seconds for new leaves
    const interval = setInterval(fetchAbsences, 30000);
    return () => clearInterval(interval);
  }, [fetchAbsences]);

  // ── Open assign modal + fetch ranked candidates ───────────────────────────
  const openAssign = async (absence) => {
    setModalAbsence(absence);
    setModalOpen(true);
    setCandidates([]);
    setSelectedSlot(null);
    setSelectedCandidate(null);
    setDispatchSuccess(false);
    setOverrideNote("");
    setCandidatesLoading(true);

    try {
      const res = await fetch(
        `${API}/relief/candidates/${absence.id}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setCandidates(data.slots || []);
      // Auto-select first slot
      if (data.slots?.length > 0) setSelectedSlot(data.slots[0]);
    } catch (e) {
      console.error("Failed to fetch candidates:", e);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  // ── Start SSE stream for an absence ──────────────────────────────────────
  const startSSE = useCallback((absenceId) => {
    if (sseRef.current) sseRef.current.close();
    const token = getToken();
    const es = new EventSource(
      `${API}/relief/stream/${absenceId}?token=${token}`
    );
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Update the row status live
        setAbsences((prev) =>
          prev.map((a) =>
            a.id === absenceId ? { ...a, _assignments: data.assignments } : a
          )
        );
      } catch {}
    };
    es.onerror = () => es.close();
    sseRef.current = es;
  }, []);

  useEffect(() => () => sseRef.current?.close(), []);

  // ── Dispatch relief (HOD assigns top candidate) ───────────────────────────
  const handleDispatch = async () => {
    if (!selectedCandidate || !modalAbsence) return;
    setDispatching(true);
    try {
      const res = await fetch(
        `${API}/leaves/relief/${modalAbsence.id}/assign`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            relief_teacher_id: selectedCandidate.teacher_id,
            note: overrideNote || undefined,
          }),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      setDispatchSuccess(true);
      startSSE(modalAbsence.id);
      // Refresh the table after 1.5s
      setTimeout(() => {
        fetchAbsences();
        setModalOpen(false);
      }, 1500);
    } catch (e) {
      console.error("Dispatch failed:", e);
      alert("Failed to assign relief. Please try again.");
    } finally {
      setDispatching(false);
    }
  };

  // ── Derive stats from real data ───────────────────────────────────────────
  const totalToday  = absences.length;
  const unassigned  = absences.filter((a) => a.status === "pending").length;
  const assigned    = absences.filter((a) => a.status === "approved").length;

  const summaryStats = [
    { label: "TOTAL RELIEF TODAY", value: String(totalToday || 0),  sub: "Across all departments",  accent: "text-teal-600",    icon: ShieldCheck,   iconBg: "bg-teal-50" },
    { label: "ASSIGNED",           value: String(assigned || 0),    sub: "Successfully covered",    accent: "text-emerald-600", icon: CheckCircle2,  iconBg: "bg-emerald-50" },
    { label: "UNASSIGNED",         value: String(unassigned || 0),  sub: "Needs immediate action",  accent: "text-red-600",     icon: AlertTriangle, iconBg: "bg-red-50" },
    { label: "LIVE UPDATES",       value: "ON",                     sub: "Polling every 30s",       accent: "text-purple-600",  icon: RefreshCw,     iconBg: "bg-purple-50" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
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
          <div className="flex gap-2">
            <button
              onClick={fetchAbsences}
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
        <motion.div variants={itemV} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* TABLE */}
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
                      No pending leave requests. All relief duties are covered! 🎉
                    </td>
                  </tr>
                )}

                {!loading && absences.map((absence) => {
                  const sc = statusConfig[absence.status] || statusConfig.pending;
                  const assignments = absence._assignments || [];
                  const hasAssigned = assignments.some((a) => a.status === "accepted");

                  return (
                    <tr key={absence.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                        {new Date(absence.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-gray-900">
                        {absence.teacher_name || absence.teacher_id?.slice(0, 8) + "..."}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600 capitalize">
                        {absence.leave_type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">
                        P{absence.period_start} – P{absence.period_end}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${sc.pill}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {hasAssigned ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                            <CheckCircle2 size={13} />
                            Covered
                          </span>
                        ) : (
                          <button
                            onClick={() => openAssign(absence)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            Assign Relief
                          </button>
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
              <Download size={13} />
              Export
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── ASSIGN RELIEF MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={modalOverlay}
            initial="hidden" animate="visible" exit="exit"
            onClick={() => !dispatching && setModalOpen(false)}
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
                  <h2 className="text-lg font-bold text-gray-900">Assign Relief Teacher</h2>
                  {modalAbsence && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(modalAbsence.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                      {" · "}Periods {modalAbsence.period_start}–{modalAbsence.period_end}
                      {" · "}{modalAbsence.leave_type}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto px-6 py-5 flex-1">

                {/* Slot selector (if multiple slots) */}
                {candidates.length > 1 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Select Period</p>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((slot) => (
                        <button
                          key={slot.slot_id}
                          onClick={() => { setSelectedSlot(slot); setSelectedCandidate(null); }}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                            selectedSlot?.slot_id === slot.slot_id
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 text-gray-600 hover:border-indigo-300"
                          }`}
                        >
                          Period {slot.period}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidates loading */}
                {candidatesLoading && (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 size={28} className="animate-spin text-indigo-400" />
                    <p className="text-sm text-gray-400">Ranking eligible teachers...</p>
                    <p className="text-xs text-gray-300">Checking timetable, workload, expertise & fairness</p>
                  </div>
                )}

                {/* No candidates */}
                {!candidatesLoading && candidates.length === 0 && (
                  <div className="py-10 text-center text-sm text-gray-400">
                    No eligible candidates found. All teachers may be busy or at capacity.
                  </div>
                )}

                {/* Ranked candidate cards */}
                {!candidatesLoading && selectedSlot && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Ranked Candidates — Period {selectedSlot.period}
                      </p>
                      <span className="ml-auto text-[11px] text-gray-400">
                        {selectedSlot.candidates?.length || 0} eligible
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(selectedSlot.candidates || []).map((candidate, idx) => (
                        <CandidateCard
                          key={candidate.teacher_id}
                          candidate={candidate}
                          rank={idx + 1}
                          selected={selectedCandidate?.teacher_id === candidate.teacher_id}
                          onSelect={setSelectedCandidate}
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

                {/* Override note */}
                {selectedCandidate && (
                  <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Add a note for this assignment..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>
                )}

                {/* Success state */}
                {dispatchSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700"
                  >
                    <CheckCircle2 size={16} />
                    Relief request sent to {selectedCandidate?.name}! Waiting for response.
                  </motion.div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400">
                  {selectedCandidate
                    ? `Selected: ${selectedCandidate.name} (Score: ${selectedCandidate.total_score})`
                    : "Select a teacher from the ranked list above"}
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={dispatching}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatch}
                    disabled={!selectedCandidate || dispatching || dispatchSuccess}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dispatching ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Dispatching...
                      </>
                    ) : dispatchSuccess ? (
                      <>
                        <CheckCircle2 size={14} />
                        Sent!
                      </>
                    ) : (
                      "Dispatch Relief Request"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}