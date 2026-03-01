import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  FadeInView,
  FrostedCard,
  ScreenGradientBackground,
  UploadProgressBanner,
} from '../../components';
import { styles } from './HomeScreen.styles';

export interface HomeScreenProps {
  insets: { top: number; bottom: number };
  onOpenCamera: () => void;
  onChooseFromGallery: () => void;
  onViewLogs: () => void;
  onOpenSettings: () => void;
  pendingCount: number;
  uploadingCount?: number;
  queuedCount?: number;
  currentUploadProgress?: number;
}

export function HomeScreen({
  insets,
  onOpenCamera,
  onChooseFromGallery,
  onViewLogs,
  onOpenSettings,
  pendingCount,
  uploadingCount = 0,
  queuedCount = 0,
  currentUploadProgress,
}: HomeScreenProps) {
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <View style={styles.mainContent}>
        <FadeInView delay={0} duration={500} fromTranslateY={8}>
          <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextBlock}>
              <View style={styles.heroAccent} />
              <Text style={styles.brand}>Serveus</Text>
              <Text style={styles.tagline}>
                Photo uploads, simplified. Capture or pick — we'll handle the rest in the background.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsIconBtn}
              onPress={onOpenSettings}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeInView>

      <View style={styles.actions}>
        <FadeInView delay={120} duration={450}>
          <TouchableOpacity onPress={onOpenCamera} activeOpacity={0.88}>
            <FrostedCard style={styles.primaryButton} borderRadius={18}>
              <View style={styles.primaryButtonInner}>
                <View style={[styles.buttonIcon, styles.buttonIconCamera]}>
                  <Text style={styles.buttonIconText}>📷</Text>
                </View>
                <View style={styles.primaryButtonTextWrap}>
                  <Text style={styles.primaryButtonLabel}>Open Camera</Text>
                  <Text style={styles.primaryButtonHint}>Take a new photo</Text>
                </View>
                <Text style={styles.primaryButtonChevron}>›</Text>
              </View>
            </FrostedCard>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={220} duration={450}>
          <TouchableOpacity onPress={onChooseFromGallery} activeOpacity={0.88}>
            <FrostedCard style={styles.primaryButton} borderRadius={18}>
              <View style={styles.primaryButtonInner}>
                <View style={[styles.buttonIcon, styles.buttonIconGallery]}>
                  <Text style={styles.buttonIconText}>🖼</Text>
                </View>
                <View style={styles.primaryButtonTextWrap}>
                  <Text style={styles.primaryButtonLabel}>Choose from Gallery</Text>
                  <Text style={styles.primaryButtonHint}>Select from your library</Text>
                </View>
                <Text style={styles.primaryButtonChevron}>›</Text>
              </View>
            </FrostedCard>
          </TouchableOpacity>
        </FadeInView>
      </View>

      <FadeInView delay={320} duration={400}>
        <TouchableOpacity onPress={onViewLogs} activeOpacity={0.88}>
          <FrostedCard style={styles.viewLogsButton} borderRadius={14}>
            <View style={styles.viewLogsInner}>
              <View style={[styles.buttonIcon, styles.viewLogsIcon]}>
                <Text style={styles.buttonIconText}>📋</Text>
              </View>
              <View style={styles.viewLogsTextWrap}>
                <Text style={styles.viewLogsLabel}>View upload logs</Text>
                <Text style={styles.viewLogsHint}>Check status and responses</Text>
              </View>
              {pendingCount > 0 ? (
                <View style={styles.logsBadge}>
                  <Text style={styles.logsBadgeText}>{pendingCount}</Text>
                </View>
              ) : null}
              <Text style={styles.primaryButtonChevron}>›</Text>
            </View>
          </FrostedCard>
        </TouchableOpacity>
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
