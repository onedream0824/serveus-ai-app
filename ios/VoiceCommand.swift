import AVFoundation
import Foundation
import Speech
import React

@objc(VoiceCommandType)
public enum VoiceCommandType: Int, CaseIterable {
  case onMyWay = 0
  case startAppointment
  case takePhoto
  case addNote
  case createProofOfWork
  case completeAppointment
  case unknown

  var commandId: String {
    switch self {
    case .onMyWay: return "on_my_way"
    case .startAppointment: return "start_appointment"
    case .takePhoto: return "take_photo"
    case .addNote: return "add_note"
    case .createProofOfWork: return "create_proof_of_work"
    case .completeAppointment: return "complete_appointment"
    case .unknown: return "unknown"
    }
  }

  static func phrases(for type: VoiceCommandType) -> [String] {
    switch type {
    case .onMyWay: return ["i'm on my way", "on my way", "im on my way", "i am on my way"]
    case .startAppointment: return ["start appointment", "start the appointment", "begin appointment"]
    case .takePhoto: return ["take picture", "take photo", "take a picture", "take a photo", "capture photo"]
    case .addNote: return ["add note", "note"]
    case .createProofOfWork: return ["create proof of work", "proof of work", "create proof", "create report", "create service report", "service report"]
    case .completeAppointment: return ["complete appointment", "finish appointment", "complete job", "finish job"]
    case .unknown: return []
    }
  }
}

@objc(VoiceCommand)
class VoiceCommand: RCTEventEmitter {

  private var speechRecognizer: SFSpeechRecognizer?
  private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
  private var recognitionTask: SFSpeechRecognitionTask?
  private let audioEngine = AVAudioEngine()

  override init() {
    super.init()
    speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
  }

  override func supportedEvents() -> [String]! {
    return ["onTranscript", "onCommand", "onError", "onListeningChange"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }


  @objc func requestPermission(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    SFSpeechRecognizer.requestAuthorization { status in
      switch status {
      case .authorized:
        resolve(true)
      case .denied:
        reject("PERMISSION_DENIED", "Speech recognition denied", nil)
      case .restricted:
        reject("PERMISSION_RESTRICTED", "Speech recognition restricted", nil)
      case .notDetermined:
        reject("PERMISSION_NOT_DETERMINED", "Speech recognition not determined", nil)
      @unknown default:
        reject("PERMISSION_UNKNOWN", "Unknown permission status", nil)
      }
    }
  }

  @objc func startListening(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let recognizer = speechRecognizer, recognizer.isAvailable else {
      reject("NOT_AVAILABLE", "Speech recognizer not available", nil)
      return
    }

    if recognitionTask != nil {
      recognitionTask?.cancel()
      recognitionTask = nil
    }

    let audioSession = AVAudioSession.sharedInstance()
    do {
      try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
      try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
    } catch {
      reject("AUDIO_SESSION", error.localizedDescription, error)
      return
    }

    recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
    guard let request = recognitionRequest else {
      reject("REQUEST_NIL", "Could not create recognition request", nil)
      return
    }
    request.shouldReportPartialResults = true

    let inputNode = audioEngine.inputNode
    let recordingFormat = inputNode.outputFormat(forBus: 0)

    let sampleRate = recordingFormat.sampleRate
    let channelCount = recordingFormat.channelCount
    guard sampleRate > 0, channelCount > 0 else {
      reject("AUDIO_FORMAT", "No valid audio input. Use a real device or set Simulator → I/O → Audio Input.", nil)
      return
    }

    inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
      self?.recognitionRequest?.append(buffer)
    }

    audioEngine.prepare()
    do {
      try audioEngine.start()
    } catch {
      reject("AUDIO_ENGINE", error.localizedDescription, error)
      return
    }

    sendEvent(withName: "onListeningChange", body: ["isListening": true])
    recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
      guard let self = self else { return }
      if let error = error {
        let nsError = error as NSError
        let isCancellation = nsError.domain == "kAFAssistantErrorDomain" && nsError.code == 216
        if isCancellation {
          self.cleanupListening()
          return
        }
        self.sendEvent(withName: "onError", body: ["message": error.localizedDescription])
        self.cleanupListening()
        return
      }
      if let result = result {
        let transcript = result.bestTranscription.formattedString
        let isFinal = result.isFinal
        self.sendEvent(withName: "onTranscript", body: [
          "transcript": transcript,
          "isFinal": isFinal,
        ])
        if isFinal, !transcript.isEmpty {
          self.parseAndEmitCommand(transcript: transcript)
        }
        if isFinal {
          self.cleanupListening()
        }
      }
    }
    resolve(nil)
  }

  @objc func stopListening(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    cleanupListening()
    resolve(nil)
  }

  private func cleanupListening() {
    audioEngine.stop()
    audioEngine.inputNode.removeTap(onBus: 0)
    recognitionRequest?.endAudio()
    recognitionRequest = nil
    recognitionTask?.cancel()
    recognitionTask = nil
    sendEvent(withName: "onListeningChange", body: ["isListening": false])
  }

  private func parseAndEmitCommand(transcript: String) {
    let lower = transcript.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
    if lower.isEmpty { return }

    for phrase in VoiceCommandType.phrases(for: .addNote) {
      if lower.hasPrefix(phrase) {
        let rest = String(lower.dropFirst(phrase.count)).trimmingCharacters(in: .whitespacesAndNewlines)
        if !rest.isEmpty {
          sendEvent(withName: "onCommand", body: [
            "command": VoiceCommandType.addNote.commandId,
            "text": rest,
          ])
          return
        }
        break
      }
    }

    for type in [VoiceCommandType.onMyWay, .startAppointment, .takePhoto, .createProofOfWork, .completeAppointment] {
      for phrase in VoiceCommandType.phrases(for: type) {
        if lower == phrase || lower.contains(phrase) {
          sendEvent(withName: "onCommand", body: [
            "command": type.commandId,
            "text": "",
          ])
          return
        }
      }
    }

    sendEvent(withName: "onTranscript", body: ["transcript": transcript, "isFinal": true])
  }
}
