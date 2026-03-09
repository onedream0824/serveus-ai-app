import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { MetaGlasses: MetaGlassesModule } = NativeModules;

const GLASSES_EVENT = 'onGlassesConnectionChange';

class MetaGlassesService {
  constructor() {
    this.nativeModule = MetaGlassesModule;
    this.eventEmitter = MetaGlassesModule ? new NativeEventEmitter(MetaGlassesModule) : null;
  }

  isAvailable() {
    return Boolean(this.nativeModule);
  }

  async startRegistration() {
    if (!this.nativeModule) {
      throw new Error(`MetaGlasses is not available on ${Platform.OS}`);
    }
    return this.nativeModule.startRegistration();
  }

  async getGlassesState() {
    if (!this.nativeModule) {
      return {
        isRegistered: false,
        glassesConnected: false,
        connectedDeviceCount: 0,
        isStreaming: false,
        error: null,
      };
    }
    const state = await this.nativeModule.getGlassesState();
    return {
      isRegistered: !!state?.isRegistered,
      glassesConnected: !!state?.glassesConnected,
      connectedDeviceCount: state?.connectedDeviceCount ?? 0,
      connectedDeviceId: state?.connectedDeviceId ?? null,
      isStreaming: !!state?.isStreaming,
      error: state?.error ?? null,
    };
  }

  async startStreaming() {
    if (!this.nativeModule) {
      throw new Error(`MetaGlasses is not available on ${Platform.OS}`);
    }
    return this.nativeModule.startStreaming();
  }

  async stopStreaming() {
    if (!this.nativeModule) return;
    return this.nativeModule.stopStreaming();
  }

  async capturePhoto() {
    if (!this.nativeModule) {
      throw new Error(`MetaGlasses is not available on ${Platform.OS}`);
    }
    const result = await this.nativeModule.capturePhoto();
    const uri = result?.uri ?? result;
    return typeof uri === 'string' ? { uri } : { uri: null };
  }

  addListener(callback) {
    if (!this.eventEmitter) return { remove: () => {} };
    const sub = this.eventEmitter.addListener(GLASSES_EVENT, callback);
    return { remove: () => sub.remove() };
  }
}

const instance = new MetaGlassesService();

export default {
  isAvailable: () => instance.isAvailable(),
  startRegistration: () => instance.startRegistration(),
  getGlassesState: () => instance.getGlassesState(),
  startStreaming: () => instance.startStreaming(),
  stopStreaming: () => instance.stopStreaming(),
  capturePhoto: () => instance.capturePhoto(),
  addListener: (cb) => instance.addListener(cb),
};
