import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  CalendarDays,
  Eye,
  MessageSquare,
  XCircle,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: "easeOut",
    },
  },
};

const getInitials = (name) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

export default function LeaveOversightPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectMsg, setRejectMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [clarifyModal, setClarifyModal] = useState(null);
  const [clarifyMsg, setClarifyMsg] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      try {
        data = await api.get("/api/v1/admin/leaves");
      } catch {
        data = await api.get("/leaves/pending");
      }

      const list = Array.isArray(data)
        ? data
        : data?.data || [];

      setLeaves(
        list.map((l) => ({
          ...l,
          teacher_name: l.teacher_name || "Unknown Teacher",
          status: (l.status || "pending").toLowerCase(),
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`);

    try {
      await api.put(`/leaves/${id}/action`, {
        action: "approve",
      });

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: "approved" }
            : l
        )
      );

      showToast("Leave approved successfully.");
    } catch (e) {
      showToast(
        e.message || "Failed to approve leave.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectMsg.trim()) return;

    const id = rejectModal.id;

    setActionLoading(`reject-${id}`);

    try {
      await api.put(`/leaves/${id}/action`, {
        action: "reject",
        note: rejectMsg,
      });

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: "rejected" }
            : l
        )
      );

      showToast("Leave rejected.");

      setRejectModal(null);
      setRejectMsg("");
    } catch (e) {
      showToast(
        e.message || "Failed to reject leave.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleClarifySend = async () => {
    if (!clarifyMsg.trim()) return;

    const id = clarifyModal.id;

    setActionLoading(`clarify-${id}`);

    try {
      await api.put(`/leaves/${id}/action`, {
        action: "clarify",
        note: clarifyMsg,
      });

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "clarification_requested",
                clarification_note: clarifyMsg,
              }
            : l
        )
      );

      showToast(
        `Clarification sent to ${clarifyModal.name}.`
      );

      setClarifyModal(null);
      setClarifyMsg("");
    } catch (e) {
      showToast(
        e.message ||
          "Failed to send clarification.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const pendingLeaves = leaves.filter(
    (l) =>
      l.status === "pending" ||
      l.status === "clarification_requested"
  );

  const approvedLeaves = leaves.filter(
    (l) => l.status === "approved"
  );

  const rejectedLeaves = leaves.filter(
    (l) => l.status === "rejected"
  );

  const tabs = [
    {
      id: "pending",
      label: "Pending",
      count: pendingLeaves.length,
    },
    {
      id: "approved",
      label: "Approved",
      count: approvedLeaves.length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: rejectedLeaves.length,
    },
    {
      id: "onleave",
      label: "On Leave",
      count: null,
    },
  ];

  const tabLeaves =
    activeTab === "pending"
      ? pendingLeaves
      : activeTab === "approved"
      ? approvedLeaves
      : activeTab === "rejected"
      ? rejectedLeaves
      : pendingLeaves;

  const filtered = tabLeaves.filter(
    (l) =>
      !search ||
      l.teacher_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      l.leave_type
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const onLeaveTeachers = leaves
    .filter(
      (l) =>
        l.status === "pending" ||
        l.status === "approved" ||
        l.status === "clarification_requested"
    )
    .slice(0, 5)
    .map((l) => ({
      initials: getInitials(l.teacher_name),
      name: l.teacher_name || "Unknown Teacher",
      dept: l.leave_type || "—",
    }));

  const statusBadgeColor = (status) => {
    if (status === "approved")
      return "bg-green-50 text-green-700 ring-green-500/20";

    if (status === "rejected")
      return "bg-red-50 text-red-700 ring-red-500/20";

    if (status === "clarification_requested")
      return "bg-purple-50 text-purple-700 ring-purple-500/20";

    return "bg-amber-50 text-amber-700 ring-amber-500/20";
  };

  const statusLabel = (status) => {
    if (status === "clarification_requested")
      return "Action Needed";

    return (
      status?.charAt(0).toUpperCase() +
        status?.slice(1) || "Pending"
    );
  };

  const isActionable = (status) =>
    status === "pending" ||
    status === "clarification_requested";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7"
    >
      {/* HEADER */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Leave Oversight
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and audit staff leave requests
            across the institution.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Download size={15} />
            Export Log
          </button>
        </div>
      </motion.div>

      {/* TABS */}
      <motion.div
        variants={itemVariants}
        className="flex gap-0 border-b border-gray-200"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-5 pb-3 pt-1 text-[13px] font-semibold transition-colors ${
                active
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}

              {tab.count !== null && (
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    active
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {loading ? "—" : tab.count}
                </span>
              )}

              {active && (
                <motion.span
                  layoutId="leave-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-600"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                  }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* FILTER ROW */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-56 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <CalendarDays
            size={14}
            className="text-gray-400"
          />
          All Dates
        </div>
      </motion.div>

      {/* LOADING / ERROR */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          Loading leaves…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            onClick={fetchLeaves}
            className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* LEAVE CARDS */}
      {!loading && !error && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {filtered.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center py-12 text-sm text-gray-400">
              No leave requests found.
            </div>
          ) : (
            filtered.map((req) => {
              const isEmergency =
                req.is_emergency === true ||
                req.leave_type
                  ?.toLowerCase()
                  ?.includes("emergency");

              console.log(req);   
              return (
                <motion.div
                  key={req.id}
                  whileHover={{ y: -2 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  className={`
                    overflow-hidden rounded-2xl border p-5 backdrop-blur-sm
                    ${
                      isEmergency
                        ? "border-red-300 bg-red-50/90 shadow-md shadow-red-100"
                        : "border-gray-100 bg-white"
                    }
                  `}
                >
                  <div
                    className={`flex items-start justify-between rounded-xl p-3 -m-3 mb-3 ${
                      isEmergency ? "bg-red-100/80" : ""
                    }`}
                  >
                  </div><div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                        {getInitials(req.teacher_name)}
                      </div>

                      <div>
                        <p className="text-base font-bold text-gray-900">
                          {req.teacher_name}
                        </p>

                        <span
                          className={
                            isEmergency
                              ? "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize border bg-red-200 text-red-800 border-red-300"
                              : "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize border bg-gray-100 text-gray-500 border-gray-200"
                          }
                        >
                          {req.leave_type}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`
                        flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold
                        ${
                          isEmergency
                            ? "bg-red-200 text-red-800 border border-red-300"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }
                      `}
                    >
                      {statusLabel(req.status)}
                    </span>
                  </div>

                  {isEmergency && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-700">
                      <AlertTriangle size={14} />
                      Emergency leave requires immediate
                      review
                    </div>
                  )}

                  <div
                    className={`my-4 h-px ${
                      isEmergency ? "bg-red-300" : "bg-gray-100"
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        Date
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-gray-900">
                        {req.start_date ||
                          req.date ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        Periods
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-gray-900">
                        {req.is_full_day
                          ? "Full Day"
                          : `${req.period_start} – ${req.period_end}`}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        Reason
                      </p>

                      <p className="mt-0.5 text-sm text-gray-700">
                        {req.reason || "—"}
                      </p>
                    </div>

                    {req.clarification_note && (
                      <div className="col-span-2 rounded-lg border border-purple-200 bg-purple-50 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-purple-700">
                          Clarification Requested
                        </p>

                        <p className="mt-1 text-[11px] text-purple-900">
                          {req.clarification_note}
                        </p>
                      </div>
                    )}
                  </div>

                  {isActionable(req.status) && (
                    <div className="mt-5 flex items-center gap-2.5">
                      <button className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-500 transition hover:text-indigo-600">
                        <Eye size={13} />
                        View Details
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={() => {
                          setClarifyModal({
                            id: req.id,
                            name: req.teacher_name,
                          });

                          setClarifyMsg("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
                      >
                        <MessageSquare size={13} />
                        Clarify
                      </button>

                      <button
                        onClick={() => {
                          setRejectModal({
                            id: req.id,
                            name: req.teacher_name,
                          });

                          setRejectMsg("");
                        }}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500 border-l-red-600 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          handleApprove(req.id)
                        }
                        disabled={!!actionLoading}
                        className={`
                          inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition disabled:opacity-50
                          ${
                            isEmergency
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }
                        `}
                      >
                        <CheckCircle size={13} />

                        {actionLoading ===
                        `approve-${req.id}`
                          ? "…"
                          : "Approve"}
                      </button>
                    </div>
                  )}

                  {!isActionable(req.status) && (
                    <div className="mt-5 flex items-center gap-1 text-[12px] font-medium text-gray-400">
                      {req.status === "approved" ? (
                        <>
                          <CheckCircle
                            size={13}
                            className="text-green-500"
                          />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle
                            size={13}
                            className="text-red-400"
                          />
                          Rejected
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ON LEAVE SECTION */}
      {!loading &&
        !error &&
        onLeaveTeachers.length > 0 && (
          <motion.section
            variants={itemVariants}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Teachers Currently on Leave
              </h2>

              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200">
                Live Data Hub
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {onLeaveTeachers.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  className="relative flex flex-col items-center overflow-hidden rounded-xl border border-gray-100 bg-white py-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">
                    {t.initials}
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-900">
                    {t.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {t.dept}
                  </p>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
    </motion.div>
  );
}