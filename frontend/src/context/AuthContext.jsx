import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'schoolsync_token';
const USER_KEY  = 'schoolsync_user';

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
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
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json();
      const message = typeof err.detail === 'string' 
        ? err.detail 
        : Array.isArray(err.detail)
        ? err.detail[0]?.msg || 'Login failed.'
        : 'Login failed.';
      throw new Error(message);
    }

    const data = await response.json();

    // Decode JWT payload to get user info
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    const userData = {
      email:  email,
      role:   payload.role,
      token:  data.access_token,
    };

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_id: data.email.split('@')[0].toUpperCase(),
          email: data.email,
          password: data.password,
          role: 'teacher',
          name: data.name,
          department: data.department
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(typeof err.detail === 'string' ? err.detail : 'Registration failed.');
      }
      return response.json();
    }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      credentials: 'include',  // sends the HttpOnly cookie automatically
    });

    if (!response.ok) {
      // Refresh failed — force logout
      logout();
      return null;
    }

    const data = await response.json();
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    const userData = {
      ...JSON.parse(localStorage.getItem(USER_KEY)),
      token: data.access_token,
      role:  payload.role,
    };

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return data.access_token;
  }, [logout]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}