import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { CustomButton, CustomInput, FrostedCard, ScreenGradientBackground } from '../../components';
import { useLoginHandler } from './auth_handler';
import { loadCredentials } from '../../storage/rememberMeStorage';
import { isEmptyOrSpaces, validateEmail } from '../../utils/validation';
import { colors, layout } from '../../theme';
import { styles } from './login.styles';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    handleLogin,
    SignInLoading,
    error,
    setError,
    showUpdatePasswordModal,
    setShowUpdatePasswordModal,
  } = useLoginHandler({ email, password, rememberMe });

  useEffect(() => {
    loadCredentials().then((creds) => {
      if (creds?.email || creds?.password) {
        setEmail(creds.email || '');
        setPassword(creds.password || '');
        setRememberMe(true);
      }
    });
  }, []);

  const onSignInPress = useCallback(() => {
    if (!validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email address' });
      return;
    }
    if (isEmptyOrSpaces(password)) {
      Toast.show({ type: 'error', text1: 'Please enter your password' });
      return;
    }
    setError(null);
    handleLogin();
  }, [email, password, handleLogin, setError]);

  return (
    <View style={styles.screen}>
      <ScreenGradientBackground />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FrostedCard style={styles.card} borderRadius={layout.cardBorderRadius}>
            <Text style={styles.title}>Serveus</Text>
            <Text style={styles.subtitle}>Sign in to manage your appointments</Text>

            <CustomInput
              placeholder="Enter your email address"
              hideLabel="Email address*"
              errorMessage="Please enter a valid email address"
              error={email.length > 0 && !validateEmail(email)}
              value={email}
              onChangeText={setEmail}
              maxLength={50}
              editable={!SignInLoading}
            />
            <CustomInput
              placeholder="Enter your password"
              hideLabel="Password*"
              error={isEmptyOrSpaces(password)}
              errorMessage="Please enter your password"
              value={password}
              onChangeText={setPassword}
              password
              maxLength={50}
              editable={!SignInLoading}
            />

            <View style={styles.rememberMeContainer}>
              <Text style={styles.rememberMeText}>Remember Me</Text>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.border, true: colors.border }}
                thumbColor={rememberMe ? colors.accent : colors.textMuted}
                style={styles.rememberMeSwitch}
              />
            </View>

            <CustomButton
              label="Sign In"
              onPress={onSignInPress}
              labelStyle={styles.buttonLabel}
              style={styles.button}
              isloading={SignInLoading}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </FrostedCard>

          {showUpdatePasswordModal ? (
            <View style={styles.modalPlaceholder}>
              <Text style={styles.modalText}>
                Complete your account setup in the Serveus web app.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
