import React, { useState, useEffect, useRef } from "react";
import { Bell, Clock, LogOut, Menu, Plus, CheckCircle2, Repeat2, Users, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const BASE = 'http://localhost:8000';
function getHeaders() {
  const token = localStorage.getItem('schoolsync_token');
  return { Authorization: `Bearer ${token}` };
}

const ICON_MAP = {
  LEAVE_APPROVED: { Icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
  LEAVE_REJECTED: { Icon: X,            bg: "bg-red-50",     color: "text-red-500"     },
  LEAVE_REQUEST:  { Icon: Users,        bg: "bg-blue-50",    color: "text-blue-600"    },
  RELIEF_REQUEST: { Icon: Repeat2,      bg: "bg-orange-50",  color: "text-orange-600"  },
  GENERAL:        { Icon: Bell,         bg: "bg-gray-50",    color: "text-gray-500"    },
};

function getNavUrl(n) {
  switch (n.notification_type) {
    case 'LEAVE_APPROVED': return '/dashboard/leaves?tab=approved';
    case 'LEAVE_REJECTED': return '/dashboard/leaves?tab=rejected';
    case 'RELIEF_REQUEST': return n.action_url ?? '/dashboard/relief-duties';
    default: return n.action_url ?? null;
  }
}

const TeacherNavbar = ({ onMenuClick, user, onApplyLeave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [notifOpen, setNotifOpen]           = useState(false);
  const [toastMessage, setToastMessage]     = useState(null);
  const [pendingReliefs, setPendingReliefs] = useState([]);
  const [notifs, setNotifs]                 = useState([]);
  const dropdownRef                         = useRef(null);

  const fetchNotifs = () => {
    fetch(`${BASE}/leaves/notifications/`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((d) => setNotifs(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error);
  };

  useEffect(() => { fetchNotifs(); }, []);

  useEffect(() => {
    api.get("/relief/assignments/pending")
      .then((data) => setPendingReliefs(Array.isArray(data) ? data : []))
      .catch(() => setPendingReliefs([]));
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch(`${BASE}/leaves/notifications/read-all`, {
      method: 'PUT', headers: getHeaders(),
    }).catch(console.error);
    fetchNotifs();
  };

  const handleNotifClick = (n) => {
    setNotifOpen(false);
    fetch(`${BASE}/leaves/notifications/${n.id}/read`, {
      method: 'PUT', headers: getHeaders(),
    }).then(() => fetchNotifs()).catch(console.error);
    const url = getNavUrl(n);
    if (url) navigate(url);
  };

  const unread     = notifs.filter((n) => !n.is_read).length;
  const totalBadge = unread + pendingReliefs.length;

  // Clicking the pending relief banner always goes to the relief duties page
  const handleReliefClick = () => {
    setNotifOpen(false);
    navigate('/dashboard/relief-duties');
  };

  const isOnLeavesPage = /leaves|my-leaves/i.test(location.pathname);

  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const fmt = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase() +
        " - " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    fmt();
    const id = setInterval(fmt, 30000);
    return () => clearInterval(id);
  }, []);

  const initials     = (user?.name ?? user?.email ?? "T").split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);
  const handleLogout = () => { logout(); navigate("/login"); };

  const toastStyles = {
    accept: "bg-emerald-50 border-emerald-200 text-emerald-700",
    reject: "bg-gray-50 border-gray-200 text-gray-700",
    error:  "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <>
      <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50">
          <Menu size={18} />
        </button>
        <span className="text-[13px] font-bold text-blue-600 hidden sm:block">Teacher Dashboard</span>
        <div className="flex-1" />

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
            Mathematics
          </span>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Bell size={16} />
              {totalBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {totalBadge > 9 ? '9+' : totalBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-9 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-800">Notifications</span>
                  {unread > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      <Check size={10} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {pendingReliefs.length > 0 && (
                    <div onClick={handleReliefClick} className="flex items-start gap-2.5 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Repeat2 size={13} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-orange-800">
                          {pendingReliefs.length} Pending Relief Request{pendingReliefs.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-[10px] text-orange-600">Tap to review and respond</p>
                      </div>
                    </div>
                  )}

                  {notifs.length === 0 && pendingReliefs.length === 0 ? (
                    <p className="text-center text-[11px] text-gray-400 py-8">No notifications</p>
                  ) : (
                    notifs.slice(0, 10).map((n) => {
                      const cfg = ICON_MAP[n.notification_type] ?? ICON_MAP.GENERAL;
                      const { Icon } = cfg;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon size={13} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-800">{n.title}</p>
                            <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{n.content}</p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                              }) : ''}
                            </p>
                          </div>
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Clock size={16} />
          </button>

          {!isOnLeavesPage && (
            <button onClick={onApplyLeave} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={12} /> Apply Leave
            </button>
          )}

          <div className="relative group ml-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer select-none">
              {initials}
            </div>
            <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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