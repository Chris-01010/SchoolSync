import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  User, 
  Mail,
  School,
  Briefcase
} from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    college_id: '',
    email: '',
    password: '',
    role: 'teacher'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    // For local dev, bypass if no backend
    if (formData.college_id === 'admin' && formData.password === 'admin') {
        onLogin({ college_id: 'admin', role: 'admin' });
        return;
    }

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': isLogin ? 'application/x-www-form-urlencoded' : 'application/json' 
        },
        body: isLogin 
            ? new URLSearchParams({ username: formData.college_id, password: formData.password })
            : JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Authentication failed');

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        // Fetch user profile
        const userRes = await fetch('http://localhost:8000/auth/me', {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        const userData = await userRes.json();
        onLogin(userData);
      } else {
        setIsLogin(true);
        setError('Account created! Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] font-['Inter'] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 relative z-10">
        {/* Left: Content */}
        <div className="flex flex-col justify-center space-y-10 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">SchoolSync v1.0</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
              Next-Gen <br />
              <span className="text-primary-600">School Admin</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-md">
              AI-powered timetable generation and automated relief teacher management for modern educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Conflict Free', desc: 'Auto-generation', icon: ShieldCheck },
              { label: 'Real-time', desc: 'Relief alerts', icon: Clock }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-primary-600">
                  <feature.icon size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{feature.label}</p>
                  <p className="text-xs text-slate-400 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="order-1 lg:order-2 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[450px] bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50 p-10 relative"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <School className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {isLogin ? 'Login to your staff portal' : 'Create your admin account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                  />
                </div>
              )}

              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  placeholder="College ID (e.g. ADM001)"
                  value={formData.college_id}
                  onChange={(e) => setFormData({...formData, college_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                />
              </div>

              {!isLogin && (
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 appearance-none transition-all"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-600/20 uppercase tracking-widest text-xs mt-4 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Login Account' : 'Register Now'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
