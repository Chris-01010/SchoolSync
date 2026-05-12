import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Play, ChevronRight, FileText, Check } from 'lucide-react';
import ReliefRequestCard from './ReliefRequestCard';
import LeaveApplicationForm from './LeaveApplicationForm';

const TeacherDashboard = ({ user }) => {
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
      await fetch(`http://localhost:8000/relief-assignments/${id}/respond`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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

        </div>
      </div>

      <LeaveApplicationForm 
        isOpen={isLeaveModalOpen} 
        onClose={() => setLeaveModalOpen(false)} 
        onSubmit={handleLeaveSubmit} 
      />
    </div>
  );
};

export default TeacherDashboard;
