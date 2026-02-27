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
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          reducedTransparencyFallbackColor={colors.surface}
        />
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
    borderColor: 'rgba(255,255,255,0.06)',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 21, 28, 0.92)',
  },
  content: {
    flex: 1,
  },
});
