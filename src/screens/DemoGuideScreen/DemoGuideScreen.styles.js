import { StyleSheet } from 'react-native';
import { colors, layout } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: layout.sectionMarginBottom,
  },
  hero: {
    marginBottom: layout.gapLarge,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 320,
  },
  section: {
    marginBottom: layout.sectionMarginBottom,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  stepSay: {
    fontSize: 14,
    color: colors.accent,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  commandCard: {
    overflow: 'hidden',
    paddingVertical: 4,
  },
  commandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  commandRowLast: {
    borderBottomWidth: 0,
  },
  commandName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  commandExample: {
    fontSize: 13,
    color: colors.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
  },
  ctaWrap: {
    marginTop: 8,
    marginBottom: layout.gapLarge,
  },
  ctaButton: {
    marginBottom: 10,
  },
  ctaHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
