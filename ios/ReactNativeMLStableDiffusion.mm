#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ReactNativeMLStableDiffusion, NSObject)
RCT_EXTERN_METHOD(generateImage:(NSString *)prompt
                  options:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(loadModel:(NSString *)path
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}
@end

@interface RCT_EXTERN_MODULE(RNEventEmitter, RCTEventEmitter)
RCT_EXTERN_METHOD(supportedEvents)
+ (BOOL)requiresMainQueueSetup
{
    return NO;
}
@end
