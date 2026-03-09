import Foundation
import React
import UIKit
import MWDATCore
import MWDATCamera

@objc(MetaGlasses)
class MetaGlasses: RCTEventEmitter {

  private var isRegistered: Bool = false
  private var glassesConnected: Bool = false
  private var connectedDeviceCount: Int = 0
  private var connectedDeviceId: String?
  private var firstConnectedDevice: DeviceIdentifier?
  private var isStreaming: Bool = false
  private var lastError: String?

  private let wearables = Wearables.shared
  private var streamSession: StreamSession?
  private var registrationTask: Task<Void, Never>?
  private var devicesTask: Task<Void, Never>?
  private var stateListenerToken: (any AnyListenerToken)?
  private var photoDataListenerToken: (any AnyListenerToken)?
  private var errorListenerToken: (any AnyListenerToken)?

  private var capturePhotoResolve: RCTPromiseResolveBlock?
  private var capturePhotoReject: RCTPromiseRejectBlock?
  private var photoCaptureContinuation: CheckedContinuation<String, Error>?

  override init() {
    super.init()
    setupRegistrationListener()
    setupDevicesListener()
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["onGlassesConnectionChange"]
  }

  private func sendStateEvent() {
    sendEvent(withName: "onGlassesConnectionChange", body: [
      "isRegistered": isRegistered,
      "glassesConnected": glassesConnected,
      "connectedDeviceCount": connectedDeviceCount,
      "connectedDeviceId": connectedDeviceId as Any,
      "isStreaming": isStreaming,
      "error": lastError as Any,
    ])
  }

  private func setupRegistrationListener() {
    registrationTask = Task { @MainActor in
      for await state in wearables.registrationStateStream() {
        await MainActor.run {
          if case .registered = state {
            self.isRegistered = true
          } else {
            self.isRegistered = false
          }
          self.sendStateEvent()
        }
      }
    }
  }

  private func setupDevicesListener() {
    devicesTask = Task { @MainActor in
      for await devices in wearables.devicesStream() {
        await MainActor.run {
          self.connectedDeviceCount = devices.count
          self.glassesConnected = devices.count > 0
          self.firstConnectedDevice = devices.first
          self.connectedDeviceId = devices.first.map { "\($0)" }
          self.sendStateEvent()
        }
      }
    }
  }

  @objc func startRegistration(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await wearables.startRegistration()
        resolve(nil)
      } catch {
        self.lastError = error.localizedDescription
        self.sendStateEvent()
        reject("REGISTRATION_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc func getGlassesState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let state: [String: Any] = [
      "isRegistered": isRegistered,
      "glassesConnected": glassesConnected,
      "connectedDeviceCount": connectedDeviceCount,
      "connectedDeviceId": connectedDeviceId as Any,
      "isStreaming": isStreaming,
      "error": lastError as Any,
    ]
    resolve(state)
  }

  @objc func startStreaming(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      guard isRegistered else {
        let msg = "Not registered with Meta AI"
        self.lastError = msg
        self.sendStateEvent()
        reject("NOT_REGISTERED", msg, nil)
        return
      }
      guard let device = firstConnectedDevice else {
        let msg = "No glasses connected"
        self.lastError = msg
        self.sendStateEvent()
        reject("NO_DEVICE", msg, nil)
        return
      }
      do {
        var status = try await wearables.checkPermissionStatus(.camera)
        if status != .granted {
          status = try await wearables.requestPermission(.camera)
        }
        guard status == .granted else {
          let msg = "Camera permission denied"
          self.lastError = msg
          self.sendStateEvent()
          reject("PERMISSION_DENIED", msg, nil)
          return
        }
        let selector = SpecificDeviceSelector(device: device)
        let config = StreamSessionConfig(
          videoCodec: .raw,
          resolution: .medium,
          frameRate: 30
        )
        let session = StreamSession(
          streamSessionConfig: config,
          deviceSelector: selector
        )
        self.streamSession = session
        self.setupStreamListeners(session: session)
        await session.start()
        self.isStreaming = true
        self.lastError = nil
        self.sendStateEvent()
        resolve(nil)
      } catch {
        self.lastError = error.localizedDescription
        self.sendStateEvent()
        reject("STREAM_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc func stopStreaming(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      guard let session = streamSession else {
        resolve(nil)
        return
      }
      await session.stop()
      cleanupStreamListeners()
      streamSession = nil
      isStreaming = false
      sendStateEvent()
      resolve(nil)
    }
  }

  @objc func capturePhoto(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      guard let session = streamSession, isStreaming else {
        reject("NOT_STREAMING", "Start streaming first to capture photo", nil)
        return
      }
      self.capturePhotoResolve = resolve
      self.capturePhotoReject = reject
      do {
        try await session.capturePhoto(format: .jpeg)
        Task { @MainActor in
          try? await Task.sleep(nanoseconds: 10_000_000_000)
          if let rej = self.capturePhotoReject {
            self.capturePhotoResolve = nil
            self.capturePhotoReject = nil
            rej("TIMEOUT", "Photo capture timed out", nil)
          }
        }
      } catch {
        self.capturePhotoResolve = nil
        self.capturePhotoReject = nil
        reject("CAPTURE_FAILED", error.localizedDescription, error)
      }
    }
  }

  private func setupStreamListeners(session: StreamSession) {
    stateListenerToken = session.statePublisher.listen { [weak self] state in
      Task { @MainActor in
        switch state {
        case .streaming:
          self?.isStreaming = true
        case .stopped:
          self?.isStreaming = false
        default:
          break
        }
        self?.sendStateEvent()
      }
    }
    photoDataListenerToken = session.photoDataPublisher.listen { [weak self] photoData in
      Task { @MainActor in
        guard let self = self else { return }
        let data = photoData.data
        let tempDir = FileManager.default.temporaryDirectory
        let fileName = "serveus_glasses_\(UUID().uuidString).jpg"
        let fileURL = tempDir.appendingPathComponent(fileName)
        do {
          try data.write(to: fileURL)
          let uri = fileURL.absoluteString
          if let resolve = self.capturePhotoResolve {
            self.capturePhotoResolve = nil
            self.capturePhotoReject = nil
            resolve(["uri": uri])
          }
        } catch {
          if let reject = self.capturePhotoReject {
            self.capturePhotoResolve = nil
            self.capturePhotoReject = nil
            reject("WRITE_FAILED", error.localizedDescription, error)
          }
        }
      }
    }
    errorListenerToken = session.errorPublisher.listen { [weak self] error in
      Task { @MainActor in
        self?.lastError = error.localizedDescription
        self?.sendStateEvent()
      }
    }
  }

  private func cleanupStreamListeners() {
    stateListenerToken = nil
    photoDataListenerToken = nil
    errorListenerToken = nil
  }
}
