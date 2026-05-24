// services/authService.js
// Real auth backed by /auth/login. Stores access_token and decoded user info
// in localStorage for AuthContext to read.

import { api, loginRequest } from "./api";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

/**
 * Decode a JWT payload (no verification — just for reading role/sub on client).
 */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    // base64url → base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

/**
 * Log in. Returns { token, user } on success, throws on failure.
 * Stores both in localStorage.
 */
export async function login(email, password) {
  const data = await loginRequest(email, password);

  if (!data || !data.access_token) {
    throw new Error("Login response missing access token.");
  }

  const token = data.access_token;
  localStorage.setItem(TOKEN_KEY, token);

  // Fetch full user profile from /auth/me now that token is stored
  // (api.js automatically attaches the Authorization header)
  let user;
  try {
    user = await api.get("/auth/me");
  } catch {
    // Fallback: decode role+sub from JWT if /auth/me fails
    const claims = decodeJwt(token);
    user = claims
      ? { college_id: claims.sub, role: (claims.role || "").toLowerCase(), email }
      : { email, role: "teacher" };
  }

  // Normalize role to lowercase for routing consistency
  if (user && user.role) {
    user.role = String(user.role).toLowerCase();
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

/**
 * Log out — clears token+user and best-effort hits backend logout endpoint.
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore — we still want local state cleared
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the current user from localStorage (synchronous; for AuthContext init).
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getStoredToken();
}

// ─── Legacy mock exports kept as no-ops so old imports don't crash ───────────
// Anything still importing mockLogin will now hit the real backend.
export const mockLogin = login;