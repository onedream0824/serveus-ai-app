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
  section: {
    marginBottom: layout.sectionMarginBottom,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  rowTextLogout: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },
  rowChevron: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
