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
    marginBottom: layout.sectionMarginBottom,
  },
  heroAccent: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    gap: layout.gap,
    marginBottom: layout.gapLarge,
  },
  actionCard: {
    minHeight: 90,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  actionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconCalendar: {
    backgroundColor: colors.accentSoft,
  },
  actionIconCamera: {
    backgroundColor: colors.accentSoft,
  },
  actionIconText: {
    fontSize: 26,
  },
  actionCardText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  actionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  actionChevron: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent,
  },
  proveSection: {
    marginTop: layout.gapLarge,
    marginBottom: layout.gap,
  },
  proveSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  proveSectionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  proveCard: {
    marginBottom: 0,
  },
  proveCardInner: {
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  proveCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proveCardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  proveCardText: {
    flex: 1,
  },
  proveCardLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  proveCardSteps: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  micFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  listeningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  listeningOverlayContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  listeningOverlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
