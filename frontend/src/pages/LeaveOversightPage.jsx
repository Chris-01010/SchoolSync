import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Plus, Search, ChevronDown, CalendarDays,
  Eye, MessageSquare, XCircle, CheckCircle, X,
} from "lucide-react";
import { api } from "../services/api";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

const getInitials = (name) =>
  name?.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";

export default function LeaveOversightPage() {
  const [leaves, setLeaves]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("pending");
  const [search, setSearch]               = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal]     = useState(null);
  const [rejectMsg, setRejectMsg]         = useState("");
  const [toast, setToast]                 = useState(null);
  const [clarifyModal, setClarifyModal]   = useState(null);
  const [clarifyMsg, setClarifyMsg]       = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/v1/admin/leaves");
      const list = Array.isArray(data) ? data : (data?.data || []);
      setLeaves(list);
    } catch (err) {
      setError(err.message || "Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`);
    try {
      await api.put(`/leaves/${id}/action`, { action: "approve" });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "approved" } : l));
      showToast("Leave approved successfully.");
    } catch (e) {
      showToast(e.message || "Failed to approve leave.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectMsg.trim()) return;
    const id = rejectModal.id;
    setActionLoading(`reject-${id}`);
    try {
      await api.put(`/leaves/${id}/action`, { action: "reject", note: rejectMsg });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" } : l));
      showToast("Leave rejected.");
      setRejectModal(null);
      setRejectMsg("");
    } catch (e) {
      showToast(e.message || "Failed to reject leave.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClarifySend = async () => {
    if (!clarifyMsg.trim()) return;
    const id = clarifyModal.id;
    setActionLoading(`clarify-${id}`);
    try {
      await api.put(`/leaves/${id}/action`, { action: "clarify", note: clarifyMsg });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "clarification_requested", clarification_note: clarifyMsg } : l));
      showToast(`Clarification sent to ${clarifyModal.name}.`);
      setClarifyModal(null);
      setClarifyMsg("");
    } catch (e) {
      showToast(e.message || "Failed to send clarification.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingLeaves  = leaves.filter((l) => l.status === "pending" || l.status === "clarification_requested");
  const approvedLeaves = leaves.filter((l) => l.status === "approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected");

  const tabs = [
    { id: "pending",  label: "Pending",  count: pendingLeaves.length },
    { id: "approved", label: "Approved", count: approvedLeaves.length },
    { id: "rejected", label: "Rejected", count: rejectedLeaves.length },
    { id: "onleave",  label: "On Leave", count: null },
  ];

  const tabLeaves = activeTab === "pending"  ? pendingLeaves
                  : activeTab === "approved" ? approvedLeaves
                  : activeTab === "rejected" ? rejectedLeaves
                  : pendingLeaves;

  const filtered = tabLeaves.filter((l) =>
    !search || l.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.leave_type?.toLowerCase().includes(search.toLowerCase())
  );

  const onLeaveTeachers = leaves
    .filter((l) => l.status === "pending" || l.status === "approved" || l.status === "clarification_requested")
    .slice(0, 5)
    .map((l) => ({
      initials: getInitials(l.teacher_name),
      name: l.teacher_name || "Unknown Teacher",
      dept: l.leave_type || "—",
    }));

  const statusBadgeColor = (status) => {
    if (status === "approved") return "bg-green-50 text-green-700 ring-green-500/20";
    if (status === "rejected") return "bg-red-50 text-red-700 ring-red-500/20";
    if (status === "clarification_requested") return "bg-purple-50 text-purple-700 ring-purple-500/20";
    return "bg-amber-50 text-amber-700 ring-amber-500/20";
  };

  const statusLabel = (status) => {
    if (status === "clarification_requested") return "Action Needed";
    return status;
  };

  const isActionable = (status) => status === "pending" || status === "clarification_requested";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-7">

      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Leave Oversight (All Departments)</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and audit staff leave requests across the institution.</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Download size={15} /> Export Log
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            <Plus size={15} /> New Request
          </button>
        </div>
      </motion.div>

      {/* TABS */}
      <motion.div variants={itemVariants} className="flex gap-0 border-b border-gray-200">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-5 pb-3 pt-1 text-[13px] font-semibold transition-colors ${active ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                  {loading ? "—" : tab.count}
                </span>
              )}
              {active && (
                <motion.span layoutId="leave-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-600"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }} />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* FILTER ROW */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div className="relative">
          <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>All Departments</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <CalendarDays size={14} className="text-gray-400" /> All Dates
        </div>
      </motion.div>

      {/* LOADING / ERROR */}
      {loading && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Loading leaves…</div>}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button onClick={fetchLeaves} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
        </div>
      )}

      {/* LEAVE CARDS */}
      {!loading && !error && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center py-12 text-sm text-gray-400">No leave requests found.</div>
          ) : (
            filtered.map((req) => (
              <motion.div key={req.id} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                      {getInitials(req.teacher_name)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{req.teacher_name || "Unknown Teacher"}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {req.leave_type}
                      </span>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusBadgeColor(req.status)}`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
                <div className="my-4 h-px bg-gray-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Date</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">{req.date}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Periods</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">{req.period_start} – {req.period_end}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Reason</p>
                    <p className="mt-0.5 text-sm text-gray-700">{req.reason || "—"}</p>
                  </div>
                  {req.clarification_note && (
                    <div className="col-span-2 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Clarification Requested</p>
                      <p className="text-[11px] text-purple-900 mt-1">{req.clarification_note}</p>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                {isActionable(req.status) && (
                  <div className="mt-5 flex items-center gap-2.5">
                    <button className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-500 transition hover:text-indigo-600">
                      <Eye size={13} /> View Details
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => { setClarifyModal({ id: req.id, name: req.teacher_name || "Teacher" }); setClarifyMsg(""); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
                      <MessageSquare size={13} /> Clarify
                    </button>
                    <button
                      onClick={() => { setRejectModal({ id: req.id, name: req.teacher_name || "Teacher" }); setRejectMsg(""); }}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50">
                      <XCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50">
                      <CheckCircle size={13} />
                      {actionLoading === `approve-${req.id}` ? "…" : "Approve"}
                    </button>
                  </div>
                )}

                {/* Status label for non-actionable */}
                {!isActionable(req.status) && (
                  <div className="mt-5 flex items-center gap-1 text-[12px] font-medium text-gray-400">
                    {req.status === "approved"
                      ? <><CheckCircle size={13} className="text-green-500" /> Approved</>
                      : <><XCircle size={13} className="text-red-400" /> Rejected</>}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* ON LEAVE SECTION */}
      {!loading && !error && (
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Teachers Currently on Leave</h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200">Live Data Hub</span>
          </div>
          {onLeaveTeachers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">No teachers currently on leave.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {onLeaveTeachers.map((t, i) => (
                <motion.div key={i} whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="relative flex flex-col items-center overflow-hidden rounded-xl border border-gray-100 bg-white py-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">{t.initials}</div>
                  <p className="mt-3 text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{t.dept}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* CLARIFY MODAL */}
      <AnimatePresence>
        {clarifyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">Request Clarification</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Send a message to {clarifyModal.name}</p>
                </div>
                <button onClick={() => setClarifyModal(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <textarea value={clarifyMsg} onChange={e => setClarifyMsg(e.target.value)}
                placeholder="Type your clarification message here…" rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 resize-none" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setClarifyModal(null)}
                  className="px-4 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleClarifySend} disabled={!clarifyMsg.trim()}
                  className="px-4 py-2 text-[12px] font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Send Message</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">Reject Leave Request</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Provide a reason for rejecting {rejectModal.name}'s request</p>
                </div>
                <button onClick={() => setRejectModal(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <textarea value={rejectMsg} onChange={e => setRejectMsg(e.target.value)}
                placeholder="Reason for rejection…" rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 resize-none" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setRejectModal(null)}
                  className="px-4 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleReject} disabled={!rejectMsg.trim() || !!actionLoading}
                  className="px-4 py-2 text-[12px] font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {actionLoading?.startsWith("reject-") ? "Rejecting…" : "Confirm Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-[12px] font-semibold text-white ${toast.type === "error" ? "bg-red-600" : "bg-gray-900"}`}>
            {toast.type === "error"
              ? <XCircle size={14} className="text-red-200" />
              : <CheckCircle size={14} className="text-green-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}