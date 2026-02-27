import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

let LinearGradient: React.ComponentType<{
  colors: readonly string[];
  style: object;
  start: { x: number; y: number };
  end: { x: number; y: number };
}> | null = null;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = null;
}

const GRADIENT_COLORS = [
  colors.bg,
  '#0a0c12',
  '#0d0f18',
  '#080a0e',
] as const;

const ORB_COLORS = [
  [colors.accent, 'transparent'] as const,
  ['rgba(99, 102, 241, 0.15)', 'transparent'] as const,
] as const;

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
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -80,
    right: -100,
    opacity: 0.6,
  },
  orb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: '20%',
    left: -60,
    opacity: 0.5,
  },
});
