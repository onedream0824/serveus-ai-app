import { Platform } from 'react-native';
import { UPLOAD_ENDPOINT } from '../config/api';

const DEFAULT_TYPE = 'image/jpeg';
const DEFAULT_NAME = `photo_${Date.now()}.jpg`;

const PLATFORM_HEADER = Platform.OS === 'ios' ? 'iOS' : 'Android';

export interface UploadSuccessResult {
  fileId?: string;
  fileUrl?: string;
}

export function uploadPhotoAsync(
  uri: string,
  options?: { fileName?: string; type?: string }
): Promise<UploadSuccessResult> {
  const formData = new FormData();
  const name = options?.fileName ?? DEFAULT_NAME;
  const type = options?.type ?? inferMimeType(name) ?? DEFAULT_TYPE;
  formData.append('file', {
    uri,
    name,
    type,
  } as unknown as Blob);

  return fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Platform': PLATFORM_HEADER,
    },
    body: formData,
  }).then(async (res) => {
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (res.ok) {
      const obj = parsed as Record<string, unknown> | null;
      const fileId = typeof obj?.file_id === 'string' ? obj.file_id : undefined;
      const fileUrl = typeof obj?.file_url === 'string' ? obj.file_url : undefined;
      return { fileId, fileUrl };
    }

    const errObj = parsed as { error?: string } | null;
    const message = typeof errObj?.error === 'string' ? errObj.error : res.status.toString();
    throw new Error(message);
  });
}

export function uploadPhotoInBackground(
  uri: string,
  options?: { fileName?: string; type?: string }
): void {
  uploadPhotoAsync(uri, options).catch((err) => {
    console.warn('[Upload] Error:', err?.message ?? err);
  });
}

function inferMimeType(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
  };
  return ext ? map[ext] ?? null : null;
}
