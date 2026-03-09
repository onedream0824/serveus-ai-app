import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'upload_queue_v1';

export async function loadUploadQueue() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function saveUploadQueue(queue) {
  try {
    const payload = JSON.stringify(queue);
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch {
  }
}

