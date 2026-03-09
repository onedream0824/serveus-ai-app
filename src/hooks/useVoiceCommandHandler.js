import { useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { findAppointmentIndexByCustomerName } from '../services/voiceCommandParser';
import {
  executeOnMyWay,
  executeCompleteAppointment,
  executeCreateProofOfWork,
  executeOnMyWayWithAppointment,
  executeCreateProofOfWorkWithDraft,
} from '../services/voiceCommandApi';

const COMMANDS_NEEDING_CUSTOMER = ['on_my_way', 'complete_appointment', 'create_proof_of_work'];
const COMMANDS_NEEDING_APPOINTMENT = ['on_my_way', 'start_appointment', 'complete_appointment', 'create_proof_of_work'];

const TOAST = {
  startFirst: (text2) => ({ type: 'warning', text1: "Say 'Start appointment' first", text2 }),
  noOnMyWay: () => ({ type: 'info', text1: 'No appointments need "on my way"', text2: 'All are completed or cancelled.' }),
  chooseCustomer: () => ({ type: 'info', text1: 'There are several scheduled appointments now.', text2: 'Please choose customer name', visibilityTime: 5000 }),
};

function getEligibleForOnMyWay(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (a) => (a.status || '').toLowerCase() !== 'completed' && (a.status || '').toLowerCase() !== 'cancelled',
  );
}

function hasReportSessionActive(list) {
  return (list || []).some((a) => (a.status || '').toLowerCase() === 'in_progress');
}

async function runOnMyWayFlow(list, ctx) {
  const eligible = getEligibleForOnMyWay(list);
  if (eligible.length === 0) {
    Toast.show(TOAST.noOnMyWay());
    return;
  }
  if (eligible.length === 1) {
    const apt = eligible[0];
    const idx = list.findIndex((a) => (a.id ?? a.appointmentId) === (apt.id ?? apt.appointmentId));
    if (idx >= 0) ctx.selectAppointment(idx);
    try {
      await executeOnMyWayWithAppointment(
        ctx.token,
        apt.appointmentId ?? apt.id,
        ctx.userData,
        { serviceAgreementId: apt.serviceAgreementId, appointment: apt },
      );
      ctx.goToAppointments();
      await ctx.refreshAppointments();
      Toast.show({ type: 'success', text1: 'On my way', text2: apt.customerName });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Could not update status', text2: err?.message });
    }
    return;
  }
  Toast.show(TOAST.chooseCustomer());
  ctx.setPending('on_my_way');
}

