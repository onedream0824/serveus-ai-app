export type UploadJobStatus = 'Queued' | 'Uploading' | 'Success' | 'Failed';

export interface UploadJob {
  id: string;
  uri: string;
  fileName?: string;
  type?: string;
  status: UploadJobStatus;
  timestamp: number;
  error?: string;
}
