import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  logsHeader: {
    marginBottom: 24,
  },
  logsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 12,
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
  },
  settingsIcon: {
    fontSize: 22,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent,
  },
  logsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  logsSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  logListContent: {
    paddingBottom: 32,
  },
  logCard: {
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  logCardInner: {
    padding: 18,
  },
  logCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logCardLabelBlock: {
    flex: 1,
    minWidth: 0,
  },
  logCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  logCardId: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 76,
    alignItems: 'center',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSpinner: {
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  progressBarWrap: {
    marginTop: 10,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  logCardTime: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  logCardResponse: {
    marginTop: 10,
  },
  logCardResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  logCardFileId: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 2,
  },
  logCardFileUrl: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 2,
  },
  logCardError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
    lineHeight: 18,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  modalBody: {
    padding: 20,
    maxHeight: 360,
  },
  modalRow: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 15,
    color: colors.text,
  },
  modalValueMono: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.accent,
    lineHeight: 20,
  },
  modalStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalValueError: {
    fontSize: 14,
    color: colors.error,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
