import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  HuggingFaceDiffusionModel,
  HuggingFaceModelInfo,
  supportedModels,
  StableDiffusion,
} from 'react-native-ml-stable-diffusion';
import RNBlobUtil, { type FetchBlobResponse } from 'react-native-blob-util';
import RNFS from 'react-native-fs';

// const getDownloadedModelPath = (model: HuggingFaceModelInfo) => {
//   return `${RNFS.DocumentDirectoryPath}/stable-diffusion/models/${model.id}`;
// };

function getSaveModelPath(model: HuggingFaceModelInfo) {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/models/${model.id}`;
}

export default function App() {
  const [models] = React.useState(() => supportedModels());

  const [result, setResult] = React.useState<null | FetchBlobResponse>(null);

  React.useEffect(() => {
    // const model = HuggingFaceDiffusionModel.v2Palettized;
    // RNFS.readDir(
    //   '/var/mobile/Containers/Data/Application/406722EF-D9AB-4252-9A7C-15E694D073C1/Documents/stable-diffusion/models/apple'
    // )
    //   .then((file) => {
    //     console.log(file, 'file');
    //   })
    //   .catch((error) => {
    //     console.log(error, 'error');
    //   });
    //
    // RNBlobUtil.config({
    //   fileCache: true,
    //   path: getSaveModelPath(model),
    //   IOSBackgroundTask: true,
    // })
    //   .fetch('GET', model.getBestUrl())
    //   .progress((progress, total) => {
    //     console.log(progress, total, (Number(progress) / Number(total)) * 100);
    //   })
    //   .then((result) => {
    //     console.log('done', result.path());
    //     setResult(result);
    //     // RNFS.moveFile(result.path(), getSaveModelPath(model)).then(() => {
    //     //   console.log('moved');
    //     // });
    //   });
  }, []);

  return (
    <View style={styles.container}>
      <View>
        {models.map((v) => (
          <Text key={v.id}>{v.id}</Text>
        ))}
      </View>
      {/* <Text>Result: {result}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
