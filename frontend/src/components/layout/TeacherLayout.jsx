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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Role-aware sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onApplyLeave={() => setLeaveModalOpen(true)}
      />

      {/* Main content — no overflow-hidden here so the clip rect
          doesn't eat the first pixels of page content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TeacherNavbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onApplyLeave={() => setLeaveModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-5">
            <Outlet context={{ user, leaveModalOpen, setLeaveModalOpen }} />
          </div>
        </main>

        {/* Footer status bar */}
        <footer className="flex-shrink-0 border-t border-gray-100 bg-white px-5 py-1.5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">Teacher Dashboard</span>
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            System Status: Operational
          </span>
          <div className="flex items-center gap-3">
            {['Privacy Policy', 'Support', 'Documentation'].map((l) => (
              <button
                key={l}
                className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TeacherLayout;
