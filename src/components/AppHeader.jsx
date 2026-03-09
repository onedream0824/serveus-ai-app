import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, layout, shadows } from '../theme';
import { Logo } from './Logo';

export function AppHeader({
  showBack = false,
  onBack,
  title,
  rightAction,
  onRightPress,
}) {
  const paddingHorizontal = showBack && onBack
    ? layout.headerPaddingHorizontalStack
    : layout.headerPaddingHorizontal;

  return (
    <View style={[styles.header, { paddingHorizontal }]}>
      <View style={styles.left}>
        {showBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : title ? null : (
          <Logo size="default" />
        )}
      </View>
      <View style={styles.center} pointerEvents="box-none">
        {title ? (
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightAction != null && rightAction !== '' ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.rightBtn, shadows.button]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            {typeof rightAction === 'string' ? (
              <Text style={styles.rightIcon}>{rightAction}</Text>
            ) : (
              rightAction
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.headerHeight,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 0,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 14,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  titleText: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  rightBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    fontSize: 18,
  },
});
