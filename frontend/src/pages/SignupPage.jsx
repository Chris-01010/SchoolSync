import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AuthCard, AuthHeader, InputField, SelectField, Button,
  ErrorBanner, AuthCard as _,
} from '../components/auth/AuthComponents';
import EmailVerificationPrompt from './EmailVerificationPrompt';

// ─── Department options ───────────────────────────────────────────────────────
const DEPARTMENTS = [
  { value: 'mathematics',         label: 'Mathematics' },
  { value: 'science',             label: 'Science' },
  { value: 'english',             label: 'English' },
  { value: 'history',             label: 'History' },
  { value: 'computer_science',    label: 'Computer Science' },
  { value: 'arts',                label: 'Arts' },
  { value: 'physical_education',  label: 'Physical Education' },
  { value: 'other',               label: 'Other' },
];

// ─── Password strength rules ──────────────────────────────────────────────────
const PW_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(fields) {
  const { fullName, email, password, confirmPassword, department } = fields;
  const errs = {};

  // Full Name
  if (!fullName.trim()) {
    errs.fullName = 'Full name is required.';
  } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
    errs.fullName = 'Name must be between 2 and 100 characters.';
  } else if (!/^[A-Za-z\s\-']+$/.test(fullName.trim())) {
    errs.fullName = 'Name may only contain letters, spaces, hyphens, and apostrophes.';
  }

  // Email
  if (!email.trim()) {
    errs.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = 'Please enter a valid email address.';
  }

  // Department
  if (!department) {
    errs.department = 'Please select your department.';
  }

  // Password
  if (!password) {
    errs.password = 'Password is required.';
  } else if (password.length < 8) {
    errs.password = 'Password must be at least 8 characters.';
  } else if (!PW_RULES.test(password)) {
    errs.password = 'Must contain uppercase, lowercase, number, and special character (@$!%*?&).';
  }

  // Confirm password
  if (!confirmPassword) {
    errs.confirmPassword = 'Please confirm your password.';
  } else if (confirmPassword !== password) {
    errs.confirmPassword = 'Passwords do not match.';
  }

  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // ── Form state ──
  const [fields, setFields] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [apiError, setApiError]         = useState('');
  const [loading, setLoading]           = useState(false);

  // ── Post-submit success state ──
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error on edit; retain passwords on general errors per PRD S-08
    setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setApiError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      // Focus the first errored field
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`signup-${firstKey}`)?.focus();
      return;
    }
    setFieldErrors({});
    setApiError('');
    setLoading(true);

    try {
      await register({
        name: fields.fullName.trim(),
        email: fields.email.trim(),
        password: fields.password,
        department: fields.department,
      });
      setSubmitted(true);
    } catch (err) {
      if (err.code === 'email_taken') {
        setFieldErrors({ email: 'This email is already registered. Try signing in instead.' });
      } else if (err.name === 'TypeError') {
        setApiError('Unable to connect. Please check your internet connection.');
      } else {
        setApiError(err.message || 'Something went wrong. Please try again.');
      }
      // Per S-08: retain all input except passwords on error
      setFields((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength indicator ────────────────────────────────────────────
  const pwStrength = (() => {
    const p = fields.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[@$!%*?&]/.test(p)) score++;
    if (score <= 2) return { label: 'Weak', color: '#ba1a1a', width: '33%' };
    if (score <= 3) return { label: 'Fair', color: '#e67e22', width: '60%' };
    return { label: 'Strong', color: '#1a7a3a', width: '100%' };
  })();

  // ─── Post-submit: show email verification prompt ───────────────────────────
  if (submitted) {
    return (
      <AuthCard>
        <EmailVerificationPrompt email={fields.email.trim()} />
      </AuthCard>
    );
  }

  // ─── Registration form ─────────────────────────────────────────────────────
  return (
    <AuthCard>
      <AuthHeader
        icon="person_add"
        title="Create your account"
        subtitle="Please fill in your details to get started."
      />

      {/* API-level error */}
      {apiError && (
        <div className="mb-5">
          <ErrorBanner message={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Sign up form">
        <div className="flex flex-col gap-stack-md">

          {/* Full Name */}
          <InputField
            label="Full Name"
            id="signup-fullName"
            name="fullName"
            type="text"
            value={fields.fullName}
            onChange={handleChange}
            placeholder="e.g. Jane Smith"
            icon="person"
            error={fieldErrors.fullName}
            autoComplete="name"
            required
          />

          {/* Email */}
          <InputField
            label="Email address"
            id="signup-email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="name@company.com"
            icon="mail"
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          {/* Department */}
          <SelectField
            label="Department"
            id="signup-department"
            name="department"
            value={fields.department}
            onChange={handleChange}
            options={DEPARTMENTS}
            icon="domain"
            error={fieldErrors.department}
            required
          />

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <InputField
              label="Password"
              id="signup-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={fields.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              icon="lock"
              error={fieldErrors.password}
              rightIcon={{
                icon: showPw ? 'visibility_off' : 'visibility',
                ariaLabel: showPw ? 'Hide password' : 'Show password',
              }}
              onRightIconClick={() => setShowPw((v) => !v)}
              autoComplete="new-password"
              required
              minLength={8}
            />

            {/* Strength bar */}
            {pwStrength && (
              <div className="flex items-center gap-2 mt-1" aria-live="polite" aria-label={`Password strength: ${pwStrength.label}`}>
                <div className="flex-1 h-1 bg-[#e1e2ec] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: pwStrength.width, backgroundColor: pwStrength.color }}
                  />
                </div>
                <span className="text-label-sm font-medium" style={{ color: pwStrength.color }}>
                  {pwStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <InputField
            label="Confirm Password"
            id="signup-confirmPassword"
            name="confirmPassword"
            type={showConfirmPw ? 'text' : 'password'}
            value={fields.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            icon="lock"
            error={fieldErrors.confirmPassword}
            rightIcon={{
              icon: showConfirmPw ? 'visibility_off' : 'visibility',
              ariaLabel: showConfirmPw ? 'Hide confirm password' : 'Show confirm password',
            }}
            onRightIconClick={() => setShowConfirmPw((v) => !v)}
            autoComplete="new-password"
            required
          />

          {/* Submit */}
          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p className="text-center text-label-md text-[#74747e] mt-7">
        Already have an account?{' '}
        <Link to="/login" className="text-[#0051d5] font-medium hover:text-[#003fa6] transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
