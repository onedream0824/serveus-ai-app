import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'serveus_auth_v1';

export async function loadAuth() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.token) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveAuth({ token, userData }) {
  try {
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, userData: userData || {} }),
    );
  } catch {
  }
}

export async function clearAuth() {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
  }
}
