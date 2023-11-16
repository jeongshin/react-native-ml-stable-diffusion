import type { PlatformOSType, NativeModule } from 'react-native';
import { NativeEventEmitter, Platform } from 'react-native';
import { requireNativeModule } from '../utils';

export type StepChangeCallback = (progress: {
  step: number;
  stepCount: number;
}) => void;

export interface GenerateImageOptions {
  filename?: string;
  seed?: number;
  stepCount?: number;
  onStepChange?: StepChangeCallback;
}

interface NativeStableDiffusionModule extends NativeModule {
  loadModel(path: string): Promise<void>;

  generateImage(
    prompt: string,
    options?: GenerateImageOptions
  ): Promise<string>;
}

class ReactNativeMLStableDiffusion {
  constructor() {
    this._eventEmitter.addListener(
      'stepChanged',
      (progress: { step: number; stepCount: number }) => {
        this._listeners.forEach((cb) => cb(progress));
      }
    );
  }

  private _isModelLoaded = false;

  private _listeners: StepChangeCallback[] = [];

  private _nativeModule = requireNativeModule<NativeStableDiffusionModule>(
    'ReactNativeMLStableDiffusion'
  );

  private _eventEmitter = new NativeEventEmitter(
    Platform.select({
      ios: requireNativeModule('RNEventEmitter'),
      default: undefined,
    })
  );

  private assertPlatform(platform: PlatformOSType) {
    if (platform !== Platform.OS) {
      throw new Error(
        `[react-native-ml-stable-diffusion] This method is not available on ${Platform.OS}`
      );
    }
  }

  /**
   * recommend to use document directory path
   *
   * @param path local file path to save model
   */
  public async loadModel(path: string): Promise<void> {
    this.assertPlatform('ios');

    await this._nativeModule.loadModel(path);

    this._isModelLoaded = true;
  }

  /**
   * generate image from prompt text using loaded model
   *
   * @param prompt prompt text
   * @param {GenerateImageOptions} options options for generating image
   */
  public async generateImage(
    prompt: string,
    options?: GenerateImageOptions
  ): Promise<string | null> {
    this.assertPlatform('ios');

    if (!this._isModelLoaded) {
      throw new Error(
        '[react-native-ml-stable-diffusion] model not loaded\nmake sure to call loadModel before calling generateImage'
      );
    }

    const cb = options?.onStepChange;

    try {
      if (cb && typeof cb === 'function') {
        this._listeners.push(cb);
      }
      return await this._nativeModule.generateImage(prompt, {
        filename: options?.filename,
        stepCount: options?.stepCount ?? 10,
        seed: options?.seed ?? -1,
      });
    } catch (e) {
      throw e;
    } finally {
      this._listeners = this._listeners.filter((_cb) => _cb !== cb);
    }
  }
}

export default new ReactNativeMLStableDiffusion();
