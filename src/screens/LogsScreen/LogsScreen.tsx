import React, { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { FadeInView, FrostedCard, ScreenGradientBackground } from '../../components';
import type { UploadPhoto } from '../../types/upload';
import { getStatusStyle } from '../../theme';
import { formatTime } from '../../utils/format';
import { styles } from './LogsScreen.styles';

const STATUS_DISPLAY_LABEL: Record<UploadPhoto['status'], string> = {
  Queued: 'Queued',
  Uploading: 'Uploading',
  Success: 'Uploaded',
  Failed: 'Failed',
};

export interface LogsScreenProps {
  insets: { top: number; bottom: number };
  photos: UploadPhoto[];
  onBack: () => void;
  onRetry?: (photoId: string) => void;
}

function LogItem({
  item,
  onRetry,
  index,
}: {
  item: UploadPhoto;
  onRetry?: (photoId: string) => void;
  index: number;
}) {
  const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
  const { bg, text } = getStatusStyle(item.status);
  const statusLabel = STATUS_DISPLAY_LABEL[item.status];

  return (
    <FadeInView delay={index * 60} duration={380} fromTranslateY={10}>
      <FrostedCard style={styles.logCard} borderRadius={16}>
        <View style={styles.logCardInner}>
          <View style={styles.logCardTop}>
            <View style={styles.logCardLabelBlock}>
              <Text style={styles.logCardLabel} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.logCardId} numberOfLines={1}>
                {item.id}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: bg }]}>
              <Text style={[styles.statusPillText, { color: text }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.logCardTime}>{formatTime(item.timestamp)}</Text>
          {item.status === 'Success' && item.fileUrl ? (
            <Text style={styles.logCardFileUrl} numberOfLines={1}>
              {item.fileUrl}
            </Text>
          ) : null}
          {item.error ? (
            <Text style={styles.logCardError} numberOfLines={2}>
              {item.error}
            </Text>
          ) : null}
          {item.status === 'Failed' && onRetry ? (
            <TouchableOpacity style={styles.retryButton} onPress={() => onRetry(item.id)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </FrostedCard>
    </FadeInView>
  );
}

export function LogsScreen({ insets, photos, onBack, onRetry }: LogsScreenProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: UploadPhoto; index: number }) => (
      <LogItem item={item} onRetry={onRetry} index={index} />
    ),
    [onRetry]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <FadeInView delay={0} duration={400}>
        <View style={styles.logsHeader}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logsTitle}>Upload logs</Text>
          <Text style={styles.logsSubtitle}>{photos.length} item{photos.length !== 1 ? 's' : ''}</Text>
        </View>
      </FadeInView>

      {photos.length === 0 ? (
        <FadeInView delay={100} duration={400}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📤</Text>
            <Text style={styles.emptyStateTitle}>No uploads yet</Text>
            <Text style={styles.emptyStateText}>
              Take a photo or choose one from your gallery to see upload logs here.
            </Text>
          </View>
        </FadeInView>
      ) : (
        <FlatList
          data={[...photos].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.logListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
