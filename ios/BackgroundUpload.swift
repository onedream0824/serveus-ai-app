import Foundation

@objc(BackgroundUpload)
class BackgroundUpload: RCTEventEmitter, URLSessionDelegate, URLSessionTaskDelegate, URLSessionDataDelegate {

  private var session: URLSession?
  private var responseData: [Int: Data] = [:]
  static var shared: BackgroundUpload?

  override init() {
    super.init()
    BackgroundUpload.shared = self
    let config = URLSessionConfiguration.background(withIdentifier: "com.serveus.backgroundupload")
    config.isDiscretionary = false
    config.sessionSendsLaunchEvents = true
    session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
  }

  override func supportedEvents() -> [String]! {
    return ["uploadProgress", "uploadComplete", "uploadFailed"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func uploadFile(
    _ fileUri: String,
    url urlString: String,
    headers: [String: String],
    fileName: String,
    fileType: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let url = URL(string: urlString) else {
      reject("INVALID_URL", "Invalid upload URL", nil)
      return
    }

    guard let fileURL = URL(string: fileUri) else {
      reject("INVALID_FILE", "Invalid file URI", nil)
      return
    }

    let uploadId = UUID().uuidString
    let boundary = "Boundary-\(uploadId)"

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    for (key, value) in headers {
      request.setValue(value, forHTTPHeaderField: key)
    }

    let tempDir = FileManager.default.temporaryDirectory
    let bodyFile = tempDir.appendingPathComponent("\(uploadId).tmp")

    do {
      var body = Data()
      let fileData = try Data(contentsOf: fileURL)

      body.append("--\(boundary)\r\n".data(using: .utf8)!)
      body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
      body.append("Content-Type: \(fileType)\r\n\r\n".data(using: .utf8)!)
      body.append(fileData)
      body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

      try body.write(to: bodyFile)
    } catch {
      reject("FILE_ERROR", "Could not read file: \(error.localizedDescription)", error)
      return
    }

    guard let session = session else {
      reject("NO_SESSION", "Background URLSession not configured", nil)
      return
    }

    let task = session.uploadTask(with: request, fromFile: bodyFile)
    task.taskDescription = uploadId

    task.resume()
    resolve(uploadId)
  }

  func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
    let taskId = dataTask.taskIdentifier
    if responseData[taskId] == nil {
      responseData[taskId] = Data()
    }
    responseData[taskId]?.append(data)
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    guard let uploadId = task.taskDescription else { return }
    let taskId = task.taskIdentifier

    if let error = error {
      sendEvent(withName: "uploadFailed", body: [
        "uploadId": uploadId,
        "error": error.localizedDescription,
      ])
    } else if let data = responseData[taskId],
              let responseString = String(data: data, encoding: .utf8) {
      sendEvent(withName: "uploadComplete", body: [
        "uploadId": uploadId,
        "response": responseString,
      ])
    }

    responseData.removeValue(forKey: taskId)
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64, totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
    guard let uploadId = task.taskDescription else { return }
    let progress = totalBytesExpectedToSend > 0
      ? Double(totalBytesSent) / Double(totalBytesExpectedToSend) * 100
      : 0

    sendEvent(withName: "uploadProgress", body: [
      "uploadId": uploadId,
      "progress": progress,
    ])
  }

  func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
    DispatchQueue.main.async {
      AppDelegate.backgroundCompletionHandler?()
      AppDelegate.backgroundCompletionHandler = nil
    }
  }
}

