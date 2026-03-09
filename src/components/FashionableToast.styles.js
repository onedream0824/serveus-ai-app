import { Platform, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { layout } from '../theme/layout';

const TYPE_CONFIG = {
  success: { color: colors.success, soft: colors.successSoft, icon: '✓', bg: 'rgba(20, 34, 31, 0.96)' },
  error: { color: colors.error, soft: colors.errorSoft, icon: '✕', bg: 'rgba(34, 24, 40, 0.96)' },
  warning: { color: colors.warning, soft: colors.warningSoft, icon: '⚠', bg: 'rgba(36, 29, 24, 0.96)' },
  info: { color: colors.info, soft: colors.infoSoft, icon: 'ℹ', bg: 'rgba(22, 30, 44, 0.96)' },
  default: { color: colors.accent, soft: colors.accentSoft, icon: '•', bg: 'rgba(27, 24, 44, 0.96)' },
};

export function getToastTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

const wrapShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  android: { elevation: 10 },
});

export const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 56,
    maxWidth: '88%',
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...wrapShadow,
  },
  strip: {
    width: 4,
    borderTopLeftRadius: layout.cardBorderRadius,
    borderBottomLeftRadius: layout.cardBorderRadius,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 32,
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.15,
  },
  text2: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
