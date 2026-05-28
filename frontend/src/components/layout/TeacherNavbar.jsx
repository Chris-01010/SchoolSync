import React, { useState, useEffect } from "react";
import { Clock, LogOut, Menu, Plus, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import ReliefAssignmentModal from "../teacher/ReliefAssignmentModal";
import NotificationDropdown from "../shared/NotificationDropdown";

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

  const handleReliefClick = () => {
    const assignment = pendingReliefs.length > 0
      ? toModalShape(pendingReliefs[0])
      : mockReliefAssignment;
    setActiveAssignment(assignment);
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

          {/* Real-time notification dropdown */}
          <NotificationDropdown notificationsPath="/dashboard/notifications" />

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