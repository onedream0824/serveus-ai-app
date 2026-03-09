import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const BAR_COUNT = 5;
const BAR_MIN = 6;
const BAR_MAX = 18;

export function ListeningStatusCircle() {
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const barAnims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN))
  ).current;

  useEffect(() => {
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.12,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    );
    ringLoop.start();

    const barLoops = barAnims.map((anim, i) => {
      const phase = (i / BAR_COUNT) * Math.PI * 2;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: BAR_MIN + (Math.sin(phase) * 0.5 + 0.5) * (BAR_MAX - BAR_MIN),
            duration: 180 + i * 50,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: BAR_MIN,
            duration: 180 + (BAR_COUNT - i) * 50,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
    });
    barLoops.forEach((l) => l.start());

    return () => {
      ringLoop.stop();
      barLoops.forEach((l) => l.stop());
    };
  }, [ringScale, ringOpacity, barAnims]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <View style={styles.circle}>
        <View style={styles.barsRow}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[styles.bar, { height: anim }]}
            />
          ))}
        </View>
        <Text style={styles.label}>Listening…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(167, 139, 250, 0.85)',
    backgroundColor: 'transparent',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(45, 51, 68, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    height: BAR_MAX,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    minHeight: BAR_MIN,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
});
