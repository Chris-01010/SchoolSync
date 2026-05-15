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
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Department Overview', icon: LayoutDashboard, to: '/hod' },
  { label: 'Timetables', icon: CalendarDays, to: '/hod/timetables' },
  { label: 'Leave Approvals', icon: ClipboardCheck, to: '/hod/leave' },
  { label: 'Relief Management', icon: UserCheck, to: '/hod/relief' },
  { label: 'Analytics', icon: BarChart3, to: '/hod/analytics' },
];

const Sidebar = ({ open, onClose, user }) => {
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-52 bg-white border-r border-gray-100 flex flex-col
          transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex lg:z-auto
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight">Science Dept</p>
              <p className="text-[10px] text-gray-400 font-medium">HOD Portal</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/hod'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-150 group ${
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
                    className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Calendar CTA */}
        <div className="px-3 pb-3">
          <button className="w-full py-2 px-3 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            View School Calendar
          </button>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 px-2 py-2 space-y-0.5">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <HelpCircle size={14} />
            <span>Help Center</span>
          </button>
          <button
            onClick={handleLogOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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