export function useVoiceCommandHandler({
  token,
  userData,
  appointments,
  activeJobIndex,
  activeJob,
  proofOfWorkDraft,
  screen,
  setVoiceSuccessAt,
  setProofOfWorkVisible,
  setVoicePhotoPreviewUri,
  goToAppointments,
  addProofNote,
  addProofPhoto,
  clearProofDraft,
  setInProgress,
  completeAppointment,
  selectAppointment,
  refreshAppointments,
  openCameraForVoicePhoto,
  openGalleryForLastPhotos,
  glassesConnected = false,
  capturePhotoFromGlasses,
}) {
  const goToAppointmentsRef = useRef(goToAppointments);
  const pendingVoiceCommandRef = useRef(null);

  useEffect(() => {
    goToAppointmentsRef.current = goToAppointments;
  }, [goToAppointments]);

  const askWhichCustomer = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Which customer is this for?',
      text2: 'Say the customer name',
      visibilityTime: 4000,
    });
  }, []);

  const handleVoiceCommand = useCallback(
    async (payload) => {
      const command = payload?.command;
      let customerName = payload?.customerName?.trim() || null;
      let noteText = payload?.noteText ?? payload?.text ?? '';
      setVoiceSuccessAt(Date.now());

      const reportActive = hasReportSessionActive(appointments);
      if (command === 'add_note' || command === 'take_photo') {
        if (!reportActive) {
          Toast.show(TOAST.startFirst('Then you can add notes and take photos for the report'));
          return;
        }
      }

      const needsCustomer = COMMANDS_NEEDING_CUSTOMER.includes(command);
      const hasActiveJob = activeJob?.customerId && (activeJob?.appointmentId || activeJob?.id);
      if (needsCustomer && !customerName && !hasActiveJob) {
        pendingVoiceCommandRef.current = { command };
        askWhichCustomer();
        return;
      }
      if (command === 'add_note' && !noteText && !customerName) {
        if (activeJob?.status !== 'in_progress') {
          Toast.show(TOAST.startFirst('Then you can add notes to the report'));
          return;
        }
        pendingVoiceCommandRef.current = { command: 'add_note' };
        Toast.show({
          type: 'info',
          text1: "What's the note?",
          text2: 'Say the note after the tone',
          visibilityTime: 4000,
        });
        return;
      }
      if (command === 'add_note' && !noteText && customerName) noteText = customerName;
      if (command === 'create_proof_of_work' && !noteText && customerName) noteText = customerName;

      const useVoiceApi = token && userData && !!customerName;

      const ctx = {
        token,
        userData,
        selectAppointment,
        goToAppointments: () => goToAppointmentsRef.current?.(),
        refreshAppointments,
        setPending: (cmd) => { pendingVoiceCommandRef.current = { command: cmd }; },
      };
      if (hasActiveJob && !customerName && token && userData) {
        if (command === 'on_my_way') {
          await runOnMyWayFlow(appointments, ctx);
          return;
        }
        if (command === 'start_appointment') {
          clearProofDraft();
          setInProgress();
          goToAppointmentsRef.current();
          Toast.show({ type: 'success', text1: 'Service report started', text2: activeJob.customerName });
          return;
        }
        if (command === 'create_proof_of_work' && activeJob?.status !== 'in_progress') {
          Toast.show(TOAST.startFirst('Then you can add a service report'));
          return;
        }
        if (command === 'complete_appointment') {
          await completeAppointment();
          goToAppointmentsRef.current();
          await refreshAppointments();
          setProofOfWorkVisible(false);
          return;
        }
        if (command === 'create_proof_of_work') {
          const hasDraft =
            proofOfWorkDraft.notes.length > 0 || proofOfWorkDraft.photoUris.length > 0;
          const hasNote = (noteText || '').trim().length > 0;
          if (!hasNote && !hasDraft) {
            pendingVoiceCommandRef.current = { command: 'create_proof_of_work' };
            Toast.show({
              type: 'info',
              text1: "What's the note for the service report?",
              text2: 'Say the description after the tone',
              visibilityTime: 4500,
            });
            return;
          }
          try {
            await executeCreateProofOfWorkWithDraft(
              token,
              userData,
              activeJob,
              proofOfWorkDraft,
              (noteText || '').trim()
            );
            clearProofDraft();
            Toast.show({ type: 'success', text1: 'Service report saved', text2: activeJob.customerName });
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Could not save service report', text2: err?.message });
          }
          return;
        }
      }

      if (customerName && useVoiceApi) {
        if (command === 'start_appointment') {
          goToAppointmentsRef.current();
          const list = await refreshAppointments();
          const idx = findAppointmentIndexByCustomerName(
            Array.isArray(list) ? list : appointments,
            customerName
          );
          if (idx >= 0) {
            clearProofDraft();
            selectAppointment(idx);
            setInProgress(idx);
            const apt = (Array.isArray(list) ? list : appointments)[idx];
            Toast.show({
              type: 'success',
              text1: 'Service report started',
              text2: apt?.customerName || customerName,
            });
          } else {
            Toast.show({
              type: 'warning',
              text1: 'No appointment found',
              text2: `for "${customerName}"`,
            });
          }
          return;
        }
        if (command === 'on_my_way') {
          try {
            const result = await executeOnMyWay(token, userData, customerName);
            if (result.ok) {
              goToAppointmentsRef.current();
              await refreshAppointments();
              Toast.show({ type: 'success', text1: 'On my way', text2: result.customerName });
            } else Toast.show({ type: 'warning', text1: result.message || 'Failed' });
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Could not update status', text2: err?.message });
          }
          return;
        }
        if (command === 'complete_appointment') {
          try {
            const result = await executeCompleteAppointment(token, userData, customerName);
            if (result.ok) {
              clearProofDraft();
              goToAppointmentsRef.current();
              await refreshAppointments();
              Toast.show({ type: 'success', text1: 'Appointment completed', text2: result.customerName });
            } else Toast.show({ type: 'warning', text1: result.message || 'Failed' });
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Could not complete appointment', text2: err?.message });
          }
          return;
        }
        if (command === 'create_proof_of_work') {
          try {
            const result = await executeCreateProofOfWork(
              token,
              userData,
              customerName,
              noteText || ''
            );
            if (result.ok) {
              clearProofDraft();
              setProofOfWorkVisible(true);
              Toast.show({ type: 'success', text1: 'Service report saved', text2: result.customerName });
            } else Toast.show({ type: 'warning', text1: result.message || 'Failed' });
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Could not save service report', text2: err?.message });
          }
          return;
        }
      }

      if (command === 'add_note' && (noteText || customerName)) {
        const text = (noteText || customerName || '').trim();
        if (!text) return;
        if (activeJob?.status !== 'in_progress') {
          Toast.show(TOAST.startFirst('Then you can add notes to the report'));
          return;
        }
        addProofNote(text);
        Toast.show({ type: 'success', text1: 'Note added', text2: String(text).slice(0, 40) });
        return;
      }

      if (command === 'attach_last_photo') {
        if (!activeJob?.customerId || activeJob?.status !== 'in_progress') {
          Toast.show(TOAST.startFirst('Then you can attach photos to the report'));
          return;
        }
        const count = Math.min(Math.max(1, payload?.count ?? 1), 10);
        setProofOfWorkVisible(true);
        openGalleryForLastPhotos(count, (uris) => {
          if (uris?.length > 0) {
            uris.forEach((uri) => addProofPhoto(uri));
            Toast.show({
              type: 'success',
              text1: `${uris.length} photo(s) attached`,
              text2: 'To service report',
            });
          }
        });
        Toast.show({ type: 'info', text1: 'Select photo(s) from gallery', visibilityTime: 2000 });
        return;
      }

      const needsAppointment = COMMANDS_NEEDING_APPOINTMENT.includes(command);
      let listToUse = appointments;
      let selectedIndexByCustomer = null;
      if (needsAppointment) {
        const refreshed = await refreshAppointments();
        listToUse = Array.isArray(refreshed) ? refreshed : appointments;
      }
      if (needsAppointment && customerName && listToUse.length > 0) {
        const idx = findAppointmentIndexByCustomerName(listToUse, customerName);
        if (idx >= 0) {
          if (screen !== 'appointments') goToAppointmentsRef.current();
          selectAppointment(idx);
          selectedIndexByCustomer = idx;
        } else {
          Toast.show({
            type: 'warning',
            text1: 'No appointment found',
            text2: `for "${customerName}"`,
          });
          return;
        }
      } else if (needsAppointment && screen !== 'appointments') {
        goToAppointmentsRef.current();
      }

      if (command === 'on_my_way') {
        await runOnMyWayFlow(listToUse || [], ctx);
        return;
      }
      if (command === 'start_appointment') {
        if (listToUse.length === 0) {
          Toast.show({ type: 'warning', text1: 'No appointments', text2: 'Load appointments first' });
          return;
        }
        clearProofDraft();
        setInProgress(selectedIndexByCustomer ?? undefined);
        const apt = listToUse[selectedIndexByCustomer ?? activeJobIndex];
        Toast.show({
          type: 'success',
          text1: 'Service report started',
          ...((apt?.customerName || customerName) && { text2: apt?.customerName || customerName }),
        });
        return;
      }
      if (command === 'take_photo') {
        if (!activeJob?.customerId || activeJob?.status !== 'in_progress') {
          Toast.show(TOAST.startFirst('Then you can take photos for the report'));
          return;
        }
        const proofOfWorkExists =
          proofOfWorkDraft.photoUris.length > 0 ||
          proofOfWorkDraft.notes.length > 0 ||
          !!activeJob.proofofWorkUploadedDate ||
          !!activeJob.proofofWorkPhoto;
        if (!proofOfWorkExists) setProofOfWorkVisible(true);
        if (glassesConnected && typeof capturePhotoFromGlasses === 'function') {
          Toast.show({ type: 'info', text1: 'Capturing from glasses…', visibilityTime: 2000 });
          capturePhotoFromGlasses()
            .then(({ uri }) => {
              if (uri) setVoicePhotoPreviewUri(uri);
            })
            .catch((err) => {
              Toast.show({
                type: 'error',
                text1: 'Glasses capture failed',
                text2: err?.message ?? 'Try again',
              });
            });
        } else {
          openCameraForVoicePhoto((uri) => setVoicePhotoPreviewUri(uri));
          Toast.show({ type: 'info', text1: 'Opening camera…', visibilityTime: 1200 });
        }
        return;
      }
      if (command === 'create_proof_of_work') {
        setProofOfWorkVisible(true);
        Toast.show({ type: 'info', text1: 'Service report draft' });
        return;
      }
      if (command === 'complete_appointment') {
        completeAppointment();
        setProofOfWorkVisible(false);
        Toast.show({ type: 'success', text1: 'Appointment completed' });
      }
    },
    [
      token,
      userData,
      appointments,
      activeJobIndex,
      activeJob,
      proofOfWorkDraft,
      screen,
      setVoiceSuccessAt,
      setProofOfWorkVisible,
      setVoicePhotoPreviewUri,
      addProofNote,
      addProofPhoto,
      clearProofDraft,
      setInProgress,
      completeAppointment,
      selectAppointment,
      refreshAppointments,
      openCameraForVoicePhoto,
      openGalleryForLastPhotos,
      glassesConnected,
      capturePhotoFromGlasses,
      askWhichCustomer,
    ]
  );

  return { handleVoiceCommand, pendingVoiceCommandRef };
}
