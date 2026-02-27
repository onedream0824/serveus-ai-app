import { Platform } from 'react-native';
import Upload from './BackgroundUpload';
import { UPLOAD_ENDPOINT } from '../config/api';

const PLATFORM_HEADER = Platform.OS === 'ios' ? 'iOS' : 'Android';

type BackgroundUploadOptions = {
  uri: string;
  fileName?: string;
  type?: string;
};

export async function startBackgroundUpload(
  jobId: string,
  { uri, fileName, type }: BackgroundUploadOptions,
): Promise<string> {
  const finalFileName = fileName || uri.split('/').pop() || 'file.jpg';
  
  const extension = finalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  const finalFileType = type || mimeTypes[extension] || 'image/jpeg';

  const fileUri = uri;

  const uploadId = await Upload.startUpload({
    url: UPLOAD_ENDPOINT,
    path: fileUri,
    method: 'POST',
    type: 'multipart',
    field: 'file',
    headers: {
      'X-Platform': PLATFORM_HEADER,
      Accept: 'application/json',
    },
  });
  
  return uploadId;
}

