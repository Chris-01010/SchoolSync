import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Plus,
  BookOpen,
  MapPin
} from 'lucide-react';
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';

const TeacherDashboard = ({ user }) => {
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    timetable: [],
    relief_duties: [],
    total_hours: 0,
    relief_hours: 0,
    pending_requests: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/teachers/me/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleRespondToRelief = async (id, status, flagReason) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/relief-assignments/${id}/respond`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, flag_reason: flagReason })
      });
      // Refresh data
      const res = await fetch('http://localhost:8000/teachers/me/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to respond to relief", err);
    }
  };

  const handleApplyLeave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/absences/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newAbsence = await res.json();
        setDashboardData(prev => ({
          ...prev,
          pending_requests: [
            ...prev.pending_requests,
            { id: newAbsence.id, type: 'leave_application', message: 'Leave application pending', date: newAbsence.date }
          ]
        }));
      }
    } catch (err) {
      console.error("Failed to apply for leave", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
            Welcome back, {user.college_id}
          </h1>
          <p className="text-slate-500 font-medium">Your schedule and duties for today</p>
        </div>
        <button 
          onClick={() => setLeaveFormOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 font-bold"
        >
          <Plus size={20} />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Teaching Hours</p>
              <p className="text-2xl font-black text-slate-900">{dashboardData.total_hours}h / 30h</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(dashboardData.total_hours/30)*100}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Relief Load</p>
              <p className="text-2xl font-black text-slate-900">{dashboardData.relief_hours} / 3 cap</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(dashboardData.relief_hours/3)*100}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Next Session</p>
              <p className="text-2xl font-black text-slate-900">Period 5</p>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Grade 10B - Lab 2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Today's Schedule</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Monday, May 6</span>
          </div>

          <div className="space-y-4">
            {dashboardData.timetable.map((slot, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between group hover:border-primary-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-primary-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase">P{slot.period}</span>
                    <span className="text-lg font-black text-slate-900">09:00</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded uppercase tracking-wider">Core Class</span>
                      <h4 className="font-black text-slate-900 tracking-tight">{slot.subject}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                      <span className="flex items-center gap-1"><Users size={14} /> {slot.class}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {slot.room}</span>
                    </div>
                  </div>
                </div>
                <button className="p-3 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-2xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
            {dashboardData.timetable.length === 0 && (
              <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Action Items */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Requests</h3>
          <div className="space-y-4">
            {dashboardData.pending_requests.map((req) => (
              req.type === 'relief_request' ? (
                <ReliefRequestCard key={req.id} request={req} onRespond={handleRespondToRelief} />
              ) : (
                <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{req.message}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">{req.date}</p>
                  </div>
                </div>
              )
            ))}
            {dashboardData.pending_requests.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl">
                <p className="text-slate-400 text-sm font-bold italic">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LeaveApplicationForm 
        isOpen={isLeaveFormOpen} 
        onClose={() => setLeaveFormOpen(false)} 
        onSubmit={handleApplyLeave}
      />
    </div>
  );
};

export default TeacherDashboard;
