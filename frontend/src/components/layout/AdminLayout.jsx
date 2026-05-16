import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CalendarDays,
  ShieldCheck,
  FileText,
  Users,
  Building2,
  DoorOpen,
  BarChart3,
  ClipboardList,
  Megaphone,
  Settings,
  Bell,
  Search,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   Navigation items — all paths prefixed with /admin
   ═══════════════════════════════════════════════════════════════ */

const navItems = [
  { id: "home",        label: "Home",              icon: Home,          path: "/admin" },
  { id: "timetables",  label: "Timetables",        icon: CalendarDays,  path: "/admin/timetables" },
  { id: "relief",      label: "Relief Management", icon: ShieldCheck,   path: "/admin/relief" },
  { id: "leave",       label: "Leave Oversight",   icon: FileText,      path: "/admin/leave" },
  { id: "users",       label: "User Management",   icon: Users,         path: "/admin/users" },
  { id: "departments", label: "Departments",        icon: Building2,     path: "/admin/departments" },
  { id: "rooms",       label: "Rooms & Resources", icon: DoorOpen,      path: "/admin/rooms" },
  { id: "analytics",   label: "Analytics",          icon: BarChart3,     path: "/admin/analytics" },
  { id: "reports",     label: "Reports",            icon: ClipboardList, path: "/admin/reports" },
  { id: "announce",    label: "Announcements",      icon: Megaphone,     path: "/admin/announcements" },
  { id: "settings",    label: "Settings",           icon: Settings,      path: "/admin/settings" },
];

/* ═══════════════════════════════════════════════════════════════
   Sidebar constants
   ═══════════════════════════════════════════════════════════════ */

const SIDEBAR_W           = 240;
const SIDEBAR_W_COLLAPSED = 64;
const TOPBAR_H            = 56;

/* ═══════════════════════════════════════════════════════════════
   AdminLayout
   ═══════════════════════════════════════════════════════════════ */

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const sidebarWidth = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Home is only active at exactly /admin; others match their full path
  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

      {/* ─────────────────── SIDEBAR ─────────────────── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white"
      >
        {/* ── brand row ── */}
        <div className="relative flex h-14 items-center gap-2.5 border-b border-gray-100 px-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">A</span>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-[13px] font-semibold leading-tight text-gray-900">
                  Main Campus
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  Admin Terminal
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
        </div>

        {/* ── nav list ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon   = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150 ${
                      active
                        ? "bg-indigo-100 font-semibold text-indigo-700"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-gray-900"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-accent"
                        className="absolute -left-2 top-1 bottom-1 w-[3px] rounded-full bg-indigo-600"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}

                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.8}
                      className={`flex-shrink-0 ${
                        active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── bottom: admin avatar + logout ── */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              AD
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-1 items-center justify-between overflow-hidden"
                >
                  <span className="text-[13px] font-semibold text-gray-700">Admin</span>
                  <button onClick={handleLogout} aria-label="Log out">
                    <LogOut
                      size={15}
                      className="text-gray-400 transition hover:text-red-500 cursor-pointer"
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ─────────────────── MAIN AREA ─────────────────── */}
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-1 flex-col"
      >
        {/* ── TOPBAR ── */}
        <motion.header
          className="fixed right-0 top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm"
          animate={{ left: sidebarWidth }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ height: TOPBAR_H }}
        >
          <h2 className="text-[17px] font-bold text-indigo-600">Admin</h2>

          <div className="hidden md:block relative w-full max-w-md mx-8">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, roles, or departments..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 placeholder-gray-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                3
              </span>
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </motion.header>

        {/* ── MAIN CONTENT ── */}
        <main
          className="flex-1 overflow-y-auto bg-gray-50 px-6 pb-6"
          style={{ paddingTop: TOPBAR_H + 24 }}
        >
          {children || <Outlet />}

          <footer className="mt-10 border-t border-gray-200 pt-5 pb-4 text-center text-xs text-gray-400">
            © 2024 All Rights Reserved | Audit Log | System Status: Operational | v2.4.0-stable
          </footer>
        </main>
      </motion.div>
    </div>
  );
}
