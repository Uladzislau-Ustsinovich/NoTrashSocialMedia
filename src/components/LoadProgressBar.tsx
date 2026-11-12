import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { styles } from './LoadProgressBar.styles';

/** Thin bar under the header that tracks page load. `barStyle` comes from `useLoadProgress`. */
export function LoadProgressBar({ barStyle }: { barStyle: StyleProp<AnimatedStyle<ViewStyle>> }) {
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.bar, barStyle]} />
    </View>
  );
}
