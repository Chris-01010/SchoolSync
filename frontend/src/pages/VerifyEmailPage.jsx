import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    let cancelled = false;

    fetch(`http://localhost:8000/verify-email?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl p-10 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin h-8 w-8 text-[#0051d5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verifying your email...</h2>
            <p className="text-slate-500 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-slate-500 mt-2">Your account is now active. You can sign in.</p>
            <Link
              to="/login"
              className="mt-6 inline-block bg-[#0051d5] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#003fa6] transition-colors"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-slate-500 mt-2">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block text-[#0051d5] font-semibold hover:text-[#003fa6] transition-colors"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}