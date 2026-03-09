import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import VoiceCommand from '../services/VoiceCommand';
import Toast from 'react-native-toast-message';

const VOICE_LOG = '[Voice]';

export function useVoiceCommands({
  onCommand,
  onTranscript,
  autoStart = false,
  showToasts = true,
}) {
  const [isListening, setIsListening] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const onCommandRef = useRef(onCommand);
  const onTranscriptRef = useRef(onTranscript);
  const lastTranscriptRef = useRef('');
  onCommandRef.current = onCommand;
  onTranscriptRef.current = onTranscript;

  const isAvailable = VoiceCommand.isAvailable();

  useEffect(() => {
    if (__DEV__) console.log(VOICE_LOG, 'Module available:', isAvailable, 'Platform:', Platform.OS);
  }, [isAvailable]);

  const requestPermission = useCallback(async () => {
    if (!isAvailable) {
      if (__DEV__) console.log(VOICE_LOG, 'requestPermission skipped (module not available)');
      return false;
    }
    if (__DEV__) console.log(VOICE_LOG, 'Requesting speech recognition permission…');
    try {
      await VoiceCommand.requestPermission();
      setPermissionGranted(true);
      if (__DEV__) console.log(VOICE_LOG, 'Permission granted');
      if (showToasts) Toast.show({ type: 'success', text1: 'Microphone allowed' });
      return true;
    } catch (e) {
      if (__DEV__) console.warn(VOICE_LOG, 'Permission denied:', e?.message);
      if (showToasts) Toast.show({ type: 'error', text1: 'Microphone access denied', text2: e?.message });
      return false;
    }
  }, [isAvailable, showToasts]);

  const startListening = useCallback(async () => {
    if (__DEV__) console.log(VOICE_LOG, 'startListening called');
    if (!isAvailable) {
      if (__DEV__) console.log(VOICE_LOG, 'startListening skipped (module not available)');
      if (showToasts) {
        Toast.show({
          type: 'info',
          text1: Platform.OS === 'ios'
            ? 'Voice not available. Rebuild the app to enable.'
            : 'Voice commands are only available on iOS',
        });
      }
      return;
    }
    if (!permissionGranted) {
      const ok = await requestPermission();
      if (!ok) return;
    }
    try {
      await VoiceCommand.startListening();
      setIsListening(true);
      if (__DEV__) console.log(VOICE_LOG, 'Listening started');
      if (showToasts) Toast.show({ type: 'info', text1: 'Listening…', visibilityTime: 1500 });
    } catch (e) {
      if (__DEV__) console.warn(VOICE_LOG, 'startListening failed:', e?.message);
      if (showToasts) Toast.show({ type: 'error', text1: 'Voice error', text2: e?.message });
    }
  }, [isAvailable, permissionGranted, requestPermission, showToasts]);

  const stopListening = useCallback(async () => {
    if (__DEV__) console.log(VOICE_LOG, 'stopListening called');
    if (!isAvailable) return;
    try {
      await VoiceCommand.stopListening();
      setIsListening(false);
      if (__DEV__) console.log(VOICE_LOG, 'Listening stopped');
    } catch (e) {
      if (__DEV__) console.warn(VOICE_LOG, 'stopListening error:', e?.message);
    }
  }, [isAvailable]);

  useEffect(() => {
    if (!isAvailable || Platform.OS !== 'ios') return;

    const subCommand = VoiceCommand.addListener('onCommand', (payload) => {
      if (__DEV__ && payload?.command) console.log(VOICE_LOG, 'Command:', payload.command, payload.text ? `"${payload.text}"` : '');
      if (payload?.command && onCommandRef.current) {
        onCommandRef.current({ command: payload.command, text: payload.text || '' });
      }
    });
    const subTranscript = VoiceCommand.addListener('onTranscript', (payload) => {
      const transcript = payload?.transcript || '';
      if (transcript) lastTranscriptRef.current = transcript;
      if (__DEV__ && transcript) {
        console.log(VOICE_LOG, 'Transcript:', payload.isFinal ? '(final)' : '(partial)', `"${transcript}"`);
      }
      if (payload && onTranscriptRef.current) {
        onTranscriptRef.current({ transcript, isFinal: payload.isFinal });
      }
      if (payload.isFinal) lastTranscriptRef.current = '';
    });
    const subListening = VoiceCommand.addListener('onListeningChange', (payload) => {
      if (__DEV__ && payload && typeof payload.isListening === 'boolean') {
        console.log(VOICE_LOG, 'Listening state:', payload.isListening);
      }
      if (payload && typeof payload.isListening === 'boolean') {
        if (!payload.isListening && lastTranscriptRef.current.trim()) {
          const finalTranscript = lastTranscriptRef.current;
          lastTranscriptRef.current = '';
          if (__DEV__) console.log(VOICE_LOG, 'Treating last partial as final:', `"${finalTranscript}"`);
          if (onTranscriptRef.current) {
            onTranscriptRef.current({ transcript: finalTranscript, isFinal: true });
          }
        }
        setIsListening(payload.isListening);
      }
    });
    const subError = VoiceCommand.addListener('onError', (payload) => {
      if (__DEV__ && payload?.message) console.warn(VOICE_LOG, 'Error:', payload.message);
      if (showToasts && payload?.message) {
        Toast.show({ type: 'error', text1: 'Voice', text2: payload.message });
      }
    });

    return () => {
      subCommand.remove();
      subTranscript.remove();
      subListening.remove();
      subError.remove();
    };
  }, [isAvailable, showToasts]);

  useEffect(() => {
    if (autoStart && isAvailable && Platform.OS === 'ios') {
      requestPermission().then((ok) => {
        if (ok) startListening();
      });
    }
    return () => {
      if (isAvailable) VoiceCommand.stopListening().catch(() => {});
    };
  }, []);

  return {
    isAvailable,
    isListening,
    permissionGranted,
    requestPermission,
    startListening,
    stopListening,
  };
}
