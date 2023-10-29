import type { PlatformOSType } from 'react-native';
import { NativeModules, Platform } from 'react-native';
import type { NativeModule } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ml-stable-diffusion' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export interface LoadModelOptions {
  reduceMemory: boolean;
}

interface NativeStableDiffusionModule extends NativeModule {
  loadModel(path: string): Promise<void>;
  generateImage(): Promise<string>;
}

class ReactNativeMLStableDiffusion {
  private _nativeModule: NativeStableDiffusionModule =
    NativeModules.ReactNativeMLStableDiffusion
      ? NativeModules.ReactNativeMLStableDiffusion
      : new Proxy(
          {},
          {
            get() {
              throw new Error(LINKING_ERROR);
            },
          }
        );

  private assertPlatform(platform: PlatformOSType) {
    if (platform !== Platform.OS) {
      throw new Error(
        `[ReactNativeMLStableDiffusion] This method is not available on ${Platform.OS}`
      );
    }
  }

  public async loadModel(path: string) {
    this.assertPlatform('ios');
    await this._nativeModule.loadModel(path);
  }

  public async generateImage() {
    this.assertPlatform('ios');

    //
  }
}

export default new ReactNativeMLStableDiffusion();
