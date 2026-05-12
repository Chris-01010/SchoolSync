import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Toast } from '../components/auth/AuthComponents';
import { mockResendVerification } from '../services/authService';

export default function EmailVerificationPrompt({ email }) {
  const [resending, setResending] = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await mockResendVerification(email);
      showToast('Verification email resent! Check your inbox.');
    } catch {
      showToast('Could not resend. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {/* Success icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#d3f0d9' }}
        aria-hidden="true"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '40px', color: '#1a7a3a', fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          mark_email_read
        </span>
      </div>

      <div>
        <h2 className="font-bold text-[#1b1b1f] text-[28px] sm:text-[32px] leading-tight mb-2">
          Check your email
        </h2>
        <p className="text-[#74747e] text-body-md leading-relaxed">
          We've sent a verification link to{' '}
          <strong className="text-[#1b1b1f] font-semibold">{email}</strong>.
          <br />
          Please click the link to activate your account.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button onClick={handleResend} loading={resending} variant="secondary">
          Resend verification email
        </Button>

        <Link
          to="/login"
          className="w-full h-12 rounded-xl border border-transparent text-[15px] text-[#0051d5] font-semibold
            flex items-center justify-center hover:text-[#003fa6] transition-colors"
        >
          Back to Sign in
        </Link>
      </div>

      {toast && (
        // inline toast for this state since it's standalone
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1b1b1f] text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in"
        >
          <span className="material-symbols-outlined text-[#aecbfa]" style={{ fontSize: '18px' }}>info</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
