import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TeacherNavbar from './TeacherNavbar';

const TOKEN_KEY = 'schoolsync_token';

// ─── Relief Notification Popup ────────────────────────────────────────────────
const ReliefNotificationPopup = ({ assignment, onAccept, onReject }) => (
  <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-orange-200 rounded-2xl shadow-2xl p-5 animate-slide-up">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-orange-600 text-lg">🔔</span>
      </div>
      <div>
        <p className="text-[13px] font-bold text-gray-900">New Relief Assignment</p>
        <p className="text-[11px] text-gray-500 mt-0.5">You've been assigned as substitute</p>
      </div>
    </div>

    <div className="bg-orange-50 rounded-xl p-3 mb-4 space-y-1.5">
      <p className="text-[11px] text-gray-700">
        <span className="font-bold">Class:</span> {assignment.class_name || 'N/A'}
      </p>
      <p className="text-[11px] text-gray-700">
        <span className="font-bold">Period:</span> {assignment.period || 'N/A'}
      </p>
      <p className="text-[11px] text-gray-700">
        <span className="font-bold">Absent Teacher:</span> {assignment.absent_teacher || 'N/A'}
      </p>
      <p className="text-[11px] text-gray-700">
        <span className="font-bold">Date:</span> {assignment.date || 'Today'}
      </p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onAccept(assignment.id)}
        className="flex-1 py-2 bg-green-600 text-white text-[11px] font-bold rounded-xl hover:bg-green-700 transition-colors"
      >
        ✓ Accept
      </button>
      <button
        onClick={() => onReject(assignment.id)}
        className="flex-1 py-2 bg-red-100 text-red-600 text-[11px] font-bold rounded-xl hover:bg-red-200 transition-colors"
      >
        ✗ Reject
      </button>
    </div>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────
const TeacherLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [seenIds, setSeenIds] = useState(new Set());

  // Poll for new relief assignments every 10 seconds
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;
        const res = await fetch('http://localhost:8000/teachers/me/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const reliefs = data.pending_requests?.filter(r => r.type === 'relief_request') || [];

        // Find new assignments not yet seen
        const newOnes = reliefs.filter(r => !seenIds.has(r.id));
        if (newOnes.length > 0) {
          setPendingAssignments(newOnes);
          setCurrentPopup(newOnes[0]);
          setSeenIds(prev => new Set([...prev, ...newOnes.map(r => r.id)]));
        }
      } catch (err) {
        // silently fail
      }
    };

    fetchAssignments();
    const interval = setInterval(fetchAssignments, 10000);
    return () => clearInterval(interval);
  }, [seenIds]);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(`http://localhost:8000/leaves/relief/${id}/respond`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', flag_reason: null })
      });
    } catch (err) {
      console.error('Failed to accept:', err);
    }
    dismissPopup(id);
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(`http://localhost:8000/leaves/relief/${id}/respond`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', flag_reason: null })
      });
    } catch (err) {
      console.error('Failed to reject:', err);
    }
    dismissPopup(id);
  };

  const dismissPopup = (id) => {
    const remaining = pendingAssignments.filter(r => r.id !== id);
    setPendingAssignments(remaining);
    setCurrentPopup(remaining.length > 0 ? remaining[0] : null);
  };

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

      {/* Relief notification popup */}
      {currentPopup && (
        <ReliefNotificationPopup
          assignment={currentPopup}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default TeacherLayout;

