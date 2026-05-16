import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Building,
  Calendar,
  ClipboardList,
  Bell,
  AlertTriangle,
  Camera,
  Download,
  RotateCcw,
  Server,
  HardDrive,
  Users,
  Clock,
  Shield,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════════════ */

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};

/* ═══════════════════════════════════════════════════════════════
   Reusable Toggle Switch
   ═══════════════════════════════════════════════════════════════ */

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable Field Label
   ═══════════════════════════════════════════════════════════════ */

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Text Input Styling
   ═══════════════════════════════════════════════════════════════ */

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

/* ═══════════════════════════════════════════════════════════════
   Section Card Wrapper
   ═══════════════════════════════════════════════════════════════ */

function SectionCard({ icon: Icon, iconBg, iconColor, title, titleColor, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg || "bg-indigo-50"} ${iconColor || "text-indigo-600"}`}>
            <Icon size={16} />
          </div>
        )}
        <h2 className={`text-[16px] font-bold ${titleColor || "text-gray-900"}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SettingsPage
   ═══════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  /* ─── Institution Profile ─── */
  const [instName, setInstName] = useState("Main Campus");
  const [instCode, setInstCode] = useState("MC-2024");
  const [academicYear, setAcademicYear] = useState("2024/25");
  const [address, setAddress] = useState("123 Education Street, Academic City");
  const [contactEmail, setContactEmail] = useState("admin@institution.edu");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");

  /* ─── Timetable Configuration ─── */
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("15:30");
  const [periodDuration, setPeriodDuration] = useState(60);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [workingDays, setWorkingDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  const [breakEnabled, setBreakEnabled] = useState(true);
  const [breakTime, setBreakTime] = useState("09:00");
  const [breakDuration, setBreakDuration] = useState(15);

  /* ─── Leave & Relief ─── */
  const [maxLeaveDays, setMaxLeaveDays] = useState(3);
  const [medCertAfter, setMedCertAfter] = useState(2);
  const [autoRelief, setAutoRelief] = useState(true);
  const [fairnessMode, setFairnessMode] = useState(true);
  const [hodApproval, setHodApproval] = useState(true);
  const [maxReliefPerWeek, setMaxReliefPerWeek] = useState(5);

  /* ─── Notification Preferences ─── */
  const [notifUnassigned, setNotifUnassigned] = useState(true);
  const [notifConflict, setNotifConflict] = useState(true);
  const [notifLeave, setNotifLeave] = useState(true);
  const [notifWorkload, setNotifWorkload] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);
  const [notifDigest, setNotifDigest] = useState(false);

  /* ─── Admin Profile ─── */
  const [adminName, setAdminName] = useState("Admin Sarah");
  const [adminEmail, setAdminEmail] = useState("admin@institution.edu");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const toggleDay = (day) =>
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));

  /* ─── Notification items config ─── */
  const notifItems = [
    { label: "Unassigned Relief Alerts", desc: "Get notified when relief periods are unassigned", checked: notifUnassigned, onChange: setNotifUnassigned },
    { label: "Timetable Conflict Alerts", desc: "Immediate alerts for scheduling conflicts", checked: notifConflict, onChange: setNotifConflict },
    { label: "Leave Request Notifications", desc: "Notified when new leave requests are submitted", checked: notifLeave, onChange: setNotifLeave },
    { label: "Workload Warning Alerts", desc: "Alert when teacher workload exceeds threshold", checked: notifWorkload, onChange: setNotifWorkload },
    { label: "System Status Alerts", desc: "Notifications for system maintenance and updates", checked: notifSystem, onChange: setNotifSystem },
    { label: "Email Digest", desc: "Daily summary email of all activities", checked: notifDigest, onChange: setNotifDigest },
  ];

  /* ─── System Info rows ─── */
  const sysRows = [
    { label: "Version", value: "v2.4.0-stable" },
    { label: "Last Updated", value: "January 15, 2024" },
    { label: "Database Status", badge: true },
    { label: "Storage Used", storage: true },
    { label: "Active Sessions", value: "23" },
    { label: "Last Backup", value: "Jan 15, 2024 03:00 AM" },
  ];

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7">
      {/* ═══════ HEADER ═══════ */}
      <motion.div
        variants={itemV}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Configure system preferences and institutional settings.
          </p>
        </div>
        <button className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]">
          <Save size={15} />
          Save Changes
        </button>
      </motion.div>

      {/* ═══════ TWO COLUMN LAYOUT ═══════ */}
      <motion.div variants={itemV} className="grid grid-cols-1 gap-6 xl:grid-cols-[65%_1fr]">
        {/* ─────── LEFT COLUMN ─────── */}
        <div className="space-y-6">
          {/* ── CARD 1: Institution Profile ── */}
          <SectionCard icon={Building} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Institution Profile">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Institution Name</FieldLabel>
                  <input type="text" value={instName} onChange={(e) => setInstName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Institution Code</FieldLabel>
                  <input type="text" value={instCode} onChange={(e) => setInstCode(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <FieldLabel>Academic Year</FieldLabel>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option>2023/24</option>
                  <option>2024/25</option>
                  <option>2025/26</option>
                </select>
              </div>

              <div>
                <FieldLabel>Address</FieldLabel>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Contact Email</FieldLabel>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Contact Phone</FieldLabel>
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── CARD 2: Timetable Configuration ── */}
          <SectionCard icon={Calendar} iconBg="bg-violet-50" iconColor="text-violet-600" title="Timetable Configuration">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <FieldLabel>School Start Time</FieldLabel>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>School End Time</FieldLabel>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Period Duration</FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={periodDuration}
                      onChange={(e) => setPeriodDuration(Number(e.target.value))}
                      className={inputCls}
                    />
                    <span className="flex-shrink-0 text-[12px] font-medium text-gray-400">min</span>
                  </div>
                </div>
                <div>
                  <FieldLabel>Periods per Day</FieldLabel>
                  <input
                    type="number"
                    value={periodsPerDay}
                    onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Working Days */}
              <div>
                <FieldLabel>Working Days</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(workingDays).map(([day, active]) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg border px-4 py-2 text-[13px] font-semibold transition-all ${
                        active
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400/30"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Break Period */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Break Period</span>
                  </div>
                  <ToggleSwitch checked={breakEnabled} onChange={setBreakEnabled} id="toggle-break" />
                </div>
                {breakEnabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Break Time</FieldLabel>
                      <input type="time" value={breakTime} onChange={(e) => setBreakTime(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <FieldLabel>Duration (min)</FieldLabel>
                      <input
                        type="number"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── CARD 3: Leave & Relief Settings ── */}
          <SectionCard icon={ClipboardList} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Leave & Relief Settings">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Max Leave Days per Month</FieldLabel>
                  <input
                    type="number"
                    value={maxLeaveDays}
                    onChange={(e) => setMaxLeaveDays(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <FieldLabel>Require Medical Certificate after</FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={medCertAfter}
                      onChange={(e) => setMedCertAfter(Number(e.target.value))}
                      className={inputCls}
                    />
                    <span className="flex-shrink-0 text-[12px] font-medium text-gray-400">days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Auto-assign Relief</p>
                    <p className="text-[12px] text-gray-400">Automatically suggest relief teachers</p>
                  </div>
                  <ToggleSwitch checked={autoRelief} onChange={setAutoRelief} id="toggle-auto-relief" />
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Relief Fairness Mode</p>
                    <p className="text-[12px] text-gray-400">Balance relief duties equally</p>
                  </div>
                  <ToggleSwitch checked={fairnessMode} onChange={setFairnessMode} id="toggle-fairness" />
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">HOD Approval Required</p>
                    <p className="text-[12px] text-gray-400">Leave requests need HOD approval before Admin</p>
                  </div>
                  <ToggleSwitch checked={hodApproval} onChange={setHodApproval} id="toggle-hod-approval" />
                </div>
              </div>

              <div>
                <FieldLabel>Max Relief Periods per Week per Teacher</FieldLabel>
                <input
                  type="number"
                  value={maxReliefPerWeek}
                  onChange={(e) => setMaxReliefPerWeek(Number(e.target.value))}
                  className={`${inputCls} sm:max-w-[200px]`}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── CARD 4: Notification Preferences ── */}
          <SectionCard icon={Bell} iconBg="bg-amber-50" iconColor="text-amber-600" title="Notification Preferences">
            <div className="space-y-0 divide-y divide-gray-100">
              {notifItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="mt-0.5 text-[12px] text-gray-400">{item.desc}</p>
                  </div>
                  <ToggleSwitch
                    checked={item.checked}
                    onChange={item.onChange}
                    id={`toggle-notif-${idx}`}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ─────── RIGHT COLUMN ─────── */}
        <div className="space-y-6">
          {/* ── Admin Profile ── */}
          <SectionCard icon={Shield} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Admin Profile">
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
                  <span className="text-2xl font-bold">AD</span>
                </div>
                <button className="text-[12px] font-semibold text-gray-500 transition hover:text-indigo-600 flex items-center gap-1">
                  <Camera size={12} />
                  Change Photo
                </button>
              </div>

              <div>
                <FieldLabel>Name</FieldLabel>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputCls} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Change Password</p>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Current Password</FieldLabel>
                    <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>New Password</FieldLabel>
                    <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]">
                <Save size={15} />
                Update Profile
              </button>
            </div>
          </SectionCard>

          {/* ── System Information ── */}
          <SectionCard icon={Server} iconBg="bg-slate-100" iconColor="text-slate-600" title="System Information">
            <div className="divide-y divide-gray-100">
              {/* Version */}
              <div className="flex items-center justify-between py-3 first:pt-0">
                <span className="text-[12px] font-medium text-gray-400">Version</span>
                <span className="text-[13px] font-bold text-gray-700">v2.4.0-stable</span>
              </div>
              {/* Last Updated */}
              <div className="flex items-center justify-between py-3">
                <span className="text-[12px] font-medium text-gray-400">Last Updated</span>
                <span className="text-[13px] font-bold text-gray-700">January 15, 2024</span>
              </div>
              {/* Database Status */}
              <div className="flex items-center justify-between py-3">
                <span className="text-[12px] font-medium text-gray-400">Database Status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
              {/* Storage Used */}
              <div className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-400">Storage Used</span>
                  <span className="text-[13px] font-bold text-gray-700">45.2 GB / 100 GB</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: "45%" }} />
                </div>
              </div>
              {/* Active Sessions */}
              <div className="flex items-center justify-between py-3">
                <span className="text-[12px] font-medium text-gray-400">Active Sessions</span>
                <span className="text-[13px] font-bold text-gray-700">23</span>
              </div>
              {/* Last Backup */}
              <div className="flex items-center justify-between py-3 last:pb-0">
                <span className="text-[12px] font-medium text-gray-400">Last Backup</span>
                <span className="text-[13px] font-bold text-gray-700">Jan 15, 2024 03:00 AM</span>
              </div>
            </div>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle size={16} />
              </div>
              <h2 className="text-[16px] font-bold text-red-600">Danger Zone</h2>
            </div>

            <div className="divide-y divide-red-200/60">
              {/* Reset All Timetables */}
              <div className="flex items-center justify-between gap-4 pb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Reset All Timetables</p>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    Permanently clear all timetable data for the current academic year.
                  </p>
                </div>
                <button className="flex-shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-400 active:scale-[0.97]">
                  <span className="flex items-center gap-1.5">
                    <RotateCcw size={13} />
                    Reset
                  </span>
                </button>
              </div>

              {/* Export All Data */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Export All Data</p>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    Download a complete backup of all institutional data.
                  </p>
                </div>
                <button className="flex-shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50 hover:border-gray-400 active:scale-[0.97]">
                  <span className="flex items-center gap-1.5">
                    <Download size={13} />
                    Export
                  </span>
                </button>
              </div>
            </div>
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
  );
}
