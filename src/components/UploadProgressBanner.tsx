import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export interface UploadProgressBannerProps {
  uploadingCount: number;
  queuedCount: number;
  currentProgress?: number;
  onPressViewLogs?: () => void;
}

export function UploadProgressBanner({
  uploadingCount,
  queuedCount,
  currentProgress,
  onPressViewLogs,
}: UploadProgressBannerProps) {
  const total = uploadingCount + queuedCount;
  const hasActivity = total > 0;

  const progressPct =
    typeof currentProgress === 'number'
      ? Math.min(100, Math.max(0, currentProgress))
      : null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPressViewLogs}
      activeOpacity={0.9}
      disabled={!onPressViewLogs}
    >
      <View style={styles.bannerContent}>
        {hasActivity ? (
          <>
            <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
            <Text style={styles.bannerText}>
              {uploadingCount > 0 && queuedCount > 0
                ? `Uploading 1 photo... (${queuedCount} in queue)`
                : uploadingCount > 0
                  ? progressPct !== null
                    ? `Uploading... ${progressPct}%`
                    : 'Uploading...'
                  : `${queuedCount} in queue`}
            </Text>
            {onPressViewLogs ? (
              <Text style={styles.viewLogsLink}>View logs →</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.bannerTextIdle}>No uploads in progress</Text>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: hasActivity && progressPct !== null ? `${progressPct}%` : '0%' },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  spinner: {
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  bannerTextIdle: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  viewLogsLink: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
    minWidth: 0,
  },
});
