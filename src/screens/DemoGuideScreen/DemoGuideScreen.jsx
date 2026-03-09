import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  AppHeader,
  CustomButton,
  FadeInView,
  FrostedCard,
  ScreenGradientBackground,
} from '../../components';
import { layout } from '../../theme';
import { styles } from './DemoGuideScreen.styles';

const DEMO_STEPS = [
  { step: 1, label: "I'm on my way", say: '"I\'m on my way"', desc: 'Mark en route (say customer name if needed)' },
  { step: 2, label: 'Start', say: '"Start" or "Start appointment"', desc: 'Begin the visit' },
  { step: 3, label: 'Take photo', say: '"Take photo"', desc: 'Capture for service report' },
  { step: 4, label: 'Add note', say: '"Add note" then speak', desc: 'Add note to the report' },
  { step: 5, label: 'Complete appointment', say: '"Complete appointment"', desc: 'Mark job done' },
  { step: 6, label: 'Create proof of work', say: '"Create proof of work"', desc: 'Create proof of work and uploads it' },
];

const VOICE_COMMANDS = [
  { cmd: "I'm on my way", example: 'Update job status to active' },
  { cmd: 'Start appointment', example: 'Starts service report' },
  { cmd: 'Take a photo', example: 'Open camera if available; otherwise, use gallery.' },
  { cmd: 'Add note', example: 'Save note for the report' },
  { cmd: 'Complete appointment', example: 'Marks job done' },
  { cmd: 'Create proof of work', example: 'Create proof of work and uploads it' },
];

export function DemoGuideScreen({ insets, onBack, onGoToAppointments }) {
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScreenGradientBackground />

      <AppHeader showBack onBack={onBack} title="Demo guide" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView delay={0} duration={350}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Voice + camera flow</Text>
            <Text style={styles.heroSubtitle}>
              Follow these steps for a smooth demo. Tap the mic on any screen to use voice.
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={80} duration={350}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Demo steps</Text>
            {DEMO_STEPS.map((item, index) => (
              <View key={item.step} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>{item.label}</Text>
                  <Text style={styles.stepSay}>Say: {item.say}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={160} duration={350}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice commands</Text>
            <FrostedCard style={styles.commandCard} borderRadius={layout.cardBorderRadius}>
              {VOICE_COMMANDS.map((item, index) => (
                <View
                  key={item.cmd}
                  style={[
                    styles.commandRow,
                    index === VOICE_COMMANDS.length - 1 && styles.commandRowLast,
                  ]}
                >
                  <Text style={styles.commandName}>{item.cmd}</Text>
                  <Text style={styles.commandExample}>{item.example}</Text>
                </View>
              ))}
            </FrostedCard>
          </View>
        </FadeInView>

        {onGoToAppointments ? (
          <FadeInView delay={240} duration={350}>
            <View style={styles.ctaWrap}>
              <CustomButton
                label="Go to my jobs"
                onPress={onGoToAppointments}
                style={styles.ctaButton}
              />
              <Text style={styles.ctaHint}>Then use the mic or tap a job to run the demo</Text>
            </View>
          </FadeInView>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Serveus</Text>
        </View>
      </ScrollView>
    </View>
  );
}
