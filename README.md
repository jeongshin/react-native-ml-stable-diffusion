# react-native-ml-stable-diffusion

Stable Diffusion with Core ML on Apple Silicon for React Native

## Features

- Using [apple/ml-stable-diffusion](https://github.com/apple/ml-stable-diffusion) ✨

- Hugging Face open source models 🏄‍♂️

## Installation

```sh
npm install react-native-ml-stable-diffusion

yarn add react-native-ml-stable-diffusion
```

## Usage

### Download Model Sample Code

```ts
import {
  StableDiffusion,
  HuggingFaceModelInfo,
  HuggingFaceDiffusionModel,
  supportedModels,
} from 'react-native-ml-stable-diffusion';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import RNBlobUtil from 'react-native-blob-util';

// pick model
const model = HuggingFaceDiffusionModel.v21Palettized;

// or pick from supportedModels array

function getDownloadModelPath(model: HuggingFaceModelInfo) {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/models/${model.id}`;
}

function getUnzippedModelPath(model: HuggingFaceModelInfo) {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/unzipped/${model.id}`;
}

RNBlobUtil.config({
  fileCache: true,
  path: getDownloadModelPath(model),
  IOSBackgroundTask: true,
})
  .fetch('GET', model.getBestUrl())
  .progress((_progress, _total) => {
    // download progress
    setProgress(Number(_progress) / Number(_total));
  })
  .then(async (result) => {
    // unzip
    const unzippedPath = await unzip(
      result.path(),
      // save path
      getUnzippedModelPath(model)
    );

    // load model from compiled path
    await StableDiffusion.loadModel(await getCompiledModelPath(unzippedPath));

    // ready to generate image!
    setModelLoaded(true);
  })
  .catch((e) => {
    console.log('error', e);
  });
```

### loadModel

```ts
import { StableDiffusion } from 'react-native-ml-stable-diffusion';

StableDiffusion.loadModel(PATH_TO_MODEL);
```

### generateImage

```ts
import { StableDiffusion } from 'react-native-ml-stable-diffusion';

StableDiffusion.generateImage(prompt, {
  stepCount: 10, // steps
  seed: -1, // for random seed
  onStepChange: ({ step, stepCount }) => {
    console.log(step, stepCount);
  },
})
  .then((image) => {
    // local image file path
    setImage(image);
  })
  .catch(console.log);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
