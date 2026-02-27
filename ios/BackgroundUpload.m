#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BackgroundUpload, RCTEventEmitter)

RCT_EXTERN_METHOD(
  uploadFile:(NSString *)fileUri
  url:(NSString *)url
  headers:(NSDictionary *)headers
  fileName:(NSString *)fileName
  fileType:(NSString *)fileType
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  checkPendingUploads:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(supportedEvents)

@end
