import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { saveCredentials } from '../../storage/rememberMeStorage';
import { MEMBER_TYPE } from '../../constants/strings';

export function useLoginHandler({ email, password, rememberMe }) {
  const { setAuthFromResponse } = useAuth();
  const [SignInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  const handleLogin = useCallback(async () => {
    setError(null);
    setSignInLoading(true);
    try {
      const deviceToken = '';
      const data = await loginApi({
        emailAddress: email?.trim(),
        password: password?.trim(),
        deviceToken,
      });

      if (data?.memberType === MEMBER_TYPE.SERVICE_PROVIDER_WORKERS) {
        if (data?.isSignupCompleted) {
          await setAuthFromResponse(data);
          if (rememberMe) {
            await saveCredentials(email?.trim(), password?.trim());
          }
          Toast.show({ type: 'success', text1: 'Signed in' });
        } else {
          setShowUpdatePasswordModal(true);
        }
        setSignInLoading(false);
        return;
      }

      if (
        data?.memberType === MEMBER_TYPE.SERVICE_PROVIDER ||
        data?.memberType === MEMBER_TYPE.CUSTOMER ||
        data?.isSignupCompleted
      ) {
        await setAuthFromResponse(data);
        if (rememberMe) {
          await saveCredentials(email?.trim(), password?.trim());
        }
        Toast.show({ type: 'success', text1: 'Signed in' });
      } else {
        await setAuthFromResponse(data);
        if (rememberMe) {
          await saveCredentials(email?.trim(), password?.trim());
        }
        Toast.show({ type: 'success', text1: 'Signed in' });
      }
    } catch (err) {
      const message = err?.message || 'Login failed';
      setError(message);
      Toast.show({ type: 'error', text1: 'Login failed', text2: message });
    } finally {
      setSignInLoading(false);
    }
  }, [email, password, rememberMe, setAuthFromResponse]);

  return {
    handleLogin,
    SignInLoading,
    error,
    setError,
    showUpdatePasswordModal,
    setShowUpdatePasswordModal,
  };
}
