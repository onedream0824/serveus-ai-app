import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { BackgroundUpload } = NativeModules;

interface BackgroundUploadNativeModule {
  uploadFile: (
    fileUri: string,
    url: string,
    headers: Record<string, string>,
    fileName: string,
    fileType: string,
  ) => Promise<string>;
  checkPendingUploads: () => Promise<Array<Record<string, string>>>;
  reconnectSession: () => Promise<boolean>;
}

interface UploadFileParams {
  fileUri: string;
  url: string;
  headers: Record<string, string>;
  fileName: string;
  fileType: string;
}

interface UploadEvent {
  uploadId: string;
  progress?: number;
  response?: string;
  error?: string;
}

interface UploadListener {
  remove: () => void;
}

class BackgroundUploadModule {
  private eventEmitter: NativeEventEmitter | null = null;
  private nativeModule: BackgroundUploadNativeModule | null = null;

  constructor() {
    if (BackgroundUpload) {
      this.nativeModule = BackgroundUpload as BackgroundUploadNativeModule;
      this.eventEmitter = new NativeEventEmitter(BackgroundUpload);
    }
  }

  async uploadFile(params: UploadFileParams): Promise<string> {
    if (!this.nativeModule) {
      throw new Error(
        `BackgroundUpload native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.uploadFile(
      params.fileUri,
      params.url,
      params.headers,
      params.fileName,
      params.fileType,
    );
  }

  async checkPendingUploads(): Promise<Array<Record<string, string>>> {
    if (!this.nativeModule) {
      throw new Error(
        `BackgroundUpload native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.checkPendingUploads();
  }

  async reconnectSession(): Promise<boolean> {
    if (!this.nativeModule) {
      throw new Error(
        `BackgroundUpload native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.reconnectSession();
  }

  addListener(
    event: 'uploadProgress' | 'uploadComplete' | 'uploadFailed',
    uploadId: string,
    callback: (data: UploadEvent) => void,
  ): UploadListener {
    if (!this.eventEmitter) {
      throw new Error('BackgroundUpload event emitter is not available');
    }

    const subscription = this.eventEmitter.addListener(event, (data: UploadEvent) => {
      if (data.uploadId === uploadId) {
        callback(data);
      }
    });

    return {
      remove: () => {
        subscription.remove();
      },
    };
  }

  async startUpload(options: {
    url: string;
    path: string;
    method: string;
    type: string;
    field: string;
    headers?: Record<string, string>;
  }): Promise<string> {
    const pathParts = options.path.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'file';
    
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    const fileType = mimeTypes[extension] || 'image/jpeg';

    let fileUri = options.path;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      if (Platform.OS === 'ios') {
        fileUri = `file://${fileUri}`;
      }
    }

    return this.uploadFile({
      fileUri,
      url: options.url,
      headers: options.headers || {},
      fileName,
      fileType,
    });
  }
}

const BackgroundUploadInstance = new BackgroundUploadModule();

export default {
  startUpload: (options: Parameters<BackgroundUploadModule['startUpload']>[0]) =>
    BackgroundUploadInstance.startUpload(options),
  addListener: (
    event: 'completed' | 'error' | 'progress',
    uploadId: string,
    callback: (data: any) => void,
  ) => {
    const eventMap: Record<string, 'uploadProgress' | 'uploadComplete' | 'uploadFailed'> = {
      completed: 'uploadComplete',
      error: 'uploadFailed',
      progress: 'uploadProgress',
    };

    const newEvent = eventMap[event] || 'uploadComplete';
    
    return BackgroundUploadInstance.addListener(newEvent, uploadId, (data) => {
      if (event === 'completed') {
        callback({
          responseBody: data.response,
          responseCode: 200,
        });
      } else if (event === 'error') {
        callback({
          error: data.error,
        });
      } else {
        callback(data);
      }
    });
  },
  uploadFile: (params: UploadFileParams) => BackgroundUploadInstance.uploadFile(params),
  checkPendingUploads: () => BackgroundUploadInstance.checkPendingUploads(),
  reconnectSession: () => BackgroundUploadInstance.reconnectSession(),
};
