import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Download, ChevronDown, ChevronLeft, ChevronRight,
  MoreHorizontal, Shield, Clock, CheckCircle2, XCircle,
  Eye, EyeOff, Users, History, KeyRound, Edit2, UserCheck, UserX,
  X, Check, AlertCircle, RefreshCw, Filter,
} from "lucide-react";
import { api } from "../services/api";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

const ITEMS_PER_PAGE = 10;
const ROLES = ["TEACHER", "HOD", "ADMIN"];

const ACTION_LABELS = {
  user_created: "Account Created",
  user_updated: "Account Updated",
  user_enabled: "Account Enabled",
  user_disabled: "Account Disabled",
  password_reset: "Password Reset",
  bulk_enabled: "Bulk Enable",
  bulk_disabled: "Bulk Disable",
  bulk_reset_password: "Bulk Password Reset",
};

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(role) {
  if (role === "ADMIN") return "bg-rose-500";
  if (role === "HOD") return "bg-purple-600";
  return "bg-indigo-600";
}

function getRoleBadge(role) {
  if (role === "ADMIN") return "bg-rose-100 text-rose-700";
  if (role === "HOD") return "bg-purple-100 text-purple-700";
  return "bg-indigo-100 text-indigo-700";
}

function getAuditBadge(action) {
  if (action.includes("created")) return "bg-emerald-100 text-emerald-700";
  if (action.includes("enabled") || action.includes("enable")) return "bg-emerald-100 text-emerald-700";
  if (action.includes("disabled") || action.includes("disable")) return "bg-red-100 text-red-700";
  if (action.includes("reset") || action.includes("password")) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

function formatRelativeTime(ts) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, add };
}

