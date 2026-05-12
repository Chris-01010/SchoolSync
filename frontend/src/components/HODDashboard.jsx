import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Calendar,
  LayoutDashboard,
  TrendingUp
} from 'lucide-react';

const HODDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHODData();
  }, []);

  const fetchHODData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, leavesRes] = await Promise.all([
        fetch('http://localhost:8000/hod/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/hod/leaves/pending', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok && leavesRes.ok) {
        setStats(await statsRes.json());
        setPendingLeaves(await leavesRes.json());
      } else {
        throw new Error('Failed to fetch HOD data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (absenceId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/absences/${absenceId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setPendingLeaves(prev => prev.filter(l => l.id !== absenceId));
        // Refresh stats
        fetchHODData();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Department Oversight</h1>
          <p className="text-slate-500 font-medium">{stats?.department_name} Department • {user.email}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Calendar size={18} className="text-primary-500" />
          <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Staff Strength', value: stats?.total_staff, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Absences', value: stats?.active_absences, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Coverage Rate', value: `${stats?.coverage_rate}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Leaves', value: stats?.pending_approvals_count, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pending Approvals</h3>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                {pendingLeaves.length} Requests
              </span>
            </div>

            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary-200 hover:bg-primary-50/20 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[9px] uppercase font-black text-slate-400">{new Date(leave.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-extrabold text-slate-900">{new Date(leave.date).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">Staff ID: {leave.teacher_id.split('-')[0]}</p>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded uppercase">{leave.leave_type}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Periods: {leave.period_start} - {leave.period_end} • {leave.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleApproval(leave.id, 'rejected')}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleApproval(leave.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all"
                    >
                      <CheckCircle2 size={18} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingLeaves.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-slate-900 font-bold">No Pending Approvals</p>
                  <p className="text-slate-500 text-sm mt-1">Your department is all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <LayoutDashboard size={100} />
             </div>
             <h4 className="text-lg font-bold mb-6 relative z-10">Department Activity</h4>
             <div className="space-y-5 relative z-10">
                {[
                    { label: 'Relief Assignments', value: '8 today', icon: Clock },
                    { label: 'Staff Present', value: '14/15', icon: Users },
                ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                            <act.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">{act.label}</p>
                            <p className="text-sm font-bold">{act.value}</p>
                        </div>
                    </div>
                ))}
             </div>
             
             <button className="w-full mt-8 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                View Full Reports
             </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Coverage Insight</h4>
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-[spin_3s_linear_infinite] flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-900">95%</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">High Stability</p>
                    <p className="text-[10px] text-slate-500 font-medium">Department coverage is optimal</p>
                </div>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[95%] rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
