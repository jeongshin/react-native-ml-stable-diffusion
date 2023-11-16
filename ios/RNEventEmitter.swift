import React

@objc(RNEventEmitter)
open class RNEventEmitter: RCTEventEmitter {
    
    public static var emitter: RCTEventEmitter!
    
    override init() {
        super.init()
        RNEventEmitter.emitter = self
    }
    
    open override func supportedEvents() -> [String] {
        return ["stepChanged"]
    }
}
