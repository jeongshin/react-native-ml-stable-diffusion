import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export enum ComputeUnits {
  'cpuAndGPU' = 'cpuAndGPU',
  'cpuAndNeuralEngine' = 'cpuAndNeuralEngine',
}

export enum AttentionVariant {
  original = 'original',
  splitEinsum = 'splitEinsum',
  splitEinsumV2 = 'splitEinsumV2',
}

export enum AttentionSuffix {
  original = 'original_compiled',
  splitEinsum = 'split_einsum_compiled',
  splitEinsumV2 = 'split_einsum_v2_compiled',
}

/**
 * quantization is supported on iOS 17 and above
 */
const deviceSupportsQuantization =
  Platform.OS === 'ios' &&
  Number(DeviceInfo.getSystemVersion().split('.')[0]) >= 17;

const totalMemory = DeviceInfo.getTotalMemorySync();

const deviceHas6GBOrMore = totalMemory >= 5910000000;
const deviceHas8GBOrMore = totalMemory >= 7900000000;

export interface IDiffusionModelInfo {
  modelId: string;
  modelVersion: string;
  supportsEncoder?: boolean;
  supportsAttentionV2?: boolean;
  quantized?: boolean;
  isXL?: boolean;
}

export class HuggingFaceModelInfo {
  /// Hugging Face model Id that contains .zip archives with compiled Core ML models
  public id: string;

  private _version: string;

  /// Are weights quantized? This is only used to decide whether to use `reduceMemory`
  private _quantized: boolean;

  private _defaultAttention: AttentionVariant;

  /// Is attention v2 supported?
  private _supportsAttentionV2: boolean;

  /// Whether this is a Stable Diffusion XL model
  private _isXL: boolean;

  constructor(info: IDiffusionModelInfo) {
    this.id = info.modelId;
    this._version = info.modelVersion;
    this._isXL = info.isXL || false;
    this._quantized = info.quantized || false;
    this._supportsAttentionV2 = info.supportsAttentionV2 || false;
    this._defaultAttention = AttentionVariant.splitEinsum;
  }

  public reduceMemory(): boolean {
    if (this._isXL) {
      return !deviceHas8GBOrMore;
    }

    return !(this._quantized && deviceHas6GBOrMore);
  }

  get bestAttention(): AttentionVariant {
    if (this._supportsAttentionV2) {
      return AttentionVariant.splitEinsumV2;
    }
    return this._defaultAttention;
  }

  /**
   *
   * @returns {boolean} true if the model is supported on the current device
   */
  public isSupported(): boolean {
    return !!supportedModels().find((m) => m.id === this.id);
  }

  public modelUrl(variant: AttentionVariant): string {
    const repo = this.id.split('/').pop() ?? '';

    let suffix: string;

    switch (variant) {
      case AttentionVariant.original:
        suffix = AttentionSuffix.original;
        break;
      case AttentionVariant.splitEinsum:
        suffix = AttentionSuffix.splitEinsum;
        break;
      case AttentionVariant.splitEinsumV2:
        suffix = AttentionSuffix.splitEinsumV2;
        break;
    }

    return `https://huggingface.co/${this.id}/resolve/main/${repo}_${suffix}.zip`;
  }

  /**
   * Pattern: https://huggingface.co/pcuenq/coreml-stable-diffusion/resolve/main/coreml-stable-diffusion-v1-5_original_compiled.zip
   */
  public getBestUrl(): string {
    return this.modelUrl(this.bestAttention);
  }
}

export function supportedModels(): HuggingFaceModelInfo[] {
  if (deviceSupportsQuantization) {
    return [
      HuggingFaceDiffusionModel.v14Base,
      HuggingFaceDiffusionModel.v14Palettized,
      HuggingFaceDiffusionModel.v15Base,
      HuggingFaceDiffusionModel.v15Palettized,
      HuggingFaceDiffusionModel.v2Base,
      HuggingFaceDiffusionModel.v2Palettized,
      HuggingFaceDiffusionModel.v21Base,
      HuggingFaceDiffusionModel.v21Palettized,
      HuggingFaceDiffusionModel.xlmbpChunked,
    ];
  }

  return [
    HuggingFaceDiffusionModel.v14Base,
    HuggingFaceDiffusionModel.v15Base,
    HuggingFaceDiffusionModel.v2Base,
    HuggingFaceDiffusionModel.v21Base,
  ];
}

export const HuggingFaceDiffusionModel = {
  v14Base: new HuggingFaceModelInfo({
    modelId: 'pcuenq/coreml-stable-diffusion-1-4',
    modelVersion: 'CompVis SD 1.4',
  }),
  v14Palettized: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-1-4-palettized',
    modelVersion: 'CompVis SD 1.4 [6 bit]',
    supportsEncoder: true,
    supportsAttentionV2: true,
    quantized: true,
  }),
  v15Base: new HuggingFaceModelInfo({
    modelId: 'pcuenq/coreml-stable-diffusion-v1-5',
    modelVersion: 'RunwayML SD 1.5',
  }),
  v15Palettized: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-v1-5-palettized',
    modelVersion: 'RunwayML SD 1.5 [6 bit]',
    supportsEncoder: true,
    supportsAttentionV2: true,
    quantized: true,
  }),
  v2Base: new HuggingFaceModelInfo({
    modelId: 'pcuenq/coreml-stable-diffusion-2-base',
    modelVersion: 'StabilityAI SD 2.0',
    supportsEncoder: true,
  }),
  v2Palettized: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-2-base-palettized',
    modelVersion: 'StabilityAI SD 2.0 [6 bit]',
    supportsEncoder: true,
    supportsAttentionV2: true,
    quantized: true,
  }),
  v21Base: new HuggingFaceModelInfo({
    modelId: 'pcuenq/coreml-stable-diffusion-2-1-base',
    modelVersion: 'StabilityAI SD 2.1',
    supportsEncoder: true,
  }),
  v21Palettized: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-2-1-base-palettized',
    modelVersion: 'StabilityAI SD 2.1 [6 bit]',
    supportsEncoder: true,
    supportsAttentionV2: true,
    quantized: true,
  }),
  ofaSmall: new HuggingFaceModelInfo({
    modelId: 'pcuenq/coreml-small-stable-diffusion-v0',
    modelVersion: 'OFA-Sys/small-stable-diffusion-v0',
  }),
  xl: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-xl-base',
    modelVersion: 'SDXL base (1024, macOS)',
    supportsEncoder: true,
    isXL: true,
  }),
  xlWithRefiner: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-xl-base-with-refiner',
    modelVersion: 'SDXL with refiner (1024, macOS)',
    supportsEncoder: true,
    isXL: true,
  }),
  xlmbp: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-mixed-bit-palettization',
    modelVersion: 'SDXL base (1024, macOS) [4.5 bit]',
    supportsEncoder: true,
    quantized: true,
    isXL: true,
  }),
  xlmbpChunked: new HuggingFaceModelInfo({
    modelId: 'apple/coreml-stable-diffusion-xl-base-ios',
    modelVersion: 'SDXL base (768, iOS) [4 bit]',
    supportsEncoder: false,
    quantized: true,
    isXL: true,
  }),
};
