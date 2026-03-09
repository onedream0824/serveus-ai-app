import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors, shadows } from '../theme';

let BlurView = null;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch {
  BlurView = null;
}

export function FrostedCard({ children, style, borderRadius = 18 }) {
  return (
    <View style={[styles.wrapper, shadows.card, { borderRadius }, style]}>
      {Platform.OS === 'ios' && BlurView ? (
        <>
          <BlurView
            style={[StyleSheet.absoluteFill, styles.blurLayer]}
            blurType="dark"
            reducedTransparencyFallbackColor={colors.cardFrosted}
          />
          <View style={[StyleSheet.absoluteFill, styles.frostedTint]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'transparent',
  },
  blurLayer: {
    backgroundColor: 'transparent',
  },
  frostedTint: {
    backgroundColor: colors.cardFrosted,
  },
  androidFallback: {
    backgroundColor: colors.cardFrosted,
  },
  content: {
    flex: 1,
  },
});