function Toasts({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg text-sm font-medium pointer-events-auto ${t.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            {t.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
        <X size={16} />
      </button>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20";
const selectCls = `${inputCls} appearance-none pr-8 cursor-pointer`;

function AddUserModal({ departments, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TEACHER", department_id: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError(null);
    try {
      const body = { ...form, role: form.role.toLowerCase(), department_id: form.department_id || null };
      const result = await api.post("/api/v1/users/admin-create", body);
      onSuccess(result);
    } catch (err) {
      setApiError(err.message || "Failed to create user.");
    } finally { setSaving(false); }
  }

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: null })); };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Add New User" onClose={onClose} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
        {apiError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {apiError}
          </div>
        )}
        <Field label="Role" error={errors.role}>
          <div className="relative">
            <select value={form.role} onChange={set("role")} className={selectCls}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">College ID will be auto-generated based on the role.</p>
        </Field>
        <Field label="Full Name" error={errors.name}>
          <input value={form.name} onChange={set("name")} placeholder="e.g. Dr. Anita Sharma" className={inputCls} />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={form.email} onChange={set("email")} placeholder="e.g. anita@school.edu" className={inputCls} />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" className={`${inputCls} pr-9`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
        {form.role !== "ADMIN" && (
          <Field label="Department (Optional)" error={errors.department_id}>
            <div className="relative">
              <select value={form.department_id} onChange={set("department_id")} className={selectCls}>
                <option value="">— No Department —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </Field>
        )}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? <><RefreshCw size={13} className="animate-spin" /> Creating…</> : <><Plus size={13} /> Create User</>}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function EditUserModal({ user, departments, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "TEACHER",
    department_id: user.department_id || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError(null);
    try {
      const body = { name: form.name, email: form.email, role: form.role.toLowerCase(), department_id: form.department_id || null };
      const result = await api.patch(`/api/v1/users/${user.id}`, body);
      onSuccess(result);
    } catch (err) {
      setApiError(err.message || "Failed to update user.");
    } finally { setSaving(false); }
  }

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: null })); };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={`Edit — ${user.college_id}`} onClose={onClose} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
        {apiError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {apiError}
          </div>
        )}
        <Field label="Full Name" error={errors.name}>
          <input value={form.name} onChange={set("name")} className={inputCls} />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={form.email} onChange={set("email")} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role" error={errors.role}>
            <div className="relative">
              <select value={form.role} onChange={set("role")} className={selectCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </Field>
          {form.role !== "ADMIN" && (
            <Field label="Department">
              <div className="relative">
                <select value={form.department_id} onChange={set("department_id")} className={selectCls}>
                  <option value="">— None —</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
          )}
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save Changes</>}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function ResetPasswordModal({ user, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Minimum 8 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError(null);
    try {
      await api.put(`/api/v1/users/${user.id}/reset-password`, { new_password: password });
      onSuccess();
    } catch (err) { setApiError(err.message || "Failed to reset password."); }
    finally { setSaving(false); }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={`Reset Password — ${user.college_id}`} onClose={onClose} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
        {apiError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {apiError}
          </div>
        )}
        <Field label="New Password" error={errors.password}>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: null })); }}
              placeholder="Min. 8 characters" className={`${inputCls} pr-9`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" error={errors.confirm}>
          <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((er) => ({ ...er, confirm: null })); }}
            placeholder="Re-enter password" className={inputCls} />
        </Field>
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-60">
            {saving ? <><RefreshCw size={13} className="animate-spin" /> Resetting…</> : <><KeyRound size={13} /> Reset Password</>}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function ConfirmActionModal({ title, description, confirmLabel, danger = false, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  async function handle() { setLoading(true); await onConfirm(); setLoading(false); }
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <div className="px-6 py-5 flex flex-col gap-5">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="flex items-center justify-end gap-2.5">
          <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {loading ? <RefreshCw size={13} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function BulkResetModal({ count, onClose, onConfirm }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handle(e) {
    e.preventDefault();
    const errs = {};
    if (!password) errs.password = "Required.";
    else if (password.length < 8) errs.password = "Minimum 8 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); await onConfirm(password); setLoading(false);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={`Reset Password — ${count} user${count !== 1 ? "s" : ""}`} onClose={onClose} />
      <form onSubmit={handle} className="flex flex-col gap-4 px-6 py-5">
        <p className="text-sm text-gray-600">All selected accounts will receive this new password immediately.</p>
        <Field label="New Password" error={errors.password}>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters" className={`${inputCls} pr-9`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" error={errors.confirm}>
          <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password" className={inputCls} />
        </Field>
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-60">
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <KeyRound size={13} />}
            Reset All
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function AuditLogPanel({ targetCollegeId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = targetCollegeId
      ? `/api/v1/users/audit-log?target=${encodeURIComponent(targetCollegeId)}&limit=50`
      : "/api/v1/users/audit-log?limit=50";
    api.get(url)
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [targetCollegeId]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/20" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-[90] flex flex-col w-[400px] max-w-full bg-white border-l border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Audit Log</h2>
            {targetCollegeId && <p className="text-[12px] text-gray-400 mt-0.5">Filtered: {targetCollegeId}</p>}
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading audit log…</div>}
          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <History size={32} strokeWidth={1.5} />
              <p className="text-sm">No audit entries found.</p>
            </div>
          )}
          {!loading && logs.length > 0 && (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="px-5 py-4 hover:bg-gray-50/60 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-1.5 ${getAuditBadge(log.action)}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{log.target_college_id || "—"}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        by <span className="font-medium text-gray-500">{log.performed_by_college_id || "system"}</span>
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Object.entries(log.details).map(([k, v]) => (
                            <span key={k} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-1">{formatTimestamp(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function RowActionsMenu({ user, onEdit, onReset, onToggle, onAudit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const action = (fn) => () => { fn(); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.12 }}
            className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
            {[
              { icon: Edit2, label: "Edit User", fn: action(onEdit), cls: "text-gray-700" },
              { icon: KeyRound, label: "Reset Password", fn: action(onReset), cls: "text-amber-600" },
              {
                icon: user.is_active ? UserX : UserCheck,
                label: user.is_active ? "Disable Account" : "Enable Account",
                fn: action(onToggle),
                cls: user.is_active ? "text-red-600" : "text-emerald-600",
              },
            ].map(({ icon: Icon, label, fn, cls }) => (
              <button key={label} onClick={fn}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium hover:bg-gray-50 transition ${cls}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
            <div className="my-1 border-t border-gray-100" />
            <button onClick={action(onAudit)}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition">
              <History size={13} /> View Audit Log
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [modal, setModal] = useState(null);
  const [auditPanel, setAuditPanel] = useState(null);

  const { toasts, add: addToast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [usersData, deptsData] = await Promise.all([
        api.get("/api/v1/users/admin-view"),
        api.get("/api/v1/departments"),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const hodUsers = users.filter((u) => u.role === "HOD").length;
  const disabledUsers = users.filter((u) => !u.is_active).length;

  const stats = [
    { label: "Total Users", value: totalUsers, color: "text-gray-900", sub: "Registered accounts", subColor: "text-gray-400", icon: Users, iconBg: "bg-indigo-50", iconText: "text-indigo-600" },
    { label: "Active", value: activeUsers, color: "text-emerald-600", sub: "Currently active", subColor: "text-emerald-500", dot: "bg-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
    { label: "HODs", value: hodUsers, color: "text-purple-600", sub: "Privileged access", subColor: "text-gray-400", icon: Shield, iconBg: "bg-purple-50", iconText: "text-purple-600" },
    { label: "Disabled", value: disabledUsers, color: "text-red-500", sub: "Access suspended", subColor: "text-gray-400", icon: Clock, iconBg: "bg-red-50", iconText: "text-red-500" },
  ];

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (q && !u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q) && !u.college_id?.toLowerCase().includes(q)) return false;
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (deptFilter !== "All" && u.department !== deptFilter) return false;
    if (statusFilter !== "All") {
      if (statusFilter === "Active" && !u.is_active) return false;
      if (statusFilter === "Inactive" && u.is_active) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  const allPageSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach((u) => next.delete(u.id));
      else paginated.forEach((u) => next.add(u.id));
      return next;
    });
  }

  function toggleOne(id) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleToggleStatus(user) {
    const newStatus = !user.is_active;
    try {
      await api.put(`/api/v1/users/${user.id}/status`, { is_active: newStatus });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: newStatus, status: newStatus ? "Active" : "Disabled" } : u));
      addToast(`${user.college_id} ${newStatus ? "enabled" : "disabled"} successfully.`);
    } catch (err) { addToast(err.message || "Failed to update status.", "error"); }
    setModal(null);
  }

  async function handleBulkAction(action, newPassword = null) {
    const ids = [...selected];
    const body = { user_ids: ids, action };
    if (newPassword) body.new_password = newPassword;
    try {
      const res = await api.post("/api/v1/users/bulk-action", body);
      addToast(`${res.affected} account${res.affected !== 1 ? "s" : ""} ${action === "enable" ? "enabled" : action === "disable" ? "disabled" : "password reset"}.`);
      setSelected(new Set());
      await fetchAll();
    } catch (err) { addToast(err.message || "Bulk action failed.", "error"); }
    setModal(null);
  }

  const deptOptions = ["All", ...departments.map((d) => d.name)];

  function exportCSV() {
    const header = ["College ID", "Name", "Email", "Role", "Department", "Status", "Last Active"];
    const rows = filtered.map((u) => [u.college_id, u.name, u.email, u.role, u.department || "", u.status, u.last_active]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function pageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-full overflow-y-auto px-1 pb-8">
      <Toasts toasts={toasts} />

      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Configure institutional access and departmental hierarchies.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setAuditPanel("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition">
            <History size={14} /> Audit Log
          </button>
          <button onClick={() => setModal({ type: "add" })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
            <Plus size={15} /> Add User
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className={`mt-1 text-[34px] font-bold leading-none tracking-tight ${s.color}`}>{loading ? "—" : s.value}</p>
                  <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${s.subColor}`}>
                    {s.dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />}
                    {s.sub}
                  </p>
                </div>
                {Icon && (
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg} ${s.iconText}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search name, email, ID…"
              className="rounded-full border border-gray-300 bg-white py-1.5 pl-8 pr-4 text-xs font-medium text-gray-700 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 w-52" />
            {search && (
              <button onClick={() => { setSearch(""); resetPage(); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
          </div>

          {[
            { label: "Role", value: roleFilter, options: ["All", ...ROLES], set: (v) => { setRoleFilter(v); resetPage(); } },
            { label: "Dept", value: deptFilter, options: deptOptions, set: (v) => { setDeptFilter(v); resetPage(); } },
            { label: "Status", value: statusFilter, options: ["All", "Active", "Inactive"], set: (v) => { setStatusFilter(v); resetPage(); } },
          ].map((f) => (
            <div key={f.label} className="relative">
              <select value={f.value} onChange={(e) => f.set(e.target.value)}
                className="appearance-none rounded-full border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 shadow-sm transition hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {f.options.map((opt) => <option key={opt} value={opt}>{f.label}: {opt}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          ))}

          {(search || roleFilter !== "All" || deptFilter !== "All" || statusFilter !== "All") && (
            <button onClick={() => { setSearch(""); setRoleFilter("All"); setDeptFilter("All"); setStatusFilter("All"); resetPage(); }}
              className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 transition">
              <Filter size={10} /> Clear filters
            </button>
          )}
        </div>

        <button onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition">
          <Download size={13} /> Export CSV
        </button>
      </motion.div>

      <AnimatePresence>
        {someSelected && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold text-indigo-700">
              {selected.size} user{selected.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              {[
                { label: "Enable All", cls: "bg-emerald-600 hover:bg-emerald-700 text-white", icon: UserCheck, fn: () => setModal({ type: "bulk_confirm", data: { action: "enable" } }) },
                { label: "Disable All", cls: "bg-red-600 hover:bg-red-700 text-white", icon: UserX, fn: () => setModal({ type: "bulk_confirm", data: { action: "disable" } }) },
                { label: "Reset Password", cls: "bg-amber-500 hover:bg-amber-600 text-white", icon: KeyRound, fn: () => setModal({ type: "bulk_reset" }) },
              ].map(({ label, cls, icon: Icon, fn }) => (
                <button key={label} onClick={fn}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${cls}`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
              <button onClick={() => setSelected(new Set())} className="ml-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition">
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading users…</div>}
        {error && (
          <div className="flex items-center justify-between px-5 py-4 bg-red-50 border-b border-red-100">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={fetchAll} className="ml-4 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">Retry</button>
          </div>
        )}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <Users size={36} strokeWidth={1.5} />
                <p className="text-sm">No users match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <th className="w-10 px-4 py-3">
                        <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                          className="h-3.5 w-3.5 rounded border-gray-300 accent-indigo-600 cursor-pointer" />
                      </th>
                      {["User", "College ID", "Role", "Department", "Status", "Added", "Actions"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => {
                      const isSelected = selected.has(u.id);
                      const disabled = !u.is_active;
                      return (
                        <motion.tr key={u.id} layout
                          className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${isSelected ? "bg-indigo-50/40" : ""}`}>
                          <td className="px-4 py-3.5">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(u.id)}
                              className="h-3.5 w-3.5 rounded border-gray-300 accent-indigo-600 cursor-pointer" />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${getAvatarColor(u.role)} ${disabled ? "opacity-50" : ""}`}>
                                {getInitials(u.name)}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-[13px] font-semibold truncate ${disabled ? "text-gray-400" : "text-gray-900"}`}>{u.name}</p>
                                <p className={`text-[11px] truncate ${disabled ? "text-gray-300" : "text-gray-400"}`}>{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className="font-mono text-[12px] text-gray-500">{u.college_id}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getRoleBadge(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-gray-600">
                            {u.department || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${u.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-500/20" : "bg-red-50 text-red-600 ring-red-500/20"}`}>
                              <span className={`inline-block h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
                              {u.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-gray-400">
                            {u.created_at ? formatRelativeTime(u.created_at) : u.last_active}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <RowActionsMenu
                              user={u}
                              onEdit={() => setModal({ type: "edit", data: u })}
                              onReset={() => setModal({ type: "reset", data: u })}
                              onToggle={() => setModal({
                                type: "confirm_toggle",
                                data: {
                                  user: u,
                                  title: u.is_active ? `Disable ${u.college_id}?` : `Enable ${u.college_id}?`,
                                  description: u.is_active
                                    ? `This will revoke ${u.name}'s access immediately. They will not be able to log in until re-enabled.`
                                    : `This will restore ${u.name}'s access. They will be able to log in again.`,
                                  confirmLabel: u.is_active ? "Disable Account" : "Enable Account",
                                  danger: u.is_active,
                                },
                              })}
                              onAudit={() => setAuditPanel(u.college_id)}
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</span>–
                  <span className="font-semibold">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span>
                  {" "}of <span className="font-semibold">{filtered.length}</span> users
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition">
                    <ChevronLeft size={14} />
                  </button>
                  {pageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${page === p ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {modal?.type === "add" && (
          <AddUserModal
            departments={departments}
            onClose={() => setModal(null)}
            onSuccess={() => { setModal(null); fetchAll(); addToast("User created successfully."); }}
          />
        )}
        {modal?.type === "edit" && (
          <EditUserModal
            user={modal.data}
            departments={departments}
            onClose={() => setModal(null)}
            onSuccess={(updated) => {
              setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
              setModal(null);
              addToast(`${updated.college_id} updated successfully.`);
            }}
          />
        )}
        {modal?.type === "reset" && (
          <ResetPasswordModal
            user={modal.data}
            onClose={() => setModal(null)}
            onSuccess={() => { addToast(`Password reset for ${modal.data.college_id}.`); setModal(null); }}
          />
        )}
        {modal?.type === "confirm_toggle" && (
          <ConfirmActionModal
            title={modal.data.title}
            description={modal.data.description}
            confirmLabel={modal.data.confirmLabel}
            danger={modal.data.danger}
            onClose={() => setModal(null)}
            onConfirm={() => handleToggleStatus(modal.data.user)}
          />
        )}
        {modal?.type === "bulk_confirm" && (
          <ConfirmActionModal
            title={modal.data.action === "enable" ? `Enable ${selected.size} accounts?` : `Disable ${selected.size} accounts?`}
            description={modal.data.action === "enable"
              ? `All ${selected.size} selected accounts will have their access restored immediately.`
              : `All ${selected.size} selected accounts will lose access immediately.`}
            confirmLabel={modal.data.action === "enable" ? "Enable All" : "Disable All"}
            danger={modal.data.action === "disable"}
            onClose={() => setModal(null)}
            onConfirm={() => handleBulkAction(modal.data.action)}
          />
        )}
        {modal?.type === "bulk_reset" && (
          <BulkResetModal
            count={selected.size}
            onClose={() => setModal(null)}
            onConfirm={(pw) => handleBulkAction("reset_password", pw)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {auditPanel !== null && (
          <AuditLogPanel
            targetCollegeId={auditPanel}
            onClose={() => setAuditPanel(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}