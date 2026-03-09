import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_KEY = 'serveus_remember_me_v1';

export async function saveCredentials(email, password) {
  try {
    await AsyncStorage.setItem(
      REMEMBER_ME_KEY,
      JSON.stringify({ email: email || '', password: password || '' }),
    );
  } catch {
  }
}

export async function loadCredentials() {
  try {
    const raw = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || (!data.email && !data.password)) return null;
    return { email: data.email || '', password: data.password || '' };
  } catch {
    return null;
  }
}
