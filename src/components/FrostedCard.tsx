import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

let BlurView: React.ComponentType<{
  style: object;
  blurType: string;
  reducedTransparencyFallbackColor: string;
}> | null = null;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch {
  BlurView = null;
}

type FrostedCardProps = {
  children: React.ReactNode;
  style?: object;
  borderRadius?: number;
};

export function FrostedCard({ children, style, borderRadius = 18 }: FrostedCardProps) {
  return (
    <View style={[styles.wrapper, { borderRadius }, style]}>
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
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
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
