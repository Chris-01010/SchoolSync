import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Calendar, Clock, AlertCircle, Play, ChevronRight, FileText, Check } from 'lucide-react';
=======
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';

const TeacherDashboard = ({ user }) => {
<<<<<<< HEAD
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/teachers/me/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const json = await response.json();
        // Since timetable is mocked in backend right now, provide a frontend mock for visual completeness
        if (json.timetable.length === 0) {
            json.timetable = [
                { day: 0, period: 1, subject: 'Maths', class: 'Grade 10A', room: '201' },
                { day: 0, period: 2, subject: 'Maths', class: 'Grade 10B', room: '202' },
                { day: 0, period: 4, subject: 'Maths', class: 'Grade 11A', room: '301' }
            ];
        }
        setData(json);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/absences/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formData,
            period_start: parseInt(formData.period_start) || 1,
            period_end: parseInt(formData.period_end) || 8
        })
      });

      if (response.ok) {
          const newAbsence = await response.json();
          const newRequest = {
              id: newAbsence.id,
              type: 'leave_application',
              message: `Leave application (${newAbsence.leave_type}) pending approval`,
              date: newAbsence.date
          };
          
          setData(prev => ({
              ...prev,
              pending_requests: [newRequest, ...prev.pending_requests]
          }));
          setLeaveModalOpen(false);
          // Show success toast or similar (optional, but good)
      } else {
          const errorData = await response.json();
          alert(`Failed to submit leave: ${errorData.detail || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Failed to submit leave:', error);
      alert('An error occurred while submitting your leave application.');
    }
  };

  const handleReliefResponse = async (id, status, reason) => {
    try {
      // Optimistic update
      setData(prev => ({
        ...prev,
        pending_requests: prev.pending_requests.filter(req => req.id !== id)
      }));

      const token = localStorage.getItem('token');
=======
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
      await fetch(`http://localhost:8000/relief-assignments/${id}/respond`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
<<<<<<< HEAD
        body: JSON.stringify({ status, flag_reason: reason })
      });
    } catch (error) {
      console.error('Failed to respond to relief:', error);
      fetchDashboardData(); // Revert on failure
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

  if (error) return (
    <div className="p-8 flex flex-col justify-center items-center h-full text-center">
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-4 font-bold border border-red-100">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p>{error}</p>
      </div>
      <button onClick={fetchDashboardData} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
        Retry
      </button>
    </div>
  );

  if (!data) return null;

  const reliefRequests = data.pending_requests.filter(req => req.type === 'relief_request');
  const otherRequests = data.pending_requests.filter(req => req.type !== 'relief_request');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">My Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.email}</p>
        </div>
        <button 
          onClick={() => setLeaveModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 font-bold"
        >
          <FileText size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Clock size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">THIS WEEK</span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Total Teaching Hours</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{data.total_hours}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600"><AlertCircle size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">THIS WEEK</span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Relief Hours Taken</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{data.relief_hours}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Calendar size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">TODAY</span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Pending Requests</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{data.pending_requests.length}</p>
=======
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<<<<<<< HEAD
        
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Play size={16} className="ml-0.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Today's Schedule</h3>
              </div>
              <button className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1">
                View Weekly <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-3">
              {data.timetable.map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] uppercase font-black text-slate-400">P{slot.period}</span>
                      <span className="font-extrabold text-slate-900">{slot.room}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{slot.class}</p>
                      <p className="text-xs text-slate-500 font-medium">{slot.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-wider">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
              {data.timetable.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-medium text-sm">
                  No classes scheduled for today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          
          {/* Action Required: Relief Requests */}
          {reliefRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Action Required</h3>
              {reliefRequests.map(req => (
                <ReliefRequestCard key={req.id} request={req} onRespond={handleReliefResponse} />
              ))}
            </div>
          )}

          {/* Pending Statuses */}
          {otherRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Pending Status</h3>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                {otherRequests.map(req => (
                  <div key={req.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Submitted: {new Date(req.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reliefRequests.length === 0 && otherRequests.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-300 mb-3">
                <Check size={24} />
              </div>
              <p className="text-sm font-bold text-slate-900">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No pending actions required.</p>
            </div>
          )}

=======
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
        </div>
      </div>

      <LeaveApplicationForm 
<<<<<<< HEAD
        isOpen={isLeaveModalOpen} 
        onClose={() => setLeaveModalOpen(false)} 
        onSubmit={handleLeaveSubmit} 
=======
        isOpen={isLeaveFormOpen} 
        onClose={() => setLeaveFormOpen(false)} 
        onSubmit={handleApplyLeave}
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
      />
    </div>
  );
};

export default TeacherDashboard;
