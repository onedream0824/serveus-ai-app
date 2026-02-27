import React, { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
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
}: {
  item: UploadPhoto;
  onRetry?: (photoId: string) => void;
}) {
  const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
  const { bg, text } = getStatusStyle(item.status);
  const statusLabel = STATUS_DISPLAY_LABEL[item.status];

  return (
    <View style={styles.logCard}>
      <View style={styles.logCardTop}>
        <Text style={styles.logCardLabel} numberOfLines={1}>
          {label}
        </Text>
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
  );
}

export function LogsScreen({ insets, photos, onBack, onRetry }: LogsScreenProps) {
  const renderItem = useCallback(
    ({ item }: { item: UploadPhoto }) => <LogItem item={item} onRetry={onRetry} />,
    [onRetry]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📤</Text>
          <Text style={styles.emptyStateTitle}>No uploads yet</Text>
          <Text style={styles.emptyStateText}>
            Take a photo or choose one from your gallery to see upload logs here.
          </Text>
        </View>
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
