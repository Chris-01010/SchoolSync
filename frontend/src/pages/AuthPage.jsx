<<<<<<< HEAD
import React, { useState, useCallback } from 'react';

// ─── SVG Social Logos ───────────────────────────────────────────────────────

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
);

const AppleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// ─── Toast Component ─────────────────────────────────────────────────────────

const Toast = ({ message, onClose }) => (
  <div
    role="alert"
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1b1b1f] text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in"
  >
    <span className="material-symbols-outlined text-[18px] text-[#aecbfa]">info</span>
    <span>{message}</span>
    <button
      onClick={onClose}
      className="ml-2 text-white/60 hover:text-white transition-colors"
      aria-label="Dismiss notification"
    >
      <span className="material-symbols-outlined text-[16px]">close</span>
    </button>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─── AuthPage ─────────────────────────────────────────────────────────────────

const AuthPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // ── Client-side validation ──
  const validate = () => {
    if (!formData.email) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return 'Please enter a valid email address (e.g. name@school.edu).';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 8)
      return 'Password must be at least 8 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include', // send/receive HttpOnly cookies
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (response.status === 423) {
          const retryMin = data.retry_after_minutes ?? 15;
          throw new Error(
            `Your account is temporarily locked. Please try again in ${retryMin} minutes.`
          );
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please wait before trying again.');
        } else {
          throw new Error(data.detail || 'Something went wrong. Please try again.');
        }
      }

      // Store token for Bearer fallback
      localStorage.setItem('token', data.access_token);

      // Fetch user info
      const meRes = await fetch('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const user = await meRes.json();
      onLogin(user);
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Unable to connect. Check your internet connection.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showToast(`${provider} sign-in is coming soon.`);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showToast('Password reset is coming soon.');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    showToast('Account registration is coming soon.');
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-0 sm:p-6"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Card ── */}
      <div className="w-full sm:max-w-[440px] bg-white sm:rounded-2xl sm:shadow-card px-6 py-10 sm:px-10">

        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Shield Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EEF2FB' }}
            aria-hidden="true"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '28px', color: '#0051d5', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              shield
            </span>
          </div>

          <h1
            className="font-bold text-[#1b1b1f] mb-2 text-[28px] sm:text-[32px] leading-tight"
          >
            Welcome back
          </h1>
          <p className="text-[#74747e] text-[16px]">
            Please enter your details to sign in.
          </p>
        </div>

        {/* ── Error region (aria-live) ── */}
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-0"
        >
          {error && (
            <div
              id="login-error"
              className="flex items-start gap-2.5 bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-sm font-medium rounded-xl px-4 py-3 mb-5"
            >
              <span
                className="material-symbols-outlined flex-shrink-0 mt-0.5"
                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
              >
                error
              </span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-[#1b1b1f] text-[14px] font-medium mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74747e] pointer-events-none"
                style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                aria-hidden="true"
              >
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                aria-describedby={error ? 'login-error' : undefined}
                aria-invalid={!!error}
                className="w-full h-12 pl-11 pr-4 border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] placeholder-[#a8a8b0] bg-white transition-all duration-150
                  focus:outline-none focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/15"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-[#1b1b1f] text-[14px] font-medium"
              >
                Password
              </label>
              <a
                href="/forgot-password"
                onClick={handleForgotPassword}
                className="text-[14px] font-medium text-[#0051d5] hover:text-[#003fa6] transition-colors focus-visible:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74747e] pointer-events-none"
                style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                aria-hidden="true"
              >
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                aria-describedby={error ? 'login-error' : undefined}
                aria-invalid={!!error}
                className="w-full h-12 pl-11 pr-12 border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] placeholder-[#a8a8b0] bg-white transition-all duration-150
                  focus:outline-none focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/15"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74747e] hover:text-[#1b1b1f] transition-colors p-1 rounded-lg"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-12 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed
              text-white font-semibold text-[15px] rounded-xl transition-all duration-150
              flex items-center justify-center gap-2.5 shadow-sm"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Signing in…</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-6" aria-hidden="true">
          <div className="flex-1 h-px bg-[#c6c6cd]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a8b0]">or</span>
          <div className="flex-1 h-px bg-[#c6c6cd]" />
        </div>

        {/* ── Social Buttons ── */}
        <div className="flex flex-col gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="w-full h-12 bg-white border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] font-medium
              flex items-center justify-center gap-3 hover:bg-[#f8f9ff] hover:border-[#a8a8b0]
              transition-all duration-150 shadow-sm"
            aria-label="Continue with Google"
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>

          {/* Microsoft */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Microsoft')}
            className="w-full h-12 bg-white border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] font-medium
              flex items-center justify-center gap-3 hover:bg-[#f8f9ff] hover:border-[#a8a8b0]
              transition-all duration-150 shadow-sm"
            aria-label="Continue with Microsoft"
          >
            <MicrosoftLogo />
            <span>Continue with Microsoft</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Apple')}
            className="w-full h-12 bg-white border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] font-medium
              flex items-center justify-center gap-3 hover:bg-[#f8f9ff] hover:border-[#a8a8b0]
              transition-all duration-150 shadow-sm"
            aria-label="Continue with Apple"
          >
            <AppleLogo />
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* ── Footer link ── */}
        <p className="text-center text-[14px] text-[#74747e] mt-7">
          Don't have an account?{' '}
          <a
            href="/signup"
            onClick={handleCreateAccount}
            className="text-[#0051d5] font-medium hover:text-[#003fa6] transition-colors"
          >
            Create an account
          </a>
        </p>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
=======
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
    </div>
  );
};

export default AuthPage;
