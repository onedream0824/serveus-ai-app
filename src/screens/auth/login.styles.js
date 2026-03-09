import { StyleSheet } from 'react-native';
import { colors, layout } from '../../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: 40,
    minHeight: 400,
  },
  card: {
    padding: layout.gapLarge,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberMeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rememberMeSwitch: {
    marginStart: 8,
  },
  button: {
    width: '100%',
    marginTop: 8,
    marginVertical: 8,
  },
  buttonLabel: {
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 14,
    textAlign: 'center',
  },
  modalPlaceholder: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.errorSoft,
    borderRadius: layout.cardBorderRadius,
  },
  modalText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
});
