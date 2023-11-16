import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const style = useAnimatedStyle(() => {
    return {
      width: withTiming(`${Number(progress * 100)}%`, { duration: 500 }),
      backgroundColor: '#f0f0f0',
      height: 32,
      borderRadius: 50,
    };
  }, [progress]);

  return (
    <View style={styles.container}>
      <Animated.View style={style} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#222222',
    borderRadius: 50,
    overflow: 'hidden',
  },
});
