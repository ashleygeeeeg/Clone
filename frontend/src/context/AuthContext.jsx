import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth is carried by an httpOnly session_token cookie (set by the backend).
// No tokens are stored in localStorage (XSS-safe).
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/me`);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clean up legacy localStorage token from older versions
    localStorage.removeItem('maligee_token');
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const signup = useCallback(async (email, password, name) => {
    const res = await axios.post(`${API}/auth/signup`, { email, password, name });
    setUser(res.data.user);
    return res.data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    setUser(res.data.user);
    return res.data;
  }, []);

  const loginWithGoogle = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const processGoogleSession = useCallback(async (sessionId) => {
    const res = await axios.post(`${API}/auth/google/session`, { session_id: sessionId });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    axios.post(`${API}/auth/logout`).catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signup, login, loginWithGoogle, processGoogleSession, logout }),
    [user, loading, signup, login, loginWithGoogle, processGoogleSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
