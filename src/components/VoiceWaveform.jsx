import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function VoiceWaveform({ isListening, showSuccess }) {
  if (!showSuccess) return null;

  return (
    <View style={styles.successWrap}>
      <View style={styles.successBadge}>
        <Text style={styles.successIcon}>✓</Text>
      </View>
      <Text style={styles.successText}>Got it!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  successWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  successBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
    marginTop: 8,
  },
});
