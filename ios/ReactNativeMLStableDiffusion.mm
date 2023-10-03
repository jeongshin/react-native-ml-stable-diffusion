#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReactNativeMLStableDiffusion, NSObject)

RCT_EXTERN_METHOD(generateImage:
                  (NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
