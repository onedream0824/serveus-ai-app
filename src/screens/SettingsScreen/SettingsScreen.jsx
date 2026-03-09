import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  AppHeader,
  FadeInView,
  FrostedCard,
  ScreenGradientBackground,
} from '../../components';
import { useGlasses } from '../../context/GlassesContext';
import { layout } from '../../theme';
import { styles } from './SettingsScreen.styles';

export function SettingsScreen({
  insets,
  onBack,
  onLogout,
}) {
  const {
    isAvailable,
    isRegistered,
    glassesConnected,
    isStreaming,
    error,
    isRegistering,
    startRegistration,
    startStreaming,
    stopStreaming,
    refreshState,
  } = useGlasses();

  const [streamLoading, setStreamLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    try {
      await startRegistration();
      Toast.show({ type: 'success', text1: 'Opening Meta AI', text2: 'Complete registration there' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: e?.message });
    }
  }, [startRegistration]);

  const handleStartStreaming = useCallback(async () => {
    setStreamLoading(true);
    try {
      await startStreaming();
      Toast.show({ type: 'success', text1: 'Glasses camera ready' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Stream failed', text2: e?.message });
    } finally {
      setStreamLoading(false);
    }
  }, [startStreaming]);

  const handleStopStreaming = useCallback(async () => {
    setStreamLoading(true);
    try {
      await stopStreaming();
      Toast.show({ type: 'info', text1: 'Stream stopped' });
    } finally {
      setStreamLoading(false);
    }
  }, [stopStreaming]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <AppHeader showBack onBack={onBack} title="Settings" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isAvailable ? (
          <FadeInView delay={50} duration={400}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta Glasses</Text>
              <FrostedCard style={styles.card} borderRadius={layout.cardBorderRadius}>
                <View style={styles.row}>
                  <Text style={styles.rowText}>Status</Text>
                  <Text style={[styles.rowChevron, { fontSize: 12, marginRight: 4 }]}>
                    {isRegistered ? (glassesConnected ? 'Connected' : 'Registered') : 'Not registered'}
                  </Text>
                </View>
                {error ? (
                  <View style={[styles.row, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.rowText, { color: '#f87171', flex: 1 }]} numberOfLines={2}>{error}</Text>
                  </View>
                ) : null}
                {!isRegistered ? (
                  <TouchableOpacity
                    style={[styles.row, styles.rowLast]}
                    onPress={handleRegister}
                    disabled={isRegistering}
                    activeOpacity={0.7}
                  >
                    {isRegistering ? (
                      <ActivityIndicator size="small" color="#8b5cf6" style={{ marginRight: 8 }} />
                    ) : null}
                    <Text style={[styles.rowText, { color: '#8b5cf6' }]}>
                      {isRegistering ? 'Opening Meta AI…' : 'Register with Meta AI'}
                    </Text>
                    <Text style={styles.rowChevron}>›</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.row}
                      onPress={refreshState}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.rowText}>Refresh status</Text>
                      <Text style={styles.rowChevron}>›</Text>
                    </TouchableOpacity>
                    {glassesConnected ? (
                      <View style={[styles.row, styles.rowLast]}>
                        <Text style={styles.rowText}>
                          {isStreaming ? 'Camera stream active' : 'Camera stream off'}
                        </Text>
                        {streamLoading ? (
                          <ActivityIndicator size="small" color="#8b5cf6" />
                        ) : isStreaming ? (
                          <TouchableOpacity onPress={handleStopStreaming} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Text style={[styles.rowText, { color: '#8b5cf6', fontSize: 14 }]}>Stop</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity onPress={handleStartStreaming} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Text style={[styles.rowText, { color: '#8b5cf6', fontSize: 14 }]}>Start</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.row, styles.rowLast]}>
                        <Text style={[styles.rowText, { color: '#94a3b8' }]}>
                          Pair glasses in Meta AI app to use voice & photo
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </FrostedCard>
            </View>
          </FadeInView>
        ) : null}

        <FadeInView delay={100} duration={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <FrostedCard style={styles.card} borderRadius={layout.cardBorderRadius}>
              <View style={styles.row}>
                <Text style={styles.rowText}>Notifications</Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
              <View style={[styles.row, onLogout ? undefined : styles.rowLast]}>
                <Text style={styles.rowText}>Storage</Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
              {onLogout ? (
                <TouchableOpacity
                  style={[styles.row, styles.rowLast]}
                  onPress={onLogout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowTextLogout}>Log out</Text>
                  <Text style={styles.rowChevron}>›</Text>
                </TouchableOpacity>
              ) : null}
            </FrostedCard>
          </View>
        </FadeInView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Serveus</Text>
        </View>
      </ScrollView>
    </View>
  );
}
