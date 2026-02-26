import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { HomeScreen, LogsScreen } from './src/screens';
import { useUploadQueue } from './src/hooks';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<'home' | 'logs'>('home');
  const { uploadQueue, onOpenCamera, onChooseFromGallery } = useUploadQueue();

  const pendingCount = uploadQueue.filter(
    (j) => j.status === 'Queued' || j.status === 'Uploading'
  ).length;

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
      pendingCount={pendingCount}
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
