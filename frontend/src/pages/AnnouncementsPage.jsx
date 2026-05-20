import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  GraduationCap,
  Shield,
  Building,
  CheckCircle,
  X,
  Eye,
  Trash2,
  Mail,
  Clock,
  Send,
  Megaphone,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};

const toastV = {
  hidden: { opacity: 0, x: 80, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 26 } },
  exit: { opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } },
};

/* ═══════════════════════════════════════════════════════════════
   Mock data
   ═══════════════════════════════════════════════════════════════ */

const recentAnnouncements = [
  {
    id: 1,
    subject: "Mid-Term Exam Schedule Update",
    priority: "High",
    sentTo: "All Teachers",
    message:
      "Please note that mid-term examinations have been rescheduled to Feb 5-9. Update your timetables accordingly.",
    timestamp: "Jan 15, 2024",
    sentBy: "Admin",
  },
  {
    id: 2,
    subject: "Relief Duty Reminder",
    priority: "Normal",
    sentTo: "All HODs",
    message:
      "Kindly ensure all unassigned relief periods for this week are resolved before Friday 5PM.",
    timestamp: "Jan 14, 2024",
    sentBy: "Admin",
  },
  {
    id: 3,
    subject: "Staff Meeting — Jan 20",
    priority: "High",
    sentTo: "All Users",
    message:
      "Mandatory staff meeting scheduled for January 20th at 10AM in the Auditorium. Attendance is compulsory.",
    timestamp: "Jan 13, 2024",
    sentBy: "Admin",
  },
  {
    id: 4,
    subject: "New Lab Safety Guidelines",
    priority: "Normal",
    sentTo: "Specific Depts (Science, CS)",
    message:
      "Updated lab safety protocols have been issued. All lab supervisors must review and sign the acknowledgement form.",
    timestamp: "Jan 10, 2024",
    sentBy: "Admin",
  },
  {
    id: 5,
    subject: "Holiday Notice",
    priority: "Low",
    sentTo: "All Users",
    message:
      "The institution will remain closed on January 26th on account of Republic Day.",
    timestamp: "Jan 8, 2024",
    sentBy: "Admin",
  },
];

const departments = ["Mathematics", "Science", "English", "History", "Computer Science", "Physics"];

const recipientOptions = [
  { key: "all_users", label: "All Users", icon: Users },
  { key: "all_teachers", label: "All Teachers", icon: GraduationCap },
  { key: "all_hods", label: "All HODs", icon: Shield },
  { key: "specific_depts", label: "Specific Departments", icon: Building },
];

/* ═══════════════════════════════════════════════════════════════
   Priority badge helper
   ═══════════════════════════════════════════════════════════════ */

