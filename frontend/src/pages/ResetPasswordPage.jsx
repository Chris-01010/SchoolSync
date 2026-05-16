import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const token = searchParams.get('token');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8000/auth/reset-password?token=${token}&new_password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Reset failed.');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl p-10 max-w-md w-full">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0051d5] rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Set New Password</h2>
              <p className="text-slate-500 mt-2 text-sm">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                required
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0051d5] transition-all"
              />
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0051d5] transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0051d5] hover:bg-[#003fa6] text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-[#0051d5] text-sm font-semibold hover:text-[#003fa6]">
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Password Reset!</h2>
            <p className="text-slate-500 mt-2 text-sm">Redirecting you to sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
}