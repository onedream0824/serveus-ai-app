import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
  },
  progressBarContainer: {
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
});
