import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, DoorOpen, CheckCircle2, XCircle, AlertTriangle, ChevronDown, X,
} from "lucide-react";
import { api } from "../services/api";

const days    = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const periods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];

const mockSchedule = {
  "Period 1": { Mon: "10A Math",      Tue: "9B Science",  Wed: "10A Math",    Thu: null,           Fri: "11A Physics" },
  "Period 2": { Mon: null,            Tue: "10C English", Wed: null,          Thu: "9A History",   Fri: null },
  "Period 3": { Mon: "12A Chemistry", Tue: null,          Wed: "10B Biology", Thu: "12A Chemistry",Fri: "9C Art" },
  "Period 4": { Mon: "11B Math",      Tue: "10A Math",    Wed: null,          Thu: null,           Fri: "10A Math" },
  "Period 5": { Mon: null,            Tue: null,          Wed: "9A English",  Thu: "11B Math",     Fri: null },
  "Period 6": { Mon: "10C Science",   Tue: "12B History", Wed: "10C Science", Thu: null,           Fri: "12B History" },
};

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV      = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };
const modalOverlay = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalContent = {
  hidden:   { opacity: 0, scale: 0.92 },
  visible:  { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
  exit:     { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

export default function RoomsResourcesPage() {
  const [rooms, setRooms]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [typeFilter, setTypeFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [blockedStatus, setBlockedStatus] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/v1/rooms/");
      const list = Array.isArray(data) ? data : (data?.data || []);
      setRooms(list);
    } catch (err) {
      setError(err.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // Derived stats
  const totalRooms   = rooms.length;
  const activeRooms  = rooms.filter((r) => r.is_active !== false && r.status !== "blocked").length;
  const blockedRooms = rooms.filter((r) => r.is_active === false || r.status === "blocked").length;

  const summaryStats = [
    { label: "TOTAL ROOMS",     value: loading ? "—" : totalRooms,   sub: "All buildings",     accent: "text-indigo-600",  icon: DoorOpen,      iconBg: "bg-indigo-50" },
    { label: "ACTIVE",          value: loading ? "—" : activeRooms,  sub: "In use",            accent: "text-emerald-600", icon: CheckCircle2,  iconBg: "bg-emerald-50" },
    { label: "BLOCKED",         value: loading ? "—" : blockedRooms, sub: "Under maintenance", accent: "text-red-600",     icon: XCircle,       iconBg: "bg-red-50" },
    { label: "CONFLICTS TODAY", value: "—",                          sub: "Needs resolution",  accent: "text-amber-600",   icon: AlertTriangle, iconBg: "bg-amber-50" },
  ];

  // Unique buildings for filter dropdown
  const buildings = ["All", ...new Set(rooms.map((r) => r.building).filter(Boolean))];

  // Filtering
  const filtered = rooms.filter((r) => {
    if (typeFilter     !== "All" && r.room_type !== typeFilter)  return false;
    if (statusFilter   !== "All") {
      const isBlocked = r.is_active === false || r.status === "blocked";
      if (statusFilter === "Blocked" && !isBlocked) return false;
      if (statusFilter === "Active"  &&  isBlocked) return false;
    }
    if (buildingFilter !== "All" && r.building !== buildingFilter) return false;
    return true;
  });

  return (
    <>
      <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">

        {/* HEADER */}
        <motion.div variants={itemV} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Rooms &amp; Resources</h1>
            <p className="mt-1 text-sm text-gray-500">Manage classrooms, labs, and institutional resources.</p>
          </div>
          <button onClick={() => setAddModalOpen(true)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            <Plus size={15} /> Add Room
          </button>
        </motion.div>

        {/* STAT CARDS */}
        <motion.div variants={itemV} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.accent}`}>
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

        {/* FILTER ROW */}
        <motion.div variants={itemV} className="flex flex-wrap items-center gap-3">
          {/* Type */}
          <div className="relative">
            <select onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="All">Type: All</option>
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Staff Room">Staff Room</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* Status */}
          <div className="relative">
            <select onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {/* Building */}
          <div className="relative">
            <select onChange={(e) => setBuildingFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              {buildings.map((b) => (
                <option key={b} value={b}>{b === "All" ? "Building: All" : b}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div variants={itemV} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          {loading && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading rooms…</div>
          )}
          {error && (
            <div className="flex items-center justify-between px-5 py-4 bg-red-50 border-b border-red-100">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button onClick={fetchRooms} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">No rooms found.</div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    {["ROOM", "TYPE", "CAPACITY", "BUILDING", "STATUS", "CONFLICTS", "ACTIONS"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const isBlocked = r.is_active === false || r.status === "blocked";
                    return (
                      <tr key={r.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${isBlocked ? "bg-red-50/40" : ""}`}>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-gray-900">{r.room_number || r.name || r.room}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.room_type || r.type || "—"}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.capacity ?? "—"}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-600">{r.building || "—"}</td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-500/20">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" /> Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-gray-400">—</td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button className="text-[12px] font-semibold text-indigo-600 transition hover:text-indigo-800">Edit</button>
                            <button onClick={() => setScheduleModal(r)} className="text-[12px] font-semibold text-gray-500 transition hover:text-gray-700">Schedule</button>
                            {isBlocked ? (
                              <button className="text-[12px] font-semibold text-emerald-600 transition hover:text-emerald-800">Unblock</button>
                            ) : (
                              <button className="text-[12px] font-semibold text-amber-600 transition hover:text-amber-800">Block</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ADD ROOM MODAL — unchanged */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            onClick={() => setAddModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add Room / Lab</h2>
                <button onClick={() => setAddModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Room Number</label>
                    <input type="text" placeholder="e.g. 101"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Building</label>
                    <div className="relative">
                      <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>Main Building</option><option>Science Block</option><option>Block B</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Floor</label>
                    <input type="number" placeholder="e.g. 1"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Type</label>
                    <div className="relative">
                      <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        <option>Classroom</option><option>Laboratory</option><option>Auditorium</option><option>Staff Room</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Capacity</label>
                  <input type="number" placeholder="e.g. 40"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Resources</label>
                  <div className="flex flex-wrap gap-4">
                    {["Projector", "Whiteboard", "Smart Board", "AC"].map((res) => (
                      <label key={res} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">{res}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</label>
                  <div className="flex gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="active" defaultChecked onChange={() => setBlockedStatus(false)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="blocked" onChange={() => setBlockedStatus(true)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-gray-700">Blocked</span>
                    </label>
                  </div>
                </div>
                <AnimatePresence>
                  {blockedStatus && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Block Reason</label>
                      <input type="text" placeholder="e.g. Under renovation"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button onClick={() => { setAddModalOpen(false); setBlockedStatus(false); }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setAddModalOpen(false); setBlockedStatus(false); }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">Save Room</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROOM SCHEDULE MODAL — unchanged */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            onClick={() => setScheduleModal(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Room Schedule — {scheduleModal.room_number || scheduleModal.name || scheduleModal.room}
                </h2>
                <button onClick={() => setScheduleModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 w-24"></th>
                      {days.map((d) => (
                        <th key={d} className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-gray-500">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-[12px] font-semibold text-gray-600 whitespace-nowrap">{period}</td>
                        {days.map((day) => {
                          const cls = mockSchedule[period]?.[day];
                          return (
                            <td key={day} className="px-1.5 py-1.5">
                              {cls ? (
                                <div className="rounded-lg bg-indigo-50 px-2.5 py-2 text-center">
                                  <p className="text-[11px] font-bold text-indigo-700">{cls}</p>
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 px-2.5 py-2 text-center">
                                  <p className="text-[10px] font-medium text-gray-300">Free</p>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex justify-end">
                <button onClick={() => setScheduleModal(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}