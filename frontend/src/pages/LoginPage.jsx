import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AuthCard, AuthHeader, InputField, Button,
  Divider, SocialButton, ErrorBanner, SuccessBanner, Toast,
  GoogleLogo, MicrosoftLogo, AppleLogo,
} from '../components/auth/AuthComponents';

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(email, password) {
  const errs = {};
  if (!email) {
    errs.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errs.password = 'Password is required.';
  }
  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── State ──
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState('');
  const [verifiedBanner, setVerifiedBanner] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // ?verified=1 banner
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setVerifiedBanner(true);
      const timer = setTimeout(() => setVerifiedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setApiError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role === 'hod') {
        navigate('/hod-dashboard', { replace: true });
      } else if (user?.role === 'teacher') {
        navigate('/teacher-dashboard', { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.name === 'TypeError') {
        setApiError('Unable to connect. Please check your internet connection.');
      } else {
        setApiError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setApiError('');
  };

  const handleSocial = (provider) =>
    showToast(`Social login will be available after backend integration.`);

  return (
    <AuthCard>
      <AuthHeader
        icon="shield"
        title="Welcome back"
        subtitle="Please enter your details to sign in."
      />

      {/* Verified email banner */}
      {verifiedBanner && (
        <div className="mb-5">
          <SuccessBanner
            message="Email verified. You can now sign in."
            dismissible
            onDismiss={() => setVerifiedBanner(false)}
          />
        </div>
      )}

      {/* API error banner */}
      {apiError && (
        <div className="mb-5">
          <ErrorBanner message={apiError} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
        <div className="flex flex-col gap-stack-md">
          <InputField
            label="Email address"
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            placeholder="name@company.com"
            icon="mail"
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-[#1b1b1f] text-label-md font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast('Password reset is coming soon.')}
                className="text-label-md font-medium text-[#0051d5] hover:text-[#003fa6] transition-colors focus-visible:underline"
              >
                Forgot password?
              </button>
            </div>
            <InputField
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
              placeholder="••••••••"
              icon="lock"
              error={fieldErrors.password}
              rightIcon={{
                icon: showPw ? 'visibility_off' : 'visibility',
                ariaLabel: showPw ? 'Hide password' : 'Show password',
              }}
              onRightIconClick={() => setShowPw((v) => !v)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <div className="my-6">
        <Divider />
      </div>

      {/* Social buttons */}
      <div className="flex flex-col gap-3">
        <SocialButton icon={<GoogleLogo />}    providerName="Google"    onClick={() => handleSocial('Google')} />
        <SocialButton icon={<MicrosoftLogo />} providerName="Microsoft" onClick={() => handleSocial('Microsoft')} />
        <SocialButton icon={<AppleLogo />}     providerName="Apple"     onClick={() => handleSocial('Apple')} />
      </div>

      {/* Footer */}
      <p className="text-center text-label-md text-[#74747e] mt-7">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#0051d5] font-medium hover:text-[#003fa6] transition-colors">
          Create an account
        </Link>
      </p>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </AuthCard>
  );
}
