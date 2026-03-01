import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FadeInView, ScreenGradientBackground, UploadProgressBanner } from '../../components';
import { styles } from './SettingsScreen.styles';

export interface SettingsScreenProps {
  insets: { top: number; bottom: number };
  onBack: () => void;
  onViewLogs?: () => void;
  uploadingCount?: number;
  queuedCount?: number;
  currentUploadProgress?: number;
}

export function SettingsScreen({
  insets,
  onBack,
  onViewLogs,
  uploadingCount = 0,
  queuedCount = 0,
  currentUploadProgress,
}: SettingsScreenProps) {
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <View style={styles.mainContent}>
        <FadeInView delay={0} duration={400}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>App preferences</Text>
          </View>
        </FadeInView>

        <FadeInView delay={200} duration={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <View style={styles.row}>
              <Text style={styles.rowText}>Notifications</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Storage</Text>
            </View>
          </View>
        </FadeInView>
      </View>

      <View style={styles.progressBarContainer}>
        <UploadProgressBanner
          uploadingCount={uploadingCount}
          queuedCount={queuedCount}
          currentProgress={currentUploadProgress}
          onPressViewLogs={onViewLogs}
        />
      </View>
    </View>
  );
}
