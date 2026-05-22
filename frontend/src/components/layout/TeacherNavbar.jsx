import React, { useState, useEffect } from "react";
import { Bell, Clock, LogOut, Menu, Plus, CheckCircle2, Repeat2, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import ReliefAssignmentModal from "../teacher/ReliefAssignmentModal";

const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

const STATIC_NOTIFS = [
  {
    Icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Leave Application Approved",
    sub: "Your sick leave for " + fmtDate(tomorrow) + " has been approved by the HOD.",
    time: "2h ago",
    isRelief: false,
  },
  {
    Icon: Repeat2,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    title: "Substitute Assignment Notification",
    sub: "You have been assigned to cover Dr. Wilson's Period 6 class in Lab 2 on " + fmtDate(tomorrow) + ".",
    time: "4h ago",
    isRelief: true,
  },
  {
    Icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Departmental Meeting Scheduled",
    sub: "Mathematics Department meeting at 15:30 on " + fmtDate(dayAfter) + ". Attendance required.",
    time: "5h ago",
    isRelief: false,
  },
];

function toModalShape(req) {
  return {
    id: req.id,
    class_name: req.class ?? "Unknown Class",
    period: req.period ?? "--",
    period_start_time: null,
    period_end_time: null,
    original_teacher_name: req.absentTeacher ?? "Unknown Teacher",
    day_label: req.day ?? "--",
    subject_name: req.subject ?? "",
  };
}

const TeacherNavbar = ({ onMenuClick, user, onApplyLeave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [reliefModalOpen, setReliefModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [pendingReliefs, setPendingReliefs] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);

  useEffect(() => {
    api.get("/teacher/me/relief/pending")
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPendingReliefs(list);
      })
      .catch(() => setPendingReliefs([]));
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  const mockReliefAssignment = {
    id: 'mock-relief-001',
    class_name: '10A Chemistry',
    period: 4,
    period_start_time: '13:00',
    period_end_time: '14:00',
    original_teacher_name: 'Dr. Patel',
    day_label: 'Today',
    subject_name: 'Chemistry',
    room_name: 'Lab 3',
  };

  // REPLACE WITH THIS
  const handleReliefClick = () => {
    const assignment = pendingReliefs.length > 0
      ? toModalShape(pendingReliefs[0])
      : mockReliefAssignment;
    setActiveAssignment(assignment);
    setNotifOpen(false);
    setReliefModalOpen(true);
  };
  const handleAccept = () => {
    setPendingReliefs((prev) => prev.slice(1));
    setToastMessage({ text: "Assignment accepted", kind: "accept" });
  };

  const handleReject = () => {
    setPendingReliefs((prev) => prev.slice(1));
    setToastMessage({ text: "Assignment rejected", kind: "reject" });
  };

  const handleFlag = () => {
    setPendingReliefs((prev) => prev.slice(1));
    setToastMessage({ text: "Assignment flagged for admin review", kind: "flag" });
  };

  const isOnLeavesPage = /leaves|my-leaves/i.test(location.pathname);

  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const fmt = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric", year: "numeric",
        }).toUpperCase() + " - " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    fmt();
    const id = setInterval(fmt, 30000);
    return () => clearInterval(id);
  }, []);

  const initials = (user?.name ?? user?.email ?? "T")
    .split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toastStyles = {
    accept: "bg-emerald-50 border-emerald-200 text-emerald-700",
    reject: "bg-gray-50 border-gray-200 text-gray-700",
    flag: "bg-amber-50 border-amber-200 text-amber-700",
    error: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <>
      <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <span className="text-[13px] font-bold text-blue-600 hidden sm:block">Teacher Dashboard</span>
        <div className="flex-1" />

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
            Mathematics
          </span>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {pendingReliefs.length > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingReliefs.length}
                </span>
              ) : (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-9 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-800">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-[10px] text-blue-600 font-semibold hover:underline">
                    Mark all read
                  </button>
                </div>

                {pendingReliefs.length > 0 && (
                  <div
                    onClick={handleReliefClick}
                    className="flex items-start gap-2.5 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 cursor-pointer border-b border-orange-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Repeat2 size={13} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-orange-800">
                        {pendingReliefs.length} Pending Relief Request{pendingReliefs.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-[10px] text-orange-600 leading-snug">Tap to review and respond</p>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {STATIC_NOTIFS.map((n, i) => {
                    const I = n.Icon;
                    return (
                      <div
                        key={i}
                        onClick={n.isRelief ? handleReliefClick : undefined}
                        className={"flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50 " + (n.isRelief ? "cursor-pointer" : "")}
                      >
                        <div className={"w-7 h-7 rounded-lg " + n.iconBg + " flex items-center justify-center flex-shrink-0 mt-0.5"}>
                          <I size={13} className={n.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-gray-800">{n.title}</p>
                          <p className="text-[10px] text-gray-500 leading-snug">{n.sub}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 whitespace-nowrap mt-0.5">{n.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors" aria-label="Time">
            <Clock size={16} />
          </button>

          {!isOnLeavesPage && (
            <button
              onClick={onApplyLeave}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={12} />
              Apply Leave
            </button>
          )}

          <div className="relative group ml-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer select-none">
              {initials}
            </div>
            <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <ReliefAssignmentModal
        isOpen={reliefModalOpen}
        onClose={() => setReliefModalOpen(false)}
        assignment={activeAssignment}
        onAccept={handleAccept}
        onReject={handleReject}
        onFlag={handleFlag}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={"fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 " + (toastStyles[toastMessage.kind] ?? toastStyles.error)}
          >
            {toastMessage.kind === "accept" ? <CheckCircle2 size={14} /> : <X size={14} />}
            <span className="text-[12px] font-semibold">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeacherNavbar;
