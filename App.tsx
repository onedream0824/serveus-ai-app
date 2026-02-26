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

const COLORS = {
  bg: '#080a0e',
  bgSoft: '#0c0f14',
  surface: '#12151c',
  surfaceElevated: '#1a1f28',
  border: '#252b36',
  text: '#f2f4f8',
  textSecondary: '#8890a4',
  textMuted: '#5c6378',
  accent: '#6366f1',
  accentSoft: 'rgba(99, 102, 241, 0.18)',
  accentGlow: 'rgba(99, 102, 241, 0.25)',
  success: '#22c55e',
  successSoft: 'rgba(34, 197, 94, 0.12)',
  error: '#ef4444',
  errorSoft: 'rgba(239, 68, 68, 0.12)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  info: '#3b82f6',
  infoSoft: 'rgba(59, 130, 246, 0.12)',
};

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

function statusStyle(status: UploadJobStatus): { bg: string; text: string } {
  switch (status) {
    case 'Queued':
      return { bg: COLORS.warningSoft, text: COLORS.warning };
    case 'Uploading':
      return { bg: COLORS.infoSoft, text: COLORS.info };
    case 'Success':
      return { bg: COLORS.successSoft, text: COLORS.success };
    case 'Failed':
      return { bg: COLORS.errorSoft, text: COLORS.error };
  }
}

function HomeScreen({
  insets,
  onOpenCamera,
  onChooseFromGallery,
  onViewLogs,
  pendingCount,
}: {
  insets: { top: number; bottom: number };
  onOpenCamera: () => void;
  onChooseFromGallery: () => void;
  onViewLogs: () => void;
  pendingCount: number;
}) {
  return (
    <View style={[styles.homeScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.hero}>
        <View style={styles.heroAccent} />
        <Text style={styles.brand}>Serveus</Text>
        <Text style={styles.tagline}>
          Photo uploads, simplified. Capture or pick — we’ll handle the rest in the background.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onOpenCamera}
          activeOpacity={0.88}
        >
          <View style={[styles.buttonIcon, styles.buttonIconCamera]}>
            <Text style={styles.buttonIconText}>📷</Text>
          </View>
          <View style={styles.primaryButtonTextWrap}>
            <Text style={styles.primaryButtonLabel}>Open Camera</Text>
            <Text style={styles.primaryButtonHint}>Take a new photo</Text>
          </View>
          <Text style={styles.primaryButtonChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onChooseFromGallery}
          activeOpacity={0.88}
        >
          <View style={[styles.buttonIcon, styles.buttonIconGallery]}>
            <Text style={styles.buttonIconText}>🖼</Text>
          </View>
          <View style={styles.primaryButtonTextWrap}>
            <Text style={styles.primaryButtonLabel}>Choose from Gallery</Text>
            <Text style={styles.primaryButtonHint}>Select from your library</Text>
          </View>
          <Text style={styles.primaryButtonChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logsCta} onPress={onViewLogs} activeOpacity={0.8}>
        <Text style={styles.logsCtaLabel}>View upload logs</Text>
        {pendingCount > 0 ? (
          <View style={styles.logsBadge}>
            <Text style={styles.logsBadgeText}>{pendingCount}</Text>
          </View>
        ) : null}
        <Text style={styles.logsCtaArrow}>→</Text>
      </TouchableOpacity>
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
      const { bg, text } = statusStyle(item.status);
      return (
        <View style={styles.logCard}>
          <View style={styles.logCardTop}>
            <Text style={styles.logCardLabel} numberOfLines={1}>
              {label}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: bg }]}>
              <Text style={[styles.statusPillText, { color: text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.logCardTime}>{formatTime(item.timestamp)}</Text>
          {item.error ? (
            <Text style={styles.logCardError} numberOfLines={2}>
              {item.error}
            </Text>
          ) : null}
        </View>
      );
    },
    []
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logsHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.logsTitle}>Upload logs</Text>
        <Text style={styles.logsSubtitle}>{jobs.length} item{jobs.length !== 1 ? 's' : ''}</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📤</Text>
          <Text style={styles.emptyStateTitle}>No uploads yet</Text>
          <Text style={styles.emptyStateText}>
            Take a photo or choose one from your gallery to see upload logs here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...jobs].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.logListContent}
          showsVerticalScrollIndicator={false}
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

  const pendingCount = uploadQueue.filter(
    (j) => j.status === 'Queued' || j.status === 'Uploading'
  ).length;

  return (
    <HomeScreen
      insets={insets}
      onOpenCamera={onOpenCamera}
      onChooseFromGallery={onChooseFromGallery}
      onViewLogs={() => setScreen('logs')}
      pendingCount={pendingCount}
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
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
  },
  homeScreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 28,
  },
  hero: {
    marginTop: 40,
    marginBottom: 44,
  },
  heroAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginBottom: 20,
  },
  brand: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  buttonIconCamera: {
    backgroundColor: COLORS.accentSoft,
  },
  buttonIconGallery: {
    backgroundColor: COLORS.accentSoft,
  },
  buttonIconText: {
    fontSize: 26,
  },
  primaryButtonTextWrap: {
    flex: 1,
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  primaryButtonHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  primaryButtonChevron: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  logsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  logsCtaLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.accent,
  },
  logsBadge: {
    backgroundColor: COLORS.accent,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 6,
  },
  logsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  logsCtaArrow: {
    fontSize: 18,
    color: COLORS.accent,
    marginLeft: 6,
  },
  logsHeader: {
    marginBottom: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.accent,
  },
  logsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  logsSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  logListContent: {
    paddingBottom: 32,
  },
  logCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  logCardTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  logCardError: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
    lineHeight: 18,
  },
});

export default App;
