import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadAuth, saveAuth, clearAuth } from '../storage/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    token: null,
    userData: null,
    isLoading: true,
  });

  const restoreSession = useCallback(async () => {
    try {
      const stored = await loadAuth();
      if (stored && stored.token) {
        setState({
          token: stored.token,
          userData: stored.userData || null,
          isLoading: false,
        });
        return;
      }
    } catch {
    }
    setState((s) => ({ ...s, token: null, userData: null, isLoading: false }));
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const setAuthFromResponse = useCallback(async (userData) => {
    const token = userData?.token;
    if (!token) throw new Error('No token in login response');
    await saveAuth({ token, userData });
    setState({ token, userData, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setState({ token: null, userData: null, isLoading: false });
  }, []);

  const value = useMemo(
    () => ({
      token: state.token,
      userData: state.userData,
      isLoading: state.isLoading,
      isAuthenticated: Boolean(state.token),
      logout,
      setAuthFromResponse,
    }),
    [state.token, state.userData, state.isLoading, logout, setAuthFromResponse],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
