import { Platform } from 'react-native';
import Upload from 'react-native-background-upload';
import { UPLOAD_ENDPOINT } from '../config/api';

const PLATFORM_HEADER = Platform.OS === 'ios' ? 'iOS' : 'Android';

type BackgroundUploadOptions = {
  uri: string;
  fileName?: string;
  type?: string;
};

type UploadStartOptions = {
  url: string;
  path: string;
  method: 'POST';
  type: 'multipart';
  field: string;
  headers?: Record<string, string>;
};

export async function startBackgroundUpload(
  jobId: string,
  { uri }: BackgroundUploadOptions,
): Promise<string> {
  const options: UploadStartOptions = {
    url: UPLOAD_ENDPOINT,
    path: uri,
    method: 'POST',
    type: 'multipart',
    field: 'file',
    headers: {
      'X-Platform': PLATFORM_HEADER,
      Accept: 'application/json',
    },
  };

  const uploadId = await Upload.startUpload(options as any);
  return uploadId;
}

