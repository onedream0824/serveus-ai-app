import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  AppHeader,
  FashionableMicButton,
  FadeInView,
  FrostedCard,
  ListeningStatusCircle,
  ScreenGradientBackground,
  VoiceWaveform,
} from '../../components';
import { useWorkflow } from '../../context/WorkflowContext';
import { formatTime } from '../../utils/format';
import { layout } from '../../theme';
import { styles } from './AppointmentsScreen.styles';

function formatScheduled(ms) {
  const now = Date.now();
  const diff = ms - now;
  if (diff < 0) return 'Past';
  if (diff < 60 * 60 * 1000) return `In ${Math.round(diff / 60000)} min`;
  return new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  if (status === 'en_route') {
    return (
      <View style={[styles.badge, styles.badgeEnRoute]}>
        <Text style={[styles.badgeText, styles.badgeTextEnRoute]}>En route</Text>
      </View>
    );
  }
  if (status === 'in_progress') {
    return (
      <View style={[styles.badge, styles.badgeInProgress]}>
        <Text style={[styles.badgeText, styles.badgeTextInProgress]}>In progress</Text>
      </View>
    );
  }
  if (status === 'completed') {
    return (
      <View style={[styles.badge, styles.badgeCompleted]}>
        <Text style={[styles.badgeText, styles.badgeTextCompleted]}>Done</Text>
      </View>
    );
  }
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Scheduled</Text>
    </View>
  );
}

export function AppointmentsScreen({
  insets,
  onBack,
  onOpenSettings,
  isListening,
  onToggleMic,
  proofOfWorkVisible,
  showVoiceSuccess = false,
}) {
  const {
    appointments,
    activeJobIndex,
    activeJob,
    proofOfWorkDraft,
    selectAppointment,
    appointmentsLoading,
    appointmentsError,
    refreshAppointments,
  } = useWorkflow();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenGradientBackground />

      <AppHeader
        showBack
        onBack={onBack}
        title="Appointments"
        rightAction="⚙"
        onRightPress={onOpenSettings}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={appointmentsLoading}
            onRefresh={refreshAppointments}
            tintColor="#8b5cf6"
          />
        }
      >
        {appointmentsError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{appointmentsError}</Text>
            <TouchableOpacity onPress={refreshAppointments} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {appointmentsLoading && appointments.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Loading your appointments…</Text>
          </View>
        ) : (
        <View style={styles.list}>
        {appointments.map((apt, index) => {
          const isActive = index === activeJobIndex;
          return (
            <FadeInView key={apt.id} delay={index * 50} duration={300}>
              <TouchableOpacity
                onPress={() => selectAppointment(index)}
                activeOpacity={0.88}
              >
                <FrostedCard
                  style={[styles.card, isActive && styles.cardActive]}
                  borderRadius={layout.cardBorderRadius}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {apt.customerName}
                    </Text>
                    <StatusBadge status={apt.status} />
                  </View>
                  <Text style={styles.cardSub} numberOfLines={1}>{apt.address}</Text>
                  <Text style={styles.cardTime} numberOfLines={1}>
                    {formatScheduled(apt.scheduledAt)}
                    {apt.enRouteAt && ` · En route ${formatTime(apt.enRouteAt)}`}
                    {apt.startedAt && ` · Started ${formatTime(apt.startedAt)}`}
                    {apt.completedAt && ` · Done ${formatTime(apt.completedAt)}`}
                  </Text>
                </FrostedCard>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
        </View>
        )}

        {proofOfWorkVisible && activeJob && (proofOfWorkDraft.notes.length > 0 || proofOfWorkDraft.photoUris.length > 0) && (
        <FadeInView delay={0} duration={250}>
          <View style={styles.proofSection}>
            <Text style={styles.proofTitle}>Service report (draft)</Text>
            {proofOfWorkDraft.notes.map((n, i) => (
              <Text key={i} style={styles.proofNote}>
                • {n.text}
              </Text>
            ))}
            {proofOfWorkDraft.photoUris.length > 0 && (
              <View style={styles.proofPhotos}>
                <Text style={styles.proofNote}>{proofOfWorkDraft.photoUris.length} photo(s) attached</Text>
              </View>
            )}
          </View>
        </FadeInView>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Serveus</Text>
        </View>
      </ScrollView>

      {!isListening && (
        <View style={[styles.micWrap, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <VoiceWaveform isListening={isListening} showSuccess={showVoiceSuccess} />
          <FashionableMicButton onPress={onToggleMic} isListening={false} />
        </View>
      )}
      {isListening && (
        <View style={styles.listeningOverlay} pointerEvents="box-none">
          <View style={styles.listeningOverlayBackdrop} />
          <View style={styles.listeningOverlayContent}>
            <View style={styles.listeningOverlayCenter}>
              <ListeningStatusCircle />
            </View>
            <View style={[styles.micWrap, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <FashionableMicButton onPress={onToggleMic} isListening />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
