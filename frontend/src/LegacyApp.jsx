/**
 * LegacyApp.jsx — The original role-based authenticated dashboard shell.
 * Mounted at /app/* by the new router after successful login.
 */
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Plus,
  Search,
  Bell,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import TimetableGrid from './components/TimetableGrid';
import AbsenceModal from './components/AbsenceModal';
import TeacherDashboard from './components/TeacherDashboard';
import HODDashboard from './components/HODDashboard';
import AdminDashboard from './components/AdminDashboard';

// ─── Sidebar item ─────────────────────────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active
        ? 'bg-primary-50 text-primary-600'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
    <span className="font-semibold text-sm tracking-tight">{label}</span>
    {active && (
      <motion.div
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"
      />
    )}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const MOCK_TEACHERS = [
  { id: '1', name: 'Dr. Sarah Wilson', department: 'Science' },
  { id: '2', name: 'Mr. James Miller', department: 'Maths' },
  { id: '3', name: 'Ms. Emily Chen', department: 'English' },
  { id: '4', name: 'Mrs. Thompson', department: 'History' },
];

const MOCK_TIMETABLE = [
  { day: 0, period: 1, subject: 'Maths', class: 'Grade 10A', teacher: 'James Miller', room: '201' },
  { day: 0, period: 2, subject: 'Science', class: 'Grade 11B', teacher: 'Sarah Wilson', room: 'Lab 1' },
  { day: 1, period: 3, subject: 'English', class: 'Grade 9C', teacher: 'Emily Chen', room: '105' },
  { day: 2, period: 4, subject: 'History', class: 'Grade 12A', teacher: 'Mrs. Thompson', room: '302' },
  { day: 4, period: 1, subject: 'Maths', class: 'Grade 10B', teacher: 'James Miller', room: '201' },
];

export default function LegacyApp() {
  const { user, LogOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAbsenceModalOpen, setAbsenceModalOpen] = useState(false);

  const handleLogOut = () => {
    LogOut();
    navigate('/login', { replace: true });
  };

  const roleConfigs = {
    admin: {
      items: [
        { id: 'dashboard', label: 'Overview',         icon: LayoutDashboard },
        { id: 'timetable', label: 'Master Timetable', icon: Calendar },
        { id: 'relief',    label: 'Relief Management',icon: AlertCircle },
        { id: 'teachers',  label: 'Staff Directory',  icon: Users },
        { id: 'settings',  label: 'System Settings',  icon: Settings },
      ],
      title: 'Admin Console',
    },
    hod: {
      items: [
        { id: 'dashboard', label: 'Department View', icon: LayoutDashboard },
        { id: 'relief',    label: 'Relief Duties',   icon: AlertCircle },
        { id: 'teachers',  label: 'Dept Staff',      icon: Users },
      ],
      title: 'Department Head',
    },
    teacher: {
      items: [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'timetable', label: 'My Schedule',  icon: Calendar },
        { id: 'relief',    label: 'My Reliefs',   icon: AlertCircle },
      ],
      title: 'Staff Portal',
    },
  };

  const currentConfig = roleConfigs[user?.role] ?? roleConfigs.teacher;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Calendar className="text-white" size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">SchoolSync</span>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 mb-2">
            Main Menu
          </div>
          {currentConfig.items.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300 group"
            >
              <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
              <span className="font-semibold text-sm tracking-tight">LogOut</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-900">{user?.role?.toUpperCase()} Account</p>
          <p className="text-[10px] text-slate-500 mt-1">{user?.email}</p>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-3">
            <div className="bg-primary-500 h-full w-full rounded-full" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search teachers, classes, or rooms..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative bg-slate-50 rounded-lg border border-slate-200">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.name ?? user?.email}</p>
                <p className="text-[10px] text-slate-500">{user?.role?.toUpperCase()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-blue-400 border-2 border-white shadow-sm ring-1 ring-slate-200" />
            </div>
          </div>
        </header>

        {/* Dynamic view */}
        <div className="p-8 overflow-y-auto flex-1">
          {user?.role === 'teacher' && activeTab === 'dashboard' ? (
            <TeacherDashboard user={user} />
          ) : user?.role === 'hod' && activeTab === 'dashboard' ? (
            <HODDashboard user={user} />
          ) : user?.role === 'admin' && activeTab === 'dashboard' ? (
            <AdminDashboard user={user} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                    {activeTab === 'dashboard'
                      ? 'School Overview'
                      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  <p className="text-slate-500 font-medium">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setAbsenceModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 font-bold"
                >
                  <Plus size={18} />
                  <span>Mark Absence</span>
                </button>
              </div>

              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Active Absences', value: '4',     color: 'bg-red-50 text-red-600',     icon: AlertCircle },
                      { label: 'Relief Assigned', value: '12',    color: 'bg-green-50 text-green-600', icon: Clock },
                      { label: 'Coverage Rate',   value: '98%',   color: 'bg-blue-50 text-blue-600',   icon: LayoutDashboard },
                      { label: 'Staff Present',   value: '42/46', color: 'bg-purple-50 text-purple-600',icon: Users },
                    ].map((stat, i) => (
                      <Card key={i} className="group cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl ${stat.color}`}>
                            <stat.icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">TODAY</span>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                            <Clock size={18} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">Current Period (P4)</h3>
                        </div>
                        <button className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1">
                          View Full <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {MOCK_TIMETABLE.slice(0, 3).map((slot, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[9px] uppercase font-black text-slate-400">Room</span>
                                <span className="font-extrabold text-slate-900">{slot.room}</span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{slot.class} — {slot.subject}</p>
                                <p className="text-xs text-slate-500 font-medium">{slot.teacher}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-wider">Normal</span>
                              <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="bg-slate-900 border-none relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertCircle size={80} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-6 relative z-10">Critical Alerts</h3>
                      <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <AlertCircle className="text-white" size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-white">Unassigned Period</p>
                              <p className="text-xs text-slate-300 mt-1">P5 — Maths (Grade 11)</p>
                              <button className="mt-4 bg-white text-slate-900 text-[11px] font-black px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-wider">
                                Assign Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timetable' && (
                <Card className="min-h-[600px] border-none shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Weekly Master Schedule</h2>
                      <p className="text-sm text-slate-500">Manage and publish class schedules</p>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                      <button className="px-4 py-2 text-slate-600 text-sm font-bold rounded-lg hover:bg-white transition-all">Draft</button>
                      <button className="px-4 py-2 bg-white text-primary-600 shadow-sm border border-slate-200 rounded-lg text-sm font-bold">Publish</button>
                    </div>
                  </div>
                  <TimetableGrid data={MOCK_TIMETABLE} />
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <AbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setAbsenceModalOpen(false)}
        teachers={MOCK_TEACHERS}
      />
    </div>
  );
}
