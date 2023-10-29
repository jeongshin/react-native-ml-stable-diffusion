import CoreML
import Combine

@objc(ReactNativeMLStableDiffusion)
class ReactNativeMLStableDiffusion: NSObject {
    
    @objc(loadModel:options:resolve:reject:)
    func loadModel(path: String, options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        if #available(iOS 16.2, macOS 13.1, *) {
            let config = MLModelConfiguration()
            config.computeUnits = .cpuAndNeuralEngine
            
            let url = URL(string: path)
            
            do {
                let pipelines = try StableDiffusionPipeline(resourcesAt: url!, controlNet: [], configuration: config, disableSafety: true, reduceMemory: true)
                try pipelines.loadResources()
            } catch {
                reject("E_FAILED_LOAD_RESOURCES", error.localizedDescription, nil)
            }
            return;
        }
        
        reject("E_UNSUPPORTED_OS_VERSION",
               "stable diffusion is only available on above ios 16.2 see requirements at https://github.com/apple/ml-stable-diffusion",
               nil);
        
        
    }
}

