import React from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Button,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  StableDiffusion,
  HuggingFaceModelInfo,
  HuggingFaceDiffusionModel,
} from 'react-native-ml-stable-diffusion';
import { unzip } from 'react-native-zip-archive';
import RNBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';

import { ProgressBar } from './components/ProgressBar';
import Slider from '@react-native-community/slider';

function getDownloadModelPath(model: HuggingFaceModelInfo) {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/models/${model.id}`;
}

function getUnzippedModelPath(model: HuggingFaceModelInfo) {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/unzipped/${model.id}`;
}

const model = HuggingFaceDiffusionModel.v21Palettized;

export default function App() {
  const [prompt, setPrompt] = React.useState('');

  const [progress, setProgress] = React.useState(0);

  const [stepCount, setStepCount] = React.useState(0);

  const [modelLoaded, setModelLoaded] = React.useState(false);

  const [seed, setSeed] = React.useState(0);

  const [generatedImage, setGeneratedImage] = React.useState<string | null>(
    null
  );

  const [generateProgress, setGenerateProgress] = React.useState(0);

  const submit = async () => {
    const startAt = Date.now();
    StableDiffusion.generateImage(prompt, {
      stepCount,
      seed,
      filename: `${prompt}-${Date.now()}`,
      onStepChange: ({ step: _step, stepCount: _stepCount }) => {
        setGenerateProgress((_step + 1) / _stepCount);
      },
    })
      .then((result) => {
        setGeneratedImage(result);
        console.log('elapsed', Date.now() - startAt);
      })
      .catch(console.log);
  };

  const getCompiledModelPath = React.useCallback(async (path) => {
    const files = await RNFS.readDir(path);
    return `${path}/${files[0]?.name}`;
  }, []);

  const { width } = useWindowDimensions();

  React.useEffect(() => {
    RNBlobUtil.config({
      fileCache: true,
      path: getDownloadModelPath(model),
      IOSBackgroundTask: true,
    })
      .fetch('GET', model.getBestUrl())
      .progress((_progress, _total) => {
        setProgress(Number(_progress) / Number(_total));
      })
      .then(async (result) => {
        const unzippedPath = await unzip(
          result.path(),
          getUnzippedModelPath(model)
        );
        await StableDiffusion.loadModel(
          await getCompiledModelPath(unzippedPath)
        );
        setModelLoaded(true);
      })
      .catch((e) => {
        console.log('error', e);
      });
  }, [getCompiledModelPath]);

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>{`Model`}</Text>
        <Text style={styles.modelTitle}>{model.id}</Text>
        <ProgressBar progress={progress} />
        <Text style={styles.title}>Prompt</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Enter a prompt"
          placeholderTextColor={'#f0f0f0'}
          style={styles.textInput}
          multiline
        />
        <Text style={styles.title}>{`StepCount: ${stepCount}`}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          value={stepCount}
          onValueChange={setStepCount}
          maximumValue={150}
          step={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.title}>{`Seed: ${seed}`}</Text>
        <Slider
          style={styles.slider}
          value={seed}
          onValueChange={setSeed}
          step={1}
          minimumValue={-1}
          maximumValue={1000}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.title}>{`Image Generate Progress`}</Text>
        <ProgressBar progress={generateProgress} />
        {!!generatedImage && (
          <Image
            style={{ width, height: width, marginTop: 32 }}
            source={{
              uri: generatedImage,
            }}
          />
        )}
      </ScrollView>
      <Button
        title={modelLoaded ? 'Submit' : 'Downloading Model...'}
        disabled={!modelLoaded}
        onPress={submit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#111111',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  subTitle: {
    fontSize: 14,
    padding: 20,
    color: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    padding: 20,
    color: '#f0f0f0',
    textAlign: 'center',
  },
  modelTitle: {
    fontSize: 15,
    color: '#f0f0f0',
    paddingBottom: 12,
  },
  textInput: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#f0f0f0',
    color: '#f0f0f0',
    width: '100%',
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
