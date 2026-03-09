import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { BackgroundUpload } = NativeModules;

const NATIVE_EVENT_NAMES = ['uploadProgress', 'uploadComplete', 'uploadFailed'];

class BackgroundUploadModule {
  constructor() {
    this.eventEmitter = null;
    this.nativeModule = null;
    if (BackgroundUpload) {
      this.nativeModule = BackgroundUpload;
      this.eventEmitter = new NativeEventEmitter(BackgroundUpload);
      this._stubSubscriptions = NATIVE_EVENT_NAMES.map((name) =>
        this.eventEmitter.addListener(name, () => {}),
      );
    }
  }

  async uploadFile(params) {
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

  async checkPendingUploads() {
    if (!this.nativeModule) {
      throw new Error(
        `BackgroundUpload native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.checkPendingUploads();
  }

  async reconnectSession() {
    if (!this.nativeModule) {
      throw new Error(
        `BackgroundUpload native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.reconnectSession();
  }

  addListener(event, uploadId, callback) {
    if (!this.eventEmitter) {
      throw new Error('BackgroundUpload event emitter is not available');
    }

    const subscription = this.eventEmitter.addListener(event, (data) => {
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

  async startUpload(options) {
    const pathParts = options.path.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'file';

    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes = {
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
  startUpload: (options) => BackgroundUploadInstance.startUpload(options),
  addListener: (event, uploadId, callback) => {
    const eventMap = {
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
  uploadFile: (params) => BackgroundUploadInstance.uploadFile(params),
  checkPendingUploads: () => BackgroundUploadInstance.checkPendingUploads(),
  reconnectSession: () => BackgroundUploadInstance.reconnectSession(),
};
