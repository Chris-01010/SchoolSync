import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockLogin, mockRegister } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'schoolsync_mock_token';
const USER_KEY  = 'schoolsync_mock_user';

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true during initial hydration

  // Hydrate from localStorage on mount (mock persistence)
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const saved = localStorage.getItem(USER_KEY);
      if (token && saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // corrupt storage — ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: userData, token } = await mockLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const result = await mockRegister(data);
    // We do NOT log the user in — they need to verify email first.
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
