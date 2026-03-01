import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 28,
  },
  mainContent: {
    flex: 1,
  },
  progressBarContainer: {
    paddingTop: 16,
  },
  hero: {
    marginTop: 40,
    marginBottom: 44,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  settingsIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  settingsIcon: {
    fontSize: 22,
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
    minHeight: 92,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  primaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  primaryButtonHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  primaryButtonChevron: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.accent,
  },
  viewLogsButton: {
    minHeight: 72,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginTop: 28,
  },
  viewLogsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  viewLogsIcon: {
    backgroundColor: colors.accentSoft,
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 14,
  },
  viewLogsTextWrap: {
    flex: 1,
  },
  viewLogsLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  viewLogsHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
});
