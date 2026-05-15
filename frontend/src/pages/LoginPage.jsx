import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AuthCard,
  AuthHeader,
  InputField,
  Button,
  Divider,
  SocialButton,
  ErrorBanner,
  SuccessBanner,
  Toast,
  GoogleLogo,
  MicrosoftLogo,
  AppleLogo,
} from '../components/auth/AuthComponents';

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

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState('');
  const [verifiedBanner, setVerifiedBanner] = useState(false);

  // ─── Redirect if authenticated ─────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      const role = JSON.parse(
        localStorage.getItem('schoolsync_user') || '{}'
      ).role;

      if (role === 'HOD' || role === 'hod') {
        navigate('/hod', { replace: true });
      } else if (role === 'ADMIN' || role === 'admin') {
        navigate('/app', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  // ─── ?verified=1 banner ────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setVerifiedBanner(true);

      const timer = setTimeout(() => {
        setVerifiedBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const showToast = useCallback((msg) => {
    setToast(msg);

    setTimeout(() => {
      setToast('');
    }, 3500);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(email, password);

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setApiError('');
    setLoading(true);

    try {
<<<<<<< HEAD
      const user = await login(email, password);
      if (user?.role === 'hod') {
        navigate('/hod-dashboard', { replace: true });
      } else if (user?.role === 'teacher') {
        navigate('/teacher-dashboard', { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
=======
      const userData = await login(email, password);

      if (userData.role === 'HOD' || userData.role === 'hod') {
        navigate('/hod', { replace: true });
      } else if (
        userData.role === 'ADMIN' ||
        userData.role === 'admin'
      ) {
        navigate('/app', { replace: true });
>>>>>>> main
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.name === 'TypeError') {
        setApiError(
          'Unable to connect. Please check your internet connection.'
        );
      } else {
        setApiError(
          err.message ||
            'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    setFieldErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });

    setApiError('');
  };

  const handleSocial = (provider) => {
    showToast(
      'Social login will be available after backend integration.'
    );
  };

  return (
    <AuthCard>
      <AuthHeader
        icon="shield"
        title="Welcome back"
        subtitle="Please enter your details to sign in."
      />

      {verifiedBanner && (
        <div className="mb-5">
          <SuccessBanner
            message="Email verified. You can now sign in."
            dismissible
            onDismiss={() => setVerifiedBanner(false)}
          />
        </div>
      )}

      {apiError && (
        <div className="mb-5">
          <ErrorBanner message={apiError} />

          {apiError.includes('not verified') && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetch(
                    `http://127.0.0.1:8000/auth/resend-verification?email=${encodeURIComponent(
                      email
                    )}`,
                    {
                      method: 'POST',
                    }
                  );

                  setApiError(
                    'Verification email sent! Check your inbox.'
                  );
                } catch {
                  setApiError(
                    'Could not resend. Please try again.'
                  );
                }
              }}
              className="mt-2 w-full text-sm text-[#0051d5] font-semibold hover:text-[#003fa6] text-center"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Sign in form"
      >
        <div className="flex flex-col gap-stack-md">
          <InputField
            label="Email address"
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError('email');
            }}
            placeholder="name@company.com"
            icon="mail"
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[#1b1b1f] text-label-md font-medium"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-label-md font-medium text-[#0051d5] hover:text-[#003fa6] transition-colors focus-visible:underline"
              >
                Forgot password?
              </Link>
            </div>

            <InputField
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              placeholder="••••••••"
              icon="lock"
              error={fieldErrors.password}
              rightIcon={{
                icon: showPw ? 'visibility_off' : 'visibility',
                ariaLabel: showPw
                  ? 'Hide password'
                  : 'Show password',
              }}
              onRightIconClick={() =>
                setShowPw((v) => !v)
              }
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

      <div className="flex flex-col gap-3">
        <SocialButton
          icon={<GoogleLogo />}
          providerName="Google"
          onClick={() => handleSocial('Google')}
        />

        <SocialButton
          icon={<MicrosoftLogo />}
          providerName="Microsoft"
          onClick={() => handleSocial('Microsoft')}
        />

        <SocialButton
          icon={<AppleLogo />}
          providerName="Apple"
          onClick={() => handleSocial('Apple')}
        />
      </div>

      <p className="text-center text-label-md text-[#74747e] mt-7">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-[#0051d5] font-medium hover:text-[#003fa6] transition-colors"
        >
          Create an account
        </Link>
      </p>

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast('')}
        />
      )}
    </AuthCard>
  );
}