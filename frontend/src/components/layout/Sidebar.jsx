import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  UserCheck,
  BarChart3,
  HelpCircle,
  LogOut,
  GraduationCap,
  X,
  Home,
  Clock,
  FileText,
  Repeat2,
  LineChart,
  User,
  Bell,
  ShieldCheck,
  Users,
  Settings,
} from 'lucide-react';

// ─── Nav configs per role ─────────────────────────────────────────────────────

const HOD_NAV = [
  { label: 'Department Overview', icon: LayoutDashboard, to: '/hod' },
  { label: 'Timetables',          icon: CalendarDays,    to: '/hod/timetables' },
  { label: 'Leave Approvals',     icon: ClipboardCheck,  to: '/hod/leave' },
  { label: 'Relief Management',   icon: UserCheck,       to: '/hod/relief' },
  { label: 'Analytics',           icon: BarChart3,       to: '/hod/analytics' },
];

const TEACHER_NAV = [
  { label: 'Home',             icon: Home,         to: '/dashboard',                  end: true },
  { label: 'My Timetable',     icon: CalendarDays, to: '/dashboard/timetable' },
  { label: 'Relief Timetable', icon: Repeat2,      to: '/dashboard/relief-timetable' },
  { label: 'My Leaves',        icon: FileText,     to: '/dashboard/leaves' },
  { label: 'My Relief Duties', icon: Clock,        to: '/dashboard/relief-duties' },
  { label: 'My Workload',      icon: LineChart,    to: '/dashboard/workload' },
  { label: 'Profile',          icon: User,         to: '/dashboard/profile' },
];

const ADMIN_NAV = [
  { label: 'Overview',        icon: LayoutDashboard, to: '/admin' },
  { label: 'User Management', icon: Users,           to: '/admin/users' },
  { label: 'Timetables',      icon: CalendarDays,    to: '/admin/timetables' },
  { label: 'Leave Oversight', icon: ShieldCheck,     to: '/admin/leave' },
  { label: 'Analytics',       icon: BarChart3,       to: '/admin/analytics' },
  { label: 'Settings',        icon: Settings,        to: '/admin/settings' },
];

// ─── Brand config per role ────────────────────────────────────────────────────

const BRAND = {
  teacher: { label: 'Teacher Portal', sub: 'Mathematics Dept' },
  hod: { label: 'HOD Portal', sub: 'Department Overview' },
  admin:   { label: 'Admin Portal',   sub: 'Institution-Wide' },
};

const CTA = {
  teacher: { label: 'Apply Leave',   action: 'apply-leave' },
  hod:     { label: null,            action: null },
  admin:   { label: 'System Settings', action: null },
};
// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar = ({ open, onClose, user, onApplyLeave }) => {
  const navigate   = useNavigate();
  

  const role     = user?.role ?? 'teacher';
  const navItems = role === 'hod' ? HOD_NAV : role === 'admin' ? ADMIN_NAV : TEACHER_NAV;
  const brand    = BRAND[role] ?? BRAND.teacher;
  const cta      = CTA[role]   ?? CTA.teacher;

  const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login";
};
  
  const handleCta = () => {
    if (cta.action === 'apply-leave' && onApplyLeave) {
      onApplyLeave();
      onClose?.();
    }
  };

  return (
    <>
      {/* ── Sidebar shell ──
          Mobile:  fixed drawer, slides in/out via translate
          Desktop: static flex item — lg:!relative forces position out of
                   fixed stacking context; lg:shrink-0 locks the w-52 width
      ── */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-52 bg-white border-r border-gray-100
          flex flex-col transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:!relative lg:translate-x-0 lg:z-auto lg:shrink-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight">{brand.label}</p>
              <p className="text-[10px] text-gray-400 font-medium">{brand.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* User pill (teacher role only) */}
        {role === 'teacher' && user && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {(user.name ?? user.email ?? 'T')
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-800 truncate leading-tight">
                  {user.name ?? user.email}
                </p>
                <p className="text-[10px] text-gray-400 truncate">Mathematics Dept</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end ?? false}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium
                 transition-all duration-150 group ${
                   isActive
                     ? 'bg-blue-50 text-blue-700'
                     : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="px-3 pb-3">
          <button
            onClick={handleCta}
            className="w-full py-2 px-3 bg-blue-600 text-white text-[11px] font-semibold
                       rounded-lg hover:bg-blue-700 transition-colors"
          >
            {cta.label}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-2 py-2 space-y-0.5">
          <button
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px]
                       font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help Center</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px]
                       font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
