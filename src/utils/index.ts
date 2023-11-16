import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ml-stable-diffusion' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export function requireNativeModule<T>(
  moduleName: 'ReactNativeMLStableDiffusion' | 'RNEventEmitter'
): T {
  return NativeModules[moduleName]
    ? NativeModules[moduleName]
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
}
