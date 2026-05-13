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
    // Build form-data body (FastAPI OAuth2PasswordRequestForm requires this)
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Login failed.');
    }

    const data = await response.json();
    // data = { access_token: "...", token_type: "bearer" }

    // Decode the JWT payload to get user info (no library needed)
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    const userData = {
      email:     payload.sub,   // college_id stored as 'sub'
      role:      payload.role,
      token:     data.access_token,
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
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Registration failed.');
    }
    return response.json();
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