function PriorityBadge({ priority }) {
  const styles = {
    High: "bg-red-50 text-red-700 ring-red-500/20",
    Normal: "bg-blue-50 text-blue-700 ring-blue-500/20",
    Low: "bg-gray-100 text-gray-600 ring-gray-400/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
        styles[priority] || styles.Normal
      }`}
    >
      {priority}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Toggle Switch component
   ═══════════════════════════════════════════════════════════════ */

function ToggleSwitch({ checked, onChange, label, icon: Icon }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={15} className="text-gray-400 group-hover:text-gray-500 transition" />}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AnnouncementsPage
   ═══════════════════════════════════════════════════════════════ */

export default function AnnouncementsPage() {
  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendTo, setSendTo] = useState("all_users");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [priority, setPriority] = useState("Normal");
  const [emailCopy, setEmailCopy] = useState(false);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Toast
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const recipientLabel = () => {
    const opt = recipientOptions.find((r) => r.key === sendTo);
    return opt ? opt.label : "All Users";
  };

  const handleSend = () => {
    setToast(`Announcement sent successfully to ${recipientLabel()}`);
    // Reset form
    setSubject("");
    setMessage("");
    setSendTo("all_users");
    setSelectedDepts([]);
    setPriority("Normal");
    setEmailCopy(false);
    setScheduleLater(false);
    setScheduleDate("");
    setScheduleTime("");
  };

  const toggleDept = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  return (
    <>
      <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">
        {/* ═══════ HEADER ═══════ */}
        <motion.div
          variants={itemV}
          className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Announcements</h1>
            <p className="mt-1 text-[14px] text-gray-500">
              Send and manage institutional announcements across all departments.
            </p>
          </div>
          <button
            onClick={handleSend}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
          >
            <Plus size={15} />
            New Announcement
          </button>
        </motion.div>

        {/* ═══════ TWO COLUMN LAYOUT ═══════ */}
        <motion.div variants={itemV} className="grid grid-cols-1 gap-6 xl:grid-cols-[55%_1fr]">
          {/* ─────── LEFT: Send Announcement ─────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Megaphone size={16} />
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">New Announcement</h2>
            </div>

            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Announcement subject..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Send To */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Send To
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {recipientOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = sendTo === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSendTo(opt.key)}
                        className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left transition-all ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-400/30"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition ${
                            isSelected
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <p
                            className={`text-[13px] font-semibold ${
                              isSelected ? "text-indigo-700" : "text-gray-700"
                            }`}
                          >
                            {opt.label}
                          </p>
                        </div>
                        {/* Radio circle */}
                        <div className="ml-auto flex-shrink-0">
                          <div
                            className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Department multi-select (conditional) */}
                <AnimatePresence>
                  {sendTo === "specific_depts" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3.5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Select Departments
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {departments.map((dept) => {
                            const isChecked = selectedDepts.includes(dept);
                            return (
                              <label
                                key={dept}
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition ${
                                  isChecked
                                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleDept(dept)}
                                  className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {dept}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Priority
                </label>
                <div className="flex gap-2">
                  {["High", "Normal", "Low"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-full px-5 py-1.5 text-[13px] font-semibold transition-all ${
                        priority === p
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <ToggleSwitch
                  checked={emailCopy}
                  onChange={setEmailCopy}
                  label="Send Email Copy"
                  icon={Mail}
                />
                <div className="border-t border-gray-200" />
                <ToggleSwitch
                  checked={scheduleLater}
                  onChange={setScheduleLater}
                  label="Schedule for later"
                  icon={Clock}
                />

                {/* Schedule date/time (conditional) */}
                <AnimatePresence>
                  {scheduleLater && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Date
                          </label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Time
                          </label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                <Send size={15} />
                Send Announcement
              </button>
            </div>
          </div>

          {/* ─────── RIGHT: Recent Announcements ─────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Megaphone size={16} />
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">Recent Announcements</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {recentAnnouncements.map((ann) => (
                <div key={ann.id} className="py-4 first:pt-0 last:pb-0 group">
                  {/* Top row: subject + badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug">
                      {ann.subject}
                    </h3>
                    <PriorityBadge priority={ann.priority} />
                  </div>

                  {/* Sent to */}
                  <p className="mt-1 text-[12px] font-medium text-gray-400">
                    Sent to: <span className="text-gray-500">{ann.sentTo}</span>
                  </p>

                  {/* Message preview — truncated 2 lines */}
                  <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500 line-clamp-2">
                    {ann.message}
                  </p>

                  {/* Bottom row */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-gray-400">
                        {ann.timestamp}
                      </span>
                      <span className="text-[11px] text-gray-300">•</span>
                      <span className="text-[11px] font-medium text-gray-400">
                        Sent by {ann.sentBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-500 transition hover:text-gray-700">
                        <Eye size={13} />
                        View
                      </button>
                      <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-500 transition hover:text-red-700">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════ FOOTER ═══════ */}
        <motion.div variants={itemV}>
          <div className="border-t border-gray-200 pt-5">
            <p className="text-center text-[12px] text-gray-400">
              © 2024 All Rights Reserved &nbsp;|&nbsp; Audit Log &nbsp;|&nbsp; System Status:{" "}
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>{" "}
              &nbsp;|&nbsp; v2.4.0-stable
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════ SUCCESS TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-lg"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle size={15} />
            </div>
            <p className="text-[13px] font-semibold text-emerald-800">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 flex-shrink-0 text-emerald-400 transition hover:text-emerald-600"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
