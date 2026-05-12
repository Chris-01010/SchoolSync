import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
  </div>
);

const HODDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    department_name: 'Science',
    active_absences: 2,
    coverage_rate: 98.2,
    total_staff: 12,
    pending_approvals_count: 3
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const statsRes = await fetch('http://localhost:8000/hod/dashboard', { headers });
        const statsData = await statsRes.json();
        setStats(statsData);

        const leavesRes = await fetch('http://localhost:8000/hod/leaves/pending', { headers });
        const leavesData = await leavesRes.json();
        setPendingLeaves(leavesData);
      } catch (err) {
        console.error("Failed to fetch HOD data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprove = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/absences/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      setPendingLeaves(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Failed to approve leave", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
          {stats.department_name} Department Oversight
        </h1>
        <p className="text-slate-500 font-medium">Monitoring departmental workload and attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Active Absences" 
          value={stats.active_absences} 
          icon={AlertCircle} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          label="Coverage Rate" 
          value={`${stats.coverage_rate}%`} 
          icon={CheckCircle} 
          color="bg-blue-50 text-blue-600" 
          trend="+1.2%" 
        />
        <StatCard 
          label="Total Staff" 
          value={stats.total_staff} 
          icon={Users} 
          color="bg-purple-50 text-purple-600" 
        />
        <StatCard 
          label="Pending Leaves" 
          value={stats.pending_approvals_count} 
          icon={Clock} 
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider">
              {pendingLeaves.length} Requests
            </span>
          </div>

          <div className="space-y-4">
            {pendingLeaves.map((leave) => (
              <motion.div 
                key={leave.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between group hover:border-primary-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase">May</span>
                    <span className="text-lg font-black text-slate-900">12</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Teacher ID: {leave.teacher_id.slice(0,8)}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{leave.leave_type} Leave</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleApprove(leave.id, 'approved')}
                    className="px-4 py-2 bg-primary-600 text-white text-[10px] font-black rounded-xl hover:bg-primary-700 transition-all uppercase tracking-wider shadow-lg shadow-primary-600/20"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleApprove(leave.id, 'rejected')}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-wider"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
            {pendingLeaves.length === 0 && (
              <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-bold">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Dept Insights</h3>
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={80} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Peak Absence Day</p>
            <h4 className="text-2xl font-black mb-6">Friday</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-xs font-bold text-slate-300">Staff with high relief load:</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold">Mr. David Lee</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg">4/3 Limit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
