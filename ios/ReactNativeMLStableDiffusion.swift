import CoreML

@available(iOS 16.2, *)
@objc(ReactNativeMLStableDiffusion)
class ReactNativeMLStableDiffusion: NSObject {
    private var pipelines: StableDiffusionPipeline?
    
    public func applicationSupportURL() -> URL {
        let fileManager = FileManager.default
        guard let appDirectoryURL = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return URL.applicationSupportDirectory
        }
        
        do {
            try fileManager.createDirectory(at: appDirectoryURL, withIntermediateDirectories: true, attributes: nil)
            
            return appDirectoryURL
        } catch {
            print("Error creating application support directory: \(error)")
            return fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        }
    }
    
    func tempStorageURL() -> URL {
        let tmpDir = applicationSupportURL().appendingPathComponent("rn-stable-diffusion-temp")
        
        if !FileManager.default.fileExists(atPath: tmpDir.path) {
            do {
                try FileManager.default.createDirectory(at: tmpDir, withIntermediateDirectories: true, attributes: nil)
            } catch {
                print("Failed to create temporary directory: \(error)")
                return FileManager.default.temporaryDirectory
            }
        }
        
        return tmpDir
    }
    
    func saveImage(cgImage: CGImage, filename: String?) -> URL? {
        let image = UIImage(cgImage: cgImage)
        let fn = filename ?? "diffusion_generated_image"
        let url = self.tempStorageURL()
        
        let fileURL = url
            .appendingPathComponent(fn)
            .appendingPathExtension("png")
        
        if let imageData = image.pngData() {
            do {
                try imageData.write(to: fileURL)
                return fileURL
            } catch {
                print("Error saving image to temporary file: \(error)")
            }
        }
        
        return nil
    }
    
    @objc(loadModel:resolve:reject:)
    func loadModel(_ path: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        let url = URL(fileURLWithPath: path)
        
        let config = MLModelConfiguration()
        
        config.computeUnits = .cpuAndNeuralEngine
        
        do {
            self.pipelines = try StableDiffusionPipeline(resourcesAt: url, controlNet: [], configuration: config, disableSafety: false, reduceMemory: true)
            try self.pipelines!.loadResources()
        } catch {
            return reject("E_FAILED_LOAD_RESOURCES", error.localizedDescription, nil)
        }
        resolve(nil)
    }
    
    @objc(generateImage:options:resolve:reject:)
    func generateImage(_ prompt: String, options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var config = StableDiffusionPipeline.Configuration(prompt: prompt)
        
        config.stepCount = (options.value(forKey: "stepCount") as? Int) ?? 1
        config.seed = (options.value(forKey: "seed") as? UInt32) ?? 1
        
        let filename = (options.value(forKey: "filename") as? String)
        
        do {
            let cgImage = try self.pipelines!.generateImages(configuration: config, progressHandler: { progress in
                RNEventEmitter.emitter.sendEvent(withName: "stepChanged", body: ["step": progress.step, "stepCount": progress.stepCount])
                return true
            }).first
            
            let savedImage = self.saveImage(cgImage: cgImage!!, filename: filename)
            
            resolve(savedImage?.absoluteURL.absoluteString ?? nil)
        } catch {
            reject("E_FAILED_GENERATE_IMAGE", error.localizedDescription, nil)
        }
    }
}

