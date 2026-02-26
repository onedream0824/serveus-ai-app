import React, { useCallback, useEffect, useRef } from 'react';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';
import { uploadPhotoAsync } from './src/services/uploadService';
import type { UploadJob, UploadJobStatus } from './src/types/upload';
import Toast from 'react-native-toast-message';

function makeJobId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function handleImageResult(result: ImagePickerResponse): {
  uri: string;
  fileName?: string;
  type?: string;
} | null {
  if (result.didCancel) return null;
  if (result.errorCode) {
    Alert.alert('Error', result.errorMessage ?? 'Failed to get image');
    return null;
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    type: asset.type ?? undefined,
  };
}

const STATUS_EMOJI: Record<UploadJobStatus, string> = {
  Queued: '⏳',
  Uploading: '🔄',
  Success: '✅',
  Failed: '❌',
};

function HomeScreen({
  insets,
  onOpenCamera,
  onChooseFromGallery,
  onViewLogs,
}: {
  insets: { top: number; bottom: number };
  onOpenCamera: () => void;
  onChooseFromGallery: () => void;
  onViewLogs: () => void;
}) {
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Serveus</Text>
      <Text style={styles.subtitle}>Photos are queued and uploaded in the background</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onOpenCamera} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onChooseFromGallery} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onViewLogs} activeOpacity={0.8}>
          <Text style={styles.buttonSecondaryText}>View logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LogsScreen({
  insets,
  jobs,
  onBack,
}: {
  insets: { top: number; bottom: number };
  jobs: UploadJob[];
  onBack: () => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: UploadJob }) => {
      const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
      return (
        <View style={styles.logRow}>
          <Text style={styles.logLabel} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.logTime}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.logStatus}>
            {STATUS_EMOJI[item.status]} {item.status}
          </Text>
          {item.error ? (
            <Text style={styles.logError} numberOfLines={1}>
              {item.error}
            </Text>
          ) : null}
        </View>
      );
    },
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logsHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.logsTitle}>Upload logs</Text>
      </View>
      {jobs.length === 0 ? (
        <Text style={styles.emptyLogs}>No uploads yet. Take or choose a photo to start.</Text>
      ) : (
        <FlatList
          data={[...jobs].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.logListContent}
        />
      )}
    </View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = React.useState<'home' | 'logs'>('home');
  const [uploadQueue, setUploadQueue] = React.useState<UploadJob[]>([]);

  const addToQueue = useCallback(
    (uri: string, fileName?: string, type?: string) => {
      const job: UploadJob = {
        id: makeJobId(),
        uri,
        fileName,
        type,
        status: 'Queued',
        timestamp: Date.now(),
      };
      setUploadQueue((prev) => [...prev, job]);
    },
    []
  );

  const setJobStatus = useCallback((id: string, status: UploadJobStatus, error?: string) => {
    setUploadQueue((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status, error } : j))
    );
  }, []);

  const processingIdRef = useRef<string | null>(null);

  useEffect(() => {
    const firstQueued = uploadQueue.find((j) => j.status === 'Queued');
    if (!firstQueued) {
      processingIdRef.current = null;
      return;
    }
    if (processingIdRef.current === firstQueued.id) return;
    processingIdRef.current = firstQueued.id;

    const job = firstQueued;
    setUploadQueue((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'Uploading' as const } : j))
    );

    const label = job.fileName ?? 'Photo';
    Toast.show({
      type: 'info',
      text1: 'Upload started',
      text2: label,
    });

    uploadPhotoAsync(job.uri, { fileName: job.fileName, type: job.type })
      .then(() => {
        setJobStatus(job.id, 'Success');
        processingIdRef.current = null;
        Toast.show({
          type: 'success',
          text1: 'Upload successful',
          text2: label,
        });
      })
      .catch((err) => {
        setJobStatus(job.id, 'Failed', err?.message ?? 'Upload failed');
        processingIdRef.current = null;
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: err?.message ?? label,
        });
      });
  }, [uploadQueue, setJobStatus]);

  const onOpenCamera = useCallback(() => {
    launchCamera({ mediaType: 'photo', saveToPhotos: false }, (res) => {
      const data = handleImageResult(res);
      if (data) addToQueue(data.uri, data.fileName, data.type);
    });
  }, [addToQueue]);

  const onChooseFromGallery = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      const data = handleImageResult(res);
      if (data) addToQueue(data.uri, data.fileName, data.type);
    });
  }, [addToQueue]);

  if (screen === 'logs') {
    return (
      <LogsScreen
        insets={insets}
        jobs={uploadQueue}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      insets={insets}
      onOpenCamera={onOpenCamera}
      onChooseFromGallery={onChooseFromGallery}
      onViewLogs={() => setScreen('logs')}
    />
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  actions: {
    marginTop: 40,
    gap: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  buttonSecondaryText: {
    color: '#94a3b8',
    fontSize: 17,
    fontWeight: '600',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 17,
  },
  logsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  emptyLogs: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 24,
  },
  logListContent: {
    paddingBottom: 24,
  },
  logRow: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  logLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  logStatus: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 6,
  },
  logError: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 4,
  },
});

export default App;
