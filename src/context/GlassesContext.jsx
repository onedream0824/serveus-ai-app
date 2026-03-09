import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import MetaGlasses from '../services/MetaGlasses';

const GlassesContext = createContext(null);

const initialState = {
  isAvailable: false,
  isRegistered: false,
  glassesConnected: false,
  connectedDeviceCount: 0,
  isStreaming: false,
  error: null,
  isRegistering: false,
};

export function GlassesProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [isRegistering, setIsRegistering] = useState(false);

  const updateState = useCallback((next) => {
    setState((prev) => ({
      ...prev,
      isAvailable: MetaGlasses.isAvailable(),
      ...next,
    }));
  }, []);

  useEffect(() => {
    if (!MetaGlasses.isAvailable()) {
      setState((prev) => ({ ...prev, isAvailable: false }));
      return;
    }
    setState((prev) => ({ ...prev, isAvailable: true }));
    MetaGlasses.getGlassesState().then((s) => {
      updateState({
        isRegistered: s.isRegistered,
        glassesConnected: s.glassesConnected,
        connectedDeviceCount: s.connectedDeviceCount,
        isStreaming: s.isStreaming,
        error: s.error,
      });
    });
    const sub = MetaGlasses.addListener((payload) => {
      updateState({
        isRegistered: !!payload?.isRegistered,
        glassesConnected: !!payload?.glassesConnected,
        connectedDeviceCount: payload?.connectedDeviceCount ?? 0,
        isStreaming: !!payload?.isStreaming,
        error: payload?.error ?? null,
      });
    });
    return () => sub.remove();
  }, [updateState]);

  const startRegistration = useCallback(async () => {
    if (!MetaGlasses.isAvailable()) return;
    setIsRegistering(true);
    try {
      await MetaGlasses.startRegistration();
      const s = await MetaGlasses.getGlassesState();
      updateState({
        isRegistered: s.isRegistered,
        glassesConnected: s.glassesConnected,
        connectedDeviceCount: s.connectedDeviceCount,
        error: null,
      });
    } catch (err) {
      updateState({ error: err?.message ?? 'Registration failed' });
    } finally {
      setIsRegistering(false);
    }
  }, [updateState]);

  const startStreaming = useCallback(async () => {
    if (!MetaGlasses.isAvailable()) return;
    try {
      await MetaGlasses.startStreaming();
      const s = await MetaGlasses.getGlassesState();
      updateState({ isStreaming: s.isStreaming, error: null });
    } catch (err) {
      updateState({ error: err?.message ?? 'Streaming failed' });
    }
  }, [updateState]);

  const stopStreaming = useCallback(async () => {
    if (!MetaGlasses.isAvailable()) return;
    await MetaGlasses.stopStreaming();
    updateState({ isStreaming: false });
  }, [updateState]);

  const capturePhotoFromGlasses = useCallback(async () => {
    if (!MetaGlasses.isAvailable()) {
      throw new Error('Meta glasses not available');
    }
    const s = await MetaGlasses.getGlassesState();
    if (!s.glassesConnected) {
      throw new Error('No glasses connected');
    }
    if (!s.isStreaming) {
      await MetaGlasses.startStreaming();
    }
    const result = await MetaGlasses.capturePhoto();
    const uri = result?.uri;
    if (!uri) {
      throw new Error('Photo capture failed');
    }
    return { uri };
  }, []);

  const value = {
    ...state,
    isRegistering,
    startRegistration,
    startStreaming,
    stopStreaming,
    capturePhotoFromGlasses,
    refreshState: () => MetaGlasses.getGlassesState().then((s) => updateState({
      isRegistered: s.isRegistered,
      glassesConnected: s.glassesConnected,
      connectedDeviceCount: s.connectedDeviceCount,
      isStreaming: s.isStreaming,
      error: s.error,
    })),
  };

  return (
    <GlassesContext.Provider value={value}>
      {children}
    </GlassesContext.Provider>
  );
}

export function useGlasses() {
  const ctx = useContext(GlassesContext);
  if (!ctx) {
    return {
      ...initialState,
      isRegistering: false,
      startRegistration: async () => {},
      startStreaming: async () => {},
      stopStreaming: async () => {},
      capturePhotoFromGlasses: async () => ({ uri: null }),
      refreshState: () => {},
    };
  }
  return ctx;
}
