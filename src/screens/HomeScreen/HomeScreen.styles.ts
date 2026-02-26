import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
  },
  hero: {
    marginTop: 40,
    marginBottom: 44,
  },
  heroAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginBottom: 20,
  },
  brand: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  buttonIconCamera: {
    backgroundColor: colors.accentSoft,
  },
  buttonIconGallery: {
    backgroundColor: colors.accentSoft,
  },
  buttonIconText: {
    fontSize: 26,
  },
  primaryButtonTextWrap: {
    flex: 1,
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButtonHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  primaryButtonChevron: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textMuted,
  },
  logsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  logsCtaLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent,
  },
  logsBadge: {
    backgroundColor: colors.accent,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 6,
  },
  logsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  logsCtaArrow: {
    fontSize: 18,
    color: colors.accent,
    marginLeft: 6,
  },
});
