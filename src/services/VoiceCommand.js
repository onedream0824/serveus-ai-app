import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { VoiceCommand: VoiceCommandModule } = NativeModules;

const VOICE_EVENT_NAMES = ['onTranscript', 'onCommand', 'onError', 'onListeningChange'];

class VoiceCommandService {
  constructor() {
    this.eventEmitter = null;
    this.nativeModule = VoiceCommandModule;
    if (VoiceCommandModule) {
      this.eventEmitter = new NativeEventEmitter(VoiceCommandModule);
      this._stubSubscriptions = VOICE_EVENT_NAMES.map((name) =>
        this.eventEmitter.addListener(name, () => {}),
      );
    }
  }

  isAvailable() {
    return Boolean(this.nativeModule);
  }

  async requestPermission() {
    if (!this.nativeModule) {
      throw new Error(
        `VoiceCommand native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.requestPermission();
  }

  async startListening() {
    if (!this.nativeModule) {
      throw new Error(
        `VoiceCommand native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.startListening();
  }

  async stopListening() {
    if (!this.nativeModule) {
      throw new Error(
        `VoiceCommand native module is not available on ${Platform.OS}. Make sure the native module is properly linked.`,
      );
    }
    return this.nativeModule.stopListening();
  }

  addListener(eventName, callback) {
    if (!this.eventEmitter) {
      return { remove: () => {} };
    }
    const subscription = this.eventEmitter.addListener(eventName, callback);
    return { remove: () => subscription.remove() };
  }
}

const instance = new VoiceCommandService();

export default {
  isAvailable: () => instance.isAvailable(),
  requestPermission: () => instance.requestPermission(),
  startListening: () => instance.startListening(),
  stopListening: () => instance.stopListening(),
  addListener: (eventName, callback) => instance.addListener(eventName, callback),
};
