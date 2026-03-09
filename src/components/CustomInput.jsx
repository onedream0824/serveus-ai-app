import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, layout } from '../theme';

export function CustomInput({
  placeholder,
  hideLabel,
  error = false,
  errorMessage,
  value,
  onChangeText,
  maxLength = 50,
  password = false,
  editable = true,
}) {
  return (
    <View style={styles.wrap}>
      {hideLabel ? (
        <Text style={styles.label}>{hideLabel}</Text>
      ) : null}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        secureTextEntry={password}
        editable={editable}
        autoCapitalize={password ? 'none' : 'sentences'}
        autoCorrect={!password}
      />
      {error && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: layout.buttonBorderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
