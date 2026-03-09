import { Platform } from 'react-native';
import Upload from './BackgroundUpload';
import { UPLOAD_ENDPOINT } from '../config/api';

const PLATFORM_HEADER = Platform.OS === 'ios' ? 'iOS' : 'Android';

export async function startBackgroundUpload(jobId, { uri }) {
  const uploadId = await Upload.startUpload({
    url: UPLOAD_ENDPOINT,
    path: uri,
    headers: {
      'X-Platform': PLATFORM_HEADER,
      Accept: 'application/json',
    },
  });

  return uploadId;
}
