import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { HomeScreen, LogsScreen, SettingsScreen } from './src/screens';
import { useUploadQueue } from './src/hooks';
import type { UploadPhoto } from './src/types/upload';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<'home' | 'logs' | 'settings'>('home');
  const { uploadQueue, onOpenCamera, onChooseFromGallery, retryUpload } = useUploadQueue();

  const pendingCount = uploadQueue.filter(
    (p: UploadPhoto) => p.status === 'Queued' || p.status === 'Uploading'
  ).length;
  const uploadingCount = uploadQueue.filter((p: UploadPhoto) => p.status === 'Uploading').length;
  const queuedCount = uploadQueue.filter((p: UploadPhoto) => p.status === 'Queued').length;
  const currentUploadProgress = uploadQueue.find((p: UploadPhoto) => p.status === 'Uploading')
    ?.progress;

  if (screen === 'logs') {
    return (
      <LogsScreen
        insets={insets}
        photos={uploadQueue}
        onBack={() => setScreen('home')}
        onOpenSettings={() => setScreen('settings')}
        onRetry={retryUpload}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        insets={insets}
        onBack={() => setScreen('home')}
        onViewLogs={() => setScreen('logs')}
        uploadingCount={uploadingCount}
        queuedCount={queuedCount}
        currentUploadProgress={currentUploadProgress}
      />
    );
  }

  return (
    <HomeScreen
      insets={insets}
      onOpenCamera={onOpenCamera}
      onChooseFromGallery={onChooseFromGallery}
      onViewLogs={() => setScreen('logs')}
      onOpenSettings={() => setScreen('settings')}
      pendingCount={pendingCount}
      uploadingCount={uploadingCount}
      queuedCount={queuedCount}
      currentUploadProgress={currentUploadProgress}
    />
  );
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
      <Toast />
    </SafeAreaProvider>
  );
}
