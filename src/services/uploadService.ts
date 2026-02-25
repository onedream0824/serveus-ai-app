import { UPLOAD_ENDPOINT } from '../config/api';

const DEFAULT_TYPE = 'image/jpeg';
const DEFAULT_NAME = `photo_${Date.now()}.jpg`;

export function uploadPhotoAsync(
  uri: string,
  options?: { fileName?: string; type?: string }
): Promise<void> {
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
    body: formData,
  }).then(async (res) => {
    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    if (res.ok) {
      console.log('[Upload] Success:', res.status, parsed);
    } else {
      console.warn('[Upload] Failure:', res.status, parsed);
      throw new Error(res.status.toString());
    }
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
