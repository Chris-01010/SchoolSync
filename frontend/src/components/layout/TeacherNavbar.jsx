import React, { useState } from 'react';
import { Bell, Clock, LogOut, Menu, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherNavbar = ({ onMenuClick, user, onApplyLeave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  // Hide the top-right "Apply Leave" button when on the My Leaves page,
  // since that page has its own working in-page Apply button.
  const isOnLeavesPage = /leaves|my-leaves/i.test(location.pathname);

  // Live clock
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const fmt = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase() +
        ' · ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    };
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);

  const initials = (user?.name ?? user?.email ?? 'T')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Brand title */}
      <span className="text-[13px] font-bold text-blue-600 hidden sm:block">Teacher Dashboard</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dept badge */}
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
          Mathematics
        </span>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-9 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[12px] font-bold text-gray-800">Notifications</span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-[10px] text-blue-600 font-semibold hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {[
                  { icon: '✅', title: 'Personal Leave Approved', sub: 'Your leave for Oct 30 has been granted.', time: '2h ago', color: 'text-emerald-600' },
                  { icon: '🔄', title: 'New Relief Duty Assigned', sub: 'Period 6 in Lab 2 for Mr. Wilson.', time: '4h ago', color: 'text-orange-500' },
                  { icon: '📢', title: 'Departmental Meeting', sub: 'Math Dept meeting at 3:30 PM today.', time: '5h ago', color: 'text-blue-500' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <span className="text-base mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800">{n.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{n.sub}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap mt-0.5">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clock */}
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors" aria-label="Time">
          <Clock size={16} />
        </button>

        {/* Apply leave button — hidden on the My Leaves page */}
        {!isOnLeavesPage && (
          <button
            onClick={onApplyLeave}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white
                       text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={12} />
            Apply Leave
          </button>
        )}

        {/* Avatar + logout */}
        <div className="relative group ml-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center
                          text-white text-[10px] font-bold cursor-pointer select-none">
            {initials}
          </div>
          {/* Dropdown */}
          <div className="absolute right-0 top-9 w-36 bg-white border border-gray-200 rounded-xl
                          shadow-lg z-50 overflow-hidden opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible transition-all duration-150">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-medium
                         text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherNavbar;