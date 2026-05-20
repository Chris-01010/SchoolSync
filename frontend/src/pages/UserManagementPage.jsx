import { api } from "../services/api";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, TrendingUp, ChevronDown, Download, SlidersHorizontal,
  ChevronLeft, ChevronRight, MoreHorizontal, Shield, Clock,
} from "lucide-react";

const filterDropdowns = [
  { label: "Role",   options: ["All", "TEACHER", "HOD", "ADMIN"] },
  { label: "Dept",   options: ["All", "Science", "Math", "English", "History"] },
  { label: "Status", options: ["All", "Active", "Inactive"] },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(role) {
  if (role === "ADMIN")   return "bg-red-500";
  if (role === "HOD")     return "bg-purple-600";
  if (role === "TEACHER") return "bg-indigo-600";
  return "bg-gray-500";
}

function getRolePill(role) {
  if (role === "HOD")     return "bg-purple-100 text-purple-700";
  if (role === "ADMIN")   return "bg-red-100 text-red-700";
  if (role === "TEACHER") return "bg-indigo-100 text-indigo-700";
  return null;
}

function getStatusPill(status) {
  if (status === "Active") return {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    dot:  "bg-emerald-500",
  };
  return {
    pill: "bg-red-50 text-red-700 ring-red-500/20",
    dot:  "bg-red-500",
  };
}

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/v1/users/admin-view");
      const list = Array.isArray(data) ? data : (data?.data || []);
      setUsers(list);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Derived stats from real data
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.is_active).length;
  const hodUsers      = users.filter((u) => u.role === "HOD").length;
  const disabledUsers = users.filter((u) => !u.is_active).length;

  const stats = [
    { label: "TOTAL USERS",  value: totalUsers,    valueColor: "text-gray-900",   sub: "Registered accounts",    subColor: "text-gray-400",    subIcon: TrendingUp },
    { label: "ACTIVE",       value: activeUsers,   valueColor: "text-indigo-600", sub: "Currently active",       subColor: "text-emerald-600", dot: "bg-emerald-500" },
    { label: "HODs",         value: hodUsers,      valueColor: "text-indigo-600", sub: "Privileged access",      subColor: "text-gray-400",    subIcon: Shield },
    { label: "DISABLED",     value: disabledUsers, valueColor: "text-red-600",    sub: "Access suspended",       subColor: "text-gray-400",    subIcon: Clock },
  ];

  // Filtering
  const filtered = users.filter((u) => {
    if (roleFilter   !== "All" && u.role !== roleFilter) return false;
    if (deptFilter   !== "All" && u.department !== deptFilter) return false;
    if (statusFilter !== "All") {
      const isActive = u.is_active ? "Active" : "Inactive";
      if (isActive !== statusFilter) return false;
    }
    return true;
  });

  // Pagination
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated   = filtered.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const handleFilterChange = (label, value) => {
    setActivePage(1);
    if (label === "Role")   setRoleFilter(value);
    if (label === "Dept")   setDeptFilter(value);
    if (label === "Status") setStatusFilter(value);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-7">

      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Configure institutional access and departmental hierarchies.</p>
        </div>
        <button className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
          <Plus size={15} /> Add User
        </button>
      </motion.div>

      {/* STAT CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const SubIcon = s.subIcon;
          return (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
              <p className={`mt-1 text-[34px] font-bold leading-none tracking-tight ${s.valueColor}`}>
                {loading ? "—" : s.value}
              </p>
              <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${s.subColor}`}>
                {s.dot    && <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />}
                {SubIcon  && <SubIcon size={12} />}
                {s.sub}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FILTER ROW */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterDropdowns.map((f) => (
            <div key={f.label} className="relative">
              <select
                onChange={(e) => handleFilterChange(f.label, e.target.value)}
                className="appearance-none rounded-full border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 shadow-sm transition hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>{f.label}: {opt}</option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50">
            <Download size={15} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading users…</div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between px-5 py-4 bg-red-50 border-b border-red-100">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={fetchUsers} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">No users found.</div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["USER", "ROLE", "DEPT", "STATUS", "LAST ACTIVE", "ACTIONS"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => {
                  const { pill, dot } = getStatusPill(u.status);
                  const rolePill = getRolePill(u.role);
                  const disabled = !u.is_active;
                  return (
                    <tr key={u.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">

                      {/* USER */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(u.role)}`}>
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${disabled ? "text-gray-400" : "text-gray-900"}`}>
                              {u.name}
                            </p>
                            <p className={`text-[12px] ${disabled ? "text-gray-300" : "text-gray-500"}`}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {rolePill
                          ? <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${rolePill}`}>{u.role}</span>
                          : <span className="text-[12px] font-medium text-gray-400">{u.role}</span>
                        }
                      </td>

                      {/* DEPT */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                        {u.department || <span className="text-gray-300">—</span>}
                      </td>

                      {/* STATUS */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${pill}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
                          {u.status}
                        </span>
                      </td>

                      {/* LAST ACTIVE */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{u.last_active}</td>

                      {/* ACTIONS */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <button className={`text-[12px] font-semibold transition ${disabled ? "text-gray-400 hover:text-gray-600" : "text-indigo-600 hover:text-indigo-800"}`}>
                            Edit
                          </button>
                          <button className="text-[12px] font-semibold text-gray-400 transition hover:text-gray-600">
                            Reset
                          </button>
                          {disabled && (
                            <button className="text-[12px] font-semibold text-emerald-600 transition hover:text-emerald-800">
                              Enable
                            </button>
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

        {/* PAGINATION */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold">{(activePage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(activePage * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
              <span className="font-semibold">{filtered.length}</span> users
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setActivePage((p) => Math.max(1, p - 1))} disabled={activePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setActivePage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${activePage === p ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))} disabled={activePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}