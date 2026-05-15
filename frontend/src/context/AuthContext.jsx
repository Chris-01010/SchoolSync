import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'schoolsync_token';
const USER_KEY = 'schoolsync_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Temporary Dev Login ───────────────────────────────────────────────
  useEffect(() => {
    const devUser = {
      email: 'hod@schoolsync.com',
      role: 'HOD',
      token: 'dev-token',
    };

    setUser(devUser);

    localStorage.setItem(TOKEN_KEY, 'dev-token');
    localStorage.setItem(USER_KEY, JSON.stringify(devUser));

    setIsLoading(false);
  }, []);

  // ─── Fake Login (temporary) ───────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const fakeUser = {
      email,
      role: 'HOD',
      token: 'dev-token',
    };

    localStorage.setItem(TOKEN_KEY, 'dev-token');
    localStorage.setItem(USER_KEY, JSON.stringify(fakeUser));

    setUser(fakeUser);

    return fakeUser;
  }, []);

  // ─── Registration Placeholder ─────────────────────────────────────────
  const register = useCallback(async (data) => {
    return {
      success: true,
      user: data,
    };
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────
  const LogOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // ─── Refresh Placeholder ──────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    return 'dev-token';
  }, []);

  const value = {
    user,
    isAuthenticated: true,
    isLoading,
    login,
    register,
    LogOut,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return ctx;
}