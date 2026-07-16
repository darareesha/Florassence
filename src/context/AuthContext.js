
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getAuthSession, saveAuthSession, clearAuthSession } from '../services/storage';

// instead of passing through app, home,profile and settings, the user can directly get access to AuthContext
const AuthContext = createContext(null);
/*
AuthProvider wraps the application and manages authentication state.
It loads any previously saved session, stores the current user's session,
and provides authentication functions to all child components.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getAuthSession()
      .then(setSession)
      .finally(() => setCheckingSession(false));
  }, []);

  const login = useCallback(async ({ name, email }) => {
    const newSession = { name, email };
    await saveAuthSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    isAuthed: !!session,
    checkingSession,
    login,
    logout,
  }), [session, checkingSession, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
