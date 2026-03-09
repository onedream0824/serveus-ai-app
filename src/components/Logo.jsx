import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Logo({ size = 'default', style }) {
  const isSmall = size === 'small';
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={[styles.text, isSmall && styles.textSmall]}>Serveus</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  text: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  textSmall: {
    fontSize: 18,
    fontWeight: '700',
  },
});
