import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  AppHeader,
  FashionableMicButton,
  FadeInView,
  FrostedCard,
  ListeningStatusCircle,
  ScreenGradientBackground,
  VoiceWaveform,
} from '../../components';
import { layout } from '../../theme';
import { styles } from './HomeScreen.styles';

export function HomeScreen({
  insets,
  onOpenCamera,
  onOpenSettings,
  onOpenAppointments,
  onOpenDemoGuide,
  onToggleMic,
  isListening = false,
  showVoiceSuccess = false,
}) {
  const welcomeToastShown = useRef(false);
  const micPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      micPulse.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(micPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isListening, micPulse]);

  const openAppointmentsWithToast = useCallback(() => {
    if (!onOpenAppointments) return;
    Toast.show({
      type: 'info',
      text1: 'Opening your jobs…',
      visibilityTime: 1200,
    });
    onOpenAppointments();
  }, [onOpenAppointments]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader rightAction="⚙" onRightPress={onOpenSettings} />

        <FadeInView delay={0} duration={400}>
          <View style={styles.hero}>
            <View style={styles.heroAccent} />
            <Text style={styles.tagline}>
              Manage your appointments and document your visits with voice and photos. Uploads run in the background.
            </Text>
          </View>
        </FadeInView>

        <View style={styles.actions}>
          {onOpenAppointments ? (
            <FadeInView delay={60} duration={350}>
              <TouchableOpacity onPress={openAppointmentsWithToast} activeOpacity={0.88}>
                <FrostedCard style={styles.actionCard} borderRadius={layout.cardBorderRadiusLarge}>
                  <View style={styles.actionCardInner}>
                    <View style={[styles.actionIcon, styles.actionIconCalendar]}>
                      <Text style={styles.actionIconText}>📅</Text>
                    </View>
                    <View style={styles.actionCardText}>
                      <Text style={styles.actionLabel}>Appointments</Text>
                      <Text style={styles.actionHint}>Your jobs and voice commands</Text>
                    </View>
                    <Text style={styles.actionChevron}>›</Text>
                  </View>
                </FrostedCard>
              </TouchableOpacity>
            </FadeInView>
          ) : null}
          <FadeInView delay={120} duration={350}>
            <TouchableOpacity onPress={onOpenCamera} activeOpacity={0.88}>
              <FrostedCard style={styles.actionCard} borderRadius={layout.cardBorderRadiusLarge}>
                <View style={styles.actionCardInner}>
                  <View style={[styles.actionIcon, styles.actionIconCamera]}>
                    <Text style={styles.actionIconText}>📷</Text>
                  </View>
                  <View style={styles.actionCardText}>
                    <Text style={styles.actionLabel}>Capture photo</Text>
                    <Text style={styles.actionHint}>Add to service report or save for later</Text>
                  </View>
                  <Text style={styles.actionChevron}>›</Text>
                </View>
              </FrostedCard>
            </TouchableOpacity>
          </FadeInView>
        </View>

        <FadeInView delay={180} duration={400}>
          <View style={styles.proveSection}>
            <Text style={styles.proveSectionTitle}>Prove my work</Text>
            <Text style={styles.proveSectionHint}>Demo: voice + camera flow</Text>
            {onOpenDemoGuide ? (
              <TouchableOpacity
                style={styles.proveCard}
                onPress={onOpenDemoGuide}
                activeOpacity={0.88}
              >
                <FrostedCard style={styles.proveCardInner} borderRadius={layout.cardBorderRadius}>
                  <View style={styles.proveCardContent}>
                    <Text style={styles.proveCardIcon}>🎯</Text>
                    <View style={styles.proveCardText}>
                      <Text style={styles.proveCardLabel}>Demo guide</Text>
                      <Text style={styles.proveCardSteps}>
                        Voice commands & step-by-step flow for the demo
                      </Text>
                    </View>
                    <Text style={styles.actionChevron}>›</Text>
                  </View>
                </FrostedCard>
              </TouchableOpacity>
            ) : null}
          </View>
        </FadeInView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Serveus</Text>
        </View>
      </ScrollView>

      {onToggleMic ? (
        <>
          {!isListening && (
            <View style={[styles.micFooter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
              <VoiceWaveform isListening={isListening} showSuccess={showVoiceSuccess} />
              <Animated.View style={{ transform: [{ scale: micPulse }] }}>
                <FashionableMicButton onPress={onToggleMic} isListening={false} />
              </Animated.View>
            </View>
          )}
          {isListening && (
            <View style={styles.listeningOverlay} pointerEvents="box-none">
              <View style={styles.listeningOverlayBackdrop} />
              <View style={styles.listeningOverlayContent}>
                <View style={styles.listeningOverlayCenter}>
                  <ListeningStatusCircle />
                </View>
                <View style={[styles.micFooter, { paddingBottom: insets.bottom + Math.max(insets.bottom, 12) + 8 }]}>
                  <FashionableMicButton onPress={onToggleMic} isListening />
                </View>
              </View>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}
