import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from '../shared/NotificationDropdown';
import {
  Home, CalendarDays, ShieldCheck, FileText, Users, Building2,
  DoorOpen, BarChart3, ClipboardList, Megaphone, Settings,
  Search, LogOut, PanelLeftClose, PanelLeftOpen, Menu, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { id: "home",        label: "Home",              icon: Home,          path: "/admin"               },
  { id: "timetables",  label: "Timetables",        icon: CalendarDays,  path: "/admin/timetables"    },
  { id: "relief",      label: "Relief Management", icon: ShieldCheck,   path: "/admin/relief"        },
  { id: "leave",       label: "Leave Oversight",   icon: FileText,      path: "/admin/leave"         },
  { id: "users",       label: "User Management",   icon: Users,         path: "/admin/users"         },
  { id: "departments", label: "Departments",        icon: Building2,     path: "/admin/departments"   },
  { id: "rooms",       label: "Rooms & Resources", icon: DoorOpen,      path: "/admin/rooms"         },
  { id: "analytics",   label: "Analytics",          icon: BarChart3,     path: "/admin/analytics"     },
  { id: "reports",     label: "Reports",            icon: ClipboardList, path: "/admin/reports"       },
  { id: "announce",    label: "Announcements",      icon: Megaphone,     path: "/admin/announcements" },
  { id: "settings",    label: "Settings",           icon: Settings,      path: "/admin/settings"      },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname === path;

  // Sidebar content shared between mobile drawer and desktop sidebar
  const SidebarContent = ({ showClose = false }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="relative flex h-14 items-center gap-2.5 border-b border-gray-100 px-4 flex-shrink-0">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        {(!collapsed || showClose) && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-[13px] font-semibold leading-tight text-gray-900">Main Campus</p>
            <p className="text-[11px] font-medium text-gray-400">Admin Terminal</p>
          </div>
        )}
        {showClose && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={16} />
          </button>
        )}
        {/* Desktop collapse toggle */}
        {!showClose && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-1/2 z-50 hidden lg:flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon   = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed && !showClose ? item.label : undefined}
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
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8}
                    className={`flex-shrink-0 ${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  {(!collapsed || showClose) && (
                    <span className="overflow-hidden whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom avatar + logout */}
      <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            AD
          </div>
          {(!collapsed || showClose) && (
            <div className="flex flex-1 items-center justify-between overflow-hidden">
              <span className="text-[13px] font-semibold text-gray-700">Admin</span>
              <button onClick={handleLogout} aria-label="Log out">
                <LogOut size={15} className="text-gray-400 transition hover:text-red-500 cursor-pointer" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="admin-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-[80vw] max-w-[240px] bg-white border-r border-gray-200
        flex flex-col transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        <SidebarContent showClose={true} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col flex-shrink-0 border-r border-gray-200 bg-white relative"
      >
        <SidebarContent showClose={false} />
      </motion.aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">

        {/* Topbar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-3 sm:px-6 gap-3 z-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <Menu size={18} />
          </button>

          <h2 className="text-[17px] font-bold text-indigo-600 whitespace-nowrap">Admin</h2>

          <div className="hidden md:block relative w-full max-w-md mx-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, roles, or departments..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 placeholder-gray-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <NotificationDropdown notificationsPath="/admin/leave" />
            <div className="hidden sm:block h-6 w-px bg-gray-200" />
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>

        {/* Content — AdminHome manages its own scroll + fixed bar */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}