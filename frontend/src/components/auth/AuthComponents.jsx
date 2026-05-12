// ─── Shared reusable components for the Auth module ──────────────────────────
// InputField, SelectField, Button, SocialButton, Divider, ErrorBanner, SuccessBanner
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// InputField
// ─────────────────────────────────────────────────────────────────────────────
export const InputField = ({
  label,
  id,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  rightIcon,
  onRightIconClick,
  disabled = false,
  autoComplete,
  required = false,
  minLength,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[#1b1b1f] text-label-md font-medium">
      {label}
    </label>
    <div className="relative">
      {/* Leading icon */}
      <span
        className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74747e] pointer-events-none select-none"
        style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        aria-hidden="true"
      >
        {icon}
      </span>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'w-full h-12 rounded-xl border text-[15px] text-[#1b1b1f] placeholder-[#a8a8b0] bg-white',
          'transition-all duration-150 pl-11',
          rightIcon ? 'pr-12' : 'pr-4',
          'focus:outline-none focus:ring-2 focus:ring-[#0051d5]/15 focus:border-[#0051d5]',
          error
            ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/15'
            : 'border-[#c6c6cd]',
          disabled ? 'opacity-50 cursor-not-allowed bg-[#f5f5f7]' : '',
        ].join(' ')}
      />

      {/* Trailing icon button */}
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          aria-label={rightIcon.ariaLabel}
          tabIndex={0}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74747e] hover:text-[#1b1b1f] transition-colors p-1 rounded-lg focus-visible:outline-2"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {rightIcon.icon}
          </span>
        </button>
      )}
    </div>

    {/* Inline error */}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-[#ba1a1a] text-label-sm flex items-center gap-1">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '14px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          aria-hidden="true"
        >
          error
        </span>
        {error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SelectField
// ─────────────────────────────────────────────────────────────────────────────
export const SelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  icon,
  error,
  disabled = false,
  required = false,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[#1b1b1f] text-label-md font-medium">
      {label}
    </label>
    <div className="relative">
      <span
        className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74747e] pointer-events-none select-none"
        style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        aria-hidden="true"
      >
        {icon}
      </span>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'w-full h-12 rounded-xl border text-[15px] bg-white appearance-none',
          'pl-11 pr-10 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#0051d5]/15 focus:border-[#0051d5]',
          value === '' ? 'text-[#a8a8b0]' : 'text-[#1b1b1f]',
          error
            ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/15'
            : 'border-[#c6c6cd]',
          disabled ? 'opacity-50 cursor-not-allowed bg-[#f5f5f7]' : '',
        ].join(' ')}
      >
        <option value="" disabled>
          Select your department
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Chevron */}
      <span
        className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74747e] pointer-events-none"
        style={{ fontSize: '20px' }}
        aria-hidden="true"
      >
        expand_more
      </span>
    </div>

    {error && (
      <p id={`${id}-error`} role="alert" className="text-[#ba1a1a] text-label-sm flex items-center gap-1">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '14px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          aria-hidden="true"
        >
          error
        </span>
        {error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export const Button = ({
  children,
  type = 'button',
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const base =
    'w-full h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2';

  const styles = {
    primary:
      'bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-sm',
    secondary:
      'bg-white text-[#1b1b1f] border border-[#c6c6cd] hover:bg-[#f8f9ff] hover:border-[#a8a8b0] shadow-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${styles[variant]}`}
    >
      {loading ? (
        <>
          <Spinner />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SocialButton
// ─────────────────────────────────────────────────────────────────────────────
export const SocialButton = ({ icon, providerName, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Continue with ${providerName}`}
    className="w-full h-12 bg-white border border-[#c6c6cd] rounded-xl text-[15px] text-[#1b1b1f] font-medium
      flex items-center justify-center gap-3 hover:bg-[#f8f9ff] hover:border-[#a8a8b0]
      transition-all duration-150 shadow-sm active:scale-[0.98]"
  >
    {icon}
    <span>Continue with {providerName}</span>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Divider
// ─────────────────────────────────────────────────────────────────────────────
export const Divider = ({ text = 'OR' }) => (
  <div className="flex items-center gap-3" aria-hidden="true">
    <div className="flex-1 h-px bg-[#c6c6cd]" />
    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a8b0]">{text}</span>
    <div className="flex-1 h-px bg-[#c6c6cd]" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBanner
// ─────────────────────────────────────────────────────────────────────────────
export const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex items-start gap-2.5 bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-sm font-medium rounded-xl px-4 py-3"
    >
      <span
        className="material-symbols-outlined flex-shrink-0 mt-0.5"
        style={{ fontSize: '18px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        aria-hidden="true"
      >
        error
      </span>
      <span>{message}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SuccessBanner
// ─────────────────────────────────────────────────────────────────────────────
export const SuccessBanner = ({ message, dismissible = false, onDismiss }) => {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-2.5 bg-[#d3f0d9] border border-[#1a7a3a]/20 text-[#1a5c2e] text-sm font-medium rounded-xl px-4 py-3"
    >
      <span
        className="material-symbols-outlined flex-shrink-0 mt-0.5"
        style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        aria-hidden="true"
      >
        check_circle
      </span>
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="text-[#1a5c2e]/60 hover:text-[#1a5c2e] transition-colors ml-1 flex-shrink-0"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px' }}
          >
            close
          </span>
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast (floating)
// ─────────────────────────────────────────────────────────────────────────────
export const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1b1b1f] text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in"
    >
      <span
        className="material-symbols-outlined text-[#aecbfa]"
        style={{ fontSize: '18px' }}
      >
        info
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthCard shell
// ─────────────────────────────────────────────────────────────────────────────
export const AuthCard = ({ children }) => (
  <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-0 sm:p-6">
    <div className="w-full sm:max-w-[440px] bg-white sm:rounded-2xl sm:shadow-card px-6 py-10 sm:px-10">
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// AuthHeader (shield / email-check icon + title + subtitle)
// ─────────────────────────────────────────────────────────────────────────────
export const AuthHeader = ({ icon = 'shield', title, subtitle, iconColor = '#0051d5' }) => (
  <div className="flex flex-col items-center text-center mb-8">
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
      style={{ backgroundColor: '#EEF2FB' }}
      aria-hidden="true"
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '28px', color: iconColor, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {icon}
      </span>
    </div>
    <h1 className="font-bold text-[#1b1b1f] mb-2 text-[28px] sm:text-[32px] leading-tight">
      {title}
    </h1>
    {subtitle && <p className="text-[#74747e] text-body-md">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Social Logos (SVG)
// ─────────────────────────────────────────────────────────────────────────────
export const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
);

export const AppleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);
