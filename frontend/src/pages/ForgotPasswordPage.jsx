import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch(
        `http://localhost:8000/auth/forgot-password?email=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl p-10 max-w-md w-full">
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0051d5] rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
              <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send you a reset link.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0051d5] transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0051d5] hover:bg-[#003fa6] text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-[#0051d5] text-sm font-semibold hover:text-[#003fa6]">
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Check your email</h2>
              <p className="text-slate-500 mt-2 text-sm">
                If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
              </p>
              <Link to="/login" className="mt-6 inline-block text-[#0051d5] font-semibold hover:text-[#003fa6]">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}