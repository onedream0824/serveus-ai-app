import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';
import {
  getAppointments,
  markAppointmentAsCompleted,
} from '../services/appointmentApi';

const WorkflowContext = createContext(null);

const EMPTY_APPOINTMENTS = [];
const STATUS_IN_PROGRESS = 'in_progress';

function getInProgressIndex(list) {
  if (!Array.isArray(list)) return -1;
  return list.findIndex((a) => (a.status || '').toLowerCase() === STATUS_IN_PROGRESS);
}

export function WorkflowProvider({ children }) {
  const { token, userData, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState(EMPTY_APPOINTMENTS);
  const [activeJobIndex, setActiveJobIndex] = useState(0);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [proofOfWorkDraft, setProofOfWorkDraft] = useState({
    notes: [],
    photoUris: [],
  });

  const activeJob = useMemo(
    () => (appointments[activeJobIndex] ? appointments[activeJobIndex] : null),
    [appointments, activeJobIndex],
  );

  const refreshAppointments = useCallback(async () => {
    if (!token || !userData) {
      setAppointments(EMPTY_APPOINTMENTS);
      return EMPTY_APPOINTMENTS;
    }
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const list = await getAppointments(token, userData, { sorts: 'dated,timeSlotFrom' });
      const next = Array.isArray(list) ? list : EMPTY_APPOINTMENTS;
      setAppointments(next);
      setActiveJobIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    } catch (err) {
      setAppointmentsError(err?.message ?? 'Failed to load appointments');
      setAppointments(EMPTY_APPOINTMENTS);
      Toast.show({ type: 'error', text1: 'Could not load appointments', text2: err?.message });
      return EMPTY_APPOINTMENTS;
    } finally {
      setAppointmentsLoading(false);
    }
  }, [token, userData]);

  useEffect(() => {
    if (isAuthenticated && token && userData) {
      refreshAppointments();
    } else {
      setAppointments(EMPTY_APPOINTMENTS);
      setActiveJobIndex(0);
    }
  }, [isAuthenticated, token, userData, refreshAppointments]);

  const setInProgress = useCallback((optionalIndex) => {
    setAppointments((prev) => {
      const next = [...prev];
      const idx = typeof optionalIndex === 'number' && optionalIndex >= 0 ? optionalIndex : activeJobIndex;
      if (next[idx]) {
        next[idx] = {
          ...next[idx],
          status: STATUS_IN_PROGRESS,
          startedAt: next[idx].startedAt || Date.now(),
        };
      }
      return next;
    });
  }, [activeJobIndex]);

  const addProofNote = useCallback((text) => {
    if (!text || !text.trim()) return;
    setProofOfWorkDraft((prev) => ({
      ...prev,
      notes: [...prev.notes, { text: text.trim(), timestamp: Date.now() }],
    }));
  }, []);

  const addProofPhoto = useCallback((uri) => {
    setProofOfWorkDraft((prev) => ({
      ...prev,
      photoUris: [...prev.photoUris, uri],
    }));
  }, []);

  const clearProofDraft = useCallback(() => {
    setProofOfWorkDraft({ notes: [], photoUris: [] });
  }, []);

  const completeAppointment = useCallback(async () => {
    if (!token || !userData) {
      Toast.show({ type: 'error', text1: 'Not authenticated' });
      return;
    }
    const inProgressIndex = getInProgressIndex(appointments);
    const job = inProgressIndex >= 0 ? appointments[inProgressIndex] : null;
    if (!job) {
      Toast.show({ type: 'warning', text1: 'No appointment in progress', text2: 'Start an appointment first' });
      return;
    }
    const appointmentId = job.appointmentId ?? job.id;
    try {
      await markAppointmentAsCompleted(token, appointmentId);
      setAppointments((prev) => {
        const next = [...prev];
        if (next[inProgressIndex]) {
          next[inProgressIndex] = { ...next[inProgressIndex], status: 'completed', completedAt: Date.now() };
        }
        return next;
      });
      clearProofDraft();
      setActiveJobIndex(Math.min(inProgressIndex + 1, Math.max(0, appointments.length - 1)));
      Toast.show({ type: 'success', text1: 'Appointment completed' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Could not complete appointment', text2: err?.message });
    }
  }, [token, userData, appointments, clearProofDraft]);

  const selectAppointment = useCallback((index) => {
    if (index >= 0 && index < appointments.length) {
      setActiveJobIndex(index);
    }
  }, [appointments.length]);

  const value = useMemo(
    () => ({
      appointments,
      activeJobIndex,
      activeJob,
      proofOfWorkDraft,
      appointmentsLoading,
      appointmentsError,
      refreshAppointments,
      setInProgress,
      addProofNote,
      addProofPhoto,
      clearProofDraft,
      completeAppointment,
      selectAppointment,
    }),
    [
      appointments,
      activeJobIndex,
      activeJob,
      proofOfWorkDraft,
      appointmentsLoading,
      appointmentsError,
      refreshAppointments,
      setInProgress,
      addProofNote,
      addProofPhoto,
      clearProofDraft,
      completeAppointment,
      selectAppointment,
    ],
  );

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
