/**
 * authService.js — Mock API service layer for the Auth Module.
 * Replace these functions with real fetch/axios calls when the backend is wired.
 */

const MOCK_DELAY = 1000; // ms

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Mock login ───────────────────────────────────────────────────────────────
// Success: any email ending in @schoolsync.com with password "password"
// Also accepts the seed users for dev convenience
const SEED_USERS = [
  { email: 'admin@schoolsync.com',   password: 'admin123',   name: 'Admin User',   role: 'admin' },
  { email: 'teacher@schoolsync.com', password: 'teacher123', name: 'John Doe',     role: 'teacher' },
  { email: 'hod@schoolsync.com',     password: 'hod123',     name: 'Dr. Smith',    role: 'hod' },
  { email: 'test@schoolsync.com',    password: 'password',   name: 'Test User',    role: 'teacher' },
];

export async function mockLogin(email, password) {
  await delay(MOCK_DELAY);

  const match = SEED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (match) {
    const token = `mock-jwt-${Date.now()}`;
    return {
      user: { name: match.name, email: match.email, role: match.role },
      token,
    };
  }

  // Simulate generic invalid credentials
  const err = new Error('Invalid email or password. Please try again.');
  err.code = 'invalid_credentials';
  throw err;
}

// ─── Mock register ────────────────────────────────────────────────────────────
// Error: if email is "taken@schoolsync.com"
export async function mockRegister({ name, email, password, department }) {
  await delay(MOCK_DELAY);

  if (email.toLowerCase() === 'taken@schoolsync.com') {
    const err = new Error('This email is already registered. Try signing in instead.');
    err.code = 'email_taken';
    err.field = 'email';
    throw err;
  }

  return { message: 'Verification email sent.' };
}

// ─── Mock resend verification ─────────────────────────────────────────────────
export async function mockResendVerification(email) {
  await delay(MOCK_DELAY);
  console.log(`[authService] Resend verification email to: ${email}`);
  return { message: 'Verification email resent.' };
}
