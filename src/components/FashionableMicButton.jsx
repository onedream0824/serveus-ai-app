import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

let LinearGradient = null;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = null;
}

const GRADIENT_IDLE = ['#9d6ffa', '#7c3aed'];
const GRADIENT_ACTIVE = ['#a78bfa', '#8b5cf6'];

const BORDER_GLOW_IDLE = 'rgba(167, 139, 250, 0.9)';
const BORDER_GLOW_ACTIVE = 'rgba(196, 181, 253, 0.95)';

const ICON_FILL_IDLE = '#fff';
const ICON_FILL_ACTIVE = '#fff';

function MicIconShape() {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.micHead, { backgroundColor: ICON_FILL_IDLE }]}>
        <View style={[styles.micHeadInner, { backgroundColor: ICON_FILL_IDLE, opacity: 0.5 }]} />
      </View>
      <View style={[styles.micStem, { backgroundColor: ICON_FILL_IDLE }]} />
      <View style={[styles.micBase, { backgroundColor: ICON_FILL_IDLE }]} />
    </View>
  );
}

function StopIconShape() {
  return (
    <View style={[styles.stopIcon, { backgroundColor: ICON_FILL_ACTIVE }]} />
  );
}

export function FashionableMicButton({ onPress, isListening, style }) {
  const isActive = !!isListening;
  const borderOpacity = useRef(new Animated.Value(0.5)).current;
  const borderScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(borderOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(borderScale, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(borderOpacity, {
            toValue: 0.45,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(borderScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [borderOpacity, borderScale]);

  const buttonContent = (
    <View style={styles.buttonWrap}>
      <Animated.View
        style={[
          styles.borderRing,
          {
            opacity: borderOpacity,
            transform: [{ scale: borderScale }],
            borderColor: isActive ? BORDER_GLOW_ACTIVE : BORDER_GLOW_IDLE,
          },
        ]}
      />
      <View style={[styles.outerRing, isActive && styles.outerRingActive]}>
        <View style={[styles.innerButton, isActive && styles.innerButtonActive]}>
        {LinearGradient ? (
          <LinearGradient
            colors={isActive ? GRADIENT_ACTIVE : GRADIENT_IDLE}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isActive ? colors.accent : '#8b5cf6' },
            ]}
          />
        )}
        {isActive ? <StopIconShape /> : <MicIconShape />}
      </View>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.touchable, style]}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  buttonWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  outerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  outerRingActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.5)',
    shadowColor: '#c4b5fd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
  },
  innerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  innerButtonActive: {
    borderColor: 'rgba(255,255,255,0.6)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHead: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micHeadInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  micStem: {
    width: 5,
    height: 16,
    borderRadius: 2.5,
    marginBottom: 3,
  },
  micBase: {
    width: 22,
    height: 6,
    borderRadius: 3,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
});
