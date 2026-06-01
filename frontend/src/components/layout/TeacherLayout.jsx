import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TeacherNavbar from './TeacherNavbar';

const TeacherLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar — backdrop handled inside Sidebar.jsx */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onApplyLeave={() => setLeaveModalOpen(true)}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <TeacherNavbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onApplyLeave={() => setLeaveModalOpen(true)}
        />

        {/* Content area — TeacherHome manages its own scroll + fixed bar.
            Other pages scroll via their own overflow-y-auto wrapper.      */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet context={{ user, leaveModalOpen, setLeaveModalOpen }} />
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-gray-100 bg-white px-3 sm:px-5 py-1.5 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Teacher Dashboard</span>
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            System Status: Operational
          </span>
          <div className="hidden sm:flex items-center gap-3">
            {['Privacy Policy', 'Support', 'Documentation'].map((l) => (
              <button key={l} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">{l}</button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TeacherLayout;