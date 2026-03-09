import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, layout, shadows } from '../theme';

export function CustomButton({
  label,
  onPress,
  labelStyle,
  style,
  isloading = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        (isloading || disabled) && styles.buttonDisabled,
        style,
      ]}
      activeOpacity={0.85}
      disabled={isloading || disabled}
    >
      {isloading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: layout.buttonBorderRadius,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
