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
  },
  errorBanner: {
    padding: 16,
    backgroundColor: colors.errorSoft,
    borderRadius: layout.cardBorderRadius,
    marginBottom: layout.gap,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.error,
    borderRadius: layout.buttonBorderRadius,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  list: {
    gap: 10,
    paddingBottom: layout.gapLarge,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardActive: {
    borderLeftColor: colors.accent,
    borderColor: colors.accentMuted,
    backgroundColor: colors.accentSoft,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceElevated,
  },
  badgeEnRoute: {
    backgroundColor: colors.infoSoft,
  },
  badgeInProgress: {
    backgroundColor: colors.accentSoft,
  },
  badgeCompleted: {
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgeTextEnRoute: { color: colors.info },
  badgeTextInProgress: { color: colors.accent },
  badgeTextCompleted: { color: colors.success },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 0,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  proofSection: {
    marginTop: layout.gapLarge,
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  proofTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  proofNote: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  proofPhotos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  micWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
