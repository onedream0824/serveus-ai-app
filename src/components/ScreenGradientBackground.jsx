import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

let LinearGradient = null;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = null;
}

const GRADIENT_COLORS = [
  colors.bg,
  colors.bgSoft,
  '#0e1118',
  colors.bg,
];

const ORB_COLORS = [
  [colors.accent, 'transparent'],
  ['rgba(139, 92, 246, 0.12)', 'transparent'],
];

export function ScreenGradientBackground() {
  if (!LinearGradient) {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} pointerEvents="none" />;
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...GRADIENT_COLORS]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={ORB_COLORS[0]}
          style={styles.orb1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={ORB_COLORS[1]}
          style={styles.orb2}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -100,
    right: -120,
    opacity: 0.45,
  },
  orb2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: '18%',
    left: -70,
    opacity: 0.35,
  },
});
