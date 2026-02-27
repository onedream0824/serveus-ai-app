import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UploadPhoto } from '../types/upload';

const STORAGE_KEY = 'upload_queue_v1';

export async function loadUploadQueue(): Promise<UploadPhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as UploadPhoto[];
  } catch {
    return [];
  }
}

export async function saveUploadQueue(queue: UploadPhoto[]): Promise<void> {
  try {
    const payload = JSON.stringify(queue);
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch {
  }
}

