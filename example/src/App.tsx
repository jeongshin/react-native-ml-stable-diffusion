import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  HuggingFaceDiffusionModel,
  HuggingFaceModelInfo,
  supportedModels,
} from 'react-native-ml-stable-diffusion';
import RNBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';

const getDownloadedModelPath = (model: HuggingFaceModelInfo) => {
  return `/stable-diffusion/models/${model.id}`;
};

const getSaveModelPath = (model: HuggingFaceModelInfo) => {
  return `${RNFS.DocumentDirectoryPath}/stable-diffusion/models/${model.id}`;
};

export default function App() {
  const [models] = React.useState(() => supportedModels());

  React.useEffect(() => {
    const model = HuggingFaceDiffusionModel.v2Palettized;

    RNBlobUtil.config({
      fileCache: true,
      path: getDownloadedModelPath(model),
      IOSBackgroundTask: true,
    })
      .fetch('GET', model.getBestUrl())
      .progress((progress, total) => {
        console.log(progress, total, (Number(progress) / Number(total)) * 100);
      })
      .then((result) => {
        console.log('done');
        RNFS.moveFile(result.path(), getSaveModelPath(model)).then(() => {
          console.log('moved');
        });
      });
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
