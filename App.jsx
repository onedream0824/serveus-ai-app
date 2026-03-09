import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, StatusBar, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AppointmentsScreen, DemoGuideScreen, HomeScreen, Login, SettingsScreen } from './src/screens';
import { FashionableToast } from './src/components/FashionableToast';
import { colors } from './src/theme';
import { useUploadQueue } from './src/hooks/useUploadQueue';
import { useVoiceCommands } from './src/hooks/useVoiceCommands';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WorkflowProvider, useWorkflow } from './src/context/WorkflowContext';
import { GlassesProvider, useGlasses } from './src/context/GlassesContext';
import { parseTranscript, stripHeyMeta } from './src/services/voiceCommandParser';
import { useVoiceCommandHandler } from './src/hooks/useVoiceCommandHandler';
import { styles as appStyles } from './App.styles';

const toastConfig = {
  success: (props) => <FashionableToast {...props} />,
  error: (props) => <FashionableToast {...props} />,
  info: (props) => <FashionableToast {...props} />,
  warning: (props) => <FashionableToast {...props} />,
};

function useAppNavigation() {
  const [screen, setScreen] = useState('home');
  const stackRef = useRef(['home']);
  const push = useCallback((name) => {
    stackRef.current = [...stackRef.current, name];
    setScreen(name);
  }, []);
  const pop = useCallback(() => {
    const stack = stackRef.current;
    if (stack.length > 1) {
      const next = stack.slice(0, -1);
      stackRef.current = next;
      setScreen(next[next.length - 1]);
    } else {
      stackRef.current = ['home'];
      setScreen('home');
    }
  }, []);
  return {
    screen,
    goToSettings: useCallback(() => push('settings'), [push]),
    goToAppointments: useCallback(() => push('appointments'), [push]),
    goToDemoGuide: useCallback(() => push('demoGuide'), [push]),
    goBack: pop,
  };
}

function AppContent({ onLogout }) {
  const insets = useSafeAreaInsets();
  const { token, userData } = useAuth();
  const { screen, goToSettings, goToAppointments, goToDemoGuide, goBack } = useAppNavigation();
  const [proofOfWorkVisible, setProofOfWorkVisible] = useState(false);
  const [voiceSuccessAt, setVoiceSuccessAt] = useState(null);

  useEffect(() => {
    if (voiceSuccessAt == null) return;
    const t = setTimeout(() => setVoiceSuccessAt(null), 2200);
    return () => clearTimeout(t);
  }, [voiceSuccessAt]);

  const {
    appointments,
    activeJobIndex,
    activeJob,
    proofOfWorkDraft,
    addProofPhoto,
    addProofNote,
    clearProofDraft,
    setInProgress,
    completeAppointment,
    selectAppointment,
    refreshAppointments,
  } = useWorkflow();

  const openAppointmentsFromHome = useCallback(() => {
    refreshAppointments();
    goToAppointments();
  }, [refreshAppointments, goToAppointments]);

  const onPhotoCaptured = useCallback(
    (uri) => {
      if (screen === 'appointments' && activeJob?.status === 'in_progress') addProofPhoto(uri);
    },
    [screen, activeJob?.status, addProofPhoto],
  );

  const { onOpenCamera, openCameraForVoicePhoto, openGalleryForLastPhotos } = useUploadQueue({
    onPhotoCaptured,
  });

  const {
    glassesConnected,
    capturePhotoFromGlasses,
  } = useGlasses();

  const [voicePhotoPreviewUri, setVoicePhotoPreviewUri] = useState(null);

  useEffect(() => {
    if (!voicePhotoPreviewUri) return;
    const uri = voicePhotoPreviewUri;
    const timer = setTimeout(() => {
      addProofPhoto(uri);
      setVoicePhotoPreviewUri(null);
      Toast.show({ type: 'success', text1: 'Photo added to service report' });
    }, 1500);
    return () => clearTimeout(timer);
  }, [voicePhotoPreviewUri, addProofPhoto]);

  const { handleVoiceCommand, pendingVoiceCommandRef } = useVoiceCommandHandler({
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
    glassesConnected,
    capturePhotoFromGlasses,
  });

  const onTranscriptFinal = useCallback(
    (payload) => {
      if (!payload?.isFinal || !payload?.transcript?.trim()) return;
      const raw = payload.transcript.trim();
      const transcript = stripHeyMeta(raw);
      const pending = pendingVoiceCommandRef.current;
      if (pending) {
        const parsed = parseTranscript(transcript);
        if (parsed?.command) {
          pendingVoiceCommandRef.current = null;
          handleVoiceCommand(parsed);
        } else {
          pendingVoiceCommandRef.current = null;
          const isProofOfWork = pending.command === 'create_proof_of_work';
          handleVoiceCommand({
            command: pending.command,
            customerName: isProofOfWork ? undefined : transcript,
            noteText: isProofOfWork ? transcript : pending.noteText,
          });
        }
        return;
      }
      const parsed = parseTranscript(transcript);
      if (parsed) handleVoiceCommand(parsed);
    },
    [handleVoiceCommand],
  );

  const onCommandFromNative = useCallback(
    (payload) => {
      if (!payload?.command) return;
      handleVoiceCommand({
        command: payload.command,
        noteText: payload.text?.trim() || undefined,
      });
    },
    [handleVoiceCommand],
  );

  const {
    startListening,
    stopListening,
    isListening,
  } = useVoiceCommands({
    onCommand: onCommandFromNative,
    onTranscript: onTranscriptFinal,
    autoStart: false,
    showToasts: true,
  });

  const toggleMic = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const voicePhotoPreviewModal =
    voicePhotoPreviewUri != null ? (
      <Modal visible transparent animationType="fade">
        <View style={appStyles.photoModalBackdrop}>
          <Image source={{ uri: voicePhotoPreviewUri }} style={appStyles.photoModalImage} />
        </View>
      </Modal>
    ) : null;

  if (screen === 'demoGuide') {
    return (
      <DemoGuideScreen
        insets={insets}
        onBack={goBack}
        onGoToAppointments={goToAppointments}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <>
        <SettingsScreen
          insets={insets}
          onBack={goBack}
          onLogout={onLogout}
        />
        {voicePhotoPreviewModal}
      </>
    );
  }

  if (screen === 'appointments') {
    return (
      <>
        <AppointmentsScreen
          insets={insets}
          onBack={goBack}
          onOpenSettings={goToSettings}
          isListening={isListening}
          onToggleMic={toggleMic}
          proofOfWorkVisible={proofOfWorkVisible}
          showVoiceSuccess={voiceSuccessAt != null}
        />
        {voicePhotoPreviewModal}
      </>
    );
  }

  return (
    <>
      <HomeScreen
        insets={insets}
        onOpenCamera={onOpenCamera}
        onOpenSettings={goToSettings}
        onOpenAppointments={openAppointmentsFromHome}
        onOpenDemoGuide={goToDemoGuide}
        onToggleMic={toggleMic}
        isListening={isListening}
        showVoiceSuccess={voiceSuccessAt != null}
      />
      {voicePhotoPreviewModal}
    </>
  );
}

function AppWithAuth() {
  const { isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={appStyles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Login />
        <Toast config={toastConfig} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppContent onLogout={logout} />
      <Toast config={toastConfig} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkflowProvider>
          <GlassesProvider>
            <AppWithAuth />
          </GlassesProvider>
        </WorkflowProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
