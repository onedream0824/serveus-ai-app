import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  onOpenSettings?: () => void;
  onRetry?: (photoId: string) => void;
}

function LogItemBrief({
  item,
  onPress,
  index,
}: {
  item: UploadPhoto;
  onPress: () => void;
  index: number;
}) {
  const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
  const { bg, text } = getStatusStyle(item.status);
  const statusLabel = STATUS_DISPLAY_LABEL[item.status];
  const isUploading = item.status === 'Uploading';
  const progressPct =
    isUploading && typeof item.progress === 'number' ? item.progress : null;

  return (
    <FadeInView delay={index * 60} duration={380} fromTranslateY={10}>
      <Pressable onPress={onPress}>
        <FrostedCard style={styles.logCard} borderRadius={16}>
          <View style={styles.logCardInner}>
            <View style={styles.logCardTop}>
              <View style={styles.logCardLabelBlock}>
                <Text style={styles.logCardLabel} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={styles.logCardTime}>{formatTime(item.timestamp)}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: bg }]}>
                {isUploading ? (
                  <View style={styles.statusPillRow}>
                    <ActivityIndicator size="small" color={text} style={styles.statusSpinner} />
                    <Text style={[styles.statusPillText, { color: text }]}>
                      {progressPct !== null ? `${progressPct}%` : '...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.statusPillText, { color: text }]}>{statusLabel}</Text>
                )}
              </View>
            </View>
            {isUploading ? (
              <View style={styles.progressBarWrap}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressPct !== null ? `${progressPct}%` : '0%',
                      },
                    ]}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </FrostedCard>
      </Pressable>
    </FadeInView>
  );
}

function LogDetailModal({
  item,
  onClose,
  onRetry,
}: {
  item: UploadPhoto;
  onClose: () => void;
  onRetry?: (photoId: string) => void;
}) {
  const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
  const { bg, text } = getStatusStyle(item.status);
  const statusLabel = STATUS_DISPLAY_LABEL[item.status];

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload details</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>File</Text>
              <Text style={styles.modalValue}>{label}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>ID</Text>
              <Text style={styles.modalValueMono}>{item.id}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Time</Text>
              <Text style={styles.modalValue}>{formatTime(item.timestamp)}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Status</Text>
              <View style={[styles.modalStatusPill, { backgroundColor: bg }]}>
                <Text style={[styles.modalStatusText, { color: text }]}>{statusLabel}</Text>
              </View>
            </View>
            {item.fileId ? (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>file_id</Text>
                <Text style={styles.modalValueMono} selectable>
                  {item.fileId}
                </Text>
              </View>
            ) : null}
            {item.fileUrl ? (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>file_url</Text>
                <Text style={styles.modalValueMono} selectable numberOfLines={3}>
                  {item.fileUrl}
                </Text>
              </View>
            ) : null}
            {item.error ? (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Error</Text>
                <Text style={styles.modalValueError}>{item.error}</Text>
              </View>
            ) : null}
          </ScrollView>
          {item.status === 'Failed' && onRetry ? (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.retryButton} onPress={() => onRetry(item.id)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function LogsScreen({
  insets,
  photos,
  onBack,
  onOpenSettings,
  onRetry,
}: LogsScreenProps) {
  const [selectedItem, setSelectedItem] = useState<UploadPhoto | null>(null);

  const renderItem = useCallback(
    ({ item, index }: { item: UploadPhoto; index: number }) => (
      <LogItemBrief
        item={item}
        index={index}
        onPress={() => setSelectedItem(item)}
      />
    ),
    []
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <FadeInView delay={0} duration={400}>
        <View style={styles.logsHeader}>
          <View style={styles.logsHeaderRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            {onOpenSettings ? (
              <TouchableOpacity
                onPress={onOpenSettings}
                style={styles.settingsIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.settingsIcon}>⚙</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.logsTitle}>Upload logs</Text>
          <Text style={styles.logsSubtitle}>{photos.length} item{photos.length !== 1 ? 's' : ''}</Text>
        </View>
      </FadeInView>

      {selectedItem ? (
        <LogDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRetry={onRetry}
        />
      ) : null}

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
