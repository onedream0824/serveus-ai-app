export type UploadPhotoStatus = 'Queued' | 'Uploading' | 'Success' | 'Failed';

export interface UploadPhoto {
  id: string;
  uri: string;
  fileName?: string;
  type?: string;
  status: UploadPhotoStatus;
  timestamp: number;
  error?: string;
  fileId?: string;
  fileUrl?: string;
  uploadId?: string;
}
