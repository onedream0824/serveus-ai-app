import React, { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { UploadJob } from '../../types/upload';
import { getStatusStyle } from '../../theme';
import { formatTime } from '../../utils/format';
import { styles } from './LogsScreen.styles';

export interface LogsScreenProps {
  insets: { top: number; bottom: number };
  jobs: UploadJob[];
  onBack: () => void;
}

function LogItem({ item }: { item: UploadJob }) {
  const label = item.fileName ?? `Photo ${item.id.slice(0, 8)}`;
  const { bg, text } = getStatusStyle(item.status);
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
}

export function LogsScreen({ insets, jobs, onBack }: LogsScreenProps) {
  const renderItem = useCallback(
    ({ item }: { item: UploadJob }) => <LogItem item={item} />,
    []
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
