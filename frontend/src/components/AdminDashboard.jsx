import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Flag, 
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-slate-500 text-sm font-semibold">{title}</p>
    <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
  </div>
);

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [activeReliefs, setActiveReliefs] = useState([]);
  const [flaggedReliefs, setFlaggedReliefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, activeRes, flaggedRes] = await Promise.all([
        fetch('http://localhost:8000/admin/stats', { headers }),
        fetch('http://localhost:8000/admin/relief/active', { headers }),
        fetch('http://localhost:8000/admin/relief/flagged', { headers })
      ]);

      if (statsRes.ok && activeRes.ok && flaggedRes.ok) {
        setStats(await statsRes.json());
        setActiveReliefs(await activeRes.json());
        setFlaggedReliefs(await flaggedRes.json());
      } else {
        throw new Error('Failed to fetch admin dashboard data');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-64"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;

  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 font-bold">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">School-wide metrics and real-time oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchAdminData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Clock size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Absences" 
          value={stats?.active_absences || 0} 
          icon={AlertCircle} 
          color="bg-red-50 text-red-600"
          trend="up"
          trendValue="Today"
        />
        <StatCard 
          title="Relief Assigned" 
          value={stats?.relief_assigned_today || 0} 
          icon={TrendingUp} 
          color="bg-green-50 text-green-600"
          trend="up"
          trendValue="Today"
        />
        <StatCard 
          title="Coverage Rate" 
          value={`${stats?.coverage_rate || 0}%`} 
          icon={CheckCircle} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Staff Present" 
          value={`${stats?.staff_present_count || 0}/${stats?.total_staff_count || 0}`} 
          icon={Users} 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Substitutions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Active Substitutions</h3>
              </div>
              <button className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Absence ID</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Relief Teacher</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Assigned At</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReliefs.length > 0 ? activeReliefs.map((relief) => (
                    <tr key={relief.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">#{relief.absence_id.slice(0,8)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Relief Request</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">Teacher ID</div>
                        <div className="text-[10px] text-slate-500 font-medium">#{relief.relief_teacher_id.slice(0,8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{new Date(relief.assigned_at).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{new Date(relief.assigned_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          relief.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                          relief.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          relief.status === 'flagged' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {relief.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                        No active relief assignments for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Center (Flagged & Conflicts) */}
        <div className="space-y-6">
          
          {/* Flagged Issues */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Flag size={80} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2">
              <Flag size={18} className="text-amber-400" />
              Flagged Issues
            </h3>
            <div className="space-y-4 relative z-10">
              {flaggedReliefs.length > 0 ? flaggedReliefs.map(flag => (
                <div key={flag.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <p className="text-sm font-bold text-white mb-1">Relief Flagged</p>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    Reason: {flag.flag_reason || 'No reason provided'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-slate-900 text-[11px] font-black py-2 rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-wider">
                      Review
                    </button>
                    <button className="flex-1 bg-white/10 text-white text-[11px] font-black py-2 rounded-xl hover:bg-white/20 transition-colors uppercase tracking-wider border border-white/10">
                      Ignore
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-500 font-medium text-sm">
                  No flagged issues requiring review.
                </div>
              )}
            </div>
          </div>

          {/* Conflict Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Conflict Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-bold text-slate-900">Unresolved Absence</p>
                  <p className="text-[10px] text-slate-500 mt-1">Grade 10A Science period starts in 15 mins with no relief.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